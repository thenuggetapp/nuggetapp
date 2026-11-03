// Server only: uses the Supabase service role key.
import { createClient } from '@supabase/supabase-js';

/*
  Passwordless sign-up / sign-in by email, sent through our own email (send-auth-email edge
  function -> Resend) instead of Supabase's built-in mailer.

  The link points at /auth/confirm, which exchanges the one-time token for a session. Clicking it
  confirms the email address and signs the user in.
*/

function adminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Only same-site paths, so the link can't be used to send people elsewhere. */
export function safeNextPath(next: string | null | undefined, fallback = '/') {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : fallback;
}

async function sendEmail(type: 'signup' | 'magic_link', to: string, link: string, userName?: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-auth-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ type, to, link, userName }),
  });
  if (!res.ok) {
    throw new Error(`send-auth-email failed (${res.status}): ${await res.text()}`);
  }
}

async function signInLink(email: string, origin: string, next: string) {
  const { data, error } = await adminClient().auth.admin.generateLink({ type: 'magiclink', email });
  const tokenHash = data?.properties?.hashed_token;
  if (error || !tokenHash) {
    throw new Error(`Could not create sign-in link: ${error?.message || 'no token'}`);
  }
  return `${origin}/auth/confirm?token_hash=${encodeURIComponent(tokenHash)}&next=${encodeURIComponent(next)}`;
}

/**
 * Creates a passwordless account if this email is new and sends the Nugget welcome email
 * (or, for an existing account, a "sign in to Nugget" email). New accounts land on /welcome,
 * where they can optionally set a password, then continue to `next`.
 */
export async function sendSignUpOrSignInEmail(params: {
  email: string;
  firstName: string;
  origin: string;
  next: string;
}): Promise<{ isNewUser: boolean }> {
  const { email, firstName, origin } = params;
  const next = safeNextPath(params.next);

  const { error: createError } = await adminClient().auth.admin.createUser({
    email,
    user_metadata: { full_name: firstName },
  });
  const alreadyExists = !!createError && /already|registered|exists/i.test(createError.message);
  if (createError && !alreadyExists) {
    throw new Error(`Could not create account: ${createError.message}`);
  }

  const isNewUser = !createError;
  const destination = isNewUser ? `/welcome?next=${encodeURIComponent(next)}` : next;
  const link = await signInLink(email, origin, destination);
  await sendEmail(isNewUser ? 'signup' : 'magic_link', email, link, firstName);
  return { isNewUser };
}

/** Sends a "sign in to Nugget" email to an existing account. Does nothing for unknown emails. */
export async function sendSignInEmailIfAccountExists(params: { email: string; origin: string; next: string }) {
  const { data: profile } = await adminClient()
    .from('user_profiles')
    .select('full_name')
    .eq('email', params.email)
    .maybeSingle();
  if (!profile) return;

  const link = await signInLink(params.email, params.origin, safeNextPath(params.next));
  await sendEmail('magic_link', params.email, link, profile.full_name || undefined);
}
