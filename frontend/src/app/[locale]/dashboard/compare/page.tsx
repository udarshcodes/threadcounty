"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GitCompare, Layers } from "lucide-react";
import { useRouter } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Report = any;

export default function ComparePage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedOne, setSelectedOne] = useState<string>("");
  const [selectedTwo, setSelectedTwo] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchReports() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data } = await supabase
        .from('reports')
        .select('*, uploads(file_name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setReports(data);
      setLoading(false);
    }
    fetchReports();
  }, [supabase, router]);

  const r1 = reports.find(r => r.id === selectedOne);
  const r2 = reports.find(r => r.id === selectedTwo);

  if (loading) return <div className="p-10 text-center">Loading comparison tool...</div>;

  return (
    <div className="container mx-auto py-10 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6 -ml-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading flex items-center gap-2">
          <GitCompare className="h-8 w-8 text-primary" />
          Fabric Comparison
        </h1>
        <p className="text-muted-foreground">Select two historical reports to compare their thread density and composition.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Sample A</CardTitle>
            <select 
              className="w-full p-2 border rounded-md bg-background"
              value={selectedOne}
              onChange={e => setSelectedOne(e.target.value)}
            >
              <option value="">-- Select Report --</option>
              {reports.map(r => (
                <option key={r.id} value={r.id} disabled={r.id === selectedTwo}>
                  {r.uploads?.file_name} ({new Date(r.created_at).toLocaleDateString()})
                </option>
              ))}
            </select>
          </CardHeader>
          <CardContent>
            {r1 ? (
               <div className="space-y-4">
                 <div className="aspect-video bg-muted flex items-center justify-center rounded-lg relative overflow-hidden border">
                   <Layers className="h-10 w-10 text-muted-foreground/30" />
                 </div>
                 <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-muted/20 border rounded-lg">
                      <div className="text-xs text-muted-foreground">Type</div>
                      <div className="font-bold">{r1.fabric_type}</div>
                    </div>
                    <div className="p-3 bg-muted/20 border rounded-lg">
                      <div className="text-xs text-muted-foreground">Density</div>
                      <div className="font-bold">{r1.thread_density} /cm²</div>
                    </div>
                    <div className="p-3 bg-muted/20 border rounded-lg">
                      <div className="text-xs text-muted-foreground">Warp Count</div>
                      <div className="font-bold">{r1.warp_count} EPI</div>
                    </div>
                    <div className="p-3 bg-muted/20 border rounded-lg">
                      <div className="text-xs text-muted-foreground">Weft Count</div>
                      <div className="font-bold">{r1.weft_count} PPI</div>
                    </div>
                 </div>
                 <div className="p-3 bg-primary/5 border rounded-lg text-sm">
                   <strong>Score:</strong> {(r1.confidence_score * 100).toFixed(1)}%
                 </div>
               </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                 Select a report to view metrics
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sample B</CardTitle>
            <select 
              className="w-full p-2 border rounded-md bg-background"
              value={selectedTwo}
              onChange={e => setSelectedTwo(e.target.value)}
            >
              <option value="">-- Select Report --</option>
              {reports.map(r => (
                <option key={r.id} value={r.id} disabled={r.id === selectedOne}>
                  {r.uploads?.file_name} ({new Date(r.created_at).toLocaleDateString()})
                </option>
              ))}
            </select>
          </CardHeader>
          <CardContent>
            {r2 ? (
               <div className="space-y-4">
                 <div className="aspect-video bg-muted flex items-center justify-center rounded-lg relative overflow-hidden border">
                   <Layers className="h-10 w-10 text-muted-foreground/30" />
                 </div>
                 <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-muted/20 border rounded-lg">
                      <div className="text-xs text-muted-foreground">Type</div>
                      <div className="font-bold">{r2.fabric_type}</div>
                    </div>
                    <div className="p-3 bg-muted/20 border rounded-lg">
                      <div className="text-xs text-muted-foreground">Density</div>
                      <div className="font-bold">{r2.thread_density} /cm²</div>
                    </div>
                    <div className="p-3 bg-muted/20 border rounded-lg">
                      <div className="text-xs text-muted-foreground">Warp Count</div>
                      <div className="font-bold">{r2.warp_count} EPI</div>
                    </div>
                    <div className="p-3 bg-muted/20 border rounded-lg">
                      <div className="text-xs text-muted-foreground">Weft Count</div>
                      <div className="font-bold">{r2.weft_count} PPI</div>
                    </div>
                 </div>
                 <div className="p-3 bg-primary/5 border rounded-lg text-sm">
                   <strong>Score:</strong> {(r2.confidence_score * 100).toFixed(1)}%
                 </div>
               </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                 Select a report to view metrics
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {r1 && r2 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Comparison Analysis</CardTitle>
            <CardDescription>Differences highlighted between the two fabrics.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               <p className="text-sm">
                 <strong>Density Variance:</strong> {Math.abs(r1.thread_density - r2.thread_density).toFixed(1)} threads/cm² 
                 ({r1.thread_density > r2.thread_density ? "Sample A is denser" : "Sample B is denser"}).
               </p>
               <p className="text-sm">
                 <strong>Warp Variance:</strong> {Math.abs(r1.warp_count - r2.warp_count)} EPI.
               </p>
               <p className="text-sm">
                 <strong>Weft Variance:</strong> {Math.abs(r1.weft_count - r2.weft_count)} PPI.
               </p>
               <p className="text-sm">
                 <strong>Type Match:</strong> {r1.fabric_type === r2.fabric_type ? "Identical base fabric types detected." : "Different fabric types detected."}
               </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
