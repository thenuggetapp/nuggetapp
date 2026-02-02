import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
      mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ? 'Set' : 'Missing',
    },
    tests: {} as Record<string, any>,
  };

  // Test Supabase connection
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });

    const { data, error } = await supabase
      .from('restaurants')
      .select('id')
      .limit(1);

    if (error) {
      diagnostics.tests.supabase = {
        status: 'Failed',
        error: error.message,
        code: error.code,
      };
    } else {
      diagnostics.tests.supabase = {
        status: 'Success',
        message: 'Database connection working',
        recordsFound: data?.length || 0,
      };
    }
  } catch (error: any) {
    diagnostics.tests.supabase = {
      status: 'Error',
      error: error.message,
    };
  }

  // Test Mapbox API
  try {
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    if (!mapboxToken || mapboxToken.includes('example')) {
      diagnostics.tests.mapbox = {
        status: 'Failed',
        error: 'Mapbox token not configured or is placeholder',
      };
    } else {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/London.json?access_token=${mapboxToken}&limit=1`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        diagnostics.tests.mapbox = {
          status: 'Failed',
          error: data.message || 'API request failed',
          statusCode: response.status,
        };
      } else {
        diagnostics.tests.mapbox = {
          status: 'Success',
          message: 'Mapbox API working',
          resultsFound: data.features?.length || 0,
        };
      }
    }
  } catch (error: any) {
    diagnostics.tests.mapbox = {
      status: 'Error',
      error: error.message,
    };
  }

  const allPassed = Object.values(diagnostics.tests).every(
    (test: any) => test.status === 'Success'
  );

  return NextResponse.json({
    healthy: allPassed,
    ...diagnostics,
  });
}
