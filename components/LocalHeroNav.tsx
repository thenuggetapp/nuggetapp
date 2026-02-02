'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import {
  Home,
  LayoutDashboard,
  MapPin,
  DollarSign,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
  Award,
  FileText,
} from 'lucide-react';

const menuItems = [
  {
    title: 'Homepage',
    href: '/',
    icon: Home,
  },
  {
    title: 'Dashboard',
    href: '/local-hero/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Suggestions',
    href: '/local-hero/dashboard/suggestions',
    icon: FileText,
  },
  {
    title: 'My Cities',
    href: '/local-hero/dashboard/cities',
    icon: MapPin,
  },
  {
    title: 'Earnings',
    href: '/local-hero/dashboard/earnings',
    icon: DollarSign,
  },
  {
    title: 'Performance',
    href: '/local-hero/dashboard/performance',
    icon: TrendingUp,
  },
  {
    title: 'Settings',
    href: '/local-hero/dashboard/settings',
    icon: Settings,
  },
];

export function LocalHeroNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside
      className={`bg-white border-r border-slate-200 flex-shrink-0 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          {!isCollapsed && (
            <Link href="/local-hero/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#8dbf65] rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Nugget</h2>
                <p className="text-xs text-slate-500">Local Hero</p>
              </div>
            </Link>
          )}
          {isCollapsed && (
            <div className="w-full flex justify-center">
              <div className="w-10 h-10 bg-[#8dbf65] rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
          )}
        </div>

        <div className="p-2 border-b border-slate-200">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsCollapsed(!isCollapsed);
              }
            }}
            className="w-full flex items-center justify-center px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </button>
        </div>

        <nav className="flex-1 p-2 overflow-y-auto" tabIndex={0} role="navigation" aria-label="Local Hero navigation">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#8dbf65] text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  title={item.title}
                  aria-label={item.title}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium">{item.title}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-2 border-t border-slate-200">
          <button
            onClick={handleLogout}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleLogout();
              }
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
