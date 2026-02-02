"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowRight, Plus } from "lucide-react";
import { CityRequestModal } from "@/components/CityRequestModal";

interface CityData {
  name: string;
  count: number;
  image: string;
  description: string;
}

const FEATURED_CITIES: CityData[] = [
  {
    name: "London",
    count: 273,
    image: "/jamie-davies-7intev_ztru-unsplash.jpg",
    description: "Explore family-friendly restaurants across London"
  },
  {
    name: "Chicago",
    count: 43,
    image: "/neal-kharawala-xxa8ptuld1y-unsplash.jpg",
    description: "Discover the best spots for families in Chicago"
  },
  {
    name: "San Francisco",
    count: 22,
    image: "/amogh-manjunath-hksflo1t8ia-unsplash.jpg",
    description: "Find family dining options in San Francisco"
  }
];

export function CityBrowse() {
  const router = useRouter();
  const [showCityRequestModal, setShowCityRequestModal] = useState(false);

  const handleCityClick = (cityName: string) => {
    const cityRoutes: Record<string, string> = {
      "London": "/london",
      "Chicago": "/chicago",
      "San Francisco": "/sanfrancisco"
    };

    const route = cityRoutes[cityName] || `/search?q=${encodeURIComponent(cityName)}`;
    router.push(route);
  };

  return (
    <section className="mt-0 md:mt-[50px] text-left px-4 md:px-10 pb-4 md:pb-6">
      <div className="mb-4 md:mb-8">
        <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3">
          Browse by city
        </h2>
        <p className="hidden md:block text-sm md:text-base text-slate-600 max-w-2xl">
          We're growing city by city to create more welcoming places for families.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {FEATURED_CITIES.map((city) => (
          <Card
            key={city.name}
            className="group cursor-pointer overflow-hidden border-2 border-slate-200 hover:border-[#8dbf65] transition-all duration-300 hover:shadow-xl h-80 relative"
            onClick={() => handleCityClick(city.name)}
          >
            <img
              src={city.image}
              alt={`${city.name} restaurants`}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

            <div className="relative h-full flex flex-col justify-between p-6">
              <div className="flex justify-end">
                <Badge className="bg-[#8dbf65] hover:bg-[#7aaa56] text-white border-0 px-3 py-1.5 shadow-lg">
                  <MapPin className="h-3 w-3 mr-1" />
                  {city.count} restaurants
                </Badge>
              </div>

              <div className="space-y-3">
                <h3 className="text-3xl font-bold text-white drop-shadow-lg">
                  {city.name}
                </h3>
                <p className="text-white/90 text-sm drop-shadow">
                  {city.description}
                </p>
                <div className="flex items-center text-white font-semibold group-hover:gap-2 transition-all">
                  <span>Explore restaurants</span>
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Card>
        ))}

        <Card
          className="group cursor-pointer overflow-hidden border-0 transition-all duration-300 hover:shadow-xl h-80 relative bg-[#111728]"
          onClick={() => setShowCityRequestModal(true)}
        >
          <div className="relative h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#8dbf65]/10 flex items-center justify-center group-hover:bg-[#8dbf65]/20 transition-colors">
              <Plus className="h-8 w-8 text-[#8dbf65] group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-bold text-white">
              Request a New City
            </h3>
            <p className="text-white text-sm">
              Don't see your city? Let us know where we should expand next
            </p>
            <div className="flex items-center text-[#8dbf65] font-semibold group-hover:gap-2 transition-all">
              <span>Make a request</span>
              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Card>
      </div>

      <CityRequestModal
        open={showCityRequestModal}
        onOpenChange={setShowCityRequestModal}
      />
    </section>
  );
}
