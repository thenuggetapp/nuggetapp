import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const startTime = Date.now();

  try {
    const supabase = createClient();

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
        duration: Date.now() - startTime,
      });
    }

    // Test the profile query with timing
    const queryStart = Date.now();
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    const queryDuration = Date.now() - queryStart;
    const totalDuration = Date.now() - startTime;

    if (profileError) {
      return NextResponse.json({
        success: false,
        error: profileError.message,
        queryDuration,
        totalDuration,
      });
    }

    return NextResponse.json({
      success: true,
      hasProfile: !!profile,
      queryDuration,
      totalDuration,
      profile: profile ? {
        id: profile.id,
        email: profile.email,
        role: profile.role,
      } : null,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
    });
  }
}
