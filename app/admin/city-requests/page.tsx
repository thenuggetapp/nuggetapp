'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { MapPin, Eye, CheckCircle, XCircle, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AdminSidebar } from '@/components/AdminSidebar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client-browser';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface CityRequest {
  id: string;
  city_name: string;
  reason: string;
  email?: string;
  user_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  admin_notes?: string;
}

export default function CityRequestsPage() {
  const { signOut } = useAuth();
  const { user, userProfile, isChecking } = useRequireAuth({ requiredRole: 'admin' });
  const [requests, setRequests] = useState<CityRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<CityRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (userProfile?.role === 'admin') {
      fetchRequests();
    }
  }, [userProfile, filterStatus]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      let query = supabase
        .from('city_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching city requests:', error);
      toast.error('Failed to load city requests');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: CityRequest['status']) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('city_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Request ${status}`);
      fetchRequests();
      if (selectedRequest?.id === id) {
        setSelectedRequest({ ...selectedRequest, status });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const updateAdminNotes = async (id: string, notes: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('city_requests')
        .update({ admin_notes: notes })
        .eq('id', id);

      if (error) throw error;

      toast.success('Notes updated');
      fetchRequests();
      if (selectedRequest?.id === id) {
        setSelectedRequest({ ...selectedRequest, admin_notes: notes });
      }
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Failed to update notes');
    }
  };

  const deleteRequest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this request?')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('city_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Request deleted');
      fetchRequests();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Failed to delete request');
    }
  };

  const viewRequest = (request: CityRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.admin_notes || '');
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: CityRequest['status']) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />

      <main className="flex-1">
        <div className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">City Requests</h1>
              <p className="text-sm text-slate-600">Manage city expansion requests</p>
            </div>
            <Button onClick={fetchRequests} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <div className="text-sm text-slate-600">Total Requests</div>
              <div className="text-3xl font-bold text-slate-900 mt-2">{stats.total}</div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <div className="text-sm text-slate-600">Pending</div>
              <div className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <div className="text-sm text-slate-600">Approved</div>
              <div className="text-3xl font-bold text-green-600 mt-2">{stats.approved}</div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <div className="text-sm text-slate-600">Rejected</div>
              <div className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">All Requests</h2>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
                <p className="mt-4 text-slate-600">Loading requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="p-12 text-center text-slate-600">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <p>No city requests found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>City Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.city_name}</TableCell>
                      <TableCell>{request.email || '-'}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-slate-600">
                        {format(new Date(request.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => viewRequest(request)}
                          variant="ghost"
                          size="sm"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>City Request Details</DialogTitle>
            <DialogDescription>Review and manage this city request</DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6 mt-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700">City Name</Label>
                  <p className="text-lg font-semibold mt-1">{selectedRequest.city_name}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700">Reason</Label>
                  <p className="mt-1 text-slate-900 whitespace-pre-wrap">{selectedRequest.reason}</p>
                </div>

                {selectedRequest.email && (
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Email</Label>
                    <p className="mt-1 text-slate-900">{selectedRequest.email}</p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium text-slate-700">Requested On</Label>
                  <p className="mt-1 text-slate-900">
                    {format(new Date(selectedRequest.created_at), 'MMMM d, yyyy h:mm a')}
                  </p>
                </div>

                <div>
                  <Label htmlFor="admin-notes" className="text-sm font-medium text-slate-700">
                    Admin Notes
                  </Label>
                  <Textarea
                    id="admin-notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes about this request..."
                    rows={4}
                    className="mt-1"
                  />
                  <Button
                    onClick={() => updateAdminNotes(selectedRequest.id, adminNotes)}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    Save Notes
                  </Button>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                {selectedRequest.status !== 'approved' && (
                  <Button
                    onClick={() => updateStatus(selectedRequest.id, 'approved')}
                    variant="default"
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                )}
                {selectedRequest.status !== 'rejected' && (
                  <Button
                    onClick={() => updateStatus(selectedRequest.id, 'rejected')}
                    variant="outline"
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                )}
                <Button
                  onClick={() => deleteRequest(selectedRequest.id)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
