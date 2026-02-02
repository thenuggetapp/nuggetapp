'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Store,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MapPin,
  Heart,
  Filter,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  cuisine: string;
  address: string;
  city: string | null;
  image_url: string | null;
  visible: boolean;
  likes_count: number;
  price_level: number;
  created_at: string;
}

export default function MyRestaurantsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'hidden'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingRestaurantId, setDeletingRestaurantId] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth to complete
    if (authLoading) {
      return;
    }

    // Only fetch data if user exists
    if (user) {
      loadRestaurants();
    } else {
      // No user found, stop loading
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    filterRestaurants();
  }, [restaurants, searchQuery, filterStatus]);

  const loadRestaurants = async () => {
    if (!user) return;

    try {
      const { data: ownershipData, error: ownershipError } = await supabase
        .from('restaurant_ownership')
        .select('restaurant_id')
        .eq('owner_id', user.id);

      if (ownershipError) throw ownershipError;

      const restaurantIds = (ownershipData || []).map((o) => o.restaurant_id);

      if (restaurantIds.length === 0) {
        setRestaurants([]);
        setFilteredRestaurants([]);
        setLoading(false);
        return;
      }

      const { data: restaurantsData, error: restaurantsError } = await supabase
        .from('restaurants')
        .select('id, name, slug, cuisine, address, city, image_url, visible, likes_count, price_level, created_at')
        .in('id', restaurantIds)
        .order('created_at', { ascending: false });

      if (restaurantsError) throw restaurantsError;

      setRestaurants(restaurantsData || []);
    } catch (error) {
      console.error('Error loading restaurants:', error);
      toast({
        title: 'Error',
        description: 'Failed to load restaurants',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterRestaurants = () => {
    let filtered = [...restaurants];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.cuisine.toLowerCase().includes(query) ||
          (r.city && r.city.toLowerCase().includes(query))
      );
    }

    if (filterStatus !== 'all') {
      if (filterStatus === 'published') {
        filtered = filtered.filter((r) => r.visible);
      } else if (filterStatus === 'hidden') {
        filtered = filtered.filter((r) => !r.visible);
      }
    }

    setFilteredRestaurants(filtered);
  };

  const toggleVisibility = async (restaurantId: string, currentVisibility: boolean) => {
    console.log('🔄 toggleVisibility called:', { restaurantId, currentVisibility, userId: user?.id });
    
    try {
      // First, check ownership
      console.log('🔍 Checking ownership for restaurant...');
      const { data: ownershipData, error: ownershipError } = await supabase
        .from('restaurant_ownership')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('owner_id', user?.id);
      
      console.log('📊 Ownership check:', { ownershipData, ownershipError });

      console.log('📝 Attempting to update restaurant visibility...');
      const { data, error } = await supabase
        .from('restaurants')
        .update({ visible: !currentVisibility })
        .eq('id', restaurantId)
        .select();

      console.log('📊 Update response:', { data, error, rowsAffected: data?.length });

      if (error) {
        console.error('❌ Update error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }

      console.log('✅ Visibility toggled successfully');
      toast({
        title: 'Success',
        description: `Restaurant ${currentVisibility ? 'hidden' : 'made visible'}`,
      });

      loadRestaurants();
    } catch (error: any) {
      console.error('❌ Error toggling visibility:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update restaurant visibility',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (restaurantId: string) => {
    setDeletingRestaurantId(restaurantId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingRestaurantId) return;

    console.log('🗑️ confirmDelete called:', { deletingRestaurantId, userId: user?.id });

    try {
      console.log('📝 Attempting to delete restaurant...');
      const { data, error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', deletingRestaurantId)
        .select();

      console.log('📊 Delete response:', { data, error });

      if (error) {
        console.error('❌ Delete error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }

      console.log('✅ Restaurant deleted successfully');
      toast({
        title: 'Success',
        description: 'Restaurant deleted successfully',
      });

      loadRestaurants();
    } catch (error: any) {
      console.error('❌ Error deleting restaurant:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete restaurant',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setDeletingRestaurantId(null);
    }
  };

  const getPriceLevelSymbol = (level: number) => {
    return '$'.repeat(level);
  };

  // Show loading state while auth is initializing or data is loading
  if (authLoading || loading) {
    return (
      <div className="p-8 space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-80" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Search and filter skeleton */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-16" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>

        {/* Restaurant cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-5">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex gap-2 mt-4">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Restaurants</h1>
          <p className="text-slate-600 mt-2">
            Manage your restaurant listings and track performance
          </p>
        </div>
        <Link href="/owner/restaurants/new">
          <Button className="bg-[#8dbf65] hover:bg-[#7aaa56]">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Restaurant
          </Button>
        </Link>
      </div>

      {restaurants.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, cuisine, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('all')}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'published' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('published')}
              size="sm"
            >
              Published
            </Button>
            <Button
              variant={filterStatus === 'hidden' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('hidden')}
              size="sm"
            >
              Hidden
            </Button>
          </div>
        </div>
      )}

      {restaurants.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
              <Store className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">No restaurants yet</h3>
            <p className="text-slate-600">
              Get started by adding your first restaurant listing. It only takes a few minutes!
            </p>
            <Link href="/owner/restaurants/new">
              <Button size="lg" className="bg-[#8dbf65] hover:bg-[#7aaa56]">
                <PlusCircle className="mr-2 h-5 w-5" />
                Add Your First Restaurant
              </Button>
            </Link>
          </div>
        </Card>
      ) : filteredRestaurants.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
              <Filter className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">No restaurants found</h3>
            <p className="text-slate-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <Card key={restaurant.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                {restaurant.image_url ? (
                  <img
                    src={restaurant.image_url}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Store className="h-12 w-12 text-slate-300" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge
                    className={
                      restaurant.visible
                        ? 'bg-green-500 hover:bg-green-500'
                        : 'bg-slate-500 hover:bg-slate-500'
                    }
                  >
                    {restaurant.visible ? 'Published' : 'Hidden'}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-5">
                <h3 className="font-semibold text-lg text-slate-900 mb-2 line-clamp-1">
                  {restaurant.name}
                </h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <p className="line-clamp-1">{restaurant.cuisine}</p>
                  <div className="flex items-start gap-1">
                    <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{restaurant.address}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                      <span className="font-medium">{restaurant.likes_count || 0}</span>
                    </div>
                    <span className="text-slate-500">{getPriceLevelSymbol(restaurant.price_level)}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => toggleVisibility(restaurant.id, restaurant.visible)}
                  >
                    {restaurant.visible ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-1" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-1" />
                        Publish
                      </>
                    )}
                  </Button>
                  <Link href={`/owner/restaurants/${restaurant.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteClick(restaurant.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the restaurant
              and all associated data including coupons and analytics.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
