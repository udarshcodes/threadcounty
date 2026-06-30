import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | ThreadCounty",
  description: "Terms of Service for ThreadCounty.",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold font-heading mb-8">Terms of Service</h1>
      <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-6">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">1. Acceptance of Terms</h2>
        <p>By accessing and using ThreadCounty, you accept and agree to be bound by the terms and provision of this agreement.</p>
        
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">2. Description of Service</h2>
        <p>ThreadCounty provides AI-powered textile analysis. We reserve the right to modify or discontinue, temporarily or permanently, the service with or without notice.</p>
        
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">3. User Conduct and Uploads</h2>
        <p>You agree to only upload fabric images that you have the right to use. You are solely responsible for the content of your uploads and the consequences of submitting them.</p>
        
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">4. Limitation of Liability</h2>
        <p>ThreadCounty shall not be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of profits or revenues resulting from the use of our services.</p>
      </div>
    </div>
  );
}
