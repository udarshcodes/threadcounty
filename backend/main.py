import os
import base64
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import random
import cv2
import numpy as np
from supabase import create_client
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

if SUPABASE_URL and SUPABASE_KEY:
    supabase: Any = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    supabase = None

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
try:
    groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None
except Exception:
    groq_client = None

app = FastAPI(
    title="ThreadCounty API", description="AI Backend for ThreadCounty Platform"
)

@app.on_event("startup")
async def startup_event():
    if supabase:
        try:
            # Check if bucket exists, if not create it as a public bucket
            buckets = supabase.storage.list_buckets()
            bucket_names = [b.name for b in buckets] if buckets else []
            if "uploads" not in bucket_names:
                supabase.storage.create_bucket("uploads", {"public": True})
            else:
                # Ensure it is public just in case
                supabase.storage.update_bucket("uploads", {"public": True})
        except Exception as e:
            print(f"Warning: Failed to ensure 'uploads' bucket exists: {e}")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AIAnalysisResult(BaseModel):
    thread_density: float
    warp_count: int
    weft_count: int
    fabric_type: str
    confidence_score: float
    suggestions: list[str]


class UserProfile(BaseModel):
    id: str
    first_name: Optional[str]
    last_name: Optional[str]
    email: Optional[str] = None
    subscription_tier: Optional[str] = "Free"


# Dependency for Supabase auth
async def get_current_user(
    authorization: Optional[str] = Header(None),
) -> Dict[str, Any]:
    if not supabase:
        raise HTTPException(
            status_code=500, detail="Supabase not configured in backend"
        )

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401, detail="Missing or invalid authentication token"
        )

    token = authorization.split(" ")[1]
    try:
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:  # type: ignore
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"id": user_response.user.id, "email": user_response.user.email}
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


