import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  console.log('\n' + '='.repeat(80));
  console.log('[reset-password API] TOKEN VERIFICATION');
  console.log('='.repeat(80));

  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: tokenData, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('id, user_id, email, expires_at, used_at')
      .eq('token', token)
      .maybeSingle();

    if (tokenError) {
      console.error('[reset-password API] Token lookup error:', tokenError);
      return NextResponse.json(
        { valid: false, error: 'Invalid token' },
        { status: 400 }
      );
    }

    if (!tokenData) {
      console.log('[reset-password API] Token not found');
      return NextResponse.json(
        { valid: false, error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    if (tokenData.used_at) {
      console.log('[reset-password API] Token already used');
      return NextResponse.json(
        { valid: false, error: 'This reset link has already been used' },
        { status: 400 }
      );
    }

    const expiresAt = new Date(tokenData.expires_at);
    if (expiresAt < new Date()) {
      console.log('[reset-password API] Token expired');
      return NextResponse.json(
        { valid: false, error: 'This reset link has expired' },
        { status: 400 }
      );
    }

    if (!tokenData.user_id) {
      console.log('[reset-password API] No user associated with token');
      return NextResponse.json(
        { valid: false, error: 'Invalid token' },
        { status: 400 }
      );
    }

    console.log('[reset-password API] Token is valid');
    console.log('='.repeat(80) + '\n');

    return NextResponse.json({
      valid: true,
      email: tokenData.email,
    });
  } catch (error) {
    console.error('[reset-password API] Fatal error:', error);
    return NextResponse.json(
      { valid: false, error: 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('\n' + '='.repeat(80));
  console.log('[reset-password API] PASSWORD UPDATE');
  console.log('='.repeat(80));

  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: tokenData, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('id, user_id, email, expires_at, used_at')
      .eq('token', token)
      .maybeSingle();

    if (tokenError || !tokenData) {
      console.error('[reset-password API] Token lookup error:', tokenError);
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    if (tokenData.used_at) {
      console.log('[reset-password API] Token already used');
      return NextResponse.json(
        { success: false, error: 'This reset link has already been used' },
        { status: 400 }
      );
    }

    const expiresAt = new Date(tokenData.expires_at);
    if (expiresAt < new Date()) {
      console.log('[reset-password API] Token expired');
      return NextResponse.json(
        { success: false, error: 'This reset link has expired' },
        { status: 400 }
      );
    }

    if (!tokenData.user_id) {
      console.log('[reset-password API] No user associated with token');
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 400 }
      );
    }

    console.log('[reset-password API] Updating password for user:', tokenData.user_id);

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      tokenData.user_id,
      { password }
    );

    if (updateError) {
      console.error('[reset-password API] Password update error:', updateError);

      if (updateError.message.includes('same as')) {
        return NextResponse.json(
          { success: false, error: 'New password must be different from your current password' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, error: updateError.message || 'Failed to update password' },
        { status: 400 }
      );
    }

    const { error: markUsedError } = await supabase
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', tokenData.id);

    if (markUsedError) {
      console.error('[reset-password API] Error marking token as used:', markUsedError);
    }

    console.log('[reset-password API] Password updated successfully');
    console.log('='.repeat(80) + '\n');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[reset-password API] Fatal error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred' },
      { status: 500 }
    );
  }
}
