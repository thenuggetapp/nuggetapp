'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';
import { Loader2, CheckCircle, AlertCircle, Eye, EyeOff, Lock } from 'lucide-react';
import Image from 'next/image';

type PageState = 'loading' | 'ready' | 'success' | 'error' | 'expired';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageState, setPageState] = useState<PageState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const tokenParam = searchParams.get('token');

        console.log('[ResetPassword] Verifying token...');

        if (!tokenParam) {
          console.log('[ResetPassword] No token found in URL');
          setPageState('error');
          setErrorMessage('Invalid password reset link. Please request a new one from the login page.');
          return;
        }

        setToken(tokenParam);

        const response = await fetch(`/api/auth/reset-password?token=${tokenParam}`);
        const data = await response.json();

        console.log('[ResetPassword] Token verification result:', data);

        if (!response.ok || !data.valid) {
          if (data.error?.includes('expired')) {
            setPageState('expired');
            setErrorMessage(data.error || 'This password reset link has expired. Please request a new one.');
          } else if (data.error?.includes('already been used')) {
            setPageState('expired');
            setErrorMessage('This password reset link has already been used. Please request a new one if needed.');
          } else {
            setPageState('error');
            setErrorMessage(data.error || 'Invalid password reset link. Please request a new one.');
          }
          return;
        }

        setUserEmail(data.email || '');
        setPageState('ready');
        console.log('[ResetPassword] Token verified successfully');
      } catch (error) {
        console.error('[ResetPassword] Error verifying token:', error);
        setPageState('error');
        setErrorMessage('An error occurred while verifying your reset link. Please try again.');
      }
    };

    verifyToken();
  }, [searchParams]);

  const validatePassword = (pass: string): string | null => {
    if (pass.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(pass)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(pass)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(pass)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validatePassword(password);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!token) {
      toast.error('Invalid reset token');
      return;
    }

    setLoading(true);

    try {
      console.log('[ResetPassword] Updating password...');

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error('[ResetPassword] Password update failed:', data.error);
        toast.error(data.error || 'Failed to update password');
        setLoading(false);
        return;
      }

      console.log('[ResetPassword] Password updated successfully');
      setPageState('success');
      toast.success('Password updated successfully!');

      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error) {
      console.error('[ResetPassword] Error:', error);
      toast.error('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (pageState) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-slate-400 mb-4" />
            <p className="text-slate-600">Verifying your reset link...</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Password Updated!</h2>
            <p className="text-slate-600 mb-6">
              Your password has been successfully updated. You will be redirected to the login page shortly.
            </p>
            <Link href="/login">
              <Button className="bg-slate-900 hover:bg-slate-800">
                Go to Login
              </Button>
            </Link>
          </div>
        );

      case 'expired':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Link Expired</h2>
            <p className="text-slate-600 mb-6">
              {errorMessage || 'This password reset link has expired. Please request a new one.'}
            </p>
            <Link href="/login">
              <Button className="bg-slate-900 hover:bg-slate-800">
                Back to Login
              </Button>
            </Link>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Something Went Wrong</h2>
            <p className="text-slate-600 mb-6">
              {errorMessage || 'We could not process your password reset request. Please try again.'}
            </p>
            <Link href="/login">
              <Button className="bg-slate-900 hover:bg-slate-800">
                Back to Login
              </Button>
            </Link>
          </div>
        );

      case 'ready':
        return (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Set New Password</h2>
              <p className="text-slate-600">
                {userEmail ? `Enter a new password for ${userEmail}` : 'Please enter your new password below.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11 pl-10 pr-10"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  Must be at least 8 characters with uppercase, lowercase, and a number
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11 pl-10 pr-10"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500">Passwords do not match</p>
                )}
                {confirmPassword && password === confirmPassword && password.length >= 8 && (
                  <p className="text-xs text-green-600">Passwords match</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-slate-900 hover:bg-slate-800"
                disabled={loading || password !== confirmPassword || password.length < 8}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
              >
                Back to Login
              </Link>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex">
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
            Reset Your Password
          </h1>
          <p className="text-lg text-slate-200 drop-shadow-lg">
            Create a new secure password for your account
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

          {renderContent()}
        </div>
      </div>
    </div>
  );
}
