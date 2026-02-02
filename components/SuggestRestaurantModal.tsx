'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Store, CheckCircle, X } from 'lucide-react';
import { GooglePlacesAutocomplete } from '@/components/GooglePlacesAutocomplete';
import { mapGooglePlaceToSuggestion } from '@/lib/google-places-mapper';

interface SuggestRestaurantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SuggestRestaurantModal({ open, onOpenChange }: SuggestRestaurantModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const resetForm = () => {
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
    setSubmitted(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

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
      onOpenChange(false);
      router.push('/login?redirect=/search');
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

  const successContent = (
    <div className="text-center py-6">
      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="h-8 w-8 text-white" />
      </div>
      <h3 className="text-2xl font-semibold mb-2">Thank You!</h3>
      <p className="text-base text-slate-600 mb-6">
        Your restaurant suggestion has been submitted successfully. Our team will review it and add it to our platform if it meets our criteria.
      </p>
      <div className="space-y-3">
        <Button
          className="w-full bg-[#8dbf65] hover:bg-[#7aaa56]"
          onClick={() => resetForm()}
        >
          Suggest Another Restaurant
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => handleClose(false)}
        >
          Close
        </Button>
      </div>
    </div>
  );

  if (submitted) {
    if (isMobile) {
      return (
        <Drawer open={open} onOpenChange={handleClose}>
          <DrawerContent className="max-h-[90vh]">
            <DrawerHeader className="text-left border-b border-slate-200 pb-4">
              <div className="flex items-center justify-between">
                <DrawerTitle className="text-xl">Success!</DrawerTitle>
                <DrawerClose asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>
            <div className="p-6">
              {successContent}
            </div>
          </DrawerContent>
        </Drawer>
      );
    }

    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          {successContent}
        </DialogContent>
      </Dialog>
    );
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <h4 className="font-medium text-green-900 mb-1 text-sm flex items-center gap-1">
              <span>🚀</span>
              Quick Start with Google Places
            </h4>
            <p className="text-xs text-green-800">
              Start typing the restaurant name below to search Google Places and automatically fill all form fields
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
              Type at least 3 characters to search, or enter manually
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
              rows={3}
            />
            <p className="text-xs text-slate-500">
              Share what makes this restaurant family-friendly, memorable, or worth visiting
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2 text-sm">What happens next?</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Our team will review your suggestion</li>
              <li>• We will verify the details and contact the restaurant</li>
              <li>• If approved, it will be added to our platform</li>
              <li>• You will help families discover great places to eat!</li>
            </ul>
          </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleClose(false)}
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
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleClose}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-left border-b border-slate-200 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#8dbf65] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Store className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DrawerTitle className="text-xl">Suggest a Restaurant</DrawerTitle>
                  <DrawerDescription className="text-sm">
                    Know a great family-friendly spot? Let us know!
                  </DrawerDescription>
                </div>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          <div className="overflow-y-auto p-6">
            {formContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-[#8dbf65] rounded-lg flex items-center justify-center">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Suggest a Restaurant</DialogTitle>
              <DialogDescription>
                Know a great family-friendly spot? Let us know!
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="mt-4">
          {formContent}
        </div>
      </DialogContent>
    </Dialog>
  );
}
