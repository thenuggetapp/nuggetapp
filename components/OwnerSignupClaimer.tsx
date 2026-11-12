'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { consumeOwnerSignupIntent, hasOwnerSignupIntent } from '@/lib/owner-signup-intent';

// After a Google sign-up that started on /owner/register, makes the account an owner and opens
// the owner dashboard, whichever page Google returned the user to. Renders nothing.
export function OwnerSignupClaimer() {
  const { user, userProfile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const claimingRef = useRef(false);

  useEffect(() => {
    if (loading || !user || !userProfile || claimingRef.current) return;
    if (!hasOwnerSignupIntent()) return;
    consumeOwnerSignupIntent();
    claimingRef.current = true;

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch('/api/auth/claim-owner', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session?.access_token ?? ''}` },
        });
        const result = await res.json().catch(() => ({}));
        if (res.ok && result.role === 'owner') {
          await supabase.auth.refreshSession();
          await refreshProfile();
          router.replace(result.promoted ? '/owner/dashboard?welcome=true' : '/owner/dashboard');
          return;
        }
        if (!res.ok) {
          toast.error(result.error || 'We could not set up your restaurant owner account. Please contact us.');
        }
      } catch (err) {
        console.error('[OwnerSignupClaimer] Owner account setup failed:', err);
        toast.error('We could not set up your restaurant owner account. Please contact us.');
      } finally {
        claimingRef.current = false;
      }
    })();
  }, [loading, user, userProfile, refreshProfile, router]);

  return null;
}
