"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, Activity, Clock, Settings, Plus, Bell } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUploads: 0, totalReports: 0, storageUsage: "0.00", plan: "Free" });
  const [recentReports, setRecentReports] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [activities, setActivities] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const supabase = createClient();
  const router = useRouter();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      } else {
        setUser(user);
        
        // Fetch actual stats
        const [uploadsRes, reportsRes, notifsRes, subRes, reportsCountRes] = await Promise.all([
          supabase.from('uploads').select('file_size', { count: 'exact' }).eq('user_id', user.id),
          supabase.from('reports').select('*, uploads(file_name)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
          supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
          supabase.from('subscriptions').select('plan_name').eq('user_id', user.id).eq('status', 'active').single(),
          supabase.from('reports').select('id', { count: 'exact' }).eq('user_id', user.id)
        ]);

        const totalUploads = uploadsRes.count || 0;
        const totalSize = uploadsRes.data?.reduce((acc, curr) => acc + (curr.file_size || 0), 0) || 0;
        const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
        
        setStats({
          totalUploads,
          totalReports: reportsCountRes.count || 0,
          storageUsage: sizeInMB,
          plan: subRes.data?.plan_name || 'Free'
        });
        
        setRecentReports(reportsRes.data || []);
        setActivities(notifsRes.data || []);
      }
      setLoading(false);
    }
    getUser();
  }, [supabase, router]);

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center">Loading dashboard...</div>;
  }

  if (!user) return null;

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">Welcome back, {user.email?.split("@")[0]}</h1>
          <p className="text-muted-foreground">Here is your AI analysis overview and recent activity.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" size="icon" className="relative">
             <Bell className="h-5 w-5" />
             <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full"></span>
          </Button>
          <Link href="/dashboard/upload">
            <Button><Plus className="mr-2 h-4 w-4"/> New Analysis</Button>
          </Link>
          <Button variant="outline" onClick={() => {
            supabase.auth.signOut();
            router.push("/login");
          }}>Sign Out</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Uploads</CardTitle>
            <UploadCloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUploads}</div>
            <p className="text-xs text-muted-foreground">Lifetime</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">AI Reports Generated</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports}</div>
            <p className="text-xs text-muted-foreground">Lifetime</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.storageUsage} MB</div>
            <p className="text-xs text-muted-foreground">Of 1 GB Free Tier</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.plan}</div>
            <p className="text-xs text-muted-foreground">Current active plan</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>Your latest AI fabric analysis results.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReports.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No recent reports.</p>
              ) : recentReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-md flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{report.uploads?.file_name || "Unknown File"}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(report.created_at)} • {report.fabric_type || "Unknown Type"}</p>
                    </div>
                  </div>
                  <Link href={`/dashboard/reports/${report.id}`}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
            <CardDescription>Recent actions on your account.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               {activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
               ) : activities.map((activity) => (
                 <div key={activity.id} className="flex gap-4 border-b pb-4 last:border-0 last:pb-0">
                   <div className="mt-1"><Clock className="h-4 w-4 text-muted-foreground" /></div>
                   <div>
                     <p className="font-medium text-sm">{activity.title}</p>
                     <p className="text-xs text-muted-foreground">{formatDate(activity.created_at)}</p>
                   </div>
                 </div>
               ))}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
