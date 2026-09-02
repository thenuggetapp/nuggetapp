'use client';

import { useState, useEffect } from 'react';
import { SearchSection } from './SearchSection';
import { getLocationFromIP } from '@/lib/ip-geolocation';
import { useCookiePreferences } from '@/hooks/useCookiePreferences';

const CITIES = {
  London: { lat: 51.5074, lng: -0.1278 },
  Chicago: { lat: 41.8781, lng: -87.6298 },
  Milwaukee: { lat: 43.0389, lng: -87.9065 },
  'San Francisco': { lat: 37.7749, lng: -122.4194 }
};

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function findNearestCity(userLat: number, userLng: number): string {
  let nearestCity = 'London';
  let minDistance = Infinity;

  for (const [city, coords] of Object.entries(CITIES)) {
    const distance = calculateDistance(userLat, userLng, coords.lat, coords.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city;
    }
  }

  return nearestCity;
}

export function SmartSearchSection() {
  const [defaultCity, setDefaultCity] = useState<string | undefined>(undefined);
  const { functional } = useCookiePreferences();

  useEffect(() => {
    const detectNearestCity = async () => {
      try {
        if (!functional) {
          return;
        }

        const cachedCity = localStorage.getItem('nugget_nearest_city');
        if (cachedCity) {
          setDefaultCity(cachedCity);
          return;
        }

        const ipLocation = await getLocationFromIP();
        if (ipLocation) {
          const nearestCity = findNearestCity(ipLocation.latitude, ipLocation.longitude);
          setDefaultCity(nearestCity);
          localStorage.setItem('nugget_nearest_city', nearestCity);
        }
      } catch (error) {
        console.error('Error detecting nearest city:', error);
      }
    };

    detectNearestCity();
  }, [functional]);

  const handleLocationDetected = (city: string) => {
    setDefaultCity(city);
  };

  return <SearchSection defaultCity={defaultCity} onLocationDetected={handleLocationDetected} />;
}
