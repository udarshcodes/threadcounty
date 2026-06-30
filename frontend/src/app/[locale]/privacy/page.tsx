import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | ThreadCounty",
  description: "Privacy Policy for ThreadCounty.",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold font-heading mb-8">Privacy Policy</h1>
      <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-6">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">1. Information We Collect</h2>
        <p>We collect information you provide directly to us when you create an account, upload fabric images for analysis, or communicate with us. This may include your name, email address, and the content of your uploads.</p>
        
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">2. How We Use Your Information</h2>
        <p>We use the information we collect to provide, maintain, and improve our textile analysis services. The fabric images you upload are used exclusively to generate AI analysis reports and are not shared publicly unless you choose to do so.</p>
        
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">3. Data Security</h2>
        <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage.</p>
        
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">4. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at support@threadcounty.com.</p>
      </div>
    </div>
  );
}
