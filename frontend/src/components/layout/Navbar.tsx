"use client";

import { useState, useEffect } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

export function Navbar() {
  const pathname = usePathname();
  const t = useTranslations("Navbar");

  const routes = [
    { href: "/", label: t("home") },
    { href: "/dashboard/upload", label: "Analyze" },
    { href: "/pricing", label: t("pricing") },
    { href: "/about", label: t("about") },
  ];

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let subscription: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any

    const checkAuth = async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);

      // Listen for auth state changes (e.g., sign out, sign in)
      const { data } = supabase.auth.onAuthStateChange((_event, currentSession) => {
        setIsAuthenticated(!!currentSession);
      });
      subscription = data.subscription;
    };
    checkAuth();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return (
    <div className="fixed top-4 inset-x-0 flex justify-center z-50 px-4 pointer-events-none">
      <header className="pointer-events-auto w-full max-w-5xl rounded-full border border-white/10 bg-background/60 dark:bg-black/40 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transition-all">
        <div className="flex h-14 items-center px-6">
          <Link href="/" className="flex items-center space-x-2 mr-8">
            <div className="bg-white/10 p-1.5 rounded-full">
              <Image src="/logo.png" alt="ThreadCounty Logo" width={24} height={24} className="object-contain" />
            </div>
            <span className="font-bold text-lg tracking-tight hidden md:inline-block bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              ThreadCounty
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
            {routes.map((route) => (
              <Link
                key={route.href}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                href={route.href as any}
                className={`transition-all duration-200 px-4 py-2 rounded-full hover:bg-white/10 ${
                  pathname === route.href ? "text-foreground bg-white/5" : "text-foreground/60 hover:text-foreground"
                }`}
              >
                {route.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
            <nav className="flex items-center space-x-2">
              <LanguageSwitcher />
              <ThemeToggle />
              <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block"></div>
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="sm" className="rounded-full px-5 shadow-md shadow-primary/20">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" className="hidden sm:inline-block">
                    <Button variant="ghost" size="sm" className="rounded-full px-4">Log in</Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="rounded-full px-5 shadow-md shadow-primary/20">Sign up</Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
    </div>
  );
}
