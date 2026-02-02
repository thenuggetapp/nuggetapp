import { NextResponse } from 'next/server';

export async function GET() {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!mapboxToken) {
    return NextResponse.json({
      success: false,
      error: 'Mapbox token not found in environment variables',
      token: null,
    });
  }

  if (mapboxToken.includes('example')) {
    return NextResponse.json({
      success: false,
      error: 'Mapbox token is set to example/placeholder value',
      token: 'example',
    });
  }

  try {
    const testQuery = 'London';
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(testQuery)}.json?access_token=${mapboxToken}&limit=1`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `Mapbox API returned ${response.status}: ${data.message || 'Unknown error'}`,
        token: mapboxToken.substring(0, 20) + '...',
        statusCode: response.status,
        details: data,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Mapbox API is working correctly',
      token: mapboxToken.substring(0, 20) + '...',
      testQuery,
      resultCount: data.features?.length || 0,
      sampleResult: data.features?.[0]?.place_name || null,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: `Network error: ${error.message}`,
      token: mapboxToken.substring(0, 20) + '...',
      details: error.toString(),
    });
  }
}
