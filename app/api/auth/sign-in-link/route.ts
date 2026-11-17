import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { safeNextPath, sendSignInEmailIfAccountExists } from '@/lib/sign-in-link-email';

export const runtime = 'nodejs';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// "Email me a sign-in link" on /login, for accounts without a password (e.g. blog sign-ups).
// Always answers the same way so it can't be used to find out who has an account.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  if (!EMAIL_REGEX.test(email) || email.length > 255) {
    return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
  }

  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data: rateLimit, error: rateLimitError } = await anon.rpc('check_contact_rate_limit', {
    p_identifier: `sign-in-link-${ip}`,
    p_max_attempts: 5,
    p_window_hours: 1,
  });
  if (rateLimitError) {
    console.error('[sign-in-link API] Rate limit check error:', rateLimitError);
    return NextResponse.json({ error: 'Unable to process request' }, { status: 500 });
  }
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
  }

  try {
    await sendSignInEmailIfAccountExists({
      email,
      origin: request.nextUrl.origin,
      next: safeNextPath(body.next),
    });
  } catch (error) {
    console.error('[sign-in-link API] Failed to send sign-in link:', error);
  }

  return NextResponse.json({ success: true });
}
