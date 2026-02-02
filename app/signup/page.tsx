'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Link from 'next/link';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Script from 'next/script';
import { supabase } from '@/lib/supabase/client';

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showConfirmationSent, setShowConfirmationSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const { signUp, signInWithGoogle, userProfile, user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Use ref to track if signup is in progress - prevents redirect race condition
  const signupInProgressRef = useRef(false);

  // Redirect if already logged in (but NOT if showing verification screen or signup in progress)
  useEffect(() => {
    // If signup is in progress, don't redirect - wait for it to complete
    if (signupInProgressRef.current) {
      console.log('[Signup] ⏳ Signup in progress - blocking redirect');
      return;
    }

    // If we're showing the verification screen, don't redirect no matter what
    if (showConfirmationSent) {
      console.log('[Signup] ✋ Verification screen is showing - preventing any redirect');
      return;
    }

    console.log('[Signup] Redirect check:', {
      authLoading,
      hasUser: !!user,
      hasProfile: !!userProfile,
      showConfirmationSent,
      signupInProgress: signupInProgressRef.current,
      shouldRedirect: !authLoading && user && userProfile && !showConfirmationSent
    });

    if (!authLoading && user && userProfile) {
      console.log('[Signup] 🔄 User already logged in, redirecting...');
      if (userProfile.role === 'admin') {
        router.push('/admin');
      } else if (userProfile.role === 'owner') {
        router.push('/owner/dashboard');
      } else if (userProfile.role === 'local_hero') {
        router.push('/local-hero');
      } else {
        router.push('/');
      }
    }
  }, [authLoading, user, userProfile, router, showConfirmationSent]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === 'true') {
      toast.success('Email verified! You can now sign in.');
    }
  }, []);

  // Setup reCAPTCHA callback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).onRecaptchaSuccess = (token: string) => {
        setRecaptchaToken(token);
      };

      (window as any).onRecaptchaExpired = () => {
        setRecaptchaToken(null);
        toast.error('reCAPTCHA expired. Please verify again.');
      };

      (window as any).onRecaptchaError = () => {
        setRecaptchaToken(null);
        toast.error('reCAPTCHA error. Please try again.');
      };
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recaptchaToken) {
      toast.error('Please complete the reCAPTCHA verification');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Mark signup as in progress BEFORE starting - this blocks redirect
    signupInProgressRef.current = true;
    console.log('[Signup] 🚦 Signup started - redirect blocked');

    setLoading(true);
    console.log('[Signup] Starting signup process for:', email);

    const { error, data } = await signUp(email, password);

    if (error) {
      console.log('[Signup] Signup error:', error);
      let errorMessage = error.message || 'Failed to sign up';

      if (errorMessage.includes('Password should contain at least one character of each')) {
        errorMessage = 'Password must contain lowercase, uppercase, digit and symbols';
      } else if (errorMessage.toLowerCase().includes('already registered') || errorMessage.toLowerCase().includes('already been registered')) {
        errorMessage = 'This email is already registered. Please sign in instead.';
      }

      toast.error(errorMessage);
      setLoading(false);
      signupInProgressRef.current = false;
      console.log('[Signup] 🚦 Signup failed - redirect unblocked');
      return;
    }

    // Check if email already exists (Supabase returns user with empty identities for existing emails)
    if (data?.user && (!data.user.identities || data.user.identities.length === 0)) {
      toast.error('This email is already registered. Please sign in instead.');
      setLoading(false);
      signupInProgressRef.current = false;
      console.log('[Signup] 🚦 Signup failed (duplicate) - redirect unblocked');
      router.push('/login');
      return;
    }

    console.log('[Signup] Signup successful, checking for session...');
    console.log('[Signup] Has session:', !!data?.session);
    console.log('[Signup] Has user:', !!data?.user);

    // Show the verification screen immediately
    console.log('[Signup] 📧 Showing verification screen for:', email);
    setRegisteredEmail(email);
    setShowConfirmationSent(true);
    setLoading(false);

    // IMPORTANT: Keep signup in progress flag true - verification screen should stay visible
    // Don't set signupInProgressRef.current = false here - the verification screen needs it
    console.log('[Signup] ✅ State updated - verification screen should be visible');
    console.log('[Signup] 🚦 Keeping redirect blocked while verification screen is shown');
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();

    if (error) {
      toast.error(error.message || 'Failed to sign up with Google');
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://www.google.com/recaptcha/enterprise.js"
        strategy="lazyOnload"
        onLoad={() => setRecaptchaLoaded(true)}
      />
      <div className="min-h-screen flex">
        {/* Left side - Image Section */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900">
        <Image
          src="/london_hero_05.jpg"
          alt="Father and child enjoying a meal together"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Join Nugget - where great restaurants meet happy families
          </h1>
          <p className="text-lg text-slate-200">
            Save your favorites and discover new family-friendly restaurants
          </p>
        </div>
      </div>

      {/* Right side - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {showConfirmationSent ? (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Check your email</h2>
              <p className="text-slate-600 mb-2">
                We sent a verification link to:
              </p>
              <p className="font-semibold text-slate-900 mb-6">{registeredEmail}</p>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-slate-900 mb-2">Next steps:</h3>
                <ol className="text-sm text-slate-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Open the email from updates@thenugget.app</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Click the verification link</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Start discovering family-friendly restaurants</span>
                  </li>
                </ol>
              </div>

              <p className="text-sm text-slate-500 mb-4">
                Didn't receive the email? Check your spam folder or try signing up again.
              </p>

              <div className="flex flex-col gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowConfirmationSent(false);
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className="w-full"
                >
                  Try again with a different email
                </Button>
                <Link href="/login" className="w-full">
                  <Button variant="ghost" className="w-full">
                    Back to sign in
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <Image
                  src="https://cdn.prod.website-files.com/65c4e3031d72984c18dbb698/65e621c26e369137d198cadf_Black%20logo%20-%20no%20background-p-500.png"
                  alt="Nugget Logo"
                  width={120}
                  height={64}
                  className="h-14 w-auto mb-6"
                />
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Create account</h2>
                <p className="text-slate-600">
                  Start discovering family-friendly restaurants today
                </p>
              </div>

              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 border-slate-300 hover:bg-slate-50"
                  onClick={handleGoogleSignUp}
                  disabled={googleLoading || loading}
                >
                  {googleLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing up with Google...
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
                      Sign up with Google
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
                    <Label htmlFor="password" className="text-slate-700 font-medium">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading || googleLoading}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading || googleLoading}
                      className="h-11"
                    />
                  </div>

                  <div className="flex justify-center py-2">
                    <div
                      className="g-recaptcha"
                      data-sitekey="6LcdTFAsAAAAAMbTCaVh5Zrk4IWMhNW7wQWTK9hK"
                      data-action="SIGNUP"
                      data-callback="onRecaptchaSuccess"
                      data-expired-callback="onRecaptchaExpired"
                      data-error-callback="onRecaptchaError"
                    ></div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-slate-900 hover:bg-slate-800"
                    disabled={loading || googleLoading || !recaptchaToken}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create account'
                    )}
                  </Button>
                </form>

                <p className="text-sm text-center text-slate-600 pt-4">
                  Already have an account?{' '}
                  <Link href="/login" className="text-slate-900 font-bold underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
