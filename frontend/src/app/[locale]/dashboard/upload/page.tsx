"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, Image as ImageIcon, X, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import Tesseract from "tesseract.js";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    validateAndSetFile(selected);
  };

  const validateAndSetFile = (selected?: File) => {
    setError(null);
    if (!selected) return;

    if (!selected.type.includes("image/")) {
      setError("Please upload a valid image file (JPG, PNG).");
      return;
    }

    if (selected.size > 10 * 1024 * 1024) { // 10MB limit
      setError("File size must be less than 10MB.");
      return;
    }

    setFile(selected);
    const objectUrl = URL.createObjectURL(selected);
    setPreview(objectUrl);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    validateAndSetFile(dropped);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(10);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication required");

      // Ensure user profile exists (backward compatibility for accounts created before the signup fix)
      const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single();
      if (!profile) {
        await supabase.from('profiles').insert({
          id: user.id,
          first_name: user.user_metadata?.first_name || 'User',
          last_name: user.user_metadata?.last_name || ''
        });
      }

      setProgress(20);

      // Compression
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
      const compressedBlob = await imageCompression(file, options);
      const compressedFile = new File([compressedBlob], file.name, { type: file.type });
      
      setProgress(30);

      // OCR Integration
      let ocrText = "";
      try {
        const tesseractResult = await Tesseract.recognize(compressedFile, 'eng');
        ocrText = tesseractResult.data.text;
      } catch (err) {
        console.warn("OCR failed, continuing without it.", err);
      }

      setProgress(40);

      // 1. Upload to Supabase Storage
      let finalStoragePath = `${user.id}/${Date.now()}_${compressedFile.name}`;
      
      setProgress(50);
      try {
        const { error: storageError } = await supabase.storage.from('uploads').upload(finalStoragePath, compressedFile);
        if (storageError) throw storageError;
      } catch (uploadEx) {
        console.warn("Storage upload failed (bucket missing or RLS), fallback to base64 encoding:", uploadEx);
        // Fallback to storing as a data URI if storage fails (e.g. no bucket, RLS error)
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(compressedFile);
        });
        finalStoragePath = base64;
      }
      setProgress(70);

      // 2. Create Upload Record
      const { data: uploadData, error: uploadError } = await supabase
        .from('uploads')
        .insert({
          user_id: user.id,
          file_name: compressedFile.name,
          file_size: compressedFile.size,
          storage_path: finalStoragePath
        })
        .select()
        .single();

      if (uploadError) throw uploadError;

      setProgress(80);

      // 3. Call actual Python AI Backend
      setProgress(85);
      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("user_id", user.id);
      if (ocrText) formData.append("ocr_text", ocrText); // Pass OCR text to backend

      const { data: { session } } = await supabase.auth.getSession();

      const backendUrl = process.env.NEXT_PUBLIC_AI_BACKEND_URL || "http://127.0.0.1:8000";
      const aiResponse = await fetch(`${backendUrl}/api/analyze`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: formData,
      });

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json().catch(() => null);
        const errorMessage = errorData?.detail || "AI Analysis backend failed to process the image. Ensure the backend is running on port 8000.";
        throw new Error(errorMessage);
      }

      const aiResult = await aiResponse.json();

      const realReport = {
        upload_id: uploadData.id,
        user_id: user.id,
        thread_density: aiResult.thread_density,
        warp_count: aiResult.warp_count,
        weft_count: aiResult.weft_count,
        fabric_type: aiResult.fabric_type,
        confidence_score: aiResult.confidence_score,
        suggestions: aiResult.suggestions
      };

      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .insert(realReport)
        .select()
        .single();

      if (reportError) throw reportError;

      // 4. Create Notification for Activity Timeline
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: `Report generated for ${file.name}`,
        content: `Your AI fabric analysis report for ${file.name} is ready.`,
        is_read: false
      });

      // 5. Send Custom Email Notification via Resend
      try {
        await fetch("/api/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            userName: user.user_metadata?.first_name || "User",
            fileName: file.name,
            reportId: reportData.id,
          }),
        });
      } catch (emailErr) {
        console.warn("Failed to trigger email notification", emailErr);
      }

      setProgress(100);
      
      // Redirect to report page
      router.push(`/dashboard/reports/${reportData.id}`);

    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An error occurred during upload.");
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading">New Fabric Analysis</h1>
        <p className="text-muted-foreground">Upload an image of your textile sample to get instant AI metrics.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Image Upload</CardTitle>
          <CardDescription>Drag and drop or click to select an image (JPG, PNG, max 10MB).</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">{error}</div>}
          
          {!preview ? (
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors flex flex-col items-center justify-center min-h-[300px]"
            >
              <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Click or drag image here</p>
              <p className="text-sm text-muted-foreground mt-1">Supports JPG, PNG, JPEG</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/png, image/jpeg, image/jpg" 
                className="hidden" 
              />
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border bg-muted/30 p-2">
              <div className="relative aspect-video w-full flex items-center justify-center">
                {/* Using img instead of Next Image to handle local blobs easily */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="max-h-[400px] object-contain rounded-md"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-background border-t mt-2 rounded-md">
                <div className="flex items-center space-x-3 truncate">
                  <ImageIcon className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm font-medium truncate">{file?.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {((file?.size || 0) / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setFile(null); setPreview(null); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {loading && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Analyzing and Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-3 border-t pt-6">
          <Button variant="outline" onClick={() => router.back()} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Start Analysis
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
