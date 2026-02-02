export interface IPLocationData {
  city: string;
  region?: string;
  country: string;
  latitude: number;
  longitude: number;
}

export async function getLocationFromIP(): Promise<IPLocationData | null> {
  try {
    const response = await fetch('https://ipapi.co/json/', {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch IP location');
    }

    const data = await response.json();

    if (data.city && data.latitude && data.longitude) {
      return {
        city: data.city,
        region: data.region,
        country: data.country_name || data.country,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
      };
    }

    return null;
  } catch (error) {
    console.error('IP geolocation error:', error);

    try {
      const fallbackResponse = await fetch('https://ip-api.com/json/?fields=status,city,regionName,country,lat,lon');

      if (!fallbackResponse.ok) {
        throw new Error('Fallback IP service failed');
      }

      const fallbackData = await fallbackResponse.json();

      if (fallbackData.status === 'success' && fallbackData.city) {
        return {
          city: fallbackData.city,
          region: fallbackData.regionName,
          country: fallbackData.country,
          latitude: fallbackData.lat,
          longitude: fallbackData.lon,
        };
      }
    } catch (fallbackError) {
      console.error('Fallback IP geolocation error:', fallbackError);
    }

    return null;
  }
}
