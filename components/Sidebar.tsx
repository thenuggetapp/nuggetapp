'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Search, Menu, User, Settings, Bookmark, LogOut, Store, BarChart3, CreditCard, Megaphone, Tag, Shield, TrendingUp, Crown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SuggestRestaurantModal } from '@/components/SuggestRestaurantModal';
import { getRoleName } from '@/lib/permissions';

interface SidebarProps {
  onAddClick?: () => void;
}

export function Sidebar({ onAddClick }: SidebarProps = {}) {
  const { user, userProfile, permissions, signOut } = useAuth();
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const renderDropdownContent = () => {
    if (!userProfile) return null;

    const isOwner = userProfile.role === 'owner' || permissions.canAccessOwnerDashboard;
    const isLocalHero = userProfile.role === 'local_hero' || permissions.canAccessLocalHeroDashboard;
    const isAdmin = userProfile.role === 'admin' || permissions.canAccessAdminPanel;

    return (
      <>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{userProfile.full_name || 'User'}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            <Badge className="w-fit mt-1">{getRoleName(userProfile.role)}</Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isOwner && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Restaurant Owner
            </DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/owner/dashboard" className="flex items-center cursor-pointer">
                <Store className="mr-2 h-4 w-4" />
                <span>Owner Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/owner/restaurants" className="flex items-center cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>My Restaurants</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/owner/analytics" className="flex items-center cursor-pointer">
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>Analytics</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/owner/marketing" className="flex items-center cursor-pointer">
                <Megaphone className="mr-2 h-4 w-4" />
                <span>Marketing</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/owner/coupons" className="flex items-center cursor-pointer">
                <Tag className="mr-2 h-4 w-4" />
                <span>Coupons</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/owner/billing" className="flex items-center cursor-pointer">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/owner/settings" className="flex items-center cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {isLocalHero && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Local Hero
            </DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/local-hero" className="flex items-center cursor-pointer">
                <TrendingUp className="mr-2 h-4 w-4" />
                <span>Hero Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {isAdmin && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Administration
            </DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/admin" className="flex items-center cursor-pointer">
                <Shield className="mr-2 h-4 w-4" />
                <span>Admin Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/users" className="flex items-center cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Manage Users</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {!isOwner && !isAdmin && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/saved" className="flex items-center cursor-pointer">
                <Bookmark className="mr-2 h-4 w-4" />
                <span>Saved Places</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowSuggestModal(true)} className="cursor-pointer">
              <Store className="mr-2 h-4 w-4" />
              <span>Suggest a Restaurant</span>
            </DropdownMenuItem>
            {/* <DropdownMenuItem asChild>
              <Link href="/subscription" className="flex items-center cursor-pointer">
                <Crown className="mr-2 h-4 w-4" />
                <span>My Subscription</span>
              </Link>
            </DropdownMenuItem> */}
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem onClick={signOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </>
    );
  };

  return (
    <>
      <div className={`fixed left-0 top-0 h-full bg-white border-r border-slate-200 flex flex-col py-4 z-50 transition-all duration-300 ${isExpanded ? 'w-64' : 'w-16'}`} role="navigation" aria-label="Main sidebar">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            }
          }}
          className={`flex items-center text-slate-700 rounded-lg mb-8 ${isExpanded ? 'w-full px-4 h-10' : 'w-10 h-10 mx-auto justify-center'}`}
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <Menu className="h-5 w-5 flex-shrink-0" />
          {isExpanded && (
            <Image
              src="/nugget_colour_logo_01.png"
              alt="Nugget"
              width={120}
              height={40}
              className="ml-3 mt-5"
              style={{ transform: 'none', transition: 'none' }}
            />
          )}
        </button>

        <div className="flex flex-col gap-4 flex-1 overflow-y-auto" tabIndex={0}>
          <Link href="/" className={isExpanded ? 'w-full' : ''}>
            <button className={`flex items-center text-slate-700 hover:bg-slate-100 rounded-lg ${isExpanded ? 'w-full px-4 h-10' : 'w-10 h-10 mx-auto justify-center'}`} aria-label="Home">
              <Home className="h-5 w-5 flex-shrink-0" />
              {isExpanded && <span className="ml-3">Home</span>}
            </button>
          </Link>

          <Link href="/search" className={isExpanded ? 'w-full' : ''}>
            <button className={`flex items-center text-slate-700 hover:bg-slate-100 rounded-lg ${isExpanded ? 'w-full px-4 h-10' : 'w-10 h-10 mx-auto justify-center'}`} aria-label="Search">
              <Search className="h-5 w-5 flex-shrink-0" />
              {isExpanded && <span className="ml-3">Search</span>}
            </button>
          </Link>

          <Link href="/saved" className={isExpanded ? 'w-full' : ''}>
            <button className={`flex items-center text-slate-700 hover:bg-slate-100 rounded-lg ${isExpanded ? 'w-full px-4 h-10' : 'w-10 h-10 mx-auto justify-center'}`} aria-label="Saved">
              <Bookmark className="h-5 w-5 flex-shrink-0" />
              {isExpanded && <span className="ml-3">Saved</span>}
            </button>
          </Link>
        </div>

        <div className={`flex flex-col gap-4 ${isExpanded ? 'px-4' : 'items-center'}`}>
          {userProfile?.role === 'owner' || userProfile?.role === 'admin' ? (
            <button
              onClick={onAddClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onAddClick?.();
                }
              }}
              className={`flex items-center text-white bg-[#8dbf65] hover:bg-[#7aaa56] rounded-lg ${isExpanded ? 'w-full px-4 h-10' : 'w-10 h-10 justify-center'}`}
              title="Add Restaurant"
              aria-label="Add Restaurant"
            >
              <span className="text-lg font-bold">+</span>
              {isExpanded && <span className="ml-3">Add Restaurant</span>}
            </button>
          ) : (
            <button
              onClick={() => setShowSuggestModal(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setShowSuggestModal(true);
                }
              }}
              className={`flex items-center text-white bg-[#8dbf65] hover:bg-[#7aaa56] rounded-lg ${isExpanded ? 'w-full px-4 h-10' : 'w-10 h-10 justify-center'}`}
              title="Suggest a Restaurant"
              aria-label="Suggest a Restaurant"
            >
              <span className="text-lg font-bold">+</span>
              {isExpanded && <span className="ml-3">Suggest Restaurant</span>}
            </button>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={`relative rounded-full p-0 ${isExpanded ? 'w-full h-10 justify-start px-4' : 'h-10 w-10'}`} aria-label="User profile menu">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className="bg-slate-900 text-white">
                      {getInitials(user.email || '')}
                    </AvatarFallback>
                  </Avatar>
                  {isExpanded && <span className="ml-3 text-sm font-medium truncate">{userProfile?.full_name || user.email?.split('@')[0]}</span>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {renderDropdownContent()}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login" className={isExpanded ? 'w-full' : ''}>
              <button
                className={`flex items-center text-white bg-[#8dbf65] hover:bg-[#7aaa56] rounded-full ${isExpanded ? 'w-full px-4 h-10' : 'w-10 h-10 justify-center'}`}
                aria-label="Login"
              >
                <User className="h-5 w-5 flex-shrink-0" />
                {isExpanded && <span className="ml-3">Login</span>}
              </button>
            </Link>
          )}
        </div>
      </div>

      <SuggestRestaurantModal open={showSuggestModal} onOpenChange={setShowSuggestModal} />
    </>
  );
}
