import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-full relative overflow-hidden border-t border-white/5 bg-black/5 dark:bg-black/20 pt-20 pb-10">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-32 bg-primary/20 blur-[100px] rounded-full pointer-events-none mix-blend-screen"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5 mb-16">
          <div className="flex flex-col space-y-6 lg:col-span-2 pr-8">
            <Link href="/" className="flex items-center space-x-3">
              <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/10 shadow-lg">
                <Image src="/logo.png" alt="ThreadCounty Logo" width={32} height={32} className="object-contain" />
              </div>
              <span className="font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                ThreadCounty
              </span>
            </Link>
            <p className="text-base text-muted-foreground leading-relaxed max-w-sm">
              Empowering the textile industry with AI-driven fabric analysis and advanced modern technology. Start analyzing instantly.
            </p>
          </div>
          
          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-foreground">Platform</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/dashboard/upload" className="hover:text-primary transition-all duration-200">AI Analysis</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-all duration-200">Pricing</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary transition-all duration-200">Dashboard</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-foreground">Company</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-all duration-200">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-all duration-200">Contact</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-all duration-200">FAQ</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-foreground">Legal</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary transition-all duration-200">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-all duration-200">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ThreadCounty Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <p className="text-sm text-muted-foreground font-medium">
              Systems Operational
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
