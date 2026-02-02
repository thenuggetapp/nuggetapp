'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, FileText, AlertCircle, Crown, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Subscription, SubscriptionFeature } from '@/lib/types/roles';
import { useSubscriptionCheck } from '@/hooks/useSubscriptionCheck';

export default function BillingPage() {
  const { userProfile, refreshProfile } = useAuth();
  const { hasOwnerPro, isLoading: subscriptionLoading } = useSubscriptionCheck();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [features, setFeatures] = useState<SubscriptionFeature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile) {
      loadSubscriptionData();
    }
  }, [userProfile]);

  const loadSubscriptionData = async () => {
    try {
      if (!userProfile) return;

      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('subscription_type', 'owner_subscription')
        .maybeSingle();

      const { data: featuresData } = await supabase
        .from('subscription_features')
        .select('*')
        .eq('subscription_type', 'owner_subscription')
        .order('plan_tier')
        .order('feature_key');

      setSubscription(subData);
      setFeatures(featuresData || []);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    alert('Stripe integration would be triggered here to upgrade to Owner Pro plan');
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;

    try {
      if (!userProfile) return;

      const { error } = await supabase
        .from('subscriptions')
        .update({ cancel_at_period_end: true })
        .eq('user_id', userProfile.id)
        .eq('subscription_type', 'owner_subscription');

      if (error) throw error;

      await refreshProfile();
      loadSubscriptionData();
    } catch (error) {
      console.error('Error canceling subscription:', error);
    }
  };

  const currentPlan = subscription?.plan_tier || 'free';
  const isPro = hasOwnerPro;
  const freeFeatures = features.filter(f => f.plan_tier === 'free');
  const proFeatures = features.filter(f => f.plan_tier === 'pro');

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Billing & Subscription</h1>
        <p className="text-slate-600 mt-2">Manage your restaurant owner subscription and billing</p>
      </div>

      {subscription?.cancel_at_period_end && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your subscription will be cancelled at the end of the current billing period on{' '}
            {subscription.current_period_end
              ? new Date(subscription.current_period_end).toLocaleDateString()
              : 'the end of the period'}
            .
          </AlertDescription>
        </Alert>
      )}

      {!isPro && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You are currently on the <strong>Free Plan</strong>. Upgrade to Pro to unlock premium features and grow your restaurant visibility.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={currentPlan === 'free' ? 'border-2 border-primary' : ''}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Free Plan</CardTitle>
                <CardDescription>Get started with basics</CardDescription>
              </div>
              {currentPlan === 'free' && (
                <Badge variant="default">Current Plan</Badge>
              )}
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold">£0</span>
              <span className="text-slate-600">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {freeFeatures.map(feature => (
                <li key={feature.id} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature.description}</span>
                </li>
              ))}
              {proFeatures.map(feature => (
                <li key={feature.id} className="flex items-start gap-2 text-slate-400">
                  <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span className="text-sm line-through">{feature.description}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className={isPro ? 'border-2 border-[#8dbf65]' : ''}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-[#8dbf65]" />
                  Pro Plan
                </CardTitle>
                <CardDescription>For serious restaurant owners</CardDescription>
              </div>
              {isPro && (
                <Badge className="bg-[#8dbf65] text-white">Current Plan</Badge>
              )}
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold">£29.99</span>
              <span className="text-slate-600">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              {proFeatures.map(feature => (
                <li key={feature.id} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature.description}</span>
                </li>
              ))}
            </ul>
            {!isPro ? (
              <Button onClick={handleUpgrade} className="w-full bg-[#8dbf65] hover:bg-[#7aaa56]">
                Upgrade to Pro
              </Button>
            ) : (
              <Button
                onClick={handleCancel}
                variant="outline"
                className="w-full"
                disabled={subscription?.cancel_at_period_end}
              >
                {subscription?.cancel_at_period_end ? 'Cancellation Pending' : 'Cancel Subscription'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {subscription && isPro && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-600">Status</span>
                <Badge>{subscription.status}</Badge>
              </div>
              {subscription.current_period_start && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Current period started</span>
                  <span>{new Date(subscription.current_period_start).toLocaleDateString()}</span>
                </div>
              )}
              {subscription.current_period_end && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Next billing date</span>
                  <span>{new Date(subscription.current_period_end).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Manage your payment information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-600">
            <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p>No payment method on file</p>
            <p className="text-sm mt-2">Payment methods are managed through Stripe</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Your past invoices and receipts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-600">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p>No billing history</p>
            <p className="text-sm mt-2">Invoices will appear here after your first payment</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
