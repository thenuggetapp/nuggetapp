import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  console.log('\n' + '='.repeat(80));
  console.log('[send-email API] 📧 EMAIL SEND REQUEST RECEIVED');
  console.log('='.repeat(80));

  try {
    const body = await request.json();
    const { type, email, link, userName, newEmail } = body;

    console.log('[send-email API] Request body:', {
      type,
      email,
      link: link?.substring(0, 50) + '...',
      userName,
      newEmail,
    });

    if (!type || !email || !link) {
      console.error('[send-email API] ❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: type, email, link' },
        { status: 400 }
      );
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[send-email API] ❌ Missing Supabase credentials');
      console.error('[send-email API] Has URL:', !!supabaseUrl);
      console.error('[send-email API] Has Service Key:', !!supabaseServiceKey);
      return NextResponse.json(
        { error: 'Server configuration error: Missing Supabase credentials' },
        { status: 500 }
      );
    }

    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-auth-email`;
    console.log('[send-email API] 🚀 Calling Edge Function:', edgeFunctionUrl);

    const payload = {
      type,
      to: email,
      link,
      userName,
      newEmail,
    };

    console.log('[send-email API] 📦 Payload:', payload);

    const fetchStart = Date.now();
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify(payload),
    });
    const fetchDuration = Date.now() - fetchStart;

    console.log('[send-email API] ⏱️ Edge Function response time:', fetchDuration, 'ms');
    console.log('[send-email API] 📊 Response status:', response.status);
    console.log('[send-email API] 📊 Response ok:', response.ok);

    const data = await response.json();
    console.log('[send-email API] 📊 Response data:', data);

    if (!response.ok) {
      console.error('[send-email API] ❌ Edge function error:', data);
      console.error('[send-email API] ❌ Status:', response.status);
      console.error('[send-email API] ❌ Status Text:', response.statusText);
      return NextResponse.json(
        { error: data.error || 'Failed to send email' },
        { status: response.status }
      );
    }

    console.log('[send-email API] ✅ Email sent successfully!');
    console.log('[send-email API] ✅ Email ID:', data.id);
    console.log('='.repeat(80) + '\n');

    return NextResponse.json({ success: true, id: data.id });
  } catch (error) {
    console.error('[send-email API] ❌ Fatal error:', error);
    console.error('[send-email API] ❌ Error stack:', error instanceof Error ? error.stack : 'N/A');
    console.log('='.repeat(80) + '\n');

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
