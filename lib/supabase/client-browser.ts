import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createClient() {
  // Detect if running in iframe (Bolt preview environment)
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  // In iframe environments (Bolt preview), use localStorage-based client
  // because third-party cookies are blocked by browsers
  if (isInIframe) {
    console.log('[Supabase] Running in iframe - using localStorage-based client');
    return createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      }
    );
  }

  // In normal environments, use SSR-compatible client with cookies
  console.log('[Supabase] Using SSR-compatible cookie-based client');
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
