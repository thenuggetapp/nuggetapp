// Server only: uses the Supabase service role key and Outseta secret keys.
import { createClient } from '@supabase/supabase-js';

/*
  Syncs restaurant owners to the Outseta CRM.

  - Every owner becomes (or updates) an Outseta Person with two custom properties:
      NuggetRole   = "Restaurant partner"
      BusinessName = the business name they signed up with
  - Owners who ticked the marketing opt-in are subscribed to the Restaurant partners email list;
    owners who untick it are removed from that list.

  Needs these environment variables (server only):
    OUTSETA_SUBDOMAIN            e.g. "thenugget" for thenugget.outseta.com
    OUTSETA_API_KEY / OUTSETA_SECRET_KEY
    OUTSETA_PARTNERS_LIST_UID    Uid of the "Restaurant partners" email list
  and the custom properties above created on Person in Outseta (CRM > Custom properties).
  When the Outseta variables are missing, syncing is skipped.

  Results are recorded in public.outseta_sync_log (one row per user).
*/

const ROLE_PROPERTY = 'NuggetRole';
const BUSINESS_PROPERTY = 'BusinessName';
const OWNER_ROLE_LABEL = 'Restaurant partner';

type SyncResult = { status: 'success' | 'failed' | 'skipped'; message?: string };

function outsetaConfig() {
  const subdomain = process.env.OUTSETA_SUBDOMAIN;
  const apiKey = process.env.OUTSETA_API_KEY;
  const secretKey = process.env.OUTSETA_SECRET_KEY;
  if (!subdomain || !apiKey || !secretKey) return null;
  return {
    baseUrl: `https://${subdomain}.outseta.com/api/v1`,
    auth: `Outseta ${apiKey}:${secretKey}`,
    listUid: process.env.OUTSETA_PARTNERS_LIST_UID || null,
  };
}

async function outsetaFetch(
  config: NonNullable<ReturnType<typeof outsetaConfig>>,
  path: string,
  init: { method: string; body?: unknown }
) {
  const res = await fetch(`${config.baseUrl}${path}`, {
    method: init.method,
    headers: { Authorization: config.auth, 'Content-Type': 'application/json' },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { ok: res.ok, status: res.status, data };
}

function splitName(fullName: string | null | undefined, email: string) {
  const name = (fullName || '').trim() || email.split('@')[0];
  const [first, ...rest] = name.split(/\s+/);
  return { FirstName: first, LastName: rest.join(' ') };
}

function serviceClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function recordResult(
  supabase: ReturnType<typeof serviceClient>,
  userId: string,
  email: string,
  result: SyncResult,
  personUid?: string
) {
  const { error } = await supabase.from('outseta_sync_log').upsert(
    {
      user_id: userId,
      email,
      sync_status: result.status,
      outseta_person_id: personUid ?? null,
      error_message: result.message ?? null,
      synced_at: result.status === 'success' ? new Date().toISOString() : null,
    },
    { onConflict: 'user_id' }
  );
  if (error) console.error('[outseta] Failed to record sync result:', error);
}

/** Creates or updates an owner in Outseta and sets their email list membership. Never throws. */
export async function syncOwnerToOutseta(userId: string): Promise<SyncResult> {
  const config = outsetaConfig();
  if (!config) return { status: 'skipped', message: 'Outseta is not configured' };

  const supabase = serviceClient();
  let email = '';

  try {
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('email, full_name, role, marketing_opt_in')
      .eq('id', userId)
      .maybeSingle();
    if (profileError || !profile?.email) {
      return { status: 'failed', message: profileError?.message || 'Profile not found' };
    }
    email = profile.email;
    if (profile.role !== 'owner') return { status: 'skipped', message: 'Not a restaurant owner' };

    const { data: authUser } = await supabase.auth.admin.getUserById(userId);
    const businessName: string = authUser?.user?.user_metadata?.business_name || '';

    const personFields = {
      Email: email,
      ...splitName(profile.full_name, email),
      [ROLE_PROPERTY]: OWNER_ROLE_LABEL,
      ...(businessName ? { [BUSINESS_PROPERTY]: businessName } : {}),
    };

    // Find an existing person by email, then create or update
    const found = await outsetaFetch(config, `/crm/people?Email=${encodeURIComponent(email)}`, { method: 'GET' });
    if (!found.ok) throw new Error(`Outseta lookup failed (${found.status}): ${JSON.stringify(found.data)}`);
    const existing = found.data?.items?.[0];

    const saved = existing
      ? await outsetaFetch(config, `/crm/people/${existing.Uid}`, {
          method: 'PUT',
          body: { ...existing, ...personFields, Uid: existing.Uid },
        })
      : await outsetaFetch(config, '/crm/people', { method: 'POST', body: personFields });
    if (!saved.ok) throw new Error(`Outseta save failed (${saved.status}): ${JSON.stringify(saved.data)}`);
    const personUid: string = saved.data?.Uid || existing?.Uid;

    // Email list follows the marketing opt-in
    if (config.listUid && personUid) {
      if (profile.marketing_opt_in) {
        const sub = await outsetaFetch(config, `/email/lists/${config.listUid}/subscriptions`, {
          method: 'POST',
          body: { EmailList: { Uid: config.listUid }, Person: { Uid: personUid }, SendWelcomeEmail: false },
        });
        // Already subscribed comes back as an error; that's fine
        if (!sub.ok && sub.status !== 400 && sub.status !== 409) {
          throw new Error(`Outseta list subscribe failed (${sub.status}): ${JSON.stringify(sub.data)}`);
        }
      } else {
        const unsub = await outsetaFetch(config, `/email/lists/${config.listUid}/subscriptions/${personUid}`, {
          method: 'DELETE',
        });
        if (!unsub.ok && unsub.status !== 404) {
          throw new Error(`Outseta list unsubscribe failed (${unsub.status}): ${JSON.stringify(unsub.data)}`);
        }
      }
    }

    const result: SyncResult = { status: 'success' };
    await recordResult(supabase, userId, email, result, personUid);
    return result;
  } catch (error) {
    const result: SyncResult = { status: 'failed', message: error instanceof Error ? error.message : String(error) };
    console.error('[outseta] Sync failed for', userId, result.message);
    if (email) await recordResult(supabase, userId, email, result);
    return result;
  }
}
