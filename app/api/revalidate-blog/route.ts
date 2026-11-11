import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

// Called by the admin UI after an article is created, edited, published,
// unpublished or deleted, so /blog updates immediately instead of waiting for
// the 5-minute ISR window. Restricted to people who can manage articles.
export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || !['admin', 'local_hero'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let slug: unknown;
  try {
    ({ slug } = await request.json());
  } catch {
    // Body is optional.
  }

  revalidatePath('/blog');
  if (typeof slug === 'string' && /^[a-z0-9-]+$/i.test(slug)) {
    revalidatePath(`/article/${slug}`);
  }

  return NextResponse.json({ revalidated: true });
}
