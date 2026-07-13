'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, AlertCircle, MessageSquare, Image, Building2, Users, Newspaper, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AdminLayout from "@/components/layout/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { getDashboardStats } from "@/lib/api";

interface DashboardStats {
  events: { total: number; thisMonth: number };
  news: { total: number; thisMonth: number };
  announcements: { total: number; active: number };
  messages: { total: number; unread: number };
  media: { total: number; thisWeek: number };
  departments: { total: number };
  faculty: { total: number };
}

interface ActivityItem {
  type: "event" | "news" | "media" | "message";
  label: string;
  title: string;
  time: string;
  href?: string;
}

const ACTIVITY_HREF: Record<ActivityItem["type"], string> = {
  event: "/admin/events",
  news: "/admin/news",
  media: "/admin/media",
  message: "/admin/chat",
};

interface DashboardData {
  stats: DashboardStats;
  recentActivity: ActivityItem[];
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const dashData = await getDashboardStats();
        setData(dashData as unknown as DashboardData);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardStats, 30000);
    return () => clearInterval(interval);
  }, [toast]);

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    subtext 
  }: { 
    icon: React.ComponentType<{ className: string }>;
    label: string;
    value: number;
    subtext?: string;
  }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-3xl font-bold">{value.toLocaleString()}</p>
            {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
          </div>
          <Icon className="h-8 w-8 text-primary opacity-60" />
        </div>
      </CardContent>
    </Card>
  );
  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout>
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <p>Failed to load dashboard data</p>
              </div>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const { stats, recentActivity } = data;

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening.</p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Calendar}
            label="Events"
            value={stats.events.total}
            subtext={`${stats.events.thisMonth} this month`}
          />
          <StatCard
            icon={Newspaper}
            label="News Articles"
            value={stats.news.total}
            subtext={`${stats.news.thisMonth} this month`}
          />
          <StatCard
            icon={AlertCircle}
            label="Announcements"
            value={stats.announcements.active}
            subtext={`${stats.announcements.total} total`}
          />
          <StatCard
            icon={MessageSquare}
            label="Messages"
            value={stats.messages.unread}
            subtext={`${stats.messages.total} total`}
          />
          <StatCard
            icon={Image}
            label="Media"
            value={stats.media.total}
            subtext={`${stats.media.thisWeek} this week`}
          />
          <StatCard
            icon={Building2}
            label="Departments"
            value={stats.departments.total}
          />
          <StatCard
            icon={Users}
            label="Faculty"
            value={stats.faculty.total}
          />
          <StatCard
            icon={Activity}
            label="Activity"
            value={recentActivity.length}
            subtext="Recent items"
          />
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-sm">No recent activity</p>
            ) : (
              <div className="space-y-1">
                {recentActivity.map((item, idx) => {
                  const href = item.href || ACTIVITY_HREF[item.type] || "/admin";
                  return (
                    <Link
                      key={idx}
                      href={href}
                      className="flex items-start gap-4 rounded-lg p-3 -mx-1 border-b last:border-b-0 border-border/60 last:border-0 hover:bg-muted/60 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="mt-1 shrink-0">
                        {item.type === "event" && <Calendar className="h-5 w-5 text-blue-600" />}
                        {item.type === "news" && <Newspaper className="h-5 w-5 text-green-600" />}
                        {item.type === "media" && <Image className="h-5 w-5 text-purple-600" />}
                        {item.type === "message" && <MessageSquare className="h-5 w-5 text-orange-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground truncate">{item.title}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        {formatTime(item.time)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
