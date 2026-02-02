import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function POST(request: NextRequest) {
  console.log('\n' + '='.repeat(80));
  console.log('[forgot-password API] PASSWORD RESET REQUEST');
  console.log('='.repeat(80));

  try {
    const { email } = await request.json();

    console.log('[forgot-password API] Email:', email);

    if (!email) {
      console.error('[forgot-password API] Missing email');
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('id, full_name, email')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    console.log('[forgot-password API] User lookup result:', {
      found: !!userData,
      userId: userData?.id,
      userEmail: userData?.email,
      error: userError?.message,
    });

    const token = generateSecureToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    console.log('[forgot-password API] Storing password reset token...');
    const { data: tokenData, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: userData?.id || null,
        email: email.toLowerCase(),
        token,
        expires_at: expiresAt.toISOString(),
      })
      .select();

    if (tokenError) {
      console.error('[forgot-password API] ❌ Error storing token:', tokenError);
      console.error('[forgot-password API] Token error details:', tokenError.message, tokenError.code);
    } else {
      console.log('[forgot-password API] ✅ Token stored successfully');
      console.log('[forgot-password API] Token data:', tokenData);
    }

    let emailResult: { sent: boolean; status?: number; error?: string; emailId?: string } = { sent: false };

    if (userData) {
      const origin = request.headers.get('origin') || 'https://thenugget.app';
      const resetLink = `${origin}/reset-password?token=${token}`;

      console.log('[forgot-password API] Reset link generated:', resetLink);
      console.log('[forgot-password API] Sending email via Supabase Edge Function...');
      console.log('[forgot-password API] supabaseUrl:', supabaseUrl);
      console.log('[forgot-password API] Has service key:', !!supabaseServiceKey);

      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-auth-email`;

      const emailPayload = {
        type: 'password_reset',
        to: email,
        link: resetLink,
        userName: userData.full_name,
      };

      console.log('[forgot-password API] Edge function URL:', edgeFunctionUrl);
      console.log('[forgot-password API] Email payload:', emailPayload);

      try {
        const emailResponse = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify(emailPayload),
        });

        console.log('[forgot-password API] Email response status:', emailResponse.status);
        console.log('[forgot-password API] Email response ok:', emailResponse.ok);

        const emailData = await emailResponse.json();
        console.log('[forgot-password API] Email response data:', emailData);

        if (!emailResponse.ok) {
          console.error('[forgot-password API] Email send failed!');
          emailResult = { sent: false, status: emailResponse.status, error: emailData.error || 'Unknown error' };
        } else {
          console.log('[forgot-password API] Email sent successfully!');
          emailResult = { sent: true, emailId: emailData.id };
        }
      } catch (emailError) {
        console.error('[forgot-password API] Email fetch error:', emailError);
        emailResult = { sent: false, error: emailError instanceof Error ? emailError.message : 'Fetch error' };
      }
    } else {
      console.log('[forgot-password API] User not found, not sending email (security)');
      emailResult = { sent: false, error: 'User not found (this is hidden from client for security)' };
    }

    console.log('[forgot-password API] Final email result:', emailResult);
    console.log('='.repeat(80) + '\n');

    return NextResponse.json({
      success: true,
      debug: {
        userFound: !!userData,
        tokenCreated: !tokenError,
        emailResult,
        edgeFunctionUrl: `${supabaseUrl}/functions/v1/send-auth-email`,
      }
    });
  } catch (error) {
    console.error('[forgot-password API] Fatal error:', error);
    console.log('='.repeat(80) + '\n');
    return NextResponse.json({ success: true });
  }
}
