'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client-browser';

interface RestaurantImage {
  id: string;
  image_url: string;
  is_featured: boolean;
  display_order: number;
}

interface ImageCarouselProps {
  restaurantId: string;
  fallbackImage?: string;
  restaurantName: string;
}

export function ImageCarousel({ restaurantId, fallbackImage, restaurantName }: ImageCarouselProps) {
  const [images, setImages] = useState<RestaurantImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadImages();
  }, [restaurantId]);

  const loadImages = async () => {
    try {
      setLoading(false);
      const { data, error } = await supabase
        .from('restaurant_images')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('is_featured', { ascending: false })
        .order('display_order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setImages(data);
      } else if (fallbackImage) {
        setImages([{
          id: 'fallback',
          image_url: fallbackImage,
          is_featured: true,
          display_order: 0
        }]);
      }
    } catch (err) {
      console.error('Error loading images:', err);
      if (fallbackImage) {
        setImages([{
          id: 'fallback',
          image_url: fallbackImage,
          is_featured: true,
          display_order: 0
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className="relative h-64 lg:h-80 w-full overflow-hidden flex-shrink-0 bg-gray-200 animate-pulse" />
    );
  }

  if (images.length === 0) {
    return (
      <div className="relative h-64 lg:h-80 w-full overflow-hidden flex-shrink-0">
        <img
          src={fallbackImage || 'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=400'}
          alt={restaurantName}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="relative h-64 lg:h-80 w-full overflow-hidden flex-shrink-0 group">
      <div className="relative w-full h-full">
        <img
          src={images[currentIndex].image_url}
          alt={`${restaurantName} - Image ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>

          <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}
