import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const MAX_EMAIL_LENGTH = 255;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface NewsletterSignupData {
  email: string;
  honeypot?: string;
}

function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email) && email.length <= MAX_EMAIL_LENGTH;
}

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
  return `newsletter-${ip}`;
}

// Upserts the subscriber as a Person in Outseta's CRM so they land in the
// "signed up for the Nugget" People segment (segments are computed off
// Person/Account data — there's no direct "add to segment" API). Never
// throws — a down or unconfigured Outseta must not block the Supabase signup.
async function syncToOutseta(email: string): Promise<void> {
  const domain = process.env.OUTSETA_DOMAIN;
  const apiKey = process.env.OUTSETA_API_KEY;
  const apiSecret = process.env.OUTSETA_API_SECRET;

  if (!domain || !apiKey || !apiSecret) {
    console.warn('[Newsletter] Outseta env vars not set, skipping CRM sync');
    return;
  }

  const authHeaders = {
    'Authorization': `Outseta ${apiKey}:${apiSecret}`,
    'Content-Type': 'application/json',
  };
  const baseUrl = `https://${domain}.outseta.com/api/v1/crm/people`;
  const personPayload = {
    Email: email,
    OptInToEmailList: true,
    SchemaLessData: { Source: 'Blog Newsletter Popup' },
  };

  try {
    const lookup = await fetch(`${baseUrl}?Email=${encodeURIComponent(email)}`, {
      headers: authHeaders,
    });

    if (!lookup.ok) {
      console.error('[Newsletter] Outseta person lookup failed:', lookup.status, await lookup.text());
      return;
    }

    const { items } = await lookup.json();
    const existingUid = items?.[0]?.Uid;

    const response = existingUid
      ? await fetch(`${baseUrl}/${existingUid}`, {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify(personPayload),
        })
      : await fetch(baseUrl, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify(personPayload),
        });

    if (!response.ok) {
      const body = await response.text();
      console.error('[Newsletter] Outseta sync failed:', response.status, body);
    }
  } catch (error) {
    console.error('[Newsletter] Outseta sync error:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const body: NewsletterSignupData = await request.json();

    if (body.honeypot) {
      return NextResponse.json({ error: 'Invalid submission' }, { status: 400 });
    }

    const email = (body.email || '').trim().toLowerCase();
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    const identifier = getClientIdentifier(request);
    const { data: rateLimitData, error: rateLimitError } = await supabase
      .rpc('check_contact_rate_limit', {
        p_identifier: identifier,
        p_max_attempts: 5,
        p_window_hours: 1,
      });

    if (rateLimitError) {
      console.error('[Newsletter] Rate limit check error:', rateLimitError);
      return NextResponse.json({ error: 'Unable to process request' }, { status: 500 });
    }

    if (!rateLimitData.allowed) {
      const retryAfter = Math.ceil(rateLimitData.retry_after || 3600);
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': retryAfter.toString() } }
      );
    }

    const { error: upsertError } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        { email, status: 'subscribed', source: 'blog_popup', unsubscribed_at: null },
        { onConflict: 'email' }
      );

    if (upsertError) {
      console.error('[Newsletter] Error saving subscriber:', upsertError);
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }

    await syncToOutseta(email);

    return NextResponse.json(
      { success: true, message: "You're subscribed!" },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Newsletter] Signup error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
