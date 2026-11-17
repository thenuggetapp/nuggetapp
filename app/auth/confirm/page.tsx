'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';

// Opened from the welcome / sign-in email: exchanges the one-time token for a session
// (confirming the email address), then continues to `next`.
export default function ConfirmEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [failed, setFailed] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const tokenHash = searchParams.get('token_hash');
    const nextParam = searchParams.get('next');
    const next = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/';

    if (!tokenHash) {
      setFailed(true);
      return;
    }

    supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'email' }).then(({ error }) => {
      if (error) {
        console.error('[auth/confirm] Link could not be used:', error);
        setFailed(true);
        return;
      }
      router.replace(next);
    });
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        {failed ? (
          <>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">This link has expired</h1>
            <p className="text-slate-600 mb-6">
              Sign-in links work once and expire after a short time. Request a new one from the sign-in page.
            </p>
            <Link href="/login">
              <Button className="bg-[#8dbf65] hover:bg-[#7aaa56]">Go to sign in</Button>
            </Link>
          </>
        ) : (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-[#8dbf65] mx-auto mb-4" />
            <p className="text-slate-600">Signing you in...</p>
          </>
        )}
      </div>
    </div>
  );
}
