import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary transform transition-transform lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-primary-foreground/10">
          <Link to="/admin" className="text-primary-foreground font-display font-bold text-lg">
            NCE Admin
          </Link>
          <button className="lg:hidden text-primary-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1 pb-32">
          {sidebarItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-primary-foreground/15 text-secondary"
                  : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-foreground/10 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
            Back to Website
          </Link>
          <button
            onClick={() => { logout(); navigate("/admin/login"); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-card border-b border-border px-4 py-3 flex items-center gap-4 sticky top-0 z-30">
          <button className="lg:hidden text-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center text-sm text-muted-foreground">
            <Link to="/admin" className="hover:text-foreground transition-colors">Admin</Link>
            {location.pathname !== "/admin" && (
              <>
                <ChevronRight className="h-4 w-4 mx-1" />
                <span className="text-foreground capitalize">
                  {location.pathname.split("/").pop()}
                </span>
              </>
            )}
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
