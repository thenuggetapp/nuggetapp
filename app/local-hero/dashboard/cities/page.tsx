'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { LocalHeroNav } from '@/components/LocalHeroNav';
import { LocalHeroHeader } from '@/components/LocalHeroHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building, Loader2 } from 'lucide-react';

interface CityAssignment {
  id: string;
  city_name: string;
  state: string;
  is_active: boolean;
  assigned_at: string;
}

interface CityStats {
  city: string;
  state: string;
  restaurantCount: number;
  views: number;
  earnings: number;
}

export default function CitiesPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<CityAssignment[]>([]);
  const [cityStats, setCityStats] = useState<CityStats[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (!authLoading && userProfile && userProfile.role !== 'local_hero') {
      router.push('/');
      return;
    }

    if (user && userProfile?.role === 'local_hero') {
      loadCitiesData();
    }
  }, [user, userProfile, authLoading, router]);

  const loadCitiesData = async () => {
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

      if (activeCities.length > 0) {
        const stats: CityStats[] = [];

        for (const city of activeCities) {
          const assignment = assignmentsData?.find(a => a.city_name === city);

          const { count } = await supabase
            .from('restaurants')
            .select('*', { count: 'exact', head: true })
            .eq('city', city);

          stats.push({
            city,
            state: assignment?.state || '',
            restaurantCount: count || 0,
            views: 0,
            earnings: 0,
          });
        }

        setCityStats(stats);
      }
    } catch (error) {
      console.error('Error loading cities data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#8dbf65]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <LocalHeroNav />

      <div className="flex-1 flex flex-col">
        <LocalHeroHeader
          title="Your Cities"
          description="Manage your assigned cities and track their performance"
        />

        <div className="flex-1 overflow-auto">
          <div className="px-6 py-6">

        {assignments.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">No City Assignments Yet</p>
                <p className="text-gray-400 text-sm">
                  Contact an administrator to get assigned to cities
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment) => {
              const stats = cityStats.find(
                s => s.city === assignment.city_name
              );

              return (
                <Card key={assignment.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          {assignment.city_name}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {assignment.state}
                        </p>
                      </div>
                      {assignment.is_active ? (
                        <Badge className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building className="h-4 w-4" />
                          Restaurants
                        </div>
                        <span className="font-semibold">
                          {stats?.restaurantCount || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Views</span>
                        <span className="font-semibold">
                          {stats?.views || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Earnings</span>
                        <span className="font-semibold text-green-600">
                          ${(stats?.earnings || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="pt-2 border-t">
                        <span className="text-xs text-gray-500">
                          Assigned {new Date(assignment.assigned_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
