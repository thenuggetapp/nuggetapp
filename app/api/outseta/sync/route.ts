import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { syncOwnerToOutseta } from '@/lib/outseta';

export const runtime = 'nodejs';

// Re-syncs the signed-in owner to Outseta (e.g. after they change their marketing opt-in).
export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  // Admins can sync every existing owner at once: POST with body {"all": true}
  const body = await request.json().catch(() => ({}));
  if (body?.all === true) {
    const { data: caller } = await supabase.from('user_profiles').select('role').eq('id', data.user.id).maybeSingle();
    if (caller?.role !== 'admin') {
      return NextResponse.json({ error: 'Admins only' }, { status: 403 });
    }
    const { data: owners, error: ownersError } = await supabase.from('user_profiles').select('id').eq('role', 'owner');
    if (ownersError) {
      return NextResponse.json({ error: ownersError.message }, { status: 500 });
    }
    const counts = { success: 0, failed: 0, skipped: 0 };
    for (const owner of owners || []) {
      const result = await syncOwnerToOutseta(owner.id);
      counts[result.status]++;
    }
    return NextResponse.json({ owners: owners?.length || 0, ...counts });
  }

  const result = await syncOwnerToOutseta(data.user.id);
  return NextResponse.json(result, { status: result.status === 'failed' ? 502 : 200 });
}
