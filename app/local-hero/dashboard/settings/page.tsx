'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { LocalHeroNav } from '@/components/LocalHeroNav';
import { LocalHeroHeader } from '@/components/LocalHeroHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { validateWebsiteUrl } from '@/lib/validate-website-url';

export default function SettingsPage() {
  const { user, userProfile, loading: authLoading, refreshProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    website: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (!authLoading && userProfile && userProfile.role !== 'local_hero') {
      router.push('/');
      return;
    }

    if (user && userProfile?.role === 'local_hero') {
      loadSettings();
    }
  }, [user, userProfile, authLoading, router]);

  const loadSettings = () => {
    setFormData({
      full_name: userProfile?.full_name || '',
      email: user?.email || '',
      website: userProfile?.website || '',
    });
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const websiteValidation = validateWebsiteUrl(formData.website);
      if (!websiteValidation.valid) {
        toast.error(websiteValidation.error || 'Invalid website URL');
        return;
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: formData.full_name,
          website: websiteValidation.sanitized,
        })
        .eq('id', user?.id);

      if (error) throw error;

      setFormData((prev) => ({
        ...prev,
        full_name: formData.full_name,
        website: websiteValidation.sanitized || '',
      }));

      await refreshProfile();
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#8dbf65]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <LocalHeroNav />

      <div className="flex-1 flex flex-col">
        <LocalHeroHeader
          title="Settings"
          description="Manage your account preferences"
        />

        <div className="flex-1 overflow-auto">
          <div className="px-6 py-6">

        <div className="max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">
                  Email cannot be changed. Contact support if you need to update your email.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  placeholder="https://your-website.com"
                />
                <p className="text-xs text-gray-500">
                  Your public website link shown on restaurants you recommend.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#8dbf65] hover:bg-[#7aa856]"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={loadSettings}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
