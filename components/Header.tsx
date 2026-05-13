'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { LogOut, Bookmark, Settings, User, Crown, Shield, Store, TrendingUp, Menu, X, Handshake, Award, CircleHelp as HelpCircle, Chrome as Home, CirclePlus as PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { getRoleName } from '@/lib/permissions';

export function Header() {
  const { user, userProfile, loading: authLoading, permissions, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="bg-transparent sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white hover:bg-white/10"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open main navigation menu"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </Button>

          <Link href="/" className="hidden lg:flex items-center space-x-2">
            <img
              src="https://cdn.prod.website-files.com/65c4e3031d72984c18dbb698/65e621c26e369137d198cadf_Black%20logo%20-%20no%20background-p-500.png"
              alt="The Nugget - Return to homepage"
              className="h-20 mt-10 brightness-0 invert"
            />
          </Link>
        </div>

        <nav className="hidden lg:flex">
          {user && !authLoading ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarFallback className="bg-slate-900 text-white">
                      {getInitials(user.email || '')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {userProfile && (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{userProfile.full_name || 'User'}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <Badge className="w-fit mt-1">{getRoleName(userProfile.role)}</Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                  </>
                )}

                {userProfile && !permissions.canAccessOwnerDashboard && (
                  <DropdownMenuItem asChild>
                    <Link href="/saved" className="flex items-center cursor-pointer">
                      <Bookmark className="mr-2 h-4 w-4" />
                      <span>Saved Places</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                {/* <DropdownMenuItem asChild>
                  <Link href="/subscription" className="flex items-center cursor-pointer">
                    <Crown className="mr-2 h-4 w-4" />
                    <span>My Subscription</span>
                  </Link>
                </DropdownMenuItem> */}

                {userProfile && permissions.canAccessOwnerDashboard && (
                  <>
                    <DropdownMenuSeparator />
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
                        <span>Manage Restaurants</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                {userProfile && permissions.canAccessLocalHeroDashboard && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      Local Hero
                    </DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href="/local-hero/dashboard" className="flex items-center cursor-pointer">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        <span>Hero Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                {userProfile && permissions.canApplyAsLocalHero && !permissions.canAccessOwnerDashboard && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/local-hero" className="flex items-center cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Become a Local Hero</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                {userProfile && permissions.canAccessAdminPanel && (
                  <>
                    <DropdownMenuSeparator />
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
                    <DropdownMenuItem asChild>
                      <Link href="/admin/local-heroes" className="flex items-center cursor-pointer">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        <span>Manage Local Heroes</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <a href="https://www.thenugget.app/suggest" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="text-white hover:text-white">
                  Add a Restaurant
                </Button>
              </a>
              <Link href="/partner">
                <Button variant="ghost" size="sm" className="text-white hover:text-white">
                  For Restaurants
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-white hover:text-white">
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-[#8dbf65] hover:bg-[#7aad52] text-white">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </nav>

        <nav className="lg:hidden flex items-center gap-2">
          {user && !authLoading ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-slate-900 text-white text-xs">
                      {getInitials(user.email || '')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {userProfile && (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{userProfile.full_name || 'User'}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <Badge className="w-fit mt-1">{getRoleName(userProfile.role)}</Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/10">
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-[#8dbf65] hover:bg-[#7aad52] text-white">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full">
            <SheetHeader className="p-6 border-b">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <img
                  src="https://cdn.prod.website-files.com/65c4e3031d72984c18dbb698/65e621c26e369137d198cadf_Black%20logo%20-%20no%20background-p-500.png"
                  alt="The Nugget - Return to homepage"
                  className="h-16 w-auto"
                />
              </Link>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <Link
                  href="/"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="h-5 w-5" aria-hidden="true" />
                  <span className="font-medium">Home</span>
                </Link>

                <a
                  href="https://www.thenugget.app/suggest"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <PlusCircle className="h-5 w-5" aria-hidden="true" />
                  <span className="font-medium">Add a Restaurant</span>
                </a>

                <Link
                  href="/partner"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Handshake className="h-5 w-5" aria-hidden="true" />
                  <span className="font-medium">Restaurant Partner</span>
                </Link>

                <Link
                  href="/local-hero"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Award className="h-5 w-5" aria-hidden="true" />
                  <span className="font-medium">Local Heroes</span>
                </Link>

                <Link
                  href="/faq"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <HelpCircle className="h-5 w-5" aria-hidden="true" />
                  <span className="font-medium">FAQs</span>
                </Link>

                {user && !authLoading ? (
                  <>
                    {userProfile && !permissions.canAccessOwnerDashboard && (
                      <Link
                        href="/saved"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Bookmark className="h-5 w-5" />
                        <span className="font-medium">Saved Places</span>
                      </Link>
                    )}

                    {/* <Link
                      href="/subscription"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Crown className="h-5 w-5" />
                      <span className="font-medium">My Subscription</span>
                    </Link> */}

                    {userProfile && permissions.canAccessOwnerDashboard && (
                      <>
                        <div className="pt-4 pb-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase">Restaurant Owner</p>
                        </div>
                        <Link
                          href="/owner/dashboard"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Store className="h-5 w-5" />
                          <span className="font-medium">Owner Dashboard</span>
                        </Link>
                        <Link
                          href="/owner/restaurants"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Settings className="h-5 w-5" />
                          <span className="font-medium">Manage Restaurants</span>
                        </Link>
                      </>
                    )}

                    {userProfile && permissions.canAccessLocalHeroDashboard && (
                      <>
                        <div className="pt-4 pb-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase">Local Hero</p>
                        </div>
                        <Link
                          href="/local-hero/dashboard"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <TrendingUp className="h-5 w-5" />
                          <span className="font-medium">Hero Dashboard</span>
                        </Link>
                      </>
                    )}

                    {userProfile && permissions.canApplyAsLocalHero && !permissions.canAccessOwnerDashboard && (
                      <Link
                        href="/local-hero"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-5 w-5" />
                        <span className="font-medium">Become a Local Hero</span>
                      </Link>
                    )}

                    {userProfile && permissions.canAccessAdminPanel && (
                      <>
                        <div className="pt-4 pb-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase">Administration</p>
                        </div>
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Shield className="h-5 w-5" />
                          <span className="font-medium">Admin Dashboard</span>
                        </Link>
                        <Link
                          href="/admin/users"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <User className="h-5 w-5" />
                          <span className="font-medium">Manage Users</span>
                        </Link>
                        <Link
                          href="/admin/local-heroes"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <TrendingUp className="h-5 w-5" />
                          <span className="font-medium">Manage Local Heroes</span>
                        </Link>
                      </>
                    )}

                  </>
                ) : null}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
