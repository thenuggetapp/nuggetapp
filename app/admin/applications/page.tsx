'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Loader2,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { AdminSidebar } from '@/components/AdminSidebar';

interface Application {
  id: string;
  user_id: string | null;
  city: string | null;
  city_preference: string | null;
  experience: string;
  motivation: string;
  social_media: string | null;
  email: string | null;
  full_name: string | null;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  notes: string | null;
  user_profiles: {
    email: string;
    full_name: string | null;
  } | null;
}

export default function ApplicationsAdminPage() {
  const { isAuthorized, isChecking } = useRequireAuth({ requiredRole: 'admin' });
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>('approved');
  const [reviewNotes, setReviewNotes] = useState('');

  const getApplicantEmail = (app: Application) => {
    return app.email || app.user_profiles?.email || 'No email';
  };

  const getApplicantName = (app: Application) => {
    return app.full_name || app.user_profiles?.full_name || 'No name';
  };

  const getCity = (app: Application) => {
    return app.city_preference || app.city || 'No city';
  };

  useEffect(() => {
    if (isAuthorized) {
      loadApplications();
    }
  }, [isAuthorized]);

  useEffect(() => {
    filterApplications();
  }, [searchQuery, statusFilter, applications]);

  const loadApplications = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('local_hero_applications')
        .select(`
          id,
          user_id,
          city,
          city_preference,
          experience,
          motivation,
          social_media,
          email,
          full_name,
          status,
          submitted_at,
          reviewed_at,
          reviewed_by,
          notes,
          user_profiles!left (
            email,
            full_name
          )
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      // Type cast to handle Supabase's response
      const applications = (data || []).map(app => ({
        ...app,
        user_profiles: app.user_profiles && typeof app.user_profiles === 'object' && !Array.isArray(app.user_profiles)
          ? app.user_profiles
          : null
      })) as Application[];

      setApplications(applications);
      setFilteredApplications(applications);
    } catch (error: any) {
      console.error('Error loading applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load applications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = [...applications];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          getApplicantEmail(app).toLowerCase().includes(query) ||
          getApplicantName(app).toLowerCase().includes(query) ||
          getCity(app).toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
  };

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setViewDialogOpen(true);
  };

  const handleReviewApplication = (application: Application) => {
    setSelectedApplication(application);
    setReviewStatus('approved');
    setReviewNotes('');
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedApplication) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('local_hero_applications')
        .update({
          status: reviewStatus,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          notes: reviewNotes || null,
        })
        .eq('id', selectedApplication.id);

      if (error) throw error;

      if (reviewStatus === 'approved' && selectedApplication.user_id) {
        const { error: roleError } = await supabase.rpc('admin_update_user_role', {
          target_user_id: selectedApplication.user_id,
          new_role: 'local_hero',
        });

        if (roleError) {
          console.error('Error updating role:', roleError);
          toast({
            title: 'Warning',
            description: 'Application approved but failed to update user role. Please update manually.',
            variant: 'destructive',
          });
        }
      } else if (reviewStatus === 'approved' && !selectedApplication.user_id) {
        toast({
          title: 'Note',
          description: 'Guest application approved. User must create an account to become a Local Hero.',
        });
      }

      toast({
        title: 'Success',
        description: `Application ${reviewStatus}`,
      });

      setReviewDialogOpen(false);
      loadApplications();
    } catch (error: any) {
      console.error('Error reviewing application:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to review application',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
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
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <div className="border-b bg-white shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Local Hero Applications
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Review and manage Local Hero applications
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    loadApplications();
                    toast({
                      title: "Refreshing",
                      description: "Updating applications data...",
                    });
                  }}
                  className="gap-2"
                  type="button"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="text-sm font-medium text-gray-600">Pending</div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {applications.filter((a) => a.status === 'pending').length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="text-sm font-medium text-gray-600">Approved</div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {applications.filter((a) => a.status === 'approved').length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="text-sm font-medium text-gray-600">Rejected</div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {applications.filter((a) => a.status === 'rejected').length}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by email, name, or city..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>

              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Applicant</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                            No applications found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredApplications.map((application) => (
                          <TableRow key={application.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {getApplicantName(application)}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {getApplicantEmail(application)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getCity(application)}</TableCell>
                            <TableCell>{getStatusBadge(application.status)}</TableCell>
                            <TableCell>
                              {new Date(application.submitted_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewApplication(application)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {application.status === 'pending' && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleReviewApplication(application)}
                                      className="text-green-600 hover:text-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Applicant Name</label>
                <p className="mt-1">{getApplicantName(selectedApplication)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="mt-1">{getApplicantEmail(selectedApplication)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">City Preference</label>
                <p className="mt-1">{getCity(selectedApplication)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Motivation</label>
                <p className="mt-1 whitespace-pre-wrap">{selectedApplication.motivation}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Experience</label>
                <p className="mt-1 whitespace-pre-wrap">{selectedApplication.experience || 'Not provided'}</p>
              </div>
              {selectedApplication.social_media && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Social Media</label>
                  <p className="mt-1">{selectedApplication.social_media}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">Application Type</label>
                <p className="mt-1">
                  {selectedApplication.user_id ? (
                    <Badge className="bg-blue-500">Authenticated User</Badge>
                  ) : (
                    <Badge className="bg-purple-500">Guest Application</Badge>
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
              </div>
              {selectedApplication.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Admin Notes</label>
                  <p className="mt-1 whitespace-pre-wrap">{selectedApplication.notes}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">Submitted</label>
                <p className="mt-1">
                  {new Date(selectedApplication.submitted_at).toLocaleString()}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            {selectedApplication?.status === 'pending' && (
              <Button
                onClick={() => {
                  setViewDialogOpen(false);
                  handleReviewApplication(selectedApplication);
                }}
                className="bg-[#8dbf65] hover:bg-[#7aaa56]"
              >
                Review
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
            <DialogDescription>
              Review application from {selectedApplication ? getApplicantEmail(selectedApplication) : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Decision</label>
              <Select value={reviewStatus} onValueChange={(val: 'approved' | 'rejected') => setReviewStatus(val)}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approve</SelectItem>
                  <SelectItem value="rejected">Reject</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Notes (Optional)</label>
              <Textarea
                placeholder="Add any notes about this decision..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
            {reviewStatus === 'approved' && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  Approving this application will automatically promote the user to Local Hero status.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              className={
                reviewStatus === 'approved'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
            >
              {reviewStatus === 'approved' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
