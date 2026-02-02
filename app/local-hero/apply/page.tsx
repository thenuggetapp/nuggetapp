'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase/client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { MarketingHeader } from '@/components/MarketingHeader';
import Script from 'next/script';
import { toast } from 'sonner';

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export default function LocalHeroApplyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    cityPreference: '',
    motivation: '',
    experience: '',
  });

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
    setError('');
    setLoading(true);

    console.log('[Local Hero Application] Form data:', formData);
    console.log('[Local Hero Application] reCAPTCHA token:', recaptchaToken);

    if (!recaptchaToken) {
      const errorMsg = 'Please complete the reCAPTCHA verification';
      toast.error(errorMsg);
      setError(errorMsg);
      setLoading(false);
      return;
    }

    try {
      if (!formData.email || !formData.fullName) {
        const errorMsg = 'Please provide your name and email address';
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      const applicationData: any = {
        city_preference: formData.cityPreference,
        motivation: formData.motivation,
        experience: formData.experience || null,
        email: formData.email,
        full_name: formData.fullName,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      };

      if (user) {
        applicationData.user_id = user.id;
      }

      console.log('[Local Hero Application] Submitting data:', applicationData);

      const { data, error: insertError } = await supabase
        .from('local_hero_applications')
        .insert(applicationData)
        .select();

      if (insertError) {
        console.error('[Local Hero Application] Insert error:', insertError);
        throw insertError;
      }

      console.log('[Local Hero Application] Success! Inserted data:', data);
      toast.success('Application submitted successfully!');
      setSuccess(true);
    } catch (err: any) {
      console.error('[Local Hero Application] Error submitting application:', err);
      let errorMessage = 'Failed to submit application. Please try again.';

      if (err.code === '23505') {
        errorMessage = 'You have already submitted an application. Please wait for review.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    console.log(`[Local Hero Application] Field changed: ${name} = ${value}`);
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  if (success) {
    return (
      <>
        <Script
          src="https://www.google.com/recaptcha/enterprise.js"
          strategy="lazyOnload"
          onLoad={() => setRecaptchaLoaded(true)}
        />
        <MarketingHeader />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-3xl text-center">
              Application Submitted!
            </CardTitle>
            <CardDescription className="text-center text-lg">
              Thank you for your interest in becoming a Local Hero
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <p className="text-lg text-gray-700 mb-4">
                Your application has been received and is under review. Our team will contact you within 3-5 business days.
              </p>
              <p className="text-sm text-gray-600">
                Check your email for updates on your application status.
              </p>
            </div>
            <Link href="/">
              <Button className="w-full bg-[#8dbf65] hover:bg-[#7aaa56]">
                Return to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      </>
    );
  }

  return (
    <>
      <Script
        src="https://www.google.com/recaptcha/enterprise.js"
        strategy="lazyOnload"
        onLoad={() => setRecaptchaLoaded(true)}
      />
      <MarketingHeader />
      <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Link href="/local-hero" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Local Hero Info
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Apply to Become a Local Hero</CardTitle>
            <CardDescription className="text-lg">
              Tell us about yourself and why you'd be a great Local Hero for your city
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <p className="text-sm text-gray-600">
                  We'll use this to contact you about your application
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cityPreference">Which city do you want to be a Local Hero for?</Label>
                <Input
                  id="cityPreference"
                  name="cityPreference"
                  placeholder="e.g. New York, Helsinki, Manchester"
                  value={formData.cityPreference}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivation">Why do you want to be a Local Hero?</Label>
                <Textarea
                  id="motivation"
                  name="motivation"
                  placeholder="Tell us what drives your passion for local restaurants and community building"
                  value={formData.motivation}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Share your knowledge about local restaurants, food blogs, or dining experiences)</Label>
                <Textarea
                  id="experience"
                  name="experience"
                  placeholder="Tell us about your experience with restaurants in your city..."
                  value={formData.experience}
                  onChange={handleChange}
                  rows={5}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label>Verify you're human *</Label>
                <div className="flex justify-center py-2">
                  <div
                    className="g-recaptcha"
                    data-sitekey="6LcdTFAsAAAAAMbTCaVh5Zrk4IWMhNW7wQWTK9hK"
                    data-action="LOCAL_HERO_APPLICATION"
                    data-callback="onRecaptchaSuccess"
                    data-expired-callback="onRecaptchaExpired"
                    data-error-callback="onRecaptchaError"
                  ></div>
                </div>
                {!recaptchaToken && (
                  <p className="text-sm text-gray-600">
                    Please complete the reCAPTCHA verification above to submit your application
                  </p>
                )}
                {recaptchaToken && (
                  <p className="text-sm text-green-600">
                    ✓ Verification complete
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading || !recaptchaToken}
                className="w-full bg-[#8dbf65] hover:bg-[#7aaa56] text-white py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : !recaptchaToken ? 'Complete reCAPTCHA to Submit' : 'Submit Application'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
