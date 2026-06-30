import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-full border-t bg-background py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo.png" alt="ThreadCounty Logo" width={32} height={32} className="object-contain" />
              <span className="font-bold text-xl tracking-tight">ThreadCounty</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Empowering the textile industry with AI-driven fabric analysis and advanced modern technology.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold">Platform</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/dashboard/upload" className="hover:text-primary transition-colors">AI Analysis</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold">Company</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold">Legal</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t flex flex-col items-center justify-center text-center">
          <p className="text-xs text-muted-foreground mb-2">
            &copy; {new Date().getFullYear()} ThreadCounty Inc. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/80">
            Developed by Udarsh Goyal
          </p>
        </div>
      </div>
    </footer>
  );
}