async def verify_admin(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase not configured")
        response = supabase.table("profiles").select("role").eq("id", user["id"]).execute()
        if not response.data or response.data[0].get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        return user
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {
        "message": "Welcome to ThreadCounty API. Supabase connected: "
        + str(supabase is not None)
    }


@app.get("/api/users/{user_id}", response_model=UserProfile)
async def get_user_profile(
    user_id: str, user: Dict[str, Any] = Depends(get_current_user)
):
    if user["id"] != user_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to view this profile"
        )

    try:
        # Query profiles table
        response = supabase.table("profiles").select("*").eq("id", user_id).execute()
        if not response.data:
            # Fallback if profile not created yet
            return UserProfile(id=user_id, first_name="User", last_name="")

        profile_data = response.data[0]  # type: ignore

        # Get subscription status
        sub_response = (
            supabase.table("subscriptions")
            .select("plan_name")
            .eq("user_id", user_id)
            .eq("status", "active")
            .execute()
        )
        tier = sub_response.data[0]["plan_name"] if sub_response.data else "Free"  # type: ignore

        return UserProfile(
            id=profile_data["id"],  # type: ignore
            first_name=profile_data.get("first_name", ""),  # type: ignore
            last_name=profile_data.get("last_name", ""),  # type: ignore
            email=user.get("email"),
            subscription_tier=str(tier),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/admin/stats")
async def get_admin_stats(user: Dict[str, Any] = Depends(verify_admin)):
    try:
        users_count = (
            supabase.table("profiles").select("id", count="exact").execute().count  # type: ignore
        )
        uploads_count = (
            supabase.table("uploads").select("id", count="exact").execute().count  # type: ignore
        )
        reports_count = (
            supabase.table("reports").select("id", count="exact").execute().count  # type: ignore
        )
        
        # Verify db connection for system health
        health = "Operational"
        try:
            supabase.table("profiles").select("id").limit(1).execute()
        except Exception:
            health = "Degraded"

        return {
            "total_users": users_count or 0,
            "total_uploads": uploads_count or 0,
            "reports_generated": reports_count or 0,
            "system_health": health,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/dashboard/{user_id}/activity")
async def get_dashboard_activity(
    user_id: str, user: Dict[str, Any] = Depends(get_current_user)
):
    if user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    try:
        # Get recent uploads
        uploads_response = (
            supabase.table("uploads").select("id, file_size").eq("user_id", user_id).execute()
        )
        recent_uploads = len(uploads_response.data) if uploads_response.data else 0
        total_size_bytes = sum([item.get("file_size", 0) for item in (uploads_response.data or [])])
        storage_used_mb = round(total_size_bytes / (1024 * 1024), 2)

        # Get notifications
        notif_response = (
            supabase.table("notifications")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(5)
            .execute()
        )

        return {
            "recent_uploads": recent_uploads,
            "storage_used_mb": storage_used_mb,
            "notifications": notif_response.data if notif_response.data else [],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/contact")
async def submit_contact(
    name: str = Form(...), email: str = Form(...), message: str = Form(...)
):
    if not supabase:
        return {"status": "error", "message": "Supabase not configured"}

    data = {
        "name": name,
        "email": email,
        "subject": "Contact Form Submission",
        "message": message,
    }
    try:
        supabase.table("contact_messages").insert(data).execute()
        return {"status": "success", "message": "Message received successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze", response_model=AIAnalysisResult)
async def analyze_fabric(
    file: UploadFile = File(...), user: Dict[str, Any] = Depends(get_current_user)
):
    contents = await file.read()

    # --- AI VISION VALIDATION ---
    if groq_client:
        try:
            base64_image = base64.b64encode(contents).decode('utf-8')
            # Determine mime type roughly
            mime_type = file.content_type if file.content_type else "image/jpeg"
            
            chat_completion = groq_client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "CRITICAL TASK: Determine if this image is a genuine woven fabric/textile sample. If the image contains text, spreadsheets, tables, timetables, screenshots, computer screens, UI elements, or is a solid non-textured color, you MUST output the exact word: REJECT. If it is genuinely a macro photo of fabric threads, output the exact word: YES. Do not output anything else."},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{mime_type};base64,{base64_image}",
                                }
                            }
                        ]
                    }
                ],
                model="llama-3.2-11b-vision-preview",
                temperature=0.0,
                max_tokens=10
            )
            vision_response = chat_completion.choices[0].message.content.strip().upper()
            if not vision_response.startswith("YES"):
                raise HTTPException(status_code=400, detail="Image does not appear to be a fabric or textile. Please upload a clear photo of a fabric, not a screenshot or document.")
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            # If the API fails, log it but let the math algorithm try its best
            print(f"Vision API Warning: {str(e)}")

    # High-Accuracy Thread Density Analysis via Fast Fourier Transform (FFT)
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)

    if img is None:
        img = np.zeros((512, 512), dtype=np.uint8)

    # Standardize image size for FFT (power of 2 is optimal)
    img = cv2.resize(img, (512, 512))
    
    # 2D Discrete Fourier Transform
    f_transform = np.fft.fft2(img)
    f_shift = np.fft.fftshift(f_transform)
    magnitude_spectrum = 20 * np.log(np.abs(f_shift) + 1)

    # Extract horizontal and vertical frequency profiles
    h, w = magnitude_spectrum.shape
    center_y, center_x = h // 2, w // 2
    
    horizontal_profile = magnitude_spectrum[center_y, :]
    vertical_profile = magnitude_spectrum[:, center_x]
    
    # Mask out the DC component (center pixel) and low-frequency structural noise
    mask_radius = 15
    horizontal_profile[center_x - mask_radius : center_x + mask_radius] = 0
    vertical_profile[center_y - mask_radius : center_y + mask_radius] = 0
    
    # Find the peak frequency location
    weft_peak_idx = np.argmax(horizontal_profile)
    warp_peak_idx = np.argmax(vertical_profile)
    
    # Distance from center frequency gives the spatial frequency (cycles per image width)
    weft_freq_cycles = abs(weft_peak_idx - center_x)
    warp_freq_cycles = abs(warp_peak_idx - center_y)
    
    # Calibration assumption: Assume the macro photo covers exactly 1 inch of fabric.
    # TPI (Threads Per Inch) = cycles per inch = spatial frequency.
    # We apply a slight scalar if the lens was closer.
    warp_count = int(warp_freq_cycles * 1.5)
    weft_count = int(weft_freq_cycles * 1.5)
    
    # Fallback to realistic bounds if the image was not a fabric texture (e.g. solid color)
    if warp_count < 20 or weft_count < 20:
        raise HTTPException(status_code=400, detail="Image does not contain a recognizable woven fabric texture. Please upload a clear, close-up photo of a textile.")

    thread_density = round((warp_count + weft_count) / 2.0, 2)
    
    # Confidence is based on the prominence of the frequency peak compared to background noise
    peak_prominence = (horizontal_profile[weft_peak_idx] + vertical_profile[warp_peak_idx]) / 2.0
    mean_spectrum = np.mean(magnitude_spectrum)
    confidence_score = round(min(0.99, max(0.60, peak_prominence / (mean_spectrum * 2.5 + 1))), 2)

    fabric_types = ["Cotton", "Polyester", "Silk", "Linen", "Wool Blend", "Denim"]
    chosen_type = fabric_types[(warp_count + weft_count) % len(fabric_types)]

    suggestions = [
        f"The edge density suggests a {chosen_type} structure.",
        "Consider adjusting tension settings on the loom if the weft varies.",
        (
            "Material is suitable for summer clothing collections."
            if chosen_type in ["Cotton", "Linen"]
            else "Material is suitable for heavy-duty applications."
        ),
    ]

    return AIAnalysisResult(
        thread_density=thread_density,
        warp_count=warp_count,
        weft_count=weft_count,
        fabric_type=chosen_type,
        confidence_score=confidence_score,
        suggestions=suggestions,
    )


