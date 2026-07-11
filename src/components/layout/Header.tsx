'use client'

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search, ChevronDown } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import collegeLogo from "@/assets/college-logo.png";

const navItems = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  {
    label: "Academics",
    path: "/departments",
    children: [
      { label: "Departments", path: "/departments" },
      { label: "Faculty", path: "/faculty" },
      { label: "Academic Schedule", path: "/schedule" },
    ],
  },
  { label: "Admissions", path: "/admissions" },
  { label: "News", path: "/news" },
  { label: "Events", path: "/events" },
  { label: "Gallery", path: "/gallery" },
  { label: "Contact", path: "/contact" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      {/* Top bar */}
      <div className="bg-primary">
        <div className="container mx-auto px-4 py-1.5 flex justify-between items-center">
          <span className="text-primary-foreground text-sm font-body opacity-90">
            Welcome to Government Graduate College — Ravi Road, Shahdara, Lahore — Established 1970
          </span>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/contact" className="text-primary-foreground text-sm hover:text-secondary transition-colors">
              Contact
            </Link>
            <Link href="/admin" className="text-primary-foreground text-sm hover:text-secondary transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-3">
            <img src={collegeLogo.src} alt="Government Graduate College Shahdara Lahore" className="h-12 md:h-14 w-auto" />
            <div className="hidden sm:block">
              <h1 className="font-display text-lg md:text-xl font-bold text-primary leading-tight">
                Govt. Graduate College
              </h1>
              <p className="text-xs text-muted-foreground">Ravi Road, Shahdara, Lahore</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={item.path}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${
                    isActive(item.path)
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {item.label}
                  {item.children && <ChevronDown className="h-3 w-3" />}
                </Link>
                {item.children && openDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-0 w-48 bg-card rounded-md shadow-lg border border-border py-1 animate-fade-in-up">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        href={child.path}
                        className="block px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link
              href="/search"
              className="ml-2 p-2 rounded-md text-muted-foreground hover:bg-accent transition-colors"
            >
              <Search className="h-4 w-4" />
            </Link>
            <ThemeToggle />
          </nav>

          {/* Mobile controls */}
          <div className="lg:hidden flex items-center gap-1">
            <ThemeToggle />
            <button
              className="p-2 text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-card border-t border-border">
          <nav className="container mx-auto px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(item.path)
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-accent"
                  }`}
                >
                  {item.label}
                </Link>
                {item.children?.map((child) => (
                  <Link
                    key={child.path}
                    href={child.path}
                    onClick={() => setMobileOpen(false)}
                    className="block pl-8 py-1.5 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
