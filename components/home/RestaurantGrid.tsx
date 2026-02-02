'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Bookmark } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserBookmarks, useUserLikes, useToggleBookmark, useToggleLike } from '@/hooks/useUserData';

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  likes_count: number;
  address: string;
  image_url: string | null;
}

interface RestaurantGridProps {
  restaurants: Restaurant[];
  title: string;
}

export function RestaurantGrid({ restaurants, title }: RestaurantGridProps) {
  const { user } = useAuth();
  const router = useRouter();
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

  if (restaurants.length === 0) {
    return null;
  }

  return (
    <div className="mt-0 md:mt-[50px] text-left px-4 md:px-10 pb-4 md:pb-6">
      <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4 md:mb-3">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {restaurants.map((restaurant) => (
          <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`} prefetch={false}>
            <Card className="cursor-pointer transition-all hover:shadow-lg border-slate-200 overflow-hidden">
              <div className="relative w-full overflow-hidden aspect-[4/3]">
                <img
                  src={restaurant.image_url || 'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=400'}
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
  );
}


