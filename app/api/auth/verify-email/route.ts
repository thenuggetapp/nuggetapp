import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  console.log('\n' + '='.repeat(80));
  console.log('[verify-email API] 📧 EMAIL VERIFICATION REQUEST');
  console.log('='.repeat(80));

  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      console.error('[verify-email API] ❌ Missing token parameter');
      return NextResponse.json(
        { error: 'Missing verification token' },
        { status: 400 }
      );
    }

    console.log('[verify-email API] 🔍 Verifying token:', token.substring(0, 10) + '...');

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Find the token in database
    const { data: tokenData, error: tokenError } = await supabase
      .from('email_verification_tokens')
      .select('*')
      .eq('token', token)
      .maybeSingle();

    if (tokenError) {
      console.error('[verify-email API] ❌ Database error:', tokenError);
      return NextResponse.json(
        { error: 'Failed to verify token' },
        { status: 500 }
      );
    }

    if (!tokenData) {
      console.error('[verify-email API] ❌ Token not found');
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      );
    }

    console.log('[verify-email API] ✅ Token found for user:', tokenData.user_id);

    // Check if token is already used
    if (tokenData.used_at) {
      console.error('[verify-email API] ❌ Token already used at:', tokenData.used_at);
      return NextResponse.json(
        { error: 'This verification link has already been used' },
        { status: 400 }
      );
    }

    // Check if token is expired
    const expiresAt = new Date(tokenData.expires_at);
    const now = new Date();

    if (now > expiresAt) {
      console.error('[verify-email API] ❌ Token expired at:', expiresAt);
      return NextResponse.json(
        { error: 'This verification link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    console.log('[verify-email API] ✅ Token is valid and not expired');

    // Mark token as used
    const { error: updateTokenError } = await supabase
      .from('email_verification_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', tokenData.id);

    if (updateTokenError) {
      console.error('[verify-email API] ❌ Failed to mark token as used:', updateTokenError);
    } else {
      console.log('[verify-email API] ✅ Token marked as used');
    }

    // Update user's email_confirmed_at in Supabase Auth
    const { data: updateUserData, error: updateUserError } = await supabase.auth.admin.updateUserById(
      tokenData.user_id,
      { email_confirm: true }
    );

    if (updateUserError) {
      console.error('[verify-email API] ❌ Failed to confirm user email:', updateUserError);
      return NextResponse.json(
        { error: 'Failed to verify email. Please try again.' },
        { status: 500 }
      );
    }

    console.log('[verify-email API] ✅ User email confirmed successfully');
    console.log('[verify-email API] ✅ User ID:', tokenData.user_id);
    console.log('='.repeat(80) + '\n');

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now sign in.',
      userId: tokenData.user_id,
      email: tokenData.email,
    });

  } catch (error) {
    console.error('[verify-email API] ❌ Fatal error:', error);
    console.error('[verify-email API] ❌ Error stack:', error instanceof Error ? error.stack : 'N/A');
    console.log('='.repeat(80) + '\n');

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
