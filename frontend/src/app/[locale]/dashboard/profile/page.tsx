"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User as AuthUser } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Camera, ShieldAlert, Loader2, Activity } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<{type: "success"|"error", text: string} | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setAvatarUrl(data.avatar_url || null);
      }
      setLoading(false);
    }
    loadProfile();
  }, [supabase, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    if (!user) return;

    const { error } = await supabase.from('profiles').update({
      first_name: firstName,
      last_name: lastName
    }).eq('id', user.id);

    setSaving(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Profile updated successfully." });
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    setSaving(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    setSaving(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setNewPassword("");
      setMessage({ type: "success", text: "Password updated successfully." });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true);
      if (!e.target.files || e.target.files.length === 0 || !user) return;
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
      setAvatarUrl(publicUrl);
      setMessage({ type: "success", text: "Avatar updated successfully." });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setMessage({ type: "error", text: error.message || "Error uploading avatar. Make sure 'avatars' storage bucket exists." });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("Are you absolutely sure? This action cannot be undone and will delete all your reports and uploads permanently.")) {
      setSaving(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(process.env.NEXT_PUBLIC_AI_BACKEND_URL || "http://127.0.0.1:8000/api/users/me", {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${session?.access_token}`
          }
        });
        
        if (!response.ok) {
           throw new Error("Failed to delete account on the server.");
        }
        
        await supabase.auth.signOut();
        router.push("/");
      } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        alert(err.message || "An error occurred.");
        setSaving(false);
      }
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center">Loading profile...</div>;

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading">Account Settings</h1>
        <p className="text-muted-foreground">Manage your profile, preferences, and security.</p>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-md border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-600' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card>
             <CardContent className="pt-6 flex flex-col items-center text-center">
                <div className="relative h-24 w-24 rounded-full bg-muted/50 border-2 border-primary/20 flex items-center justify-center mb-4 group overflow-hidden">
                   {avatarUrl ? (
                     /* eslint-disable-next-line @next/next/no-img-element */
                     <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                   ) : (
                     <User className="h-12 w-12 text-muted-foreground" />
                   )}
                   <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                      {uploadingAvatar ? <Loader2 className="h-6 w-6 animate-spin mb-1" /> : <Camera className="h-6 w-6 mb-1" />}
                      <span className="text-[10px] font-medium">Change Avatar</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                   </label>
                </div>
                <h3 className="font-bold text-lg">{firstName || 'User'} {lastName}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
             </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your name and basic details.</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateProfile}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" value={user?.email || ""} disabled />
                  <p className="text-xs text-muted-foreground">Email addresses cannot be changed directly.</p>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6 flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Update your password to keep your account secure.</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdatePassword}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input 
                    id="newPassword" 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)} 
                    placeholder="Minimum 6 characters"
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6 flex justify-end">
                <Button type="submit" variant="secondary" disabled={saving || !newPassword}>
                  Update Password
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" /> Recent Activity
              </CardTitle>
              <CardDescription>View your complete account activity and timeline.</CardDescription>
            </CardHeader>
            <CardFooter>
               <Link href="/dashboard" className="w-full">
                  <Button variant="outline" className="w-full">
                    View Activity Timeline
                  </Button>
               </Link>
            </CardFooter>
          </Card>

          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" /> Danger Zone
              </CardTitle>
              <CardDescription>Permanently delete your account and all associated data.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="destructive" onClick={handleDeleteAccount} disabled={saving}>
                Delete Account
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
