'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Baby, Percent, PlusCircle, Trash2, Pause, Play, Edit, Clock, CalendarDays } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DAYS, describeDays, describeTimes } from '@/lib/offers';

type OfferType = 'kids_meal' | 'percentage';

interface Offer {
  id: string;
  restaurant_id: string;
  restaurant_name?: string;
  code: string;
  discount_type: OfferType | 'fixed_amount';
  discount_value: number;
  offer_days: number[] | null;
  offer_start_time: string | null;
  offer_end_time: string | null;
  active: boolean;
}

const OFFERS: Record<OfferType, { title: string; description: string; icon: typeof Baby; discountValue: number }> = {
  kids_meal: {
    title: 'Free kids meal',
    description: 'One free kids meal with every adult meal',
    icon: Baby,
    discountValue: 0,
  },
  percentage: {
    title: '10% off the food bill',
    description: '10% off the total food bill',
    icon: Percent,
    discountValue: 10,
  },
};

const ALL_DAYS = DAYS.map((d) => d.value);

// Offers run until the owner pauses or deletes them
const NO_END_DATE = '2099-12-31T23:59:59Z';

interface FormState {
  restaurant_id: string;
  offer_type: OfferType;
  days: number[];
  all_day: boolean;
  start_time: string;
  end_time: string;
}

const emptyForm = (restaurantId: string): FormState => ({
  restaurant_id: restaurantId,
  offer_type: 'kids_meal',
  days: ALL_DAYS,
  all_day: true,
  start_time: '11:00',
  end_time: '17:00',
});

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'NUGGET';
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

