"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  LayoutDashboard,
  FileText,
  MapPin,
  Mail,
  TrendingUp,
  Users,
  Activity,
  LogOut,
  Menu,
  X,
  DollarSign,
  UserCheck,
  UserCircle,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: "/", label: "Homepage", icon: Home },
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/suggestions", label: "Suggestions", icon: FileText },
  { href: "/admin/city-requests", label: "City Requests", icon: MapPin },
  { href: "/admin/contact-submissions", label: "Contact", icon: Mail },
  { href: "/admin/articles", label: "Articles", icon: FileText },
  { href: "/admin/applications", label: "Applications", icon: UserCircle },
  { href: "/admin/local-heroes", label: "Local Heroes", icon: TrendingUp },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/affiliates", label: "Affiliates", icon: UserCheck },
  { href: "/admin/commissions", label: "Commissions", icon: DollarSign },
  { href: "/admin/diagnostic", label: "Diagnostic", icon: Activity },
];

export function AdminSidebar() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const pathname = usePathname();
  const { signOut } = useAuth();

  const isActive = (href: string) => {
    if (href === "/" || href === "/admin") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside
      className={`bg-white border-r border-slate-200 flex-shrink-0 transition-all duration-300 ${
        isSidebarCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          {!isSidebarCollapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#8dbf65] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Nugget</h2>
                <p className="text-xs text-slate-500">Admin Panel</p>
              </div>
            </Link>
          )}
          {isSidebarCollapsed && (
            <div className="w-full flex justify-center">
              <div className="w-10 h-10 bg-[#8dbf65] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-2 border-b border-slate-200">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsSidebarCollapsed(!isSidebarCollapsed);
              }
            }}
            className="w-full flex items-center justify-center px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? (
              <Menu className="h-5 w-5" />
            ) : (
              <X className="h-5 w-5" />
            )}
          </button>
        </div>

        <nav className="flex-1 p-2 overflow-y-auto" tabIndex={0} role="navigation" aria-label="Admin navigation">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    active
                      ? "bg-[#8dbf65] text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                  title={item.label}
                  aria-label={item.label}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isSidebarCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-2 border-t border-slate-200">
          <button
            onClick={signOut}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                signOut();
              }
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isSidebarCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
