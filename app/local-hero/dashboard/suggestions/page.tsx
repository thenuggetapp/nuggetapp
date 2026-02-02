'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { LocalHeroNav } from '@/components/LocalHeroNav';
import { LocalHeroHeader } from '@/components/LocalHeroHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MapPin,
  Phone,
  Globe,
  RefreshCw,
  Loader2,
  Store,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RestaurantSuggestion {
  id: string;
  user_id: string;
  name: string;
  cuisine: string;
  address: string;
  city: string;
  postcode: string | null;
  phone: string | null;
  website: string | null;
  description: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  local_hero_recommendation: string | null;
  created_at: string;
  updated_at: string;
  user_profiles?: {
    full_name: string;
    email: string;
  };
}

interface CityAssignment {
  city_name: string;
  is_active: boolean;
}

export default function LocalHeroSuggestionsPage() {
  const { isAuthorized, isChecking, user, userProfile } = useRequireAuth({
    requiredRole: 'local_hero',
    allowAdminOverride: true,
  });
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<RestaurantSuggestion[]>([]);
  const [assignedCities, setAssignedCities] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSuggestion, setSelectedSuggestion] = useState<RestaurantSuggestion | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [recommendation, setRecommendation] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [isAuthorized]);

  const loadData = async () => {
    try {
      setLoading(true);

      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('local_hero_assignments')
        .select('city_name, is_active')
        .eq('user_id', user?.id);

      if (assignmentsError) throw assignmentsError;

      const activeCities =
        assignmentsData?.filter((a) => a.is_active).map((a) => a.city_name) || [];

      setAssignedCities(activeCities);

      if (activeCities.length > 0) {
        const { data: suggestionsData, error: suggestionsError } = await supabase
          .from('restaurant_suggestions')
          .select(`
            *,
            user_profiles (
              full_name,
              email
            )
          `)
          .in('city', activeCities)
          .order('created_at', { ascending: false });

        if (suggestionsError) throw suggestionsError;

        setSuggestions(suggestionsData || []);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load suggestions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSuggestions = useMemo(() => {
    let filtered = suggestions;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.cuisine.toLowerCase().includes(query) ||
          s.city.toLowerCase().includes(query) ||
          s.address.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [suggestions, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    return {
      pending: suggestions.filter((s) => s.status === 'pending').length,
      approved: suggestions.filter((s) => s.status === 'approved').length,
      rejected: suggestions.filter((s) => s.status === 'rejected').length,
      total: suggestions.length,
    };
  }, [suggestions]);

  const handleViewDetails = (suggestion: RestaurantSuggestion) => {
    setSelectedSuggestion(suggestion);
    setRecommendation(suggestion.local_hero_recommendation || '');
    setIsDetailDialogOpen(true);
  };

  const handleAddRecommendation = async (recommended: boolean) => {
    if (!selectedSuggestion) return;

    setIsProcessing(true);

    try {
      const recommendationText = recommended
        ? `${recommendation || 'Recommended by Local Hero'}`
        : `Not recommended: ${recommendation || 'No reason provided'}`;

      const { error: updateError } = await supabase
        .from('restaurant_suggestions')
        .update({
          local_hero_recommendation: recommendationText,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedSuggestion.id);

      if (updateError) throw updateError;

      toast({
        title: 'Success',
        description: `Recommendation ${recommended ? 'added' : 'noted'}`,
      });

      await loadData();
      setIsDetailDialogOpen(false);
      setSelectedSuggestion(null);
      setRecommendation('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add recommendation',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
          title="Restaurant Suggestions"
          description="Review suggestions from users in your assigned cities"
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          }
        />

        <div className="flex-1 overflow-auto">
          <div className="px-6 py-6">
            {assignedCities.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No City Assignments</h3>
                    <p className="text-slate-600">
                      You need to be assigned to at least one city to view suggestions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending</CardTitle>
                      <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.pending}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Approved</CardTitle>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.approved}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                      <XCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.rejected}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total</CardTitle>
                      <Store className="h-4 w-4 text-slate-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex-1 flex gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="Search by name, cuisine, or city..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {filteredSuggestions.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        No suggestions found
                      </div>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Restaurant Name</TableHead>
                              <TableHead>Cuisine</TableHead>
                              <TableHead>City</TableHead>
                              <TableHead>Submitted By</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Your Review</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredSuggestions.map((suggestion) => (
                              <TableRow key={suggestion.id}>
                                <TableCell className="font-medium">
                                  {suggestion.name}
                                </TableCell>
                                <TableCell>{suggestion.cuisine}</TableCell>
                                <TableCell>{suggestion.city}</TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <div className="font-medium">
                                      {suggestion.user_profiles?.full_name || 'Unknown'}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm text-slate-600">
                                    {new Date(suggestion.created_at).toLocaleDateString()}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {suggestion.local_hero_recommendation ? (
                                    <Badge variant="secondary" className="text-xs">
                                      Reviewed
                                    </Badge>
                                  ) : (
                                    <span className="text-xs text-slate-400">Not reviewed</span>
                                  )}
                                </TableCell>
                                <TableCell>{getStatusBadge(suggestion.status)}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewDetails(suggestion)}
                                    className="gap-2"
                                  >
                                    <Eye className="h-4 w-4" />
                                    View
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Restaurant Suggestion Details</DialogTitle>
            <DialogDescription>
              Review and add your recommendation
            </DialogDescription>
          </DialogHeader>

          {selectedSuggestion && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-slate-500">Restaurant Name</Label>
                  <p className="text-sm font-medium mt-1">{selectedSuggestion.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Cuisine</Label>
                  <p className="text-sm font-medium mt-1">{selectedSuggestion.cuisine}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs text-slate-500">Address</Label>
                <p className="text-sm font-medium mt-1 flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-slate-400 flex-shrink-0" />
                  {selectedSuggestion.address}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-slate-500">City</Label>
                  <p className="text-sm font-medium mt-1">{selectedSuggestion.city}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Postcode / Zipcode</Label>
                  <p className="text-sm font-medium mt-1">
                    {selectedSuggestion.postcode || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-slate-500">Phone</Label>
                  <p className="text-sm font-medium mt-1 flex items-center gap-2">
                    {selectedSuggestion.phone ? (
                      <>
                        <Phone className="h-4 w-4 text-slate-400" />
                        {selectedSuggestion.phone}
                      </>
                    ) : (
                      'N/A'
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Website</Label>
                  <p className="text-sm font-medium mt-1 flex items-center gap-2">
                    {selectedSuggestion.website ? (
                      <>
                        <Globe className="h-4 w-4 text-slate-400" />
                        <a
                          href={selectedSuggestion.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#8dbf65] hover:underline"
                        >
                          Visit
                        </a>
                      </>
                    ) : (
                      'N/A'
                    )}
                  </p>
                </div>
              </div>

              {selectedSuggestion.description && (
                <div>
                  <Label className="text-xs text-slate-500">Why they suggested it</Label>
                  <p className="text-sm mt-1 p-3 bg-slate-50 rounded-lg">
                    {selectedSuggestion.description}
                  </p>
                </div>
              )}

              <div>
                <Label className="text-xs text-slate-500">Submitted By</Label>
                <p className="text-sm font-medium mt-1">
                  {selectedSuggestion.user_profiles?.full_name || 'Unknown'} (
                  {selectedSuggestion.user_profiles?.email || 'N/A'})
                </p>
              </div>

              <div>
                <Label className="text-xs text-slate-500">Submission Date</Label>
                <p className="text-sm font-medium mt-1">
                  {new Date(selectedSuggestion.created_at).toLocaleString()}
                </p>
              </div>

              <div>
                <Label className="text-xs text-slate-500">Status</Label>
                <div className="mt-1">{getStatusBadge(selectedSuggestion.status)}</div>
              </div>

              {selectedSuggestion.admin_notes && (
                <div>
                  <Label className="text-xs text-slate-500">Admin Notes</Label>
                  <p className="text-sm mt-1 p-3 bg-blue-50 rounded-lg">
                    {selectedSuggestion.admin_notes}
                  </p>
                </div>
              )}

              {selectedSuggestion.local_hero_recommendation && (
                <div>
                  <Label className="text-xs text-slate-500">Your Previous Recommendation</Label>
                  <p className="text-sm mt-1 p-3 bg-green-50 rounded-lg">
                    {selectedSuggestion.local_hero_recommendation}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="recommendation">
                  Your Recommendation{' '}
                  {selectedSuggestion.status === 'pending' && '(for Admin)'}
                </Label>
                <Textarea
                  id="recommendation"
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                  placeholder="Share your local knowledge about this restaurant..."
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              {selectedSuggestion?.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleAddRecommendation(false)}
                    disabled={isProcessing}
                    className="gap-2 text-red-600 hover:text-red-700"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    Not Recommend
                  </Button>
                  <Button
                    onClick={() => handleAddRecommendation(true)}
                    disabled={isProcessing}
                    className="gap-2 bg-[#8dbf65] hover:bg-[#7aaa56]"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Recommend
                  </Button>
                </>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setIsDetailDialogOpen(false);
                setSelectedSuggestion(null);
                setRecommendation('');
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
