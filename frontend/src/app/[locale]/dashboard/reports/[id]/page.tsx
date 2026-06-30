"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, ArrowLeft, CheckCircle2, AlertTriangle, Layers } from "lucide-react";

export default function ReportPage() {
  const { id } = useParams();
  const router = useRouter();
  const [report, setReport] = useState<any | null>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchReport() {
      const { data, error } = await supabase
        .from("reports")
        .select("*, uploads(*)")
        .eq("id", id)
        .single();
        
      if (!error && data) {
        setReport(data);
      }
      setLoading(false);
    }
    if (id) fetchReport();
  }, [id, supabase]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Report link copied to clipboard!");
  };

  const handleDownload = () => {
    window.print();
  };

  if (loading) {
    return <div className="min-h-[60vh] flex flex-col items-center justify-center">
       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
       <p className="text-muted-foreground">Loading Analysis Results...</p>
    </div>;
  }

  if (!report) {
    return <div className="container mx-auto py-10 text-center">
      <h2 className="text-2xl font-bold mb-4">Report Not Found</h2>
      <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
    </div>;
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6 -ml-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">Analysis Report</h1>
          <p className="text-muted-foreground">Generated on {new Date(report.created_at).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleShare}><Share2 className="mr-2 h-4 w-4" /> Share</Button>
          <Button onClick={handleDownload}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analyzed Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-muted/50 rounded-lg flex items-center justify-center border overflow-hidden relative">
                 {/* Placeholder for uploaded image */}
                 <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"></div>
                 <Layers className="h-12 w-12 text-muted-foreground/30" />
                 <span className="absolute bottom-2 left-2 text-xs font-mono bg-background/80 px-2 py-1 rounded">
                   {report.uploads?.file_name || "Fabric_Sample.jpg"}
                 </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Confidence Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{(report.confidence_score * 100).toFixed(1)}%</div>
              <p className="text-sm text-muted-foreground mt-2">High confidence in identification.</p>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fabric Metrics</CardTitle>
              <CardDescription>Detailed thread structure analysis.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="p-4 border rounded-xl bg-muted/10">
                  <div className="text-sm text-muted-foreground mb-1">Detected Fabric Type</div>
                  <div className="text-xl font-bold text-primary">{report.fabric_type}</div>
                </div>
                <div className="p-4 border rounded-xl bg-muted/10">
                  <div className="text-sm text-muted-foreground mb-1">Thread Density</div>
                  <div className="text-xl font-bold">{report.thread_density} <span className="text-sm font-normal text-muted-foreground">threads/cm²</span></div>
                </div>
                <div className="p-4 border rounded-xl bg-muted/10">
                  <div className="text-sm text-muted-foreground mb-1">Warp Count</div>
                  <div className="text-xl font-bold">{report.warp_count} <span className="text-sm font-normal text-muted-foreground">EPI</span></div>
                </div>
                <div className="p-4 border rounded-xl bg-muted/10">
                  <div className="text-sm text-muted-foreground mb-1">Weft Count</div>
                  <div className="text-xl font-bold">{report.weft_count} <span className="text-sm font-normal text-muted-foreground">PPI</span></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {report.suggestions?.map((suggestion: string, idx: number) => (
                  <li key={idx} className="flex gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-muted-foreground">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
