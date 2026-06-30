"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, Download, Trash2, Layers, Loader2 } from "lucide-react";
import Link from "next/link";
import { useInView } from "react-intersection-observer";

export default function HistoryPage() {
  const [reports, setReports] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const supabase = createClient();

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const { ref, inView } = useInView();

  const fetchReports = useCallback(async (isLoadMore = false) => {
    if (!isLoadMore) setLoading(true);
    else setIsFetchingMore(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const from = isLoadMore ? page * 5 : 0;
      const to = from + 4;

      const { data, error } = await supabase
        .from("reports")
        .select("*, uploads(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (!error && data) {
        if (data.length < 5) setHasMore(false);
        else setHasMore(true);

        setReports(prev => {
          const newItems = isLoadMore ? [...prev, ...data] : data;
          // Deduplicate just in case
          const unique = newItems.filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i);
          return unique;
        });
        
        if (isLoadMore) setPage(p => p + 1);
        else setPage(1);
      }
    }
    setLoading(false);
    setIsFetchingMore(false);
  }, [supabase, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReports();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (inView && hasMore && !loading && !isFetchingMore) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchReports(true);
    }
  }, [inView, hasMore, loading, isFetchingMore, fetchReports]);

  const filteredReports = useMemo(() => {
    if (searchQuery.trim() === "") {
      return reports;
    }
    const lowerQuery = searchQuery.toLowerCase();
    return reports.filter((r) => {
      const matchesSearch = ((r.uploads as Record<string, unknown>)?.file_name as string)?.toLowerCase().includes(lowerQuery) ||
                            (r.fabric_type as string)?.toLowerCase().includes(lowerQuery);
      const matchesFilter = filterType === "All" || r.fabric_type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filterType, reports]);

  const uniqueFabricTypes = useMemo(() => {
    const types = new Set(reports.map(r => r.fabric_type as string).filter(Boolean));
    return ["All", ...Array.from(types)];
  }, [reports]);

  const handleDownload = (report: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const content = `ThreadCounty Analysis Report\n\nFile: ${report.uploads?.file_name || 'Unknown'}\nDate: ${new Date(report.created_at).toLocaleString()}\nFabric Type: ${report.fabric_type}\nThread Density: ${report.thread_density}\nWarp/Weft Count: ${report.warp_count}/${report.weft_count}\nConfidence: ${report.confidence_score}%\n\nSuggestions:\n${report.suggestions?.join('\n') || ''}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ThreadCounty_Report_${report.id.substring(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (reportId: string, uploadId: string | undefined, storagePath: string | undefined) => {
    if (confirm("Are you sure you want to delete this report and its associated image?")) {
      if (storagePath) {
        await supabase.storage.from("uploads").remove([storagePath]);
      }
      
      let success = false;
      if (uploadId) {
        const { error } = await supabase.from("uploads").delete().eq("id", uploadId);
        success = !error;
      }
      
      if (!success) {
        await supabase.from("reports").delete().eq("id", reportId);
      }
      setReports(reports.filter(r => r.id !== reportId));
    }
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center">Loading history...</div>;
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">Analysis History</h1>
          <p className="text-muted-foreground">View and manage your previous fabric analysis reports.</p>
        </div>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 relative">
             <div className="relative flex-1">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input 
                 placeholder="Search by file name or fabric type..." 
                 className="pl-10 w-full"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
             </div>
             <div className="sm:w-64">
               <select 
                 className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                 value={filterType}
                 onChange={(e) => setFilterType(e.target.value)}
               >
                 {uniqueFabricTypes.map(type => (
                   <option key={type} value={type}>{type}</option>
                 ))}
               </select>
             </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12 border rounded-xl bg-muted/10">
            <Layers className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
            <h3 className="text-lg font-medium">No reports found</h3>
            <p className="text-muted-foreground mb-4">You haven&apos;t generated any reports that match your search.</p>
            <Link href="/dashboard/upload">
              <Button>Upload a New Image</Button>
            </Link>
          </div>
        ) : (
          filteredReports.map((report: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
            <Card key={report.id as string} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row p-4 items-center gap-4">
                 <div className="h-16 w-16 bg-muted/50 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-primary" />
                 </div>
                 <div className="flex-1 min-w-0 text-center md:text-left">
                    <h3 className="text-lg font-bold truncate">{report.uploads?.file_name || "Unknown File"}</h3>
                    <div className="text-sm text-muted-foreground flex flex-wrap justify-center md:justify-start gap-3 mt-1">
                      <span>Type: <span className="text-foreground font-medium">{report.fabric_type}</span></span>
                      <span>Density: {report.thread_density}</span>
                      <span>{new Date(report.created_at).toLocaleDateString()}</span>
                    </div>
                 </div>
                 <div className="flex gap-2 w-full md:w-auto">
                    <Link href={`/dashboard/reports/${report.id}`} className="flex-1 md:flex-none">
                      <Button variant="outline" className="w-full">View</Button>
                    </Link>
                    <Button variant="ghost" size="icon" title="Download Text Report" onClick={() => handleDownload(report)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(report.id as string, (report.uploads as any)?.id, (report.uploads as any)?.storage_path)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                 </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {hasMore && filteredReports.length > 0 && (
        <div ref={ref} className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
