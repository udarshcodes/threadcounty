import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Shield, Cpu } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">About ThreadCounty</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We are building the intelligence layer for the global textile and manufacturing industry.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold font-heading mb-4">Our Story</h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              ThreadCounty was founded with a single mission: to modernize quality control in textile manufacturing. For decades, determining thread density, warp/weft counts, and fabric composition has relied on slow, manual inspection processes prone to human error.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              By combining state-of-the-art computer vision models with scalable cloud infrastructure, we&apos;ve reduced a 15-minute manual process to a 2-second automated analysis. Today, ThreadCounty empowers manufacturers, researchers, and fashion brands worldwide to maintain perfect quality at scale.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-primary/5 border-none shadow-none">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">10M+</div>
                <div className="text-sm font-medium">Images Analyzed</div>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-none shadow-none">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">99.8%</div>
                <div className="text-sm font-medium">Accuracy Rate</div>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-none shadow-none">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">50+</div>
                <div className="text-sm font-medium">Enterprise Clients</div>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-none shadow-none">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">12</div>
                <div className="text-sm font-medium">Supported Languages</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold font-heading mb-8 text-center">Our Core Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Precision", desc: "We never compromise on the accuracy of our models.", icon: <Target className="h-6 w-6" /> },
              { title: "Security", desc: "Your proprietary fabric designs are encrypted and protected.", icon: <Shield className="h-6 w-6" /> },
              { title: "Innovation", desc: "We continuously push the boundaries of AI research.", icon: <Cpu className="h-6 w-6" /> },
              { title: "Community", desc: "Building a global network of modern manufacturers.", icon: <Users className="h-6 w-6" /> },
            ].map((value, i) => (
              <Card key={i}>
                <CardContent className="pt-6 text-center">
                  <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {value.icon}
                  </div>
                  <h3 className="font-bold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Timeline Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold font-heading mb-12 text-center">Our Journey</h2>
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {[
              { year: "2023", title: "The Concept", desc: "Started as a research project at MIT to automate fabric analysis." },
              { year: "2024", title: "First Prototype", desc: "Successfully trained our first model to detect thread density." },
              { year: "2025", title: "Beta Launch", desc: "Onboarded 10 major textile manufacturers for beta testing." },
              { year: "2026", title: "Public Release", desc: "Launched ThreadCounty globally with a 99.8% accuracy rate." },
            ].map((item, i) => (
              <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary text-primary-foreground font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  <div className="h-3 w-3 bg-white rounded-full"></div>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-card shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <span className="font-mono text-sm text-primary">{item.year}</span>
                  </div>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold font-heading mb-12 text-center">Meet the Team</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "Dr. Alan Turing", role: "Chief Scientist & Founder", img: "AT" },
              { name: "Grace Hopper", role: "CTO", img: "GH" },
              { name: "Ada Lovelace", role: "Head of AI Research", img: "AL" },
            ].map((member, i) => (
              <Card key={i} className="text-center overflow-hidden">
                <div className="h-32 bg-primary/10"></div>
                <CardContent className="relative pt-0 pb-6">
                  <div className="mx-auto -mt-12 h-24 w-24 rounded-full border-4 border-background bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground mb-4">
                    {member.img}
                  </div>
                  <h3 className="font-bold text-lg">{member.name}</h3>
                  <p className="text-sm text-primary">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
