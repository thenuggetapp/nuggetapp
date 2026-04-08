'use client';

import { useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserBookmarks, useUserLikes, useToggleBookmark, useToggleLike } from '@/hooks/useUserData';
import { getRestaurantDisplayImageUrlOrFallback } from '@/lib/restaurant-image';

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  likes_count: number;
  address: string;
  image_url: string | null;
  google_place_id?: string | null;
}

interface RestaurantCarouselProps {
  restaurants: Restaurant[];
  title: string;
  titleLink?: string;
}

export function RestaurantCarousel({ restaurants, title, titleLink }: RestaurantCarouselProps) {
  const { user } = useAuth();
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { bookmarkedIds } = useUserBookmarks();
  const { likedIds } = useUserLikes();
  const { toggleBookmark } = useToggleBookmark();
  const { toggleLike } = useToggleLike();

  const handleToggleLike = async (restaurantId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push('/login');
      return;
    }

    await toggleLike(restaurantId);
  };

  const handleToggleBookmark = async (restaurantId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push('/login');
      return;
    }

    await toggleBookmark(restaurantId);
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  if (restaurants.length === 0) {
    return null;
  }

  return (
    <div className="mt-0 md:mt-[50px] text-left px-4 md:px-10 pb-4 md:pb-2">
      <div className="mb-4 flex items-end justify-between">
        {titleLink ? (
          <Link href={titleLink}>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 hover:text-[#8dbf65] transition-colors cursor-pointer flex items-center gap-2">
              {title}
              <ChevronRight className="h-5 w-5" />
            </h2>
          </Link>
        ) : (
          <h2 className="text-xl md:text-2xl font-semibold text-slate-900">{title}</h2>
        )}
        <div className="hidden md:flex gap-2 flex-shrink-0 ml-4">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full border-2 border-slate-200 hover:border-[#8dbf65] hover:bg-[#8dbf65]/10"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full border-2 border-slate-200 hover:border-[#8dbf65] hover:bg-[#8dbf65]/10"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory touch-pan-x"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {restaurants.map((restaurant) => (
            <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`} prefetch={false} className="flex-shrink-0 w-[280px] snap-start">
              <Card className="cursor-pointer transition-all hover:shadow-lg border-slate-200 overflow-hidden h-full">
                <div className="relative w-full overflow-hidden aspect-[4/3]">
                  <img
                    src={getRestaurantDisplayImageUrlOrFallback({
                      image_url: restaurant.image_url,
                      google_place_id: restaurant.google_place_id,
                    })}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 flex items-center gap-2">
                    <button
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-slate-50"
                      onClick={(e) => handleToggleLike(restaurant.id, e)}
                    >
                      <Heart
                        className={`h-4 w-4 ${likedIds.has(restaurant.id) ? 'text-red-500 fill-red-500' : 'text-slate-600'}`}
                      />
                    </button>
                    <button
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-slate-50"
                      onClick={(e) => handleToggleBookmark(restaurant.id, e)}
                    >
                      <Bookmark
                        className={`h-4 w-4 ${bookmarkedIds.has(restaurant.id) ? 'text-blue-600 fill-blue-600' : 'text-slate-600'}`}
                      />
                    </button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm text-slate-900 mb-2 line-clamp-1">
                    {restaurant.name}
                  </h3>
                  {restaurant.likes_count > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      <Heart className="h-3 w-3 text-red-500 fill-red-500" />
                      <span className="text-xs font-medium text-slate-700">{restaurant.likes_count} likes</span>
                    </div>
                  )}
                  <p className="text-xs text-slate-600 mb-1 line-clamp-1">{restaurant.cuisine}</p>
                  <p className="text-xs text-slate-500 line-clamp-1">{restaurant.address}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .touch-pan-x {
          touch-action: pan-x;
        }
      `}</style>
    </div>
  );
}
