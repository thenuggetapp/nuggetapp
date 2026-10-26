import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

// Makes the signed-in user a restaurant owner after a Google sign-up that started on
// /owner/register. Mirrors the email sign-up path (app/api/auth/verify-email), which promotes
// owners with the service key. Only 'customer' accounts are promoted: admins and local heroes
// keep their role.
export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }
  const userId = userData.user.id;

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();
  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  if (profile.role !== 'customer') {
    return NextResponse.json({ role: profile.role, promoted: false });
  }

  const { error: updateError } = await supabase.from('user_profiles').update({ role: 'owner' }).eq('id', userId);
  if (updateError) {
    console.error('[claim-owner API] Failed to set profile role:', updateError);
    return NextResponse.json({ error: 'Could not set up your owner account' }, { status: 500 });
  }

  const { error: metaError } = await supabase.auth.admin.updateUserById(userId, {
    app_metadata: { role: 'owner' },
  });
  if (metaError) {
    console.error('[claim-owner API] Failed to set app_metadata role:', metaError);
  }

  return NextResponse.json({ role: 'owner', promoted: true });
}
