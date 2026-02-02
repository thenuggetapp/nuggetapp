'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { User, Lock, Bell, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function SettingsPage() {
  const { userProfile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: userProfile?.full_name || '',
    email: userProfile?.email || '',
  });
  const [notifications, setNotifications] = useState({
    coupon_redemptions: true,
    payment_reminders: true,
    weekly_summary: true,
    marketing_tips: false,
  });

  const handleSaveProfile = async () => {
    if (!userProfile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ full_name: formData.full_name })
        .eq('id', userProfile.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });

      refreshProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-2">Manage your account preferences and settings</p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-slate-50"
                />
                <p className="text-xs text-slate-500">Email cannot be changed</p>
              </div>

              <Button
                className="bg-[#8dbf65] hover:bg-[#7aaa56]"
                onClick={handleSaveProfile}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose what updates you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="coupon_redemptions" className="cursor-pointer font-medium">
                    Coupon Redemptions
                  </Label>
                  <p className="text-sm text-slate-600 mt-1">
                    Get notified when customers use your coupons
                  </p>
                </div>
                <Switch
                  id="coupon_redemptions"
                  checked={notifications.coupon_redemptions}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, coupon_redemptions: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="payment_reminders" className="cursor-pointer font-medium">
                    Payment Reminders
                  </Label>
                  <p className="text-sm text-slate-600 mt-1">
                    Receive reminders about upcoming payments
                  </p>
                </div>
                <Switch
                  id="payment_reminders"
                  checked={notifications.payment_reminders}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, payment_reminders: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="weekly_summary" className="cursor-pointer font-medium">
                    Weekly Summary
                  </Label>
                  <p className="text-sm text-slate-600 mt-1">
                    Get a weekly overview of your restaurant performance
                  </p>
                </div>
                <Switch
                  id="weekly_summary"
                  checked={notifications.weekly_summary}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, weekly_summary: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="marketing_tips" className="cursor-pointer font-medium">
                    Marketing Tips
                  </Label>
                  <p className="text-sm text-slate-600 mt-1">
                    Receive tips and best practices for growing your business
                  </p>
                </div>
                <Switch
                  id="marketing_tips"
                  checked={notifications.marketing_tips}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, marketing_tips: checked })
                  }
                />
              </div>

              <Button className="bg-[#8dbf65] hover:bg-[#7aaa56]">
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage your password and account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Password</Label>
                <p className="text-sm text-slate-600">
                  To change your password, use the password reset option on the login page
                </p>
                <Button variant="outline">Reset Password</Button>
              </div>

              <div className="pt-6 border-t border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">Delete Account</h4>
                <p className="text-sm text-slate-600 mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account,
                        all your restaurants, coupons, and analytics data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
