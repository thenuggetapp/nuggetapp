'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Store, Mail, Lock, User, Building2, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function OwnerRegisterPage() {
  const router = useRouter();
  const { signUpAsOwner, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  useEffect(() => {
    const handleEmailConfirmation = () => {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        toast.success('Email confirmed successfully! Welcome to Nugget!');
        window.history.replaceState(null, '', window.location.pathname);
      }

      const params = new URLSearchParams(window.location.search);
      if (params.get('type') === 'signup' && params.get('token')) {
        toast.success('Email confirmed! You can now sign in.');
      }
    };

    handleEmailConfirmation();
  }, []);

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();

    if (error) {
      toast.error(error.message || 'Failed to sign up with Google');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName || !formData.businessName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!formData.agreeToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);

    try {
      const { error: signUpError } = await signUpAsOwner(
        formData.email,
        formData.password,
        formData.fullName,
        formData.businessName
      );

      if (signUpError) {
        setError(signUpError.message || 'Failed to create account');
        return;
      }

      router.push('/owner/dashboard?welcome=true');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-[#8dbf65] rounded-xl flex items-center justify-center">
              <Store className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">Nugget</span>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mt-4">Become a Restaurant Partner</h1>
          <p className="text-slate-600 mt-2">
            Join thousands of restaurants connecting with families
          </p>
        </div>

        <Card className="shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle>Create Your Owner Account</CardTitle>
            <CardDescription>
              Get started with a free account and list your first restaurant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
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
                    Continue with Google
                  </>
                )}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500">Or continue with email</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Smith"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="pl-10"
                      disabled={loading || googleLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessName">Business/Restaurant Name *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="businessName"
                      type="text"
                      placeholder="My Restaurant"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="pl-10"
                      disabled={loading || googleLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@restaurant.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    disabled={loading || googleLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10"
                      disabled={loading || googleLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="pl-10"
                      disabled={loading || googleLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, agreeToTerms: checked as boolean })
                  }
                  disabled={loading || googleLoading}
                />
                <div className="flex-1">
                  <Label
                    htmlFor="terms"
                    className="text-sm font-normal text-slate-700 cursor-pointer"
                  >
                    I agree to the{' '}
                    <Link href="/terms" className="text-[#8dbf65] hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-[#8dbf65] hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#8dbf65] hover:bg-[#7aaa56] h-12 text-lg"
                disabled={loading || googleLoading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-slate-600">
                Already have an owner account?{' '}
                <Link href="/login" className="text-[#8dbf65] hover:underline font-medium">
                  Sign in
                </Link>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-[#8dbf65]">Free</div>
                    <div className="text-xs text-slate-600">Forever</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#8dbf65]">5</div>
                    <div className="text-xs text-slate-600">Free Photos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#8dbf65]">24/7</div>
                    <div className="text-xs text-slate-600">Support</div>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500 mt-6">
          By creating an account, you acknowledge that Nugget will process your data in accordance
          with our Privacy Policy
        </p>
      </div>
    </div>
  );
}
