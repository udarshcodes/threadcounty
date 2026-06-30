"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Using Supabase auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
    } else if (data.user) {
      // Create the profile record to satisfy foreign key constraints
      await supabase.from('profiles').insert({
        id: data.user.id,
        first_name: firstName,
        last_name: lastName,
      });

      if (data.session) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setLoading(false);
        setError(null);
        setSuccess(true);
      }
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] w-full">
        <div className="hidden lg:flex flex-col w-1/2 border-r border-white/10 relative overflow-hidden bg-black/20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background dark:from-primary/10 dark:via-black/90 dark:to-black"></div>
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 mix-blend-screen"></div>
          <div className="absolute top-1/2 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl opacity-50 mix-blend-screen"></div>
          <div className="relative z-10 flex flex-col justify-center h-full p-16 2xl:p-24">
            <div className="mb-10 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
               <Image src="/logo.png" alt="ThreadCounty Logo" width={40} height={40} className="object-contain" />
            </div>
            <h1 className="text-5xl font-bold mb-6 font-heading tracking-tight leading-tight">
              Welcome to <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                ThreadCounty
              </span>
            </h1>
          </div>
        </div>

        <div className="flex w-full lg:w-1/2 items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10 bg-background/50 backdrop-blur-sm">
          <Card className="w-full max-w-md border-0 shadow-none lg:shadow-2xl lg:border bg-transparent lg:bg-card/50 lg:backdrop-blur-xl">
            <CardHeader className="space-y-1 flex flex-col items-center text-center pb-8 pt-6">
              <div className="mb-4 lg:hidden">
                 <Image src="/logo.png" alt="ThreadCounty Logo" width={56} height={56} className="object-contain" />
              </div>
              <CardTitle className="text-3xl font-bold text-green-500">Check your email</CardTitle>
              <CardDescription className="text-base mt-2">
                We've sent a confirmation link to <span className="font-semibold text-foreground">{email}</span>. 
                <br /><br />
                Please check your inbox (and your spam folder) to verify your account before logging in.
              </CardDescription>
            </CardHeader>
            <CardFooter className="pb-8">
              <Button onClick={() => router.push("/login")} className="w-full h-11 text-base shadow-lg" variant="outline">
                Return to Login
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

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
            Start Your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              Analysis Journey
            </span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-12 max-w-md leading-relaxed">
            Create a free account today and get 10 free fabric analyses every month. No credit card required to get started.
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
              <CardTitle className="text-3xl font-bold font-heading tracking-tight">Create an account</CardTitle>
              <CardDescription className="text-base">
                Enter your details below to create your account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSignup}>
              <CardContent className="space-y-5">
                {error && (
                  <div className="p-4 text-sm text-white bg-destructive/90 rounded-lg shadow-lg border border-destructive animate-in fade-in slide-in-from-top-2">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2.5">
                    <Label htmlFor="firstName">First name</Label>
                    <Input 
                      id="firstName" 
                      placeholder="John" 
                      required 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-11 bg-background/50"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Doe" 
                      required 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-11 bg-background/50"
                    />
                  </div>
                </div>
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
                <div className="space-y-2.5">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 bg-background/50"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-5 pt-4 pb-8">
                <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-primary/20" disabled={loading}>
                  {loading ? "Creating account..." : "Create account"}
                </Button>
                <div className="text-center text-sm text-muted-foreground pt-2">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary font-semibold hover:underline transition-all">
                    Sign in here
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
