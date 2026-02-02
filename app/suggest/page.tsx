'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { ConditionalFooter } from '@/components/ConditionalFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Store, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { GooglePlacesAutocomplete } from '@/components/GooglePlacesAutocomplete';
import { mapGooglePlaceToSuggestion } from '@/lib/google-places-mapper';

export default function SuggestRestaurantPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cuisine: '',
    address: '',
    city: '',
    postcode: '',
    phone: '',
    website: '',
    description: '',
  });

  const handlePlaceSelect = (placeData: any) => {
    const mappedData = mapGooglePlaceToSuggestion(placeData);
    setFormData({
      ...formData,
      ...mappedData,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to suggest a restaurant',
        variant: 'destructive',
      });
      router.push('/login?redirect=/suggest');
      return;
    }

    if (!formData.name || !formData.cuisine || !formData.address || !formData.city) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('restaurant_suggestions')
        .insert([
          {
            user_id: user.id,
            name: formData.name,
            cuisine: formData.cuisine,
            address: formData.address,
            city: formData.city,
            postcode: formData.postcode || null,
            phone: formData.phone || null,
            website: formData.website || null,
            description: formData.description || null,
            status: 'pending',
          },
        ]);

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: 'Success!',
        description: 'Thank you for suggesting a restaurant. We will review it soon.',
      });

      setFormData({
        name: '',
        cuisine: '',
        address: '',
        city: '',
        postcode: '',
        phone: '',
        website: '',
        description: '',
      });
    } catch (error: any) {
      console.error('Error submitting suggestion:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit suggestion',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-[#8dbf65] rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Sign In Required</CardTitle>
            <CardDescription>
              You need to be signed in to suggest a restaurant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full bg-[#8dbf65] hover:bg-[#7aaa56]"
              onClick={() => router.push('/login?redirect=/suggest')}
            >
              Sign In
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/')}
            >
              Go Back Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Thank You!</CardTitle>
            <CardDescription>
              Your restaurant suggestion has been submitted successfully. Our team will review it and add it to our platform if it meets our criteria.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full bg-[#8dbf65] hover:bg-[#7aaa56]"
              onClick={() => setSubmitted(false)}
            >
              Suggest Another Restaurant
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/search')}
            >
              Browse Restaurants
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Link
            href="/search"
            className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Link>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-[#8dbf65] rounded-lg flex items-center justify-center">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Suggest a Restaurant</CardTitle>
                  <CardDescription>
                    Know a great family-friendly spot? Let us know!
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                    <span className="text-xl">🚀</span>
                    Quick Start with Google Places
                  </h4>
                  <p className="text-sm text-green-800">
                    Start typing the restaurant name below to search Google Places and automatically fill all form fields with accurate information. This saves you time and ensures accuracy!
                  </p>
                </div>

                <div className="space-y-2">
                  <GooglePlacesAutocomplete
                    onPlaceSelect={handlePlaceSelect}
                    onManualInput={(name) => setFormData({ ...formData, name })}
                    placeholder="Search for a restaurant..."
                    label="Restaurant Name *"
                    defaultValue={formData.name}
                  />
                  <p className="text-xs text-slate-500">
                    Type at least 3 characters to search Google Places and auto-fill, or enter manually
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cuisine">
                    Cuisine Type <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cuisine"
                    placeholder="e.g., Italian, British, Indian"
                    value={formData.cuisine}
                    onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">
                      City <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="city"
                      placeholder="e.g., London"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postcode">Postcode / Zipcode</Label>
                    <Input
                      id="postcode"
                      placeholder="e.g., SW1A 1AA"
                      value={formData.postcode}
                      onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">
                    Street Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="address"
                    placeholder="123 High Street"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+44 20 1234 5678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://example.com"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Why do you recommend this restaurant?
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Tell us what makes this place special for families..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                  <p className="text-xs text-slate-500">
                    Share what makes this restaurant family-friendly, memorable, or worth visiting
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Our team will review your suggestion</li>
                    <li>• We will verify the details and contact the restaurant</li>
                    <li>• If approved, it will be added to our platform</li>
                    <li>• You will help families discover great places to eat!</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/search')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#8dbf65] hover:bg-[#7aaa56]"
                  >
                    {loading ? 'Submitting...' : 'Submit Suggestion'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <ConditionalFooter />
    </>
  );
}
