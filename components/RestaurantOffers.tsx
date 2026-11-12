'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { describeDays, describeOffer, describeTimes } from '@/lib/offers';
import { Baby, Percent, CalendarDays, Clock } from 'lucide-react';

interface Offer {
  id: string;
  discount_type: string;
  discount_value: number;
  offer_days: number[] | null;
  offer_start_time: string | null;
  offer_end_time: string | null;
}

// Live family offers for a restaurant. Renders nothing when there are none.
export function RestaurantOffers({ restaurantId }: { restaurantId: string }) {
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    // RLS only returns offers that are active and within their valid dates
    supabase
      .from('coupons')
      .select('id, discount_type, discount_value, offer_days, offer_start_time, offer_end_time')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error('Error loading offers:', error);
          return;
        }
        setOffers(data || []);
      });
  }, [restaurantId]);

  if (offers.length === 0) return null;

  return (
    <div className="family-offers space-y-3">
      <h2 className="section-title text-base lg:text-lg font-bold text-slate-900">
        Nugget Family Offer{offers.length > 1 ? 's' : ''}
      </h2>
      {offers.map((offer) => {
        const Icon = offer.discount_type === 'kids_meal' ? Baby : Percent;
        return (
          <div key={offer.id} className="flex gap-4 rounded-lg border-2 border-[#8dbf65] bg-[#8dbf65]/5 p-4">
            <div className="w-11 h-11 rounded-full bg-[#8dbf65] flex items-center justify-center flex-shrink-0">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-slate-900">
                {describeOffer(offer.discount_type, offer.discount_value)}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" />
                  {describeDays(offer.offer_days)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {describeTimes(offer.offer_start_time, offer.offer_end_time)}
                </span>
              </div>
              <p className="text-xs text-slate-500">Show this page when you order.</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
