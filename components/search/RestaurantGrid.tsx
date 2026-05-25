"use client";

import Link from "next/link";
import {
  Heart,
  Bookmark,
  Search,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Restaurant } from "@/lib/dummy-restaurants";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface RestaurantGridProps {
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  currentPage: number;
  isWideLayout: boolean;
  searchQuery: string;
  hoveredRestaurantId: string | null;
  likedIds: Set<string>;
  bookmarkedIds: Set<string>;
  onPageChange: (page: number) => void;
  onRestaurantClick: (restaurant: Restaurant) => void;
  onMouseEnter: (id: string) => void;
  onMouseLeave: () => void;
  onLike: (id: string, e: React.MouseEvent) => void;
  onBookmark: (id: string, e: React.MouseEvent) => void;
  onRequestCity: (query: string) => void;
}

export function RestaurantGrid({
  restaurants,
  loading,
  error,
  pagination,
  currentPage,
  isWideLayout,
  searchQuery,
  hoveredRestaurantId,
  likedIds,
  bookmarkedIds,
  onPageChange,
  onRestaurantClick,
  onMouseEnter,
  onMouseLeave,
  onLike,
  onBookmark,
  onRequestCity,
}: RestaurantGridProps) {
  return (
    <>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      <div
        className={`grid grid-cols-1 gap-4 transition-all duration-300 ${
          isWideLayout ? "lg:grid-cols-4" : "lg:grid-cols-2"
        }`}
      >
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-slate-200">
              <Skeleton className="h-32 w-full rounded-t-lg" />
              <CardContent className="pt-3">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : restaurants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center col-span-full">
            <Search className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No restaurants found
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mb-4">
              {searchQuery
                ? `No results for "${searchQuery}". Try a different search term.`
                : "No restaurants are currently available."}
            </p>
            {searchQuery && (
              <Button
                onClick={() => onRequestCity(searchQuery)}
                className="mt-2 bg-[#8dbf65] hover:bg-[#7da857] text-white"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Request this city
              </Button>
            )}
          </div>
        ) : (
          restaurants.map((restaurant) => (
            <Link
              key={restaurant.id}
              href={`/restaurant/${restaurant.id}`}
              prefetch={false}
              aria-label={`View details for ${restaurant.name}, ${restaurant.cuisine} restaurant in ${restaurant.address}`}
            >
              <Card
                className={`cursor-pointer transition-all overflow-hidden ${
                  hoveredRestaurantId === restaurant.id
                    ? "shadow-xl ring-4 ring-[#8dbf65] ring-opacity-50 scale-[1.02]"
                    : "hover:shadow-lg border-slate-200"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onRestaurantClick(restaurant);
                }}
                onMouseEnter={() => onMouseEnter(restaurant.id)}
                onMouseLeave={onMouseLeave}
              >
                <div className="relative w-full overflow-hidden aspect-video lg:aspect-[4/3]">
                  <img
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 flex gap-2">
                    <button
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-slate-50"
                      onClick={(e) => onLike(restaurant.id, e)}
                      aria-label={
                        likedIds.has(restaurant.id)
                          ? `Unlike ${restaurant.name}`
                          : `Like ${restaurant.name}`
                      }
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          likedIds.has(restaurant.id)
                            ? "text-red-500 fill-red-500"
                            : "text-slate-600"
                        }`}
                      />
                    </button>
                    <button
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-slate-50"
                      onClick={(e) => onBookmark(restaurant.id, e)}
                      aria-label={
                        bookmarkedIds.has(restaurant.id)
                          ? `Remove ${restaurant.name} from bookmarks`
                          : `Bookmark ${restaurant.name}`
                      }
                    >
                      <Bookmark
                        className={`h-4 w-4 ${
                          bookmarkedIds.has(restaurant.id)
                            ? "text-blue-600 fill-blue-600"
                            : "text-slate-600"
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <CardContent className="p-3">
                  <h3 className="font-semibold text-sm text-slate-900 mb-1 line-clamp-1">
                    {restaurant.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                      <span className="font-medium text-xs">
                        {restaurant.likesCount || 0}
                      </span>
                      <span className="text-xs text-slate-500">likes</span>
                    </div>
                    <span className="text-xs text-slate-600">•</span>
                    <p className="text-xs text-slate-600">
                      {restaurant.cuisine}
                    </p>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">
                    {restaurant.address}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      {!loading && restaurants.length > 0 && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 pb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-9 w-9 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            {currentPage > 3 && (
              <>
                <Button
                  variant={currentPage === 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(1)}
                  className="h-9 w-9 p-0"
                >
                  1
                </Button>
                {currentPage > 4 && (
                  <span className="px-2 text-slate-400">...</span>
                )}
              </>
            )}

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page === currentPage ||
                  page === currentPage - 1 ||
                  page === currentPage + 1 ||
                  page === currentPage - 2 ||
                  page === currentPage + 2,
              )
              .filter((page) => page > 0 && page <= pagination.totalPages)
              .map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className={`h-9 w-9 p-0 ${
                    currentPage === page
                      ? "bg-[#8dbf65] hover:bg-[#7aaa56]"
                      : ""
                  }`}
                >
                  {page}
                </Button>
              ))}

            {currentPage < pagination.totalPages - 2 && (
              <>
                {currentPage < pagination.totalPages - 3 && (
                  <span className="px-2 text-slate-400">...</span>
                )}
                <Button
                  variant={
                    currentPage === pagination.totalPages
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => onPageChange(pagination.totalPages)}
                  className="h-9 w-9 p-0"
                >
                  {pagination.totalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === pagination.totalPages}
            className="h-9 w-9 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  );
}
