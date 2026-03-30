'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Bookmark, Menu, Crown, Store, Settings, User, TrendingUp, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { getRestaurantDisplayImageUrlOrFallback } from '@/lib/restaurant-image';

interface SavedRestaurant {
  id: string;
  name: string;
  cuisine: string;
  likesCount: number;
  address: string;
  imageUrl: string;
}

export default function SavedPage() {
  const { user, userProfile, permissions } = useAuth();
  const router = useRouter();
  const [savedRestaurants, setSavedRestaurants] = useState<SavedRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchSavedRestaurants();
  }, [user, router]);

  const fetchSavedRestaurants = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: favorites, error: favError } = await supabase
        .from('favorites')
        .select('restaurant_id')
        .eq('user_id', user.id);

      if (favError) throw favError;

      if (!favorites || favorites.length === 0) {
        setSavedRestaurants([]);
        setLoading(false);
        return;
      }

      const restaurantIds = favorites.map(f => f.restaurant_id);

      const { data: restaurants, error: restError } = await supabase
        .from('restaurants')
        .select('id, name, cuisine, likes_count, address, image_url')
        .in('id', restaurantIds)
        .eq('visible', true);

      if (restError) throw restError;

      const formatted: SavedRestaurant[] = (restaurants || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        cuisine: r.cuisine,
        likesCount: r.likes_count || 0,
        address: r.address,
        imageUrl: getRestaurantDisplayImageUrlOrFallback({
          image_url: r.image_url,
          google_place_id: r.google_place_id,
        }),
      }));

      setSavedRestaurants(formatted);
    } catch (error) {
      console.error('Error fetching saved restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (restaurantId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) return;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('restaurant_id', restaurantId);

      if (error) throw error;

      setSavedRestaurants(prev => prev.filter(r => r.id !== restaurantId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-white">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <main className="flex-1 lg:ml-16 px-4 lg:px-8 py-8">
          <div className="text-center text-slate-600">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <img
                  src="https://cdn.prod.website-files.com/65c4e3031d72984c18dbb698/65e621c26e369137d198cadf_Black%20logo%20-%20no%20background-p-500.png"
                  alt="MapSearch"
                  className="h-16 w-auto"
                />
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {user ? (
                  <>
                    {!permissions.canAccessOwnerDashboard && (
                      <Link
                        href="/saved"
                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 transition-colors"
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

                    {permissions.canAccessOwnerDashboard && (
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

                    {permissions.canAccessLocalHeroDashboard && (
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

                    {permissions.canApplyAsLocalHero && !permissions.canAccessOwnerDashboard && (
                      <Link
                        href="/local-hero/apply"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-5 w-5" />
                        <span className="font-medium">Become a Local Hero</span>
                      </Link>
                    )}

                    {permissions.canAccessAdminPanel && (
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
                ) : (
                  <>
                    <Link
                      href="/owner/register"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Store className="h-5 w-5" />
                      <span className="font-medium">For Restaurants</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <main className="flex-1 lg:ml-16 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            className="h-10 w-10 flex-shrink-0"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <Link href="/">
            <img
              src="https://cdn.prod.website-files.com/65c4e3031d72984c18dbb698/65e621c26e369137d198cadf_Black%20logo%20-%20no%20background-p-500.png"
              alt="Nugget"
              className="h-8"
            />
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-8">
        <div className="max-w-full">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">My Saved Restaurants</h1>

          {savedRestaurants.length === 0 ? (
            <div className="text-center py-16">
              <Bookmark className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-700 mb-2">No saved restaurants yet</h2>
              <p className="text-slate-500 mb-6">Start exploring and bookmark your favorite restaurants!</p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Discover Restaurants
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {savedRestaurants.map((restaurant) => (
                <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`} prefetch={false}>
                  <Card className="cursor-pointer transition-all hover:shadow-lg border-slate-200 overflow-hidden h-full">
                    <div className="relative h-48 w-full overflow-hidden">
                      <img
                        src={restaurant.imageUrl}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 right-2">
                        <button
                          className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-slate-50"
                          onClick={(e) => removeBookmark(restaurant.id, e)}
                        >
                          <Bookmark className="h-4 w-4 text-blue-600 fill-blue-600" />
                        </button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-base text-slate-900 mb-2 line-clamp-1">
                        {restaurant.name}
                      </h3>
                      {restaurant.likesCount > 0 && (
                        <div className="flex items-center gap-1 mb-2">
                          <Heart className="h-3 w-3 text-red-500 fill-red-500" />
                          <span className="text-xs font-medium text-slate-700">{restaurant.likesCount} likes</span>
                        </div>
                      )}
                      <p className="text-sm text-slate-600 mb-1 line-clamp-1">{restaurant.cuisine}</p>
                      <p className="text-xs text-slate-500 line-clamp-2">{restaurant.address}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
        </div>
      </main>
    </div>
  );
}
