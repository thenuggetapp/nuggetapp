'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Store,
  Eye,
  Ticket,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  Calendar,
  DollarSign,
  Users,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  totalRestaurants: number;
  totalViews: number;
  activeCoupons: number;
  subscriptionPlan: string;
  subscriptionStatus: string;
}

const dummyChartData = [
  { date: 'Jan 15', views: 245, bookings: 12, revenue: 1200 },
  { date: 'Jan 22', views: 312, bookings: 18, revenue: 1650 },
  { date: 'Jan 29', views: 289, bookings: 15, revenue: 1450 },
  { date: 'Feb 5', views: 401, bookings: 24, revenue: 2100 },
  { date: 'Feb 12', views: 378, bookings: 21, revenue: 1950 },
  { date: 'Feb 19', views: 456, bookings: 28, revenue: 2400 },
  { date: 'Feb 26', views: 523, bookings: 32, revenue: 2850 },
];

export default function OwnerDashboardPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const showWelcome = searchParams?.get('welcome') === 'true';
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalRestaurants: 0,
    totalViews: 0,
    activeCoupons: 0,
    subscriptionPlan: 'free',
    subscriptionStatus: 'active',
  });

  useEffect(() => {
    // Wait for auth to complete
    if (authLoading) {
      return;
    }

    // Only fetch data if user exists
    if (user) {
      loadDashboardData();
    } else {
      // No user found, stop loading
      setLoading(false);
    }
  }, [user, authLoading]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const [restaurantsResult, subscriptionResult] = await Promise.all([
        supabase
          .from('restaurant_ownership')
          .select('restaurant_id, restaurants(id, name)')
          .eq('owner_id', user.id),
        supabase
          .from('subscriptions')
          .select('plan_type, status')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);

      const restaurantIds = (restaurantsResult.data || []).map((r) => r.restaurant_id);

      let totalViews = 0;
      let activeCoupons = 0;

      if (restaurantIds.length > 0) {
        const [analyticsResult, couponsResult] = await Promise.all([
          supabase
            .from('restaurant_analytics')
            .select('views')
            .in('restaurant_id', restaurantIds)
            .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
          supabase
            .from('coupons')
            .select('id')
            .in('restaurant_id', restaurantIds)
            .eq('active', true)
            .lte('valid_from', new Date().toISOString())
            .gte('valid_to', new Date().toISOString()),
        ]);

        totalViews = (analyticsResult.data || []).reduce((sum, a) => sum + (a.views || 0), 0);
        activeCoupons = (couponsResult.data || []).length;
      }

      setStats({
        totalRestaurants: restaurantIds.length,
        totalViews,
        activeCoupons,
        subscriptionPlan: subscriptionResult.data?.plan_type || 'free',
        subscriptionStatus: subscriptionResult.data?.status || 'active',
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while auth is initializing or data is loading
  if (authLoading || loading) {
    return (
      <div className="p-8 space-y-8">
        {/* Header skeleton */}
        <div>
          <Skeleton className="h-9 w-96 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>

        {/* Action cards skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {showWelcome && (
        <Alert className="bg-green-50 border-green-200">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-900">Welcome to Nugget Owner Portal!</AlertTitle>
          <AlertDescription className="text-green-700">
            Your account has been created successfully. Get started by adding your first restaurant.
          </AlertDescription>
        </Alert>
      )}

      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back, {userProfile?.full_name || 'Owner'}!
        </h1>
        <p className="text-slate-600 mt-2">
          Here's an overview of your restaurant portfolio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Restaurants</CardTitle>
            <Store className="h-4 w-4 text-[#8dbf65]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRestaurants}</div>
            <p className="text-xs text-slate-600 mt-1">Active listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-slate-600 mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
            <Ticket className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCoupons}</div>
            <p className="text-xs text-slate-600 mt-1">Currently available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{stats.subscriptionPlan}</div>
            <Badge
              className={`mt-1 ${
                stats.subscriptionStatus === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              {stats.subscriptionStatus}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {stats.totalRestaurants === 0 ? (
        <Card className="bg-[#101729] text-white">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Get Started with Your First Restaurant</CardTitle>
            <CardDescription className="text-white/90">
              Add your restaurant to start reaching more families and growing your business
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                  <Store className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold mb-1">Add Details</h3>
                <p className="text-sm text-white/80">Enter your restaurant information and photos</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold mb-1">Reach Families</h3>
                <p className="text-sm text-white/80">Attract more family diners, increase loyalty and boost revenue</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold mb-1">Track Growth</h3>
                <p className="text-sm text-white/80">Monitor views and engagement with analytics</p>
              </div>
            </div>
            <Link href="/owner/restaurants/new">
              <Button size="lg" className="bg-white text-[#101729] hover:bg-slate-50">
                <PlusCircle className="mr-2 h-5 w-5" />
                Add Your First Restaurant
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Your restaurant analytics at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dummyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 4 }}
                      name="Views"
                    />
                    <Line
                      type="monotone"
                      dataKey="bookings"
                      stroke="#8dbf65"
                      strokeWidth={2}
                      dot={{ fill: '#8dbf65', r: 4 }}
                      name="Bookings"
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ fill: '#f59e0b', r: 4 }}
                      name="Revenue ($)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-slate-600">Views</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">2,604</div>
                  <p className="text-xs text-green-600 mt-1">+12.5% vs last period</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-[#8dbf65]"></div>
                    <span className="text-sm text-slate-600">Bookings</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">150</div>
                  <p className="text-xs text-green-600 mt-1">+18.2% vs last period</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-sm text-slate-600">Revenue</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">$13,600</div>
                  <p className="text-xs text-green-600 mt-1">+15.8% vs last period</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks to manage your restaurants</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/owner/restaurants/new">
                  <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add New Restaurant
                    </div>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/owner/coupons">
                  <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center">
                      <Ticket className="mr-2 h-4 w-4" />
                      Create Coupon
                    </div>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/owner/analytics">
                  <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center">
                      <Eye className="mr-2 h-4 w-4" />
                      View Analytics
                    </div>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                {stats.subscriptionPlan === 'free' && (
                  <Link href="/owner/marketing">
                    <Button
                      variant="outline"
                      className="w-full justify-between border-[#8dbf65] text-[#8dbf65] hover:bg-[#8dbf65] hover:text-white"
                    >
                      <div className="flex items-center">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Upgrade to Pro
                      </div>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {stats.subscriptionPlan === 'free' && (
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <CardHeader>
                  <CardTitle className="text-white">Unlock Pro Features</CardTitle>
                  <CardDescription className="text-white/80">
                    Grow your business with advanced tools
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <div className="w-5 h-5 rounded-full bg-[#8dbf65] flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                        <span className="text-xs">✓</span>
                      </div>
                      <span className="text-sm">Unlimited restaurant photos</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-5 h-5 rounded-full bg-[#8dbf65] flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                        <span className="text-xs">✓</span>
                      </div>
                      <span className="text-sm">Priority search placement</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-5 h-5 rounded-full bg-[#8dbf65] flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                        <span className="text-xs">✓</span>
                      </div>
                      <span className="text-sm">Coupon and deals management</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-5 h-5 rounded-full bg-[#8dbf65] flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                        <span className="text-xs">✓</span>
                      </div>
                      <span className="text-sm">Advanced analytics and insights</span>
                    </li>
                  </ul>
                  <Link href="/owner/marketing">
                    <Button size="lg" className="w-full bg-[#8dbf65] hover:bg-[#7aaa56]">
                      Upgrade Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
