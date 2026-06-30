"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for individuals and small tests.",
      features: ["Basic AI Analysis", "Standard resolution support", "Community access"],
      buttonText: "Get Started",
      buttonVariant: "outline" as const,
    },
    {
      name: "Student",
      price: "$9",
      description: "For academic research and learning.",
      features: ["Advanced AI Analysis", "Detailed Web Reports", "Priority email support", "Image History"],
      buttonText: "Subscribe",
      buttonVariant: "outline" as const,
    },
    {
      name: "Professional",
      price: "$49",
      description: "Ideal for small to medium manufacturers.",
      features: ["Unlimited Analyses", "Advanced analytics dashboard", "24/7 Priority support", "Early access to new features"],
      buttonText: "Subscribe",
      buttonVariant: "default" as const,
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large scale industrial operations.",
      features: ["Dedicated account manager", "Custom Integrations", "On-premise deployment option", "SLA Guarantees"],
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
    }
  ];

  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">Simple, transparent pricing</h1>
          <p className="text-xl text-muted-foreground">
            Choose the plan that best fits your needs. All plans include core AI analysis capabilities.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, i) => (
            <Card key={i} className={`flex flex-col relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-muted-foreground">/mo</span>}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start">
                      <Check className="h-5 w-5 text-primary shrink-0 mr-2" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={plan.buttonVariant}>
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