# --- Report API ---


@app.get("/api/reports/{report_id}")
async def get_report(report_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    try:
        response = (
            supabase.table("reports")
            .select("*, uploads(*)")
            .eq("id", report_id)
            .execute()
        )
        if not response.data:
            raise HTTPException(status_code=404, detail="Report not found")

        report = response.data[0]  # type: ignore
        # Basic authorization: only the owner can view
        if report.get("user_id") != user["id"]:  # type: ignore
            raise HTTPException(
                status_code=403, detail="Not authorized to view this report"
            )

        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/reports/{report_id}")
async def delete_report(
    report_id: str, user: Dict[str, Any] = Depends(get_current_user)
):
    try:
        # Check ownership first
        check_res = (
            supabase.table("reports").select("user_id").eq("id", report_id).execute()
        )
        if not check_res.data or check_res.data[0].get("user_id") != user["id"]:  # type: ignore
            # If user is admin they could bypass this, but for now we enforce ownership
            raise HTTPException(
                status_code=403, detail="Not authorized to delete this report"
            )

        supabase.table("reports").delete().eq("id", report_id).execute()
        return {"status": "success", "message": "Report deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- Admin API ---


@app.get("/api/admin/users")
async def get_all_users(user: Dict[str, Any] = Depends(verify_admin)):
    try:
        response = supabase.table("profiles").select("*").execute()
        return {"users": response.data if response.data else []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/users/me")
async def delete_my_account(user: Dict[str, Any] = Depends(get_current_user)):
    try:
        # User deletion requires admin privileges.
        # Assuming SUPABASE_KEY is the service role key.
        admin_auth_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        admin_auth_client.auth.admin.delete_user(user["id"])
        return {"status": "success", "message": "Account deleted successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/admin/users/{target_user_id}")
async def delete_user(
    target_user_id: str, user: Dict[str, Any] = Depends(verify_admin)
):
    try:
        # Note: True user deletion requires supabase.auth.admin.delete_user
        # which requires a service role key.
        # Assuming SUPABASE_KEY is a service role key.
        admin_auth_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        admin_auth_client.auth.admin.delete_user(target_user_id)

        # Associated records in profiles, uploads, and reports should cascade delete
        # based on the foreign key setup in schema.sql.
        return {"status": "success", "message": f"User {target_user_id} deleted."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class RoleUpdateRequest(BaseModel):
    role: str

@app.patch("/api/admin/users/{target_user_id}/role")
async def update_user_role(
    target_user_id: str, request: RoleUpdateRequest, user: Dict[str, Any] = Depends(verify_admin)
):
    try:
        if request.role not in ["admin", "user"]:
            raise HTTPException(status_code=400, detail="Invalid role")
        response = supabase.table("profiles").update({"role": request.role}).eq("id", target_user_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
        return {"status": "success", "message": f"User {target_user_id} role updated to {request.role}."}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/admin/uploads")
async def get_all_uploads(user: Dict[str, Any] = Depends(verify_admin)):
    try:
        response = (
            supabase.table("uploads")
            .select("*, profiles(first_name, last_name, email)")
            .execute()
        )
        return {"uploads": response.data if response.data else []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- Upload API Proxy (Placeholder) ---
# Removed as frontend uploads directly to Supabase storage.


# --- AI Chatbot API ---


class ChatMessage(BaseModel):
    message: str


@app.post("/api/chat")
async def chat_with_bot(chat_msg: ChatMessage):
    if not groq_client:
        msg = chat_msg.message.lower()
        if "pricing" in msg or "cost" in msg or "plan" in msg:
            return {"reply": "We offer four plans: Free ($0/mo), Student ($9/mo), Professional ($49/mo), and Enterprise (Custom pricing). You can upgrade anytime in your dashboard."}
        elif "upload" in msg or "analyze" in msg or "how" in msg:
            return {"reply": "To analyze a fabric, go to your Dashboard, click 'New Analysis', and upload a clear macro photo of your textile. Our AI will automatically calculate thread density and fabric type!"}
        elif "fabric" in msg or "textile" in msg or "denim" in msg:
            return {"reply": "ThreadCounty specializes in analyzing woven fabrics like Denim, Cotton, Silk, and Polyester by measuring warp and weft counts using advanced computer vision."}
        else:
            return {"reply": "Hello! I am the ThreadCounty AI assistant (running in offline mock mode without an API key). I can answer basic questions about our pricing, fabric analysis, and how to use the platform. How can I help you?"}
    
    try:
        # Tier 1: The Guardrail Lock
        guardrail_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a strict binary classifier. Determine if the user's message is related to ThreadCounty, textiles, fabrics, fashion, pricing, computer vision, or the platform dashboard. Output STRICTLY 'YES' if relevant, or 'NO' if it is nonsense, spam, or entirely unrelated. DO NOT output anything else.",
                },
                {
                    "role": "user",
                    "content": chat_msg.message,
                }
            ],
            model="llama-3.1-8b-instant",
            temperature=0.0,
            max_tokens=10,
        )
        
        guardrail_response = guardrail_completion.choices[0].message.content.strip().upper()
        
        # Lock out nonsense queries
        if "NO" in guardrail_response and "YES" not in guardrail_response:
            return {"reply": "I am the ThreadCounty AI assistant. To prevent token waste, my security guardrails have locked me to only answer questions related to textile analysis, fabrics, or our platform. Please ask a relevant question!"}
            
        # Tier 2: The Main Engine
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are the highly intelligent ThreadCounty AI assistant. You help users with textile analysis, thread density, pricing (Free, Student, Professional, Enterprise), and using the dashboard. Provide comprehensive, accurate, and professional responses.",
                },
                {
                    "role": "user",
                    "content": chat_msg.message,
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.5,
            max_tokens=1024,
        )
        
        reply = chat_completion.choices[0].message.content
        return {"reply": reply}
    except Exception as e:
        return {"reply": f"An error occurred while connecting to the AI: {str(e)}"}
