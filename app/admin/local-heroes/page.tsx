'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle, MapPin, User, RefreshCw } from 'lucide-react';
import { LocalHeroApplication } from '@/lib/types/roles';
import { AdminSidebar } from '@/components/AdminSidebar';

export default function AdminLocalHeroesPage() {
  const { user, userProfile, loading: authLoading, permissions } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<LocalHeroApplication[]>([]);
  const [localHeroes, setLocalHeroes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<LocalHeroApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [newCityAssignment, setNewCityAssignment] = useState('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('[Local Heroes] Auth still loading...');
      return;
    }

    // If no user, redirect to login
    if (!user) {
      console.log('[Local Heroes] No user found, redirecting to login');
      router.push('/login');
      return;
    }

    // If user exists but no profile yet, wait for profile to load
    if (!userProfile) {
      console.log('[Local Heroes] User exists but profile not loaded yet, waiting...');
      return;
    }

    // Check if user has permission to manage local heroes
    if (!permissions.canManageLocalHeroes) {
      console.log('[Local Heroes] User does not have permission');
      router.push('/');
      return;
    }

    // All checks passed, load data
    console.log('[Local Heroes] Permission verified, loading data');
    loadData();
    loadCities();
  }, [user, userProfile, authLoading, permissions, router]);

  const loadCities = async () => {
    try {
      const { data } = await supabase
        .from('restaurants')
        .select('city')
        .not('city', 'is', null)
        .neq('city', '');

      if (data) {
        const uniqueCities = Array.from(new Set(data.map(r => r.city))).sort();
        setAvailableCities(uniqueCities);
      }
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  const loadData = async () => {
    try {
      const { data: appsData } = await supabase
        .from('local_hero_applications')
        .select(`
          *,
          user_profiles!local_hero_applications_user_id_fkey(email, full_name)
        `)
        .order('submitted_at', { ascending: false });

      console.log('[Admin Local Heroes] Applications loaded:', appsData);

      const { data: heroesData } = await supabase
        .from('user_profiles')
        .select('*, local_hero_assignments!local_hero_assignments_user_id_fkey(city_name, is_active)')
        .eq('role', 'local_hero');

      setApplications(appsData || []);
      setLocalHeroes(heroesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveApplication = async (application: LocalHeroApplication) => {
    try {
      // Update application status
      const { error: updateError } = await supabase
        .from('local_hero_applications')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          notes: reviewNotes || null,
        })
        .eq('id', application.id);

      if (updateError) {
        console.error('[Admin Local Heroes] Update error:', updateError);
        throw updateError;
      }

      // Only update user profile and create assignment if there's a user_id
      if (application.user_id) {
        const { error: roleError } = await supabase
          .from('user_profiles')
          .update({ role: 'local_hero' })
          .eq('id', application.user_id);

        if (roleError) throw roleError;

        const { error: assignmentError } = await supabase
          .from('local_hero_assignments')
          .insert({
            user_id: application.user_id,
            city_name: application.city_preference,
            is_active: true,
          });

        if (assignmentError) throw assignmentError;
      } else {
        console.log('[Admin Local Heroes] Approved anonymous application - user will need to create account');
        // For anonymous applications, you might want to send an email inviting them to create an account
      }

      setSelectedApp(null);
      setReviewNotes('');
      loadData();
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Failed to approve application. Check console for details.');
    }
  };

  const handleRejectApplication = async (application: LocalHeroApplication) => {
    try {
      const { error } = await supabase
        .from('local_hero_applications')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          notes: reviewNotes || null,
        })
        .eq('id', application.id);

      if (error) {
        console.error('[Admin Local Heroes] Reject error:', error);
        throw error;
      }

      setSelectedApp(null);
      setReviewNotes('');
      loadData();
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Failed to reject application. Check console for details.');
    }
  };

  const handleAddCityAssignment = async (userId: string) => {
    if (!newCityAssignment.trim()) return;

    try {
      const { error } = await supabase
        .from('local_hero_assignments')
        .insert({
          user_id: userId,
          city_name: newCityAssignment.trim(),
          is_active: true,
        });

      if (error) throw error;

      setNewCityAssignment('');
      loadData();
    } catch (error) {
      console.error('Error adding city assignment:', error);
    }
  };

  const handleRemoveCityAssignment = async (userId: string, cityName: string) => {
    try {
      const { error } = await supabase
        .from('local_hero_assignments')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('city_name', cityName);

      if (error) throw error;

      loadData();
    } catch (error) {
      console.error('Error removing city assignment:', error);
    }
  };

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8dbf65] mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading state while waiting for profile
  if (user && !userProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8dbf65] mx-auto mb-4"></div>
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show permission denied if user doesn't have access
  if (!permissions.canManageLocalHeroes) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>You do not have permission to access this page.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const pendingApplications = applications.filter(app => app.status === 'pending');

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <div className="border-b bg-white shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Local Heroes Management</h1>
                <p className="text-sm text-slate-600 mt-1">
                  Review applications and manage Local Hero assignments
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadData}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="px-6 py-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Pending Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingApplications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Local Heroes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{localHeroes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{applications.length}</div>
          </CardContent>
        </Card>
      </div>

      {pendingApplications.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Pending Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApplications.map((app: any) => (
                <div key={app.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold">
                        {app.full_name || app.user_profiles?.full_name || 'Unknown'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {app.email || app.user_profiles?.email || 'No email provided'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{app.city_preference || app.city || 'No city specified'}</span>
                      </div>
                      {app.submitted_at && (
                        <p className="text-xs text-gray-500 mt-1">
                          Submitted: {new Date(app.submitted_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge variant="outline">Pending</Badge>
                      {!app.user_id && (
                        <Badge variant="secondary" className="text-xs">
                          Anonymous
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div>
                      <Label className="text-sm font-semibold">Motivation</Label>
                      <p className="text-sm">{app.motivation}</p>
                    </div>
                    {app.experience && (
                      <div>
                        <Label className="text-sm font-semibold">Experience</Label>
                        <p className="text-sm">{app.experience}</p>
                      </div>
                    )}
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button onClick={() => setSelectedApp(app)}>Review Application</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Review Application</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Admin Notes</Label>
                          <Textarea
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            placeholder="Add notes about your decision..."
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => selectedApp && handleApproveApplication(selectedApp)}
                            className="flex-1"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => selectedApp && handleRejectApplication(selectedApp)}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Active Local Heroes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {localHeroes.map((hero: any) => (
              <div key={hero.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {hero.full_name || 'Unknown'}
                    </h3>
                    <p className="text-sm text-muted-foreground">{hero.email}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <Label className="text-sm font-semibold mb-2 block">Assigned Cities</Label>
                  <div className="flex flex-wrap gap-2">
                    {hero.local_hero_assignments
                      ?.filter((a: any) => a.is_active)
                      .map((assignment: any) => (
                        <Badge key={assignment.city_name} variant="secondary" className="gap-2">
                          {assignment.city_name}
                          <button
                            onClick={() => handleRemoveCityAssignment(hero.id, assignment.city_name)}
                            className="ml-1 hover:text-red-600"
                          >
                            ×
                          </button>
                        </Badge>
                      )) || <span className="text-sm text-muted-foreground">No cities assigned</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={newCityAssignment}
                    onValueChange={setNewCityAssignment}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select city to assign..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => handleAddCityAssignment(hero.id)}
                    disabled={!newCityAssignment}
                  >
                    Add City
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
