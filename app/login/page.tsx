'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Link from 'next/link';
import { Loader2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { requestPasswordReset } from '@/lib/resend-email';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { signIn, signInWithGoogle, userProfile, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const oauthTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const verifiedToastShownRef = useRef(false);

  // Check for redirect parameter and OAuth callback
  useEffect(() => {
    const redirect = searchParams.get('redirect');
    if (redirect) {
      console.log('[Login] Redirect param found:', redirect);
      setRedirectTo(redirect);
    }

    // Check if OAuth callback is happening (code or access_token in URL)
    const code = searchParams.get('code');
    const hasAccessToken = typeof window !== 'undefined' && window.location.hash.includes('access_token');

    if (code || hasAccessToken) {
      console.log('[Login] OAuth callback detected - waiting for Supabase to handle automatically');
      setGoogleLoading(true);

      // Important: DON'T clean up the URL immediately!
      // Supabase needs the code/hash to be present when it initializes
      // It will handle the code exchange automatically via onAuthStateChange

      // We'll clean up the URL after a delay to ensure Supabase processed it
      const cleanupTimer = setTimeout(() => {
        if (typeof window !== 'undefined') {
          console.log('[Login] Cleaning up OAuth params from URL');
          window.history.replaceState(null, '', window.location.pathname + (redirect ? `?redirect=${redirect}` : ''));
        }
      }, 3000); // Wait 3 seconds for Supabase to process

      return () => clearTimeout(cleanupTimer);
    }

    // Check for email verification success
    const verified = searchParams.get('verified');
    if (verified === 'true' && !verifiedToastShownRef.current) {
      console.log('[Login] Email verified successfully');
      toast.success('Email verified! Please sign in to continue.');
      verifiedToastShownRef.current = true;
    }
  }, [searchParams]);

  // Handle redirect after successful authentication
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('[Login] Auth still loading, waiting...');
      return;
    }

    // If we have both user and profile, redirect
    if (user && userProfile) {
      console.log('[Login] User authenticated, redirecting...');
      console.log('[Login] User role:', userProfile.role);

      // Clear any pending timeout
      if (oauthTimeoutRef.current) {
        clearTimeout(oauthTimeoutRef.current);
        oauthTimeoutRef.current = null;
      }

      // Stop the Google loading state
      if (googleLoading) {
        setGoogleLoading(false);
      }

      // Use window.location for redirect to avoid Next.js router issues in iframe
      const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
      
      let targetPath: string;
      if (redirectTo) {
        console.log('[Login] Using redirect param:', redirectTo);
        targetPath = redirectTo;
      } else if (userProfile.role === 'admin') {
        console.log('[Login] Redirecting admin to /admin');
        targetPath = '/admin';
      } else if (userProfile.role === 'owner') {
        console.log('[Login] Redirecting owner to /owner/dashboard');
        targetPath = '/owner/dashboard';
      } else if (userProfile.role === 'local_hero') {
        console.log('[Login] Redirecting local hero to /local-hero/dashboard');
        targetPath = '/local-hero/dashboard';
      } else {
        console.log('[Login] Redirecting user to /');
        targetPath = '/';
      }

      // In iframe mode, use window.location for more reliable redirects
      if (isInIframe) {
        console.log('[Login] 🖼️ Iframe mode - using window.location for redirect');
        window.location.href = targetPath;
      } else {
        router.push(targetPath);
      }
      return;
    }

    // Check if OAuth callback is in progress
    const code = searchParams.get('code');
    const hasAccessToken = typeof window !== 'undefined' && window.location.hash.includes('access_token');
    const isOAuthCallback = code || hasAccessToken;

    if (googleLoading && !authLoading && !user && !isOAuthCallback) {
      // Only show error if:
      // 1. We're in Google loading state
      // 2. Auth is not loading
      // 3. No user exists
      // 4. AND there's no OAuth code in URL (meaning callback already processed)
      
      // Give Supabase more time to process - wait 8 seconds total
      if (!oauthTimeoutRef.current) {
        console.log('[Login] OAuth callback processed but no user yet - waiting 8 seconds...');
        oauthTimeoutRef.current = setTimeout(() => {
          // Check one more time if user exists
          if (!user && !authLoading) {
            console.error('[Login] OAuth callback completed but no user found after waiting');
            setGoogleLoading(false);
            toast.error('Authentication failed. Please try again.');
          }
          oauthTimeoutRef.current = null;
        }, 8000); // Wait 8 seconds total for Supabase to process
      }
    } else if (googleLoading && isOAuthCallback) {
      // OAuth callback is still in progress - clear any existing timeout
      if (oauthTimeoutRef.current) {
        clearTimeout(oauthTimeoutRef.current);
        oauthTimeoutRef.current = null;
      }
    } else if (user && !userProfile && !authLoading) {
      // We have a user but no profile yet - wait a bit longer
      console.log('[Login] User exists but profile not loaded yet, waiting...');
      // Give it more time - the profile might be loading (increased for iframe/Bolt preview)
      const waitTimer = setTimeout(() => {
        if (!userProfile) {
          console.error('[Login] Profile still not loaded after waiting');
          setGoogleLoading(false);
          // Don't show error if we're in preview mode - just redirect to home
          if (typeof window !== 'undefined' && window.self !== window.top) {
            console.warn('[Login] Running in iframe - redirecting to home despite profile issue');
            router.push('/');
          } else {
            toast.error('Profile loading issue. Please refresh the page.');
          }
        }
      }, 20000); // Increased to 20 seconds for iframe environments

      return () => clearTimeout(waitTimer);
    }

    return () => {
      if (oauthTimeoutRef.current) {
        clearTimeout(oauthTimeoutRef.current);
        oauthTimeoutRef.current = null;
      }
    };
  }, [user, userProfile, authLoading, router, redirectTo, googleLoading, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast.error(error.message || 'Failed to sign in');
      setLoading(false);
    } else {
      toast.success('Successfully signed in!');
      // Auth context will handle the redirect via useEffect above
    }
  };

  const handleGoogleSignIn = async () => {
    if (googleLoading || loading) {
      console.log('[Login] Authentication already in progress');
      return;
    }

    setGoogleLoading(true);
    console.log('[Login] Starting Google OAuth...');

    const { error } = await signInWithGoogle();

    if (error) {
      console.error('[Login] OAuth error:', error);
      toast.error(error.message || 'Failed to sign in with Google');
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }

    setResetLoading(true);

    const { success, error } = await requestPasswordReset(resetEmail);

    if (success) {
      setResetSent(true);
      toast.success('Password reset email sent! Check your inbox.');
    } else {
      toast.error(error || 'Failed to send reset email');
    }

    setResetLoading(false);
  };

  const openForgotPassword = () => {
    setResetEmail(email);
    setResetSent(false);
    setShowForgotPassword(true);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900">
        <Image
          src="/chicago_hero_07.jpg"
          alt="Family dining together"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
          <h1 className="text-4xl font-bold mb-4 leading-tight drop-shadow-lg">
            Find family-friendly restaurants your kids will love
          </h1>
          <p className="text-lg text-slate-200 drop-shadow-lg">
            Discover the best spots for dining out with children
          </p>
        </div>
      </div>

      {/* Right side - Sign In Form */}
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
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Sign in</h2>
            <p className="text-slate-600">
              Welcome back! Please enter your details.
            </p>
          </div>

          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 border-slate-300 hover:bg-slate-50"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
            >
              {googleLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in with Google...
                </>
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Sign in with Google
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Or</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading || googleLoading}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-700 font-medium">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={openForgotPassword}
                    className="text-sm text-slate-600 hover:text-slate-900 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading || googleLoading}
                  className="h-11"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-slate-900 hover:bg-slate-800"
                disabled={loading || googleLoading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>

            <p className="text-sm text-center text-slate-600 pt-4">
              Don't have an account?{' '}
              <Link href="/signup" className="text-slate-900 font-bold underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>
              {resetSent
                ? "We've sent you an email with a link to reset your password."
                : "Enter your email address and we'll send you a link to reset your password."}
            </DialogDescription>
          </DialogHeader>

          {resetSent ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  Check your inbox for an email from accounts@thenugget.app. Click the link in the email to reset your password.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowForgotPassword(false)}
                  className="w-full"
                >
                  Back to sign in
                </Button>
                <button
                  type="button"
                  onClick={() => setResetSent(false)}
                  className="text-sm text-slate-600 hover:text-slate-900 hover:underline"
                >
                  Didn't receive the email? Try again
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resetEmail">Email address</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  disabled={resetLoading}
                  className="h-11"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForgotPassword(false)}
                  disabled={resetLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 bg-slate-900 hover:bg-slate-800"
                >
                  {resetLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
