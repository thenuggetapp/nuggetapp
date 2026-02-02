'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Mail, Eye, Archive, CheckCircle, Trash2, RefreshCw } from 'lucide-react';
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
import { createClient } from '@/lib/supabase/client-browser';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  created_at: string;
  updated_at: string;
}

export default function ContactSubmissionsPage() {
  const { signOut } = useAuth();
  const { user, userProfile, isChecking } = useRequireAuth({ requiredRole: 'admin' });
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  useEffect(() => {
    if (userProfile?.role === 'admin') {
      fetchSubmissions();
    }
  }, [userProfile, filterStatus]);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      let query = supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: ContactSubmission['status']) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('contact_submissions')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      fetchSubmissions();
      if (selectedSubmission?.id === id) {
        setSelectedSubmission({ ...selectedSubmission, status });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const openSubmission = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setIsDialogOpen(true);

    if (submission.status === 'new') {
      updateStatus(submission.id, 'read');
    }
  };

  const handleCleanup = async () => {
    if (!confirm('This will delete old archived submissions (90+ days) and old rate limit data (24+ hours). Continue?')) {
      return;
    }

    setIsCleaningUp(true);
    try {
      const response = await fetch('/api/admin/cleanup-contact-data', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Cleanup successful: ${data.results.submissionsDeleted} submissions and ${data.results.rateLimitsDeleted} rate limit records deleted`);
        fetchSubmissions();
      } else {
        toast.error(data.error || 'Cleanup failed');
      }
    } catch (error) {
      console.error('Error running cleanup:', error);
      toast.error('Failed to run cleanup');
    } finally {
      setIsCleaningUp(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      new: { variant: 'default', label: 'New' },
      read: { variant: 'secondary', label: 'Read' },
      replied: { variant: 'outline', label: 'Replied' },
      archived: { variant: 'outline', label: 'Archived' },
    };

    const config = variants[status] || variants.new;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isChecking || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (userProfile.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600">You do not have permission to view this page.</p>
        </div>
      </div>
    );
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
                  Contact Submissions
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  View and manage contact form submissions
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Select value={filterStatus} onValueChange={(value) => { setFilterStatus(value); }}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Submissions</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="replied">Replied</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    fetchSubmissions();
                  }}
                  className="gap-2"
                  type="button"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                <Button
                  onClick={handleCleanup}
                  variant="outline"
                  size="sm"
                  disabled={isCleaningUp}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {isCleaningUp ? 'Cleaning...' : 'Cleanup'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="px-6 py-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                <Mail className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No submissions found</h3>
                <p className="text-slate-600">
                  {filterStatus === 'all'
                    ? 'No contact form submissions yet.'
                    : `No ${filterStatus} submissions found.`}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>{getStatusBadge(submission.status)}</TableCell>
                        <TableCell className="font-medium">{submission.name}</TableCell>
                        <TableCell>{submission.email}</TableCell>
                        <TableCell className="max-w-xs truncate">{submission.subject}</TableCell>
                        <TableCell>{format(new Date(submission.created_at), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openSubmission(submission)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact Submission</DialogTitle>
            <DialogDescription>
              {selectedSubmission && format(new Date(selectedSubmission.created_at), 'MMMM d, yyyy h:mm a')}
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Name</label>
                  <p className="text-slate-900">{selectedSubmission.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <p className="text-slate-900">{selectedSubmission.email}</p>
                </div>
              </div>

              {selectedSubmission.phone && (
                <div>
                  <label className="text-sm font-medium text-slate-700">Phone</label>
                  <p className="text-slate-900">{selectedSubmission.phone}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-slate-700">Subject</label>
                <p className="text-slate-900">{selectedSubmission.subject}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Message</label>
                <p className="text-slate-900 whitespace-pre-wrap bg-slate-50 p-4 rounded-lg">
                  {selectedSubmission.message}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Status</label>
                <div className="flex gap-2">
                  <Button
                    variant={selectedSubmission.status === 'read' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateStatus(selectedSubmission.id, 'read')}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Mark as Read
                  </Button>
                  <Button
                    variant={selectedSubmission.status === 'replied' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateStatus(selectedSubmission.id, 'replied')}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Mark as Replied
                  </Button>
                  <Button
                    variant={selectedSubmission.status === 'archived' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateStatus(selectedSubmission.id, 'archived')}
                  >
                    <Archive className="w-4 h-4 mr-1" />
                    Archive
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
