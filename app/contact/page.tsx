'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, MapPin, Users, Heart, Home, Globe, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { MarketingHeader } from '@/components/MarketingHeader';
import { SkipNav } from '@/components/SkipNav';

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 255;
const MAX_PHONE_LENGTH = 20;
const MAX_SUBJECT_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 5000;
const MIN_FORM_TIME = 3000;

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    website: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isVerified, setIsVerified] = useState(false);
  const formLoadTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    formLoadTimeRef.current = Date.now();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    if (!isVerified) {
      setSubmitStatus('error');
      setErrorMessage('Please confirm you are not a robot.');
      setIsSubmitting(false);
      return;
    }

    const timeOnForm = Date.now() - formLoadTimeRef.current;

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          honeypot: formData.website,
          verified: isVerified,
          timeOnForm: timeOnForm
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '', website: '' });
        setIsVerified(false);
        formLoadTimeRef.current = Date.now();
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else if (response.status === 429) {
        setSubmitStatus('error');
        setErrorMessage('Too many submissions. Please try again later.');
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SkipNav />
      <MarketingHeader />
      <main id="main-content" className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">Contact Us</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Have questions or feedback? We'd love to hear from you.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 md:p-12 mb-12">
          <p className="text-lg text-slate-700 mb-8 leading-relaxed">
            The Nugget App is all about helping families enjoy life together, and we'd love for you to be part of the mission.
          </p>
          <p className="text-lg font-semibold text-slate-900 mb-6">Here's how:</p>

          <div className="space-y-6">
            <div className="flex gap-4">
              <MapPin className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" aria-hidden="true" />
              <div>
                <p className="text-slate-800 font-medium mb-1">
                  <span className="font-semibold">Become a Local Hero</span> - Be your city's ambassador, connecting families, restaurants, and our platform. Pitch us your city!
                </p>
                <p className="text-sm text-slate-600 italic">*This is a commission-based role.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Users className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" aria-hidden="true" />
              <div>
                <p className="text-slate-800 font-medium mb-1">
                  <span className="font-semibold">Join our Restaurant Advisory Group</span> - Guide how The Nugget supports restaurants and families alike.
                </p>
                <p className="text-sm text-slate-600 italic">*4-6 hours/month with equity.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Heart className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" aria-hidden="true" />
              <div>
                <p className="text-slate-800 font-medium mb-1">
                  <span className="font-semibold">Join as a Parent Advisor</span> - Share your family's lived experiences so we can build The Nugget to work for all families.
                </p>
                <p className="text-sm text-slate-600 italic">*This is a voluntary role with perks.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Home className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" aria-hidden="true" />
              <div>
                <p className="text-slate-800 font-medium">
                  <span className="font-semibold">Add a Favorite Restaurant</span> - Help other families discover welcoming places.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Globe className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" aria-hidden="true" />
              <div>
                <p className="text-slate-800 font-medium">
                  <span className="font-semibold">Request Your City</span> - Want The Nugget where you live? Let us know.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Lightbulb className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" aria-hidden="true" />
              <div>
                <p className="text-slate-800 font-medium">
                  <span className="font-semibold">Share Ideas & Feedback</span> - Big or small, your input makes The Nugget stronger.
                </p>
              </div>
            </div>
          </div>

          <p className="text-lg font-semibold text-slate-900 mt-8">
            Tell us how you'd like to get involved.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 md:p-12">
          <h2 className="text-3xl font-semibold text-slate-900 mb-6">Send us a Message</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name" className="text-slate-700 mb-2">Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  maxLength={MAX_NAME_LENGTH}
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-slate-700 mb-2">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  maxLength={MAX_EMAIL_LENGTH}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="phone" className="text-slate-700 mb-2">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  maxLength={MAX_PHONE_LENGTH}
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Your phone number"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="subject" className="text-slate-700 mb-2">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  maxLength={MAX_SUBJECT_LENGTH}
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What is this about?"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="message" className="text-slate-700 mb-2">Message</Label>
              <Textarea
                id="message"
                name="message"
                required
                maxLength={MAX_MESSAGE_LENGTH}
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us more..."
                rows={6}
                className="mt-1 resize-none"
              />
            </div>

            <div className="absolute left-[-9999px]" aria-hidden="true">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={formData.website}
                onChange={handleChange}
                placeholder="Leave this blank"
              />
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="robot-check"
                checked={isVerified}
                onCheckedChange={(checked) => setIsVerified(checked as boolean)}
                required
                className="mt-1"
              />
              <div className="space-y-1">
                <Label
                  htmlFor="robot-check"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  I'm not a robot
                </Label>
                <p className="text-xs text-slate-500">
                  Please confirm to help us prevent spam
                </p>
              </div>
            </div>

            {submitStatus === 'success' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">Thank you for your message! We'll get back to you soon.</p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium">
                  {errorMessage || 'Something went wrong. Please try again.'}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto"
            >
              {isSubmitting ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
