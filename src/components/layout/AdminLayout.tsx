'use client'

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Calendar, Newspaper, Bell, BookOpen, Image, Users,
  LogOut, Menu, X, ChevronRight, GraduationCap, MessageCircle
} from "lucide-react";
import { logout } from "@/lib/api";

const sidebarItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Departments", path: "/admin/departments", icon: GraduationCap },
  { label: "Events", path: "/admin/events", icon: Calendar },
  { label: "News", path: "/admin/news", icon: Newspaper },
  { label: "Announcements", path: "/admin/announcements", icon: Bell },
  { label: "Schedule", path: "/admin/schedule", icon: BookOpen },
  { label: "Media", path: "/admin/media", icon: Image },
  { label: "Faculty", path: "/admin/faculty", icon: Users },
  { label: "Live Chat", path: "/admin/chat", icon: MessageCircle },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-primary text-primary-foreground transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-4 border-b border-primary-foreground/10 flex items-center justify-between">
          <h2 className="font-display font-bold text-lg">Admin Panel</h2>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}><X className="h-5 w-5" /></button>
        </div>
        <nav className="p-4 space-y-1">
          {sidebarItems.map(item => {
            const isActive = pathname === item.path || (item.path !== "/admin" && pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${isActive ? "bg-secondary text-secondary-foreground" : "hover:bg-primary-foreground/10"}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-foreground/10">
          <button
            onClick={async () => { await logout(); router.push("/admin/login"); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm w-full hover:bg-primary-foreground/10 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-card border-b border-border px-4 py-3 flex items-center gap-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}><Menu className="h-5 w-5" /></button>
          <span className="font-display font-semibold">Admin Panel</span>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
