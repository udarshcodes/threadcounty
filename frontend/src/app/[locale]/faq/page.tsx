import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function FAQPage() {
  const faqs = [
    {
      question: "How accurate is the AI Analysis?",
      answer: "Our computer vision system is designed to provide highly accurate metrics for thread density, warp/weft counts, and material identification under standard macro-photography conditions."
    },
    {
      question: "What image formats are supported?",
      answer: "We currently support JPG, JPEG, and PNG formats. For best results, we recommend images that are at least 1024x1024 pixels in resolution, taken under good lighting conditions."
    },
    {
      question: "Is my uploaded data secure?",
      answer: "Yes. All uploaded images and generated reports are encrypted both in transit and at rest. You retain full ownership of your data, and we do not use your proprietary fabric designs to train our public models without explicit permission."
    },
    {
      question: "Can I upgrade or downgrade my plan at any time?",
      answer: "Absolutely. You can change your subscription plan at any time from your account settings. Prorated charges or credits will be applied automatically."
    },
    {
      question: "What happens if I exceed my monthly upload limit?",
      answer: "If you are on a Free or Student plan, you will be prompted to upgrade to continue analyzing images. Professional and Enterprise plans have higher or unlimited capacities."
    }
  ];

  return (
    <div className="py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about the platform, AI models, and pricing.
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <Card key={i} className="border-none shadow-sm bg-muted/30">
              <CardHeader>
                <CardTitle className="text-xl">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">Still have questions?</p>
          <Link href="/contact" className="text-primary font-medium hover:underline mt-2 inline-block">Contact our support team &rarr;</Link>
        </div>
      </div>
    </div>
  );
}
