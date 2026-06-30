"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scissors } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: "success" | "error", text: string} | null>(null);

  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dashboard/profile`,
    });

    setLoading(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Password reset instructions sent. Please check your email." });
      setEmail("");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full">
      {/* Left Side - Visual Presentation */}
      <div className="hidden lg:flex flex-col w-1/2 border-r border-white/10 relative overflow-hidden bg-black/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background dark:from-primary/10 dark:via-black/90 dark:to-black"></div>
        
        {/* Abstract background shapes */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 mix-blend-screen"></div>
        <div className="absolute top-1/2 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl opacity-50 mix-blend-screen"></div>
        
        <div className="relative z-10 flex flex-col justify-center h-full p-16 2xl:p-24">
          <div className="mb-10 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
             <Image src="/logo.png" alt="ThreadCounty Logo" width={40} height={40} className="object-contain" />
          </div>
          
          <h1 className="text-5xl font-bold mb-6 font-heading tracking-tight leading-tight">
            The Future of <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              Fabric Analysis
            </span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-12 max-w-md leading-relaxed">
            Join the platform that is revolutionizing textile manufacturing with AI-powered instant fiber thread analysis and density metrics.
          </p>
          
          <div className="space-y-6">
            {[
              { title: "99.9% AI Accuracy", desc: "Powered by custom-trained Llama 3 Vision models." },
              { title: "Instant PDF Reports", desc: "Download and share analytics with your team instantly." },
              { title: "Advanced Density Metrics", desc: "Automated EPI and PPI calculations using FFT math." }
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="mt-1 w-8 h-8 rounded-full bg-primary/10 flex flex-shrink-0 items-center justify-center text-primary font-bold border border-primary/20">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10 bg-background/50 backdrop-blur-sm">
        <div className="w-full max-w-md space-y-8 relative">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center justify-center mb-8">
            <Image src="/logo.png" alt="ThreadCounty Logo" width={56} height={56} className="object-contain mb-4" />
          </div>

          <Card className="border-0 shadow-none lg:shadow-2xl lg:border bg-transparent lg:bg-card/50 lg:backdrop-blur-xl">
            <CardHeader className="space-y-2 pb-8 pt-6">
              <CardTitle className="text-3xl font-bold font-heading tracking-tight">Reset password</CardTitle>
              <CardDescription className="text-base">
                Enter your email address and we will send you a link to reset your password.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleReset}>
              <CardContent className="space-y-5">
                {message && (
                  <div className={`p-4 text-sm rounded-lg shadow-lg border animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-destructive/90 text-white border-destructive'}`}>
                    {message.text}
                  </div>
                )}
                <div className="space-y-2.5">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@company.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 bg-background/50"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-5 pt-4 pb-8">
                <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-primary/20" disabled={loading || !email}>
                  {loading ? "Sending..." : "Send reset link"}
                </Button>
                <div className="text-center text-sm text-muted-foreground pt-2">
                  Remember your password?{" "}
                  <Link href="/login" className="text-primary font-semibold hover:underline transition-all">
                    Sign in
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
