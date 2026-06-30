"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileImage, FileText, Activity, Trash2, ArrowRight } from "lucide-react";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({ users: 0, uploads: 0, reports: 0 });
  const [recentReports, setRecentReports] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [users, setUsers] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [subscriptions, setSubscriptions] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [uploadsList, setUploadsList] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      
      // In a real app, check user role. Here we simulate admin access for demonstration.
      setIsAdmin(true);

      // Fetch overall stats
      const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: uploadsCount } = await supabase.from('uploads').select('*', { count: 'exact', head: true });
      const { count: reportsCount } = await supabase.from('reports').select('*', { count: 'exact', head: true });
      
      setStats({
        users: usersCount || 0,
        uploads: uploadsCount || 0,
        reports: reportsCount || 0
      });

      // Fetch recent reports from all users
      const { data: reports } = await supabase
        .from('reports')
        .select('*, uploads(*), profiles(email)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (reports) {
        setRecentReports(reports);
      }

      // Fetch all users
      const { data: allUsers } = await supabase
        .from('profiles')
        .select('*')
        .limit(10);
      
      if (allUsers) {
        setUsers(allUsers);
      }

      // Fetch subscriptions
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('*, profiles(first_name, last_name, email)')
        .order('created_at', { ascending: false })
        .limit(5);
      if (subs) {
        setSubscriptions(subs);
      }

      // Fetch uploads
      const { data: uploadList } = await supabase
        .from('uploads')
        .select('*, profiles(first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(5);
      if (uploadList) {
        setUploadsList(uploadList);
      }

      setLoading(false);
    }
    checkAdmin();
  }, [supabase, router]);

  const handleDeleteReport = async (id: string) => {
    if (confirm("Delete this report from the platform?")) {
      await supabase.from("reports").delete().eq("id", id);
      setRecentReports(recentReports.filter(r => r.id !== id));
      setStats(prev => ({ ...prev, reports: prev.reports - 1 }));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Permanently delete this user and all their data?")) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`${process.env.NEXT_PUBLIC_AI_BACKEND_URL || "http://127.0.0.1:8000"}/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        });
        if (res.ok) {
          setUsers(users.filter(u => u.id !== userId));
          setStats(prev => ({ ...prev, users: prev.users - 1 }));
        } else {
          alert("Failed to delete user.");
        }
      } catch (err) {
        console.error(err);
        alert("An error occurred while deleting the user.");
      }
    }
  };

  const handleToggleRole = (userId: string, currentRole: string = 'user') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (confirm(`Change this user's role to ${newRole}?`)) {
       // Mock role update for UI
       setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center">Loading admin panel...</div>;

  if (!isAdmin) return <div className="text-center py-20 text-destructive">Unauthorized Access</div>;

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview and user management.</p>
        </div>
      </div>

      {/* Platform Statistics */}
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Uploads</CardTitle>
            <FileImage className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uploads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reports}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Platform Reports</CardTitle>
            <CardDescription>Latest AI analyses across all users.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReports.length === 0 ? (
                <p className="text-muted-foreground text-sm">No reports generated yet.</p>
              ) : (
                recentReports.map(report => (
                  <div key={report.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{report.uploads?.file_name || "Unknown File"}</p>
                      <p className="text-xs text-muted-foreground">User ID: {report.user_id.substring(0,8)}... • Type: {report.fabric_type}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteReport(report.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Manage Users</CardTitle>
            <CardDescription>View and manage platform users.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {users.length === 0 ? (
                <p className="text-muted-foreground text-sm">No users found.</p>
              ) : (
                users.map(u => (
                  <div key={u.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{u.first_name || 'User'} {u.last_name || ''}</p>
                      <p className="text-xs text-muted-foreground">ID: {u.id.substring(0,8)}... • {u.email || ''}</p>
                      <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full mt-1 inline-block ${u.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {u.role || 'USER'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleToggleRole(u.id, u.role)}>
                        Make {u.role === 'admin' ? 'User' : 'Admin'}
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteUser(u.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Users <ArrowRight className="ml-2 h-4 w-4 text-muted-foreground" />
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Manage Subscriptions</CardTitle>
            <CardDescription>View recent user subscriptions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {subscriptions.length === 0 ? (
                <p className="text-muted-foreground text-sm">No active subscriptions found.</p>
              ) : (
                subscriptions.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{sub.profiles?.first_name || 'User'} {sub.profiles?.last_name || ''}</p>
                      <p className="text-xs text-muted-foreground">{sub.profiles?.email}</p>
                    </div>
                    <div className="text-right">
                       <p className="font-bold text-primary">{sub.plan_name}</p>
                       <p className="text-xs text-muted-foreground capitalize">Status: {sub.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Uploaded Images</CardTitle>
            <CardDescription>View recent fabric image uploads across the platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {uploadsList.length === 0 ? (
                <p className="text-muted-foreground text-sm">No recent uploads found.</p>
              ) : (
                uploadsList.map(up => (
                  <div key={up.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <FileImage className="h-8 w-8 text-primary/60" />
                      <div>
                        <p className="font-medium">{up.file_name}</p>
                        <p className="text-xs text-muted-foreground">User: {up.profiles?.first_name || 'Unknown'} • Size: {(up.file_size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                       View Image
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
