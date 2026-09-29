'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CalendarHeart, ChefHat, UtensilsCrossed, Megaphone, Globe, Baby, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

const REQUEST_TYPES = [
  { value: 'event', label: 'Co-host a family event', description: 'Plan an event with Nugget Local Heroes, our city ambassadors: kids’ cooking classes, baby & me mornings, family nights', icon: CalendarHeart },
  { value: 'family_menu', label: 'Kids’ & family menu', description: 'Review your current menu or create a new one, for every age', icon: UtensilsCrossed },
  { value: 'marketing', label: 'Family marketing plan', description: 'Tailored recommendations to reach more local families', icon: Megaphone },
  { value: 'website', label: 'Website', description: 'Build a new website or refresh the one you have', icon: Globe },
  { value: 'amenities', label: 'Family-friendly equipment', description: 'Get help buying high chairs, baby change tables and more', icon: Baby },
  { value: 'chef_referral', label: 'Chef referral', description: 'Get introduced to chefs who love cooking for families', icon: ChefHat },
  { value: 'other', label: 'Something else', description: 'Tell us what would help and we’ll make it happen', icon: Sparkles },
];

export default function ConciergePage() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<Array<{ id: string; name: string }>>([]);
  const [requestType, setRequestType] = useState('event');
  const [restaurantId, setRestaurantId] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('restaurant_ownership')
      .select('restaurant_id, restaurants(id, name)')
      .eq('owner_id', user.id)
      .then(({ data }) => {
        const list = (data || []).map((o: any) => ({ id: o.restaurant_id, name: o.restaurants?.name || 'Unknown' }));
        setRestaurants(list);
        if (list.length > 0) setRestaurantId(list[0].id);
      });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast({ title: 'Tell us a little more', description: 'Add a short note so we know how to help', variant: 'destructive' });
      return;
    }

    setSending(true);
    const type = REQUEST_TYPES.find((t) => t.value === requestType)!;
    const restaurantName = restaurants.find((r) => r.id === restaurantId)?.name;

    const { error } = await supabase.from('contact_submissions').insert([
      {
        name: userProfile?.full_name || 'Restaurant owner',
        email: userProfile?.email || user?.email,
        phone: phone.trim() || null,
        subject: `Concierge: ${type.label}${restaurantName ? ` (${restaurantName})` : ''}`,
        message: message.trim(),
      },
    ]);
    setSending(false);

    if (error) {
      console.error('Concierge request error:', error);
      toast({ title: 'Error', description: "We couldn't send your request. Please try again.", variant: 'destructive' });
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="p-4 sm:p-8 max-w-2xl">
        <Card className="p-10 text-center">
          <CheckCircle2 className="h-12 w-12 text-[#8dbf65] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">Request sent</h1>
          <p className="text-slate-600 mt-2">Thanks! Someone from the Nugget team will be in touch soon.</p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => {
              setSent(false);
              setMessage('');
            }}
          >
            Send another request
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Concierge</h1>
        <p className="text-slate-600 mt-2">
          1:1 help from the Nugget team to make your restaurant a favourite with local families.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How can we help?</CardTitle>
          <CardDescription>Pick one and tell us a bit about what you have in mind.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Request type">
              {REQUEST_TYPES.map(({ value, label, description, icon: Icon }) => {
                const selected = requestType === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setRequestType(value)}
                    className={`text-left rounded-lg border-2 p-4 transition ${
                      selected ? 'border-[#8dbf65] bg-[#8dbf65]/5' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="h-5 w-5 text-[#8dbf65] mb-2" />
                    <div className="font-semibold text-slate-900">{label}</div>
                    <div className="text-sm text-slate-600">{description}</div>
                  </button>
                );
              })}
            </div>

            {restaurants.length > 1 && (
              <div className="space-y-2">
                <Label>Restaurant</Label>
                <Select value={restaurantId} onValueChange={setRestaurantId}>
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
              <Label htmlFor="message">Tell us more</Label>
              <Textarea
                id="message"
                rows={5}
                maxLength={5000}
                placeholder="e.g. We'd love to run a Sunday family brunch with a kids' activity table..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                type="tel"
                maxLength={20}
                placeholder="If you'd rather we call"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <p className="text-xs text-slate-500">We'll reply to {userProfile?.email || 'your account email'}.</p>
            </div>

            <Button type="submit" className="w-full sm:w-auto bg-[#8dbf65] hover:bg-[#7aaa56]" disabled={sending}>
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Request'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
