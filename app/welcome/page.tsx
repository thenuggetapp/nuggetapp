'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';

// Shown once after a passwordless sign-up (blog pop-up). Setting a password is optional.
export default function WelcomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userProfile, loading } = useAuth();
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const nextParam = searchParams.get('next');
  const next = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/';
  const firstName = (userProfile?.full_name || '').split(' ')[0];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Passwords need at least 6 characters');
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      toast.error(error.message || 'Could not save your password');
      return;
    }
    toast.success('Password saved');
    router.replace(next);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#8dbf65]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        {user ? (
          <>
            <div className="text-center mb-6">
              <CheckCircle2 className="h-12 w-12 text-[#8dbf65] mx-auto mb-3" />
              <h1 className="text-2xl font-bold text-slate-900">
                You&apos;re in{firstName ? `, ${firstName}` : ''}!
              </h1>
              <p className="text-slate-600 mt-2">
                Your email is confirmed. Set a password so you can sign in on any device.
              </p>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full bg-[#8dbf65] hover:bg-[#7aaa56]" disabled={saving}>
                {saving ? 'Saving...' : 'Save Password'}
              </Button>
            </form>
            <button
              type="button"
              onClick={() => router.replace(next)}
              className="mt-4 w-full text-sm text-slate-500 hover:text-slate-700"
            >
              Skip for now
            </button>
            <p className="mt-4 text-xs text-slate-500 text-center">
              No password? You can always sign in with a link sent to your email.
            </p>
          </>
        ) : (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome to Nugget</h1>
            <p className="text-slate-600 mb-6">Sign in to continue.</p>
            <Link href="/login">
              <Button className="bg-[#8dbf65] hover:bg-[#7aaa56]">Go to sign in</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
