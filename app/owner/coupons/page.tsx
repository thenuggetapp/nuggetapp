'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Ticket,
  PlusCircle,
  Edit,
  Trash2,
  Pause,
  Play,
  Copy,
  QrCode,
  Calendar,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Coupon {
  id: string;
  restaurant_id: string;
  restaurant_name?: string;
  code: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  valid_from: string;
  valid_to: string;
  usage_limit: number | null;
  current_usage: number;
  terms: string | null;
  active: boolean;
  created_at: string;
}

export default function CouponsPage() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [restaurants, setRestaurants] = useState<Array<{ id: string; name: string }>>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    restaurant_id: '',
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed_amount',
    discount_value: 10,
    valid_from: new Date().toISOString().split('T')[0],
    valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usage_limit: null as number | null,
    terms: '',
  });

  const subscriptionPlan = 'free';

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const { data: ownershipData } = await supabase
        .from('restaurant_ownership')
        .select('restaurant_id, restaurants(id, name)')
        .eq('owner_id', user.id);

      const restaurantsList = (ownershipData || []).map((o: any) => ({
        id: o.restaurant_id,
        name: o.restaurants?.name || 'Unknown',
      }));

      setRestaurants(restaurantsList);

      const restaurantIds = restaurantsList.map((r) => r.id);

      if (restaurantIds.length > 0) {
        const { data: couponsData } = await supabase
          .from('coupons')
          .select('*')
          .in('restaurant_id', restaurantIds)
          .order('created_at', { ascending: false });

        const couponsWithRestaurants = (couponsData || []).map((coupon) => ({
          ...coupon,
          restaurant_name: restaurantsList.find((r) => r.id === coupon.restaurant_id)?.name,
        }));

        setCoupons(couponsWithRestaurants);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load coupons',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  const handleCreate = () => {
    if (restaurants.length === 0) {
      toast({
        title: 'No Restaurants',
        description: 'Please add a restaurant first before creating coupons',
        variant: 'destructive',
      });
      return;
    }

    setEditingCoupon(null);
    setFormData({
      restaurant_id: restaurants[0].id,
      code: '',
      discount_type: 'percentage',
      discount_value: 10,
      valid_from: new Date().toISOString().split('T')[0],
      valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      usage_limit: null,
      terms: '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.code || !formData.restaurant_id) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const couponData = {
        ...formData,
        active: true,
      };

      if (editingCoupon) {
        await supabase
          .from('coupons')
          .update(couponData)
          .eq('id', editingCoupon.id);

        toast({ title: 'Success', description: 'Coupon updated successfully' });
      } else {
        await supabase.from('coupons').insert([couponData]);
        toast({ title: 'Success', description: 'Coupon created successfully' });
      }

      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast({
        title: 'Error',
        description: 'Failed to save coupon',
        variant: 'destructive',
      });
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    try {
      await supabase
        .from('coupons')
        .update({ active: !coupon.active })
        .eq('id', coupon.id);

      toast({
        title: 'Success',
        description: `Coupon ${coupon.active ? 'paused' : 'activated'}`,
      });

      loadData();
    } catch (error) {
      console.error('Error toggling coupon:', error);
      toast({
        title: 'Error',
        description: 'Failed to update coupon',
        variant: 'destructive',
      });
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      await supabase.from('coupons').delete().eq('id', id);
      toast({ title: 'Success', description: 'Coupon deleted successfully' });
      loadData();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete coupon',
        variant: 'destructive',
      });
    }
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Copied!', description: `Coupon code "${code}" copied to clipboard` });
  };

  const getCouponStatus = (coupon: Coupon) => {
    if (!coupon.active) return { label: 'Paused', color: 'bg-yellow-100 text-yellow-800' };

    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validTo = new Date(coupon.valid_to);

    if (now < validFrom) return { label: 'Scheduled', color: 'bg-blue-100 text-blue-800' };
    if (now > validTo) return { label: 'Expired', color: 'bg-slate-200 text-slate-600' };
    if (coupon.usage_limit && coupon.current_usage >= coupon.usage_limit) {
      return { label: 'Limit Reached', color: 'bg-red-100 text-red-800' };
    }

    return { label: 'Active', color: 'bg-green-100 text-green-800' };
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-96" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (subscriptionPlan === 'free') {
    return (
      <div className="p-8 space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Coupons & Deals</h1>

        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            Coupon management is a Pro feature. Upgrade to create and manage discount codes for your restaurants.
          </AlertDescription>
        </Alert>

        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-20 h-20 bg-[#8dbf65]/10 rounded-full flex items-center justify-center mx-auto">
              <Ticket className="h-10 w-10 text-[#8dbf65]" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900">Upgrade to Pro for Coupons</h3>
            <p className="text-slate-600">
              Attract more customers with exclusive deals and discount codes
            </p>
            <Button size="lg" className="bg-[#8dbf65] hover:bg-[#7aaa56]" onClick={() => window.location.href = '/owner/marketing'}>
              <TrendingUp className="mr-2 h-5 w-5" />
              Upgrade to Pro
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Coupons & Deals</h1>
          <p className="text-slate-600 mt-2">Create and manage discount codes for your restaurants</p>
        </div>
        <Button className="bg-[#8dbf65] hover:bg-[#7aaa56]" onClick={handleCreate}>
          <PlusCircle className="mr-2 h-5 w-5" />
          Create Coupon
        </Button>
      </div>

      {coupons.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
              <Ticket className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">No coupons yet</h3>
            <p className="text-slate-600">
              Create your first coupon to attract more customers with special offers
            </p>
            <Button className="bg-[#8dbf65] hover:bg-[#7aaa56]" onClick={handleCreate}>
              <PlusCircle className="mr-2 h-5 w-5" />
              Create Your First Coupon
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => {
            const status = getCouponStatus(coupon);

            return (
              <Card key={coupon.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{coupon.code}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {coupon.restaurant_name}
                      </CardDescription>
                    </div>
                    <Badge className={status.color}>{status.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4 bg-slate-50 rounded-lg">
                    <div className="text-3xl font-bold text-[#8dbf65]">
                      {coupon.discount_type === 'percentage'
                        ? `${coupon.discount_value}%`
                        : `£${coupon.discount_value}`}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      {coupon.discount_type === 'percentage' ? 'OFF' : 'DISCOUNT'}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(coupon.valid_from).toLocaleDateString()} -{' '}
                        {new Date(coupon.valid_to).toLocaleDateString()}
                      </span>
                    </div>
                    {coupon.usage_limit && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <TrendingUp className="h-4 w-4" />
                        <span>
                          {coupon.current_usage} / {coupon.usage_limit} used
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => copyCouponCode(coupon.code)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(coupon)}
                    >
                      {coupon.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600"
                      onClick={() => deleteCoupon(coupon.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
            <DialogDescription>
              Set up a discount code for your restaurant
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="restaurant">Restaurant *</Label>
              <Select
                value={formData.restaurant_id}
                onValueChange={(value) => setFormData({ ...formData, restaurant_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select restaurant" />
                </SelectTrigger>
                <SelectContent>
                  {restaurants.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Coupon Code *</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  placeholder="SUMMER2024"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={generateCouponCode}>
                  Generate
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount_type">Discount Type *</Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(value: any) => setFormData({ ...formData, discount_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_value">Discount Value *</Label>
                <Input
                  id="discount_value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discount_value}
                  onChange={(e) =>
                    setFormData({ ...formData, discount_value: parseFloat(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valid_from">Valid From *</Label>
                <Input
                  id="valid_from"
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valid_to">Valid To *</Label>
                <Input
                  id="valid_to"
                  type="date"
                  value={formData.valid_to}
                  onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="usage_limit">Usage Limit (Optional)</Label>
              <Input
                id="usage_limit"
                type="number"
                min="1"
                placeholder="Unlimited"
                value={formData.usage_limit || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    usage_limit: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                placeholder="e.g., Valid for dine-in only, not combinable with other offers..."
                value={formData.terms || ''}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-[#8dbf65] hover:bg-[#7aaa56]" onClick={handleSave}>
              {editingCoupon ? 'Update' : 'Create'} Coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
