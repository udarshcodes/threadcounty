"use client";

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
    const checkAuth = async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/40 dark:bg-black/30 backdrop-blur-2xl shadow-sm supports-[backdrop-filter]:bg-background/20">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="flex items-center space-x-2 mr-6">
          <Image src="/logo.png" alt="ThreadCounty Logo" width={32} height={32} className="object-contain" />
          <span className="font-bold text-xl tracking-tight hidden md:inline-block">ThreadCounty</span>
        </Link>

        <nav className="flex items-center space-x-6 text-sm font-medium">
          {routes.map((route) => (
            <Link
              key={route.href}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              href={route.href as any}
              className={`transition-colors hover:text-foreground/80 ${
                pathname === route.href ? "text-foreground" : "text-foreground/60"
              }`}
            >
              {route.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <LanguageSwitcher />
            <ThemeToggle />
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">{t("login")}</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">{t("getStarted")}</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
