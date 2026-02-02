import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const { data: rateLimitCleanup, error: rateLimitError } = await supabase
      .rpc('cleanup_old_contact_rate_limits');

    const { data: submissionsCleanup, error: submissionsError } = await supabase
      .rpc('cleanup_old_contact_submissions');

    if (rateLimitError || submissionsError) {
      console.error('Cleanup errors:', { rateLimitError, submissionsError });
      return NextResponse.json(
        {
          error: 'Cleanup partially failed',
          details: {
            rateLimitError: rateLimitError?.message,
            submissionsError: submissionsError?.message
          }
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed successfully',
      results: {
        rateLimitsDeleted: rateLimitCleanup || 0,
        submissionsDeleted: submissionsCleanup || 0
      }
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
