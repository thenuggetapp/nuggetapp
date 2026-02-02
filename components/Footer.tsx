'use client';

import Link from 'next/link';
import { Instagram } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client-browser';

export function Footer() {
  const { userProfile } = useAuth();
  const isOwner = userProfile?.role === 'owner' || userProfile?.role === 'admin';
  const restaurantPartnerLink = isOwner ? '/owner/dashboard' : '/partner';

  const cities = ['London', 'Chicago', 'San Francisco'];

  const [showCityRequestModal, setShowCityRequestModal] = useState(false);
  const [cityName, setCityName] = useState('');
  const [reason, setReason] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCityRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cityName.trim() || !reason.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('city_requests').insert({
        city_name: cityName.trim(),
        reason: reason.trim(),
        email: email.trim() || null,
        user_id: user?.id || null,
      });

      if (error) throw error;

      toast.success('City request submitted successfully!');
      setShowCityRequestModal(false);
      setCityName('');
      setReason('');
      setEmail('');
    } catch (error) {
      console.error('Error submitting city request:', error);
      toast.error('Failed to submit city request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-[#dfe9d3] border-t border-slate-200">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Our mission is to make dining out easier and more fun for families.
            </h2>
            <div className="space-y-2 text-slate-700">
              <p>Helping families find welcoming places faster.</p>
              <p>Helping cities and businesses see who's included and who's left out.</p>
            </div>
          </div>

          <div className="md:border-l md:border-slate-300 md:pl-8">
            <h3 className="font-semibold text-lg mb-4 text-slate-900">Cities we are in</h3>
            <ul className="space-y-3 text-slate-700">
              {cities.map((city, index) => (
                <li key={index}>
                  <Link
                    href={`/search?q=${encodeURIComponent(city)}`}
                    className="hover:text-slate-900 transition-colors"
                  >
                    {city}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  onClick={() => setShowCityRequestModal(true)}
                  className="hover:text-slate-900 transition-colors text-left"
                >
                  Request a city
                </button>
              </li>
            </ul>
          </div>

          <div className="md:border-l md:border-slate-300 md:pl-8">
            <h3 className="font-semibold text-lg mb-4 text-slate-900">Quick Links</h3>
            <ul className="space-y-3 text-slate-700">
              <li>
                <Link href={restaurantPartnerLink} className="hover:text-slate-900 transition-colors">
                  Restaurant Partner
                </Link>
              </li>
              <li>
                <Link href="/local-hero" className="hover:text-slate-900 transition-colors">
                  Local Heroes
                </Link>
              </li>
              <li>
                <Link href="/suggest" className="hover:text-slate-900 transition-colors">
                  Suggest a Restaurant
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-slate-900 transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:border-l md:border-slate-300 md:pl-8">
            <h3 className="font-semibold text-lg mb-4 text-slate-900">Company</h3>
            <ul className="space-y-3 text-slate-700">
              <li>
                <Link href="/about" className="hover:text-slate-900 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-slate-900 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-slate-900 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/thenugget.app/?hl=en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-900 transition-colors flex items-center gap-2"
                >
                  <Instagram className="h-4 w-4" />
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-300 text-center text-sm text-slate-600">
          <p>&copy; {new Date().getFullYear()} Nugget. All rights reserved -
            <Link href="/terms" className="hover:text-slate-900 transition-colors">
              Terms of Service
            </Link>{' '}
            <span>- </span>
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>

      <Dialog open={showCityRequestModal} onOpenChange={setShowCityRequestModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request a City</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCityRequest} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="cityName">City Name *</Label>
              <Input
                id="cityName"
                type="text"
                placeholder="e.g., New York, Los Angeles"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="reason">Why would you love to see this city added? *</Label>
              <Textarea
                id="reason"
                placeholder="Tell us why this city would be a great addition..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                rows={4}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5"
              />
              <p className="text-sm text-slate-500 mt-1">
                We'll notify you when we launch in your city
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCityRequestModal(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </footer>
  );
}
