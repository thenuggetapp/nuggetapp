import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  console.log('\n' + '='.repeat(80));
  console.log('[generate-token API] 🔐 GENERATE VERIFICATION TOKEN REQUEST');
  console.log('='.repeat(80));

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('[generate-token API] 🔍 Environment check:');
    console.log('[generate-token API] Has NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
    console.log('[generate-token API] Has SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
    console.log('[generate-token API] All env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[generate-token API] ❌ Missing Supabase credentials');
      return NextResponse.json(
        { error: 'Server configuration error: Missing Supabase credentials' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { userId, email } = body;

    if (!userId || !email) {
      console.error('[generate-token API] ❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: userId, email' },
        { status: 400 }
      );
    }

    console.log('[generate-token API] 📧 Generating token for user:', userId);
    console.log('[generate-token API] 📧 Email:', email);

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Generate a secure random token (64 characters)
    const token = randomBytes(32).toString('hex');
    console.log('[generate-token API] 🔑 Token generated:', token.substring(0, 10) + '...');

    // Set expiration to 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    console.log('[generate-token API] ⏰ Token expires at:', expiresAt.toISOString());

    // Delete any existing unused tokens for this user
    const { error: deleteError } = await supabase
      .from('email_verification_tokens')
      .delete()
      .eq('user_id', userId)
      .is('used_at', null);

    if (deleteError) {
      console.error('[generate-token API] ⚠️ Failed to delete old tokens:', deleteError);
    } else {
      console.log('[generate-token API] ✅ Deleted old unused tokens');
    }

    // Insert new token
    const { data: tokenData, error: insertError } = await supabase
      .from('email_verification_tokens')
      .insert({
        user_id: userId,
        email: email,
        token: token,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('[generate-token API] ❌ Failed to insert token:', insertError);
      console.error('[generate-token API] ❌ Insert error details:', JSON.stringify(insertError, null, 2));
      console.error('[generate-token API] ❌ Insert error code:', insertError.code);
      console.error('[generate-token API] ❌ Insert error message:', insertError.message);
      return NextResponse.json(
        {
          error: 'Failed to generate verification token',
          details: insertError.message,
          code: insertError.code
        },
        { status: 500 }
      );
    }

    console.log('[generate-token API] ✅ Token stored successfully');
    console.log('[generate-token API] ✅ Token ID:', tokenData.id);
    console.log('='.repeat(80) + '\n');

    return NextResponse.json({
      success: true,
      token: token,
      expiresAt: expiresAt.toISOString(),
    });

  } catch (error) {
    console.error('[generate-token API] ❌ Fatal error:', error);
    console.error('[generate-token API] ❌ Error stack:', error instanceof Error ? error.stack : 'N/A');
    console.log('='.repeat(80) + '\n');

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