export default function CouponsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [restaurants, setRestaurants] = useState<Array<{ id: string; name: string }>>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm(''));

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
        const { data: offersData } = await supabase
          .from('coupons')
          .select('id, restaurant_id, code, discount_type, discount_value, offer_days, offer_start_time, offer_end_time, active')
          .in('restaurant_id', restaurantIds)
          .order('created_at', { ascending: false });

        setOffers(
          (offersData || []).map((offer) => ({
            ...offer,
            restaurant_name: restaurantsList.find((r) => r.id === offer.restaurant_id)?.name,
          }))
        );
      } else {
        setOffers([]);
      }
    } catch (error) {
      console.error('Error loading offers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your offers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingOffer(null);
    setForm(emptyForm(restaurants[0]?.id || ''));
    setDialogOpen(true);
  };

  const openEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setForm({
      restaurant_id: offer.restaurant_id,
      offer_type: offer.discount_type === 'kids_meal' ? 'kids_meal' : 'percentage',
      days: offer.offer_days && offer.offer_days.length > 0 ? offer.offer_days : ALL_DAYS,
      all_day: !offer.offer_start_time || !offer.offer_end_time,
      start_time: offer.offer_start_time?.slice(0, 5) || '11:00',
      end_time: offer.offer_end_time?.slice(0, 5) || '17:00',
    });
    setDialogOpen(true);
  };

  const toggleDay = (day: number) => {
    setForm((f) => ({
      ...f,
      days: f.days.includes(day) ? f.days.filter((d) => d !== day) : [...f.days, day],
    }));
  };

  const handleSave = async () => {
    if (!form.restaurant_id) {
      toast({ title: 'Pick a restaurant', description: 'Choose which restaurant this offer is for', variant: 'destructive' });
      return;
    }
    if (form.days.length === 0) {
      toast({ title: 'Pick at least one day', description: 'Choose the days your offer runs', variant: 'destructive' });
      return;
    }
    if (!form.all_day && form.start_time >= form.end_time) {
      toast({ title: 'Check your times', description: 'The end time needs to be after the start time', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const offerData = {
      restaurant_id: form.restaurant_id,
      discount_type: form.offer_type,
      discount_value: OFFERS[form.offer_type].discountValue,
      offer_days: form.days.length === 7 ? null : [...form.days].sort((a, b) => a - b),
      offer_start_time: form.all_day ? null : form.start_time,
      offer_end_time: form.all_day ? null : form.end_time,
      terms: OFFERS[form.offer_type].description,
    };

    try {
      const { error } = editingOffer
        ? await supabase.from('coupons').update(offerData).eq('id', editingOffer.id)
        : await supabase.from('coupons').insert([
            {
              ...offerData,
              code: generateCode(),
              valid_from: new Date().toISOString(),
              valid_to: NO_END_DATE,
              active: true,
            },
          ]);
      if (error) throw error;

      toast({ title: editingOffer ? 'Offer updated' : 'Offer is live', description: 'Families will see it on your Nugget page' });
      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving offer:', error);
      const detail = (error as { message?: string })?.message;
      toast({ title: "Couldn't save your offer", description: detail || 'Please try again', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (offer: Offer) => {
    const { error } = await supabase.from('coupons').update({ active: !offer.active }).eq('id', offer.id);
    if (error) {
      console.error('Error toggling offer:', error);
      toast({ title: 'Error', description: 'Failed to update offer', variant: 'destructive' });
      return;
    }
    toast({ title: offer.active ? 'Offer paused' : 'Offer is live again' });
    loadData();
  };

  const deleteOffer = async (id: string) => {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) {
      console.error('Error deleting offer:', error);
      toast({ title: 'Error', description: 'Failed to delete offer', variant: 'destructive' });
      return;
    }
    toast({ title: 'Offer removed' });
    loadData();
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

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Coupons & Deals</h1>
          <p className="text-slate-600 mt-2">Pick a family offer and choose when it runs. Families see it on your Nugget page.</p>
        </div>
        {restaurants.length > 0 && (
          <Button className="bg-[#8dbf65] hover:bg-[#7aaa56]" onClick={openCreate}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Add an Offer
          </Button>
        )}
      </div>

      {restaurants.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <h3 className="text-xl font-semibold text-slate-900">Add your restaurant first</h3>
            <p className="text-slate-600">Once your restaurant is listed you can add a family offer in a couple of clicks.</p>
            <Link href="/owner/restaurants/new">
              <Button className="bg-[#8dbf65] hover:bg-[#7aaa56]">
                <PlusCircle className="mr-2 h-5 w-5" />
                Add a Restaurant
              </Button>
            </Link>
          </div>
        </Card>
      ) : offers.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(Object.keys(OFFERS) as OfferType[]).map((type) => {
            const { title, description, icon: Icon } = OFFERS[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setEditingOffer(null);
                  setForm({ ...emptyForm(restaurants[0].id), offer_type: type });
                  setDialogOpen(true);
                }}
                className="text-left rounded-lg border-2 border-slate-200 bg-white p-6 hover:border-[#8dbf65] hover:shadow-md transition"
              >
                <div className="w-12 h-12 bg-[#8dbf65]/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-[#8dbf65]" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
                <p className="text-slate-600 mt-1">{description}</p>
                <p className="text-sm font-medium text-[#8dbf65] mt-4">Choose this offer →</p>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => {
            const type: OfferType = offer.discount_type === 'kids_meal' ? 'kids_meal' : 'percentage';
            const Icon = OFFERS[type].icon;
            const title =
              offer.discount_type === 'fixed_amount' ? `${offer.discount_value} off` :
              offer.discount_type === 'percentage' ? `${offer.discount_value}% off the food bill` :
              OFFERS.kids_meal.title;

            return (
              <Card key={offer.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 bg-[#8dbf65]/10 rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-[#8dbf65]" />
                    </div>
                    <Badge className={offer.active ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'}>
                      {offer.active ? 'Live' : 'Paused'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg pt-2">{title}</CardTitle>
                  <CardDescription>{offer.restaurant_name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      <span>{describeDays(offer.offer_days)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{describeTimes(offer.offer_start_time, offer.offer_end_time)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(offer)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggleActive(offer)} aria-label={offer.active ? 'Pause offer' : 'Resume offer'}>
                      {offer.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600" onClick={() => deleteOffer(offer.id)} aria-label="Delete offer">
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingOffer ? 'Edit offer' : 'Add a family offer'}</DialogTitle>
            <DialogDescription>Choose your offer and when it runs.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {restaurants.length > 1 && (
              <div className="space-y-2">
                <Label>Restaurant</Label>
                <Select value={form.restaurant_id} onValueChange={(value) => setForm({ ...form, restaurant_id: value })}>
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
            )}

            <div className="space-y-2">
              <Label>Offer</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup">
                {(Object.keys(OFFERS) as OfferType[]).map((type) => {
                  const { title, description, icon: Icon } = OFFERS[type];
                  const selected = form.offer_type === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setForm({ ...form, offer_type: type })}
                      className={`text-left rounded-lg border-2 p-4 transition ${
                        selected ? 'border-[#8dbf65] bg-[#8dbf65]/5' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Icon className="h-5 w-5 text-[#8dbf65] mb-2" />
                      <div className="font-semibold text-slate-900">{title}</div>
                      <div className="text-sm text-slate-600">{description}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Days</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => {
                  const selected = form.days.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleDay(day.value)}
                      className={`h-10 w-12 rounded-md border text-sm font-medium transition ${
                        selected ? 'bg-[#8dbf65] border-[#8dbf65] text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="all_day">All day</Label>
                <Switch id="all_day" checked={form.all_day} onCheckedChange={(checked) => setForm({ ...form, all_day: checked })} />
              </div>
              {!form.all_day && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">From</Label>
                    <Input id="start_time" type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time">Until</Label>
                    <Input id="end_time" type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-[#8dbf65] hover:bg-[#7aaa56]" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingOffer ? 'Save Offer' : 'Make it Live'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
