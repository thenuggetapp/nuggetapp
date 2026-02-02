"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FilterOption {
  id: string;
  label: string;
  icon: string;
  searchParam: string;
}

const POPULAR_FILTERS: FilterOption[] = [
  {
    id: "high_chairs",
    label: "High Chairs",
    icon: "/high-chairs.png",
    searchParam: "high_chairs=true",
  },
  {
    id: "baby_change_unisex",
    label: "Baby Change (Unisex)",
    icon: "/baby-change-unisex.png",
    searchParam: "baby_change_unisex=true",
  },
  {
    id: "kids_potty_toilet",
    label: "Kids Potty/Toilet",
    icon: "/kids-potty-toilet.png",
    searchParam: "kids_potty_toilet=true",
  },
  {
    id: "kids_colouring",
    label: "Kids Coloring",
    icon: "/kids-colouring.png",
    searchParam: "kids_colouring=true",
  },
  {
    id: "kids_play_space",
    label: "Kids Play Space",
    icon: "/kids-play-space.png",
    searchParam: "kids_play_space=true",
  },
  {
    id: "playground_nearby",
    label: "Playground Nearby",
    icon: "/playground_nearby.png",
    searchParam: "playground_nearby=true",
  },
  {
    id: "kids_menu",
    label: "Kids Menu",
    icon: "/kids-menu.png",
    searchParam: "kids_menu=true",
  },
  {
    id: "free_kids_meal",
    label: "Free Kids Meal",
    icon: "/free-kids-meal.png",
    searchParam: "free_kids_meal=true",
  },
  {
    id: "pram_storage",
    label: "Pram Storage",
    icon: "/pram-storage.png",
    searchParam: "pram_storage=true",
  },
  {
    id: "games_available",
    label: "Games Available",
    icon: "/games-available.png",
    searchParam: "games_available=true",
  },
  {
    id: "outdoor",
    label: "Outdoor Seating",
    icon: "/outdoor.png",
    searchParam: "outdoor=true",
  },
  {
    id: "wheelchair",
    label: "Wheelchair Access",
    icon: "/wheelchair.png",
    searchParam: "wheelchair=true",
  },
  {
    id: "dog_friendly",
    label: "Dog Friendly",
    icon: "/dog-friendly.png",
    searchParam: "dog_friendly=true",
  },
  {
    id: "quick_service",
    label: "Quick Service",
    icon: "/quick-service.png",
    searchParam: "quick_service=true",
  },
];

interface PopularFiltersProps {
  location?: string;
  filterCounts?: Record<string, number>;
}

export function PopularFilters({ location, filterCounts: preloadedCounts }: PopularFiltersProps = {}) {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [filterCounts, setFilterCounts] = useState<Record<string, number>>(preloadedCounts || {});
  const [loading, setLoading] = useState(!preloadedCounts);

  useEffect(() => {
    if (preloadedCounts) {
      return;
    }

    const fetchFilterCounts = async () => {
      try {
        const params = new URLSearchParams();
        if (location) {
          params.append('city', location);
        }

        const response = await fetch(`/api/filter-counts?${params.toString()}`);
        const data = await response.json();

        if (data.amenities) {
          setFilterCounts(data.amenities);
        }
      } catch (error) {
        console.error('Error fetching filter counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilterCounts();
  }, [location, preloadedCounts]);

  const visibleFilters = POPULAR_FILTERS.filter(filter => {
    if (loading) return true;
    const count = filterCounts[filter.id] || 0;
    return count > 0;
  });

  const handleFilterClick = (filter: FilterOption) => {
    const locationParam = location ? `q=${encodeURIComponent(location)}&` : '';
    router.push(`/search?${locationParam}${filter.searchParam}`);
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

  if (!loading && visibleFilters.length === 0) {
    return null;
  }

  return (
    <section className="-mt-[30px] md:mt-12 px-4 md:px-10 pb-1">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2">
            Popular Amenities
          </h2>
          <p className="hidden md:block text-sm md:text-base text-slate-600">
            Quickly find restaurants with the amenities that matter most
          </p>
        </div>
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
          className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory touch-pan-x"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {visibleFilters.map((filter) => (
            <Card
              key={filter.id}
              onClick={() => handleFilterClick(filter)}
              className="flex-shrink-0 w-[120px] md:w-[140px] h-[120px] md:h-[140px] cursor-pointer border-2 border-slate-200 hover:border-[#8dbf65] hover:shadow-lg transition-all duration-300 snap-start"
            >
              <div className="h-full flex flex-col items-center justify-center p-3 md:p-4 text-center space-y-2">
                <div className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center">
                  <img
                    src={filter.icon}
                    alt={filter.label}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-xs md:text-sm font-semibold text-slate-900 leading-tight">
                  {filter.label}
                </h3>
              </div>
            </Card>
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
    </section>
  );
}
