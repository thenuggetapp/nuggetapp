'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

type VerificationState = 'verifying' | 'success' | 'error' | 'expired' | 'used';

export default function VerifyEmailPage() {
  const [state, setState] = useState<VerificationState>('verifying');
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setState('error');
        setMessage('Missing verification token. Please check your email link.');
        return;
      }

      try {
        console.log('[VerifyEmail] Verifying token...');
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          console.log('[VerifyEmail] ✅ Email verified successfully');
          setState('success');
          setMessage(data.message || 'Email verified successfully!');
          setUserEmail(data.email || '');

          setTimeout(() => {
            router.push('/login?verified=true');
          }, 3000);
        } else {
          console.error('[VerifyEmail] ❌ Verification failed:', data.error);

          if (data.error?.includes('expired')) {
            setState('expired');
            setMessage('This verification link has expired. Please sign up again to receive a new link.');
          } else if (data.error?.includes('already been used')) {
            setState('used');
            setMessage('This verification link has already been used. You can now sign in with your account.');
          } else {
            setState('error');
            setMessage(data.error || 'Failed to verify email. Please try again.');
          }
        }
      } catch (error) {
        console.error('[VerifyEmail] ❌ Fatal error:', error);
        setState('error');
        setMessage('An unexpected error occurred. Please try again later.');
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900">
        <Image
          src="/london_hero_05.jpg"
          alt="Family enjoying a meal together"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Welcome to Nugget
          </h1>
          <p className="text-lg text-slate-200">
            Your journey to discovering family-friendly restaurants starts here
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Image
              src="https://cdn.prod.website-files.com/65c4e3031d72984c18dbb698/65e621c26e369137d198cadf_Black%20logo%20-%20no%20background-p-500.png"
              alt="Nugget Logo"
              width={120}
              height={64}
              className="h-14 w-auto mb-6"
            />
          </div>

          {state === 'verifying' && (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <Loader2 className="w-8 h-8 text-slate-600 animate-spin" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Verifying your email</h2>
              <p className="text-slate-600">Please wait while we confirm your email address...</p>
            </div>
          )}

          {state === 'success' && (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Email verified!</h2>
              <p className="text-slate-600 mb-4">{message}</p>
              {userEmail && (
                <p className="text-sm text-slate-500 mb-6">
                  Account verified: <span className="font-semibold text-slate-700">{userEmail}</span>
                </p>
              )}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  Redirecting you to sign in page...
                </p>
              </div>
              <Link href="/login" className="w-full block">
                <Button className="w-full h-11 bg-slate-900 hover:bg-slate-800">
                  Sign In Now
                </Button>
              </Link>
            </div>
          )}

          {state === 'expired' && (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Link Expired</h2>
              <p className="text-slate-600 mb-6">{message}</p>
              <div className="flex flex-col gap-3">
                <Link href="/signup" className="w-full">
                  <Button className="w-full h-11 bg-slate-900 hover:bg-slate-800">
                    Sign Up Again
                  </Button>
                </Link>
                <Link href="/login" className="w-full">
                  <Button variant="outline" className="w-full h-11 border-slate-300">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {state === 'used' && (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-8 h-8 text-slate-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Already Verified</h2>
              <p className="text-slate-600 mb-6">{message}</p>
              <Link href="/login" className="w-full block">
                <Button className="w-full h-11 bg-slate-900 hover:bg-slate-800">
                  Sign In
                </Button>
              </Link>
            </div>
          )}

          {state === 'error' && (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Verification Failed</h2>
              <p className="text-slate-600 mb-6">{message}</p>
              <div className="flex flex-col gap-3">
                <Link href="/signup" className="w-full">
                  <Button className="w-full h-11 bg-slate-900 hover:bg-slate-800">
                    Sign Up Again
                  </Button>
                </Link>
                <Link href="/login" className="w-full">
                  <Button variant="outline" className="w-full h-11 border-slate-300">
                    Try Signing In
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-slate-500 mt-8">
            Need help?{' '}
            <Link href="/contact" className="text-slate-900 font-semibold hover:underline">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
