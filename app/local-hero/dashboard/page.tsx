'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { LocalHeroNav } from '@/components/LocalHeroNav';
import { LocalHeroHeader } from '@/components/LocalHeroHeader';
import { QuickAddRestaurantModal } from '@/components/QuickAddRestaurantModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DollarSign,
  Eye,
  TrendingUp,
  MapPin,
  Edit,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

interface CityAssignment {
  id: string;
  city_name: string;
  is_active: boolean;
  assigned_at: string;
}

interface Restaurant {
  id: string;
  name: string;
  city: string;
  country: string;
  cuisine: string;
  visible: boolean;
  likes_count: number;
}

interface Stats {
  totalEarnings: number;
  monthlyEarnings: number;
  totalViews: number;
  totalRestaurants: number;
}

export default function LocalHeroDashboard() {
  const { isAuthorized, isChecking, user, userProfile } = useRequireAuth({
    requiredRole: 'local_hero',
    allowAdminOverride: true
  });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [assignments, setAssignments] = useState<CityAssignment[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalEarnings: 0,
    monthlyEarnings: 0,
    totalViews: 0,
    totalRestaurants: 0,
  });

  useEffect(() => {
    if (isAuthorized) {
      loadDashboardData();
    }
  }, [isAuthorized]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('local_hero_assignments')
        .select('*')
        .eq('user_id', user?.id)
        .order('assigned_at', { ascending: false });

      if (assignmentsError) throw assignmentsError;

      setAssignments(assignmentsData || []);

      const activeCities = assignmentsData
        ?.filter((a) => a.is_active)
        .map((a) => a.city_name) || [];

      const { data: ownedRestaurants, error: ownershipError } = await supabase
        .from('restaurant_ownership')
        .select('restaurant_id')
        .eq('owner_id', user?.id);

      if (ownershipError) throw ownershipError;

      const ownedRestaurantIds = ownedRestaurants?.map((o) => o.restaurant_id) || [];

      let restaurantsData: any[] = [];

      if (activeCities.length > 0) {
        const { data: cityRestaurants, error: cityRestaurantsError } = await supabase
          .from('restaurants')
          .select('id, name, city, country, cuisine, visible, likes_count')
          .in('city', activeCities)
          .order('name');

        if (cityRestaurantsError) throw cityRestaurantsError;
        restaurantsData = cityRestaurants || [];
      }

      if (ownedRestaurantIds.length > 0) {
        const { data: ownedRestaurantsData, error: ownedRestaurantsError } = await supabase
          .from('restaurants')
          .select('id, name, city, country, cuisine, visible, likes_count')
          .in('id', ownedRestaurantIds)
          .order('name');

        if (ownedRestaurantsError) throw ownedRestaurantsError;

        const existingIds = new Set(restaurantsData.map((r) => r.id));
        const newRestaurants = (ownedRestaurantsData || []).filter(
          (r) => !existingIds.has(r.id)
        );
        restaurantsData = [...restaurantsData, ...newRestaurants];
      }

      setRestaurants(restaurantsData);

      setStats({
        totalEarnings: 0,
        monthlyEarnings: 0,
        totalViews: 0,
        totalRestaurants: restaurantsData.length,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRestaurantVisibility = async (restaurantId: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ visible: !currentVisibility })
        .eq('id', restaurantId);

      if (error) throw error;

      setRestaurants(
        restaurants.map((r) =>
          r.id === restaurantId ? { ...r, visible: !currentVisibility } : r
        )
      );
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  if (isChecking || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#8dbf65]" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <LocalHeroNav />

      <div className="flex-1 flex flex-col">
        <LocalHeroHeader
          title="Local Hero Dashboard"
          description={`Welcome back, ${userProfile?.full_name || user?.email}`}
          actions={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={loadDashboardData}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button
                size="sm"
                className="bg-[#8dbf65] hover:bg-[#7aaa56] gap-2"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="h-4 w-4" />
                Add Restaurant
              </Button>
            </>
          }
        />

        <div className="flex-1 overflow-auto">
          <div className="px-6 py-6">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                All-time commission
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.monthlyEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Current month earnings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews}</div>
              <p className="text-xs text-muted-foreground">
                Restaurant page views
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Restaurants</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRestaurants}</div>
              <p className="text-xs text-muted-foreground">
                In your cities
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Your City Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No city assignments yet. Contact admin for assignment.
                </p>
              ) : (
                <div className="space-y-3">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{assignment.city_name}</p>
                      </div>
                      {assignment.is_active ? (
                        <Badge className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-sm">
                Activity tracking coming soon. You'll see clicks, views, and conversions here.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Restaurants</CardTitle>
          </CardHeader>
          <CardContent>
            {restaurants.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm mb-4">
                  No restaurants found in your assigned cities.
                </p>
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="bg-[#8dbf65] hover:bg-[#7aaa56]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Restaurant
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Restaurant Name</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Cuisine</TableHead>
                      <TableHead>Likes</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {restaurants.map((restaurant) => (
                      <TableRow key={restaurant.id}>
                        <TableCell className="font-medium">{restaurant.name}</TableCell>
                        <TableCell>
                          {restaurant.city}{restaurant.country ? `, ${restaurant.country}` : ''}
                        </TableCell>
                        <TableCell>{restaurant.cuisine || 'N/A'}</TableCell>
                        <TableCell>{restaurant.likes_count || 0}</TableCell>
                        <TableCell>
                          <button
                            onClick={() =>
                              toggleRestaurantVisibility(restaurant.id, restaurant.visible)
                            }
                            className="flex items-center gap-1"
                          >
                            {restaurant.visible ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-green-600 text-sm">Visible</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-500 text-sm">Hidden</span>
                              </>
                            )}
                          </button>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/local-hero/dashboard/restaurants/${restaurant.id}`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <QuickAddRestaurantModal
          open={showAddModal}
          onOpenChange={setShowAddModal}
          onSuccess={loadDashboardData}
        />
          </div>
        </div>
      </div>
    </div>
  );
}
