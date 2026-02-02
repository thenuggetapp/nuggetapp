'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Store, ArrowRight } from 'lucide-react';

interface QuickAddRestaurantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function QuickAddRestaurantModal({ open, onOpenChange, onSuccess }: QuickAddRestaurantModalProps) {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cuisine: '',
    address: '',
    city: '',
  });

  const handleQuickAdd = async () => {
    if (!formData.name || !formData.cuisine || !formData.address || !formData.city) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to add a restaurant',
        variant: 'destructive',
      });
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      console.log('Quick add - Creating restaurant via API:', { name: formData.name, city: formData.city });

      // Call the server-side API route
      const response = await fetch('/api/restaurants/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({
          name: formData.name,
          cuisine: formData.cuisine,
          address: formData.address,
          city: formData.city,
          country: 'United Kingdom',
          latitude: 51.5074,
          longitude: -0.1278,
          price_level: 2,
          visible: false,
          nugget_verified: false,
          kids_menu: false,
          high_chairs: false,
          wheelchair_access: false,
          outdoor_seating: false,
          changing_table: false,
          vegetarian_options: false,
          vegan_options: false,
          gluten_free_options: false,
          dog_friendly: false,
          playground_nearby: false,
          quick_service: false,
          good_for_groups: false,
          air_conditioning: false,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create restaurant');
      }

      console.log('Restaurant created successfully:', result.restaurant.id);

      toast({
        title: 'Success!',
        description: 'Restaurant created. Complete the details to publish.',
      });

      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }

      if (userProfile?.role === 'local_hero') {
        router.push('/local-hero/dashboard');
      } else {
        router.push('/owner/restaurants');
      }
    } catch (error: any) {
      console.error('Error creating restaurant:', error);

      let errorMessage = error?.message || 'Failed to create restaurant';

      // Add more context for common errors
      if (errorMessage.includes('Unauthorized')) {
        errorMessage = 'Please sign in again to continue.';
      } else if (errorMessage.includes('Permission denied')) {
        errorMessage = 'Permission denied. Please ensure you have proper role assigned.';
      } else if (errorMessage.includes('already exists')) {
        errorMessage = 'A restaurant with this name already exists.';
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFullForm = () => {
    onOpenChange(false);
    if (userProfile?.role === 'local_hero') {
      router.push('/local-hero/dashboard/restaurants/new');
    } else {
      router.push('/owner/restaurants/new');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-[#8dbf65] rounded-lg flex items-center justify-center">
              <Store className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-xl">Quick Add Restaurant</DialogTitle>
          </div>
          <DialogDescription>
            Add basic details now and complete the full listing later
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Restaurant Name *</Label>
            <Input
              id="name"
              placeholder="e.g., The Family Kitchen"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cuisine">Cuisine Type *</Label>
            <Input
              id="cuisine"
              placeholder="e.g., Italian, British"
              value={formData.cuisine}
              onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Street Address *</Label>
            <Input
              id="address"
              placeholder="123 High Street"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              placeholder="London"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleFullForm}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Use Full Form Instead
          </Button>
          <Button
            onClick={handleQuickAdd}
            disabled={loading}
            className="w-full sm:w-auto bg-[#8dbf65] hover:bg-[#7aaa56] order-1 sm:order-2"
          >
            {loading ? (
              'Creating...'
            ) : (
              <>
                Quick Add
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>

        <p className="text-xs text-center text-slate-500">
          Restaurant will be saved as draft. You can add photos, hours, and amenities later.
        </p>
      </DialogContent>
    </Dialog>
  );
}
