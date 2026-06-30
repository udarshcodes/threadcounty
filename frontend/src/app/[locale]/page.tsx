"use client";

import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Activity, ShieldCheck, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("Index");

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight font-heading mb-6"
          >
            {t("title")}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground"
          >
            {t("subtitle")}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex justify-center gap-4"
          >
            <Link href="/signup">
              <Button size="lg" className="rounded-full px-8">
                {t("getStarted")} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard/upload">
              <Button size="lg" variant="outline" className="rounded-full px-8">
                {t("viewDemo")}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Product Overview Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold font-heading mb-6">Product Overview</h2>
          <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
            ThreadCounty is a comprehensive AI-powered platform designed to replace manual fabric inspection. 
            By leveraging advanced computer vision, our software instantly analyzes macroscopic fabric images 
            to determine thread density, warp and weft counts, and material composition with unparalleled precision.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-heading">Powerful Features for Modern Manufacturing</h2>
            <p className="mt-4 text-muted-foreground">Everything you need to automate quality control and fabric analysis.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Voice-Enabled Chatbot", description: "Ask questions naturally using our built-in AI assistant with Speech Recognition.", icon: <Zap className="h-6 w-6" /> },
              { title: "Offline PWA Support", description: "Install ThreadCounty on any device and access it anywhere, anytime.", icon: <ShieldCheck className="h-6 w-6" /> },
              { title: "Smart Compression & OCR", description: "Client-side image compression and built-in Tesseract OCR for fabric tags.", icon: <Activity className="h-6 w-6" /> },
              { title: "Historical Comparison", description: "Dynamically compare past analysis reports side-by-side in the dashboard.", icon: <Activity className="h-6 w-6" /> },
              { title: "Multi-language (i18n)", description: "Available in English and Spanish with seamless route-based localization.", icon: <Zap className="h-6 w-6" /> },
              { title: "Email Notifications", description: "Receive instant email updates when your AI fabric analysis is complete.", icon: <ShieldCheck className="h-6 w-6" /> },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Workflow Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-heading">How It Works</h2>
            <p className="mt-4 text-muted-foreground">Three simple steps to transform your quality control.</p>
          </div>
          <div className="flex flex-col md:flex-row justify-center items-center gap-12 text-center">
             <div className="flex-1 max-w-sm">
                <div className="text-5xl font-extrabold text-primary/80 mb-4">01</div>
                <h3 className="text-xl font-bold mb-2">Upload Image</h3>
                <p className="text-muted-foreground">Take a macroscopic photo of your fabric and upload it securely.</p>
             </div>
             <div className="hidden md:block w-px h-24 bg-border"></div>
             <div className="flex-1 max-w-sm">
                <div className="text-5xl font-extrabold text-primary/80 mb-4">02</div>
                <h3 className="text-xl font-bold mb-2">AI Processing</h3>
                <p className="text-muted-foreground">Our neural networks analyze the thread structure instantly.</p>
             </div>
             <div className="hidden md:block w-px h-24 bg-border"></div>
             <div className="flex-1 max-w-sm">
                <div className="text-5xl font-extrabold text-primary/80 mb-4">03</div>
                <h3 className="text-xl font-bold mb-2">Get Results</h3>
                <p className="text-muted-foreground">Download detailed reports with density, type, and actionable suggestions.</p>
             </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-primary/20 backdrop-blur-xl pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-foreground">
            <div>
              <div className="text-4xl font-extrabold mb-2">100%</div>
              <div className="text-foreground/80 font-medium">Cloud Based</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold mb-2">Zero</div>
              <div className="text-foreground/80 font-medium">Setup Required</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold mb-2">24/7</div>
              <div className="text-foreground/80 font-medium">Availability</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold mb-2">~2s</div>
              <div className="text-foreground/80 font-medium">Average Processing Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-heading">What Our Users Say</h2>
            <p className="mt-4 text-muted-foreground">Hear from our early beta testers.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card p-6 rounded-2xl shadow-sm border">
              <div className="flex text-yellow-400 mb-4">
                {"★★★★★"}
              </div>
              <p className="text-muted-foreground mb-6">&quot;ThreadCounty reduced our quality control time by 80%. The warp and weft counts are incredibly accurate.&quot;</p>
              <div className="font-semibold">— Sarah Jenkins</div>
              <div className="text-sm text-muted-foreground">Production Manager</div>
            </div>
            <div className="bg-card p-6 rounded-2xl shadow-sm border">
              <div className="flex text-yellow-400 mb-4">
                {"★★★★★"}
              </div>
              <p className="text-muted-foreground mb-6">&quot;The dashboard is incredibly intuitive. I can see all my past analyses in one place without complex spreadsheets.&quot;</p>
              <div className="font-semibold">— David Chen</div>
              <div className="text-sm text-muted-foreground">CTO, TextileTech</div>
            </div>
            <div className="bg-card p-6 rounded-2xl shadow-sm border">
              <div className="flex text-yellow-400 mb-4">
                {"★★★★★"}
              </div>
              <p className="text-muted-foreground mb-6">&quot;As a fabric researcher, this tool is invaluable. The thread density measurements match our manual lab tests perfectly.&quot;</p>
              <div className="font-semibold">— Dr. Elena Rossi</div>
              <div className="text-sm text-muted-foreground">Material Scientist</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section (Preview) */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl font-bold font-heading mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6 text-left">
            <div className="bg-muted/30 p-6 rounded-lg border">
              <h3 className="font-bold text-lg mb-2">How accurate is the AI Analysis?</h3>
              <p className="text-muted-foreground">Our computer vision system is designed to provide highly accurate metrics for thread density, warp/weft counts, and material identification under standard macro-photography conditions.</p>
            </div>
            <div className="bg-muted/30 p-6 rounded-lg border">
              <h3 className="font-bold text-lg mb-2">What image formats are supported?</h3>
              <p className="text-muted-foreground">We currently support JPG, JPEG, and PNG formats. Best results require at least 1024x1024 resolution.</p>
            </div>
          </div>
          <Link href="/faq" className="mt-8 inline-block">
            <Button variant="outline">View All FAQs</Button>
          </Link>
        </div>
      </section>
      {/* Contact Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold font-heading mb-6">Ready to Transform Your Quality Control?</h2>
          <p className="mb-8 max-w-2xl mx-auto opacity-90">
            Contact our sales team today to learn how ThreadCounty can be integrated into your existing manufacturing pipeline.
          </p>
          <Link href="/contact">
            <Button size="lg" variant="secondary" className="rounded-full px-8 text-primary font-bold">
              Contact Us Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
