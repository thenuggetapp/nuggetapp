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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Plus, Edit, Link as LinkIcon } from 'lucide-react';
import { BookingAffiliate } from '@/lib/types/roles';
import { AdminSidebar } from '@/components/AdminSidebar';

export default function AdminAffiliatesPage() {
  const { permissions } = useAuth();
  const router = useRouter();
  const [affiliates, setAffiliates] = useState<BookingAffiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAffiliate, setEditingAffiliate] = useState<BookingAffiliate | null>(null);

  const [formData, setFormData] = useState({
    partner_name: '',
    affiliate_id: '',
    webhook_secret: '',
    commission_rate: 5.0,
    is_active: true,
  });

  useEffect(() => {
    if (!permissions.canManageAffiliates) {
      router.push('/');
      return;
    }
    loadAffiliates();
  }, [permissions]);

  const loadAffiliates = async () => {
    try {
      const { data } = await supabase
        .from('booking_affiliates')
        .select('*')
        .order('partner_name');

      setAffiliates(data || []);
    } catch (error) {
      console.error('Error loading affiliates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingAffiliate) {
        const { error } = await supabase
          .from('booking_affiliates')
          .update({
            affiliate_id: formData.affiliate_id,
            webhook_secret: formData.webhook_secret,
            commission_rate: formData.commission_rate,
            is_active: formData.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingAffiliate.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('booking_affiliates')
          .insert({
            partner_name: formData.partner_name,
            affiliate_id: formData.affiliate_id,
            webhook_secret: formData.webhook_secret,
            commission_rate: formData.commission_rate,
            is_active: formData.is_active,
          });

        if (error) throw error;
      }

      resetForm();
      loadAffiliates();
    } catch (error) {
      console.error('Error saving affiliate:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      partner_name: '',
      affiliate_id: '',
      webhook_secret: '',
      commission_rate: 5.0,
      is_active: true,
    });
    setEditingAffiliate(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (affiliate: BookingAffiliate) => {
    setEditingAffiliate(affiliate);
    setFormData({
      partner_name: affiliate.partner_name,
      affiliate_id: affiliate.affiliate_id || '',
      webhook_secret: affiliate.webhook_secret || '',
      commission_rate: Number(affiliate.commission_rate),
      is_active: affiliate.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleToggleActive = async (affiliate: BookingAffiliate) => {
    try {
      const { error } = await supabase
        .from('booking_affiliates')
        .update({ is_active: !affiliate.is_active })
        .eq('id', affiliate.id);

      if (error) throw error;

      loadAffiliates();
    } catch (error) {
      console.error('Error toggling affiliate:', error);
    }
  };

  if (!permissions.canManageAffiliates) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>You do not have permission to access this page.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const activeCount = affiliates.filter(a => a.is_active).length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <div className="border-b bg-white shadow-sm">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Affiliate Partners</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Partner
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAffiliate ? 'Edit' : 'Add'} Affiliate Partner</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="partner_name">Partner Name</Label>
                <Input
                  id="partner_name"
                  value={formData.partner_name}
                  onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                  placeholder="e.g., resy, opentable"
                  required
                  disabled={!!editingAffiliate}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="affiliate_id">Affiliate ID</Label>
                <Input
                  id="affiliate_id"
                  value={formData.affiliate_id}
                  onChange={(e) => setFormData({ ...formData, affiliate_id: e.target.value })}
                  placeholder="Your affiliate identifier"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook_secret">Webhook Secret</Label>
                <Input
                  id="webhook_secret"
                  type="password"
                  value={formData.webhook_secret}
                  onChange={(e) => setFormData({ ...formData, webhook_secret: e.target.value })}
                  placeholder="Webhook signing secret"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                <Input
                  id="commission_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.commission_rate}
                  onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <Button type="submit" className="w-full">
                {editingAffiliate ? 'Update' : 'Create'} Partner
              </Button>
            </form>
          </DialogContent>
        </Dialog>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{affiliates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Avg Commission Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {affiliates.length > 0
                ? (affiliates.reduce((sum, a) => sum + Number(a.commission_rate), 0) / affiliates.length).toFixed(1)
                : '0'}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Affiliate Partners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {affiliates.map(affiliate => (
              <div key={affiliate.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <LinkIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold capitalize">{affiliate.partner_name}</h3>
                        {affiliate.affiliate_id && (
                          <p className="text-sm text-muted-foreground">ID: {affiliate.affiliate_id}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span>Commission: {affiliate.commission_rate}%</span>
                      <span className="text-muted-foreground">
                        Updated: {new Date(affiliate.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={affiliate.is_active ? 'default' : 'secondary'}>
                      {affiliate.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(affiliate)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Switch
                      checked={affiliate.is_active}
                      onCheckedChange={() => handleToggleActive(affiliate)}
                    />
                  </div>
                </div>
              </div>
            ))}
            {affiliates.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No affiliate partners configured yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
