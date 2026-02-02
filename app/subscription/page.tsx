'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { CheckCircle, XCircle, Crown, AlertCircle, Menu, Bookmark, Store, Settings, User, TrendingUp, Shield } from 'lucide-react';
import { Subscription, SubscriptionFeature } from '@/lib/types/roles';
import { useSubscriptionCheck } from '@/hooks/useSubscriptionCheck';
import { MarketingHeader } from '@/components/MarketingHeader';

export default function SubscriptionPage() {
  const { userProfile, refreshProfile, permissions } = useAuth();
  const { hasCustomerPro, isLoading: subscriptionLoading } = useSubscriptionCheck();
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [features, setFeatures] = useState<SubscriptionFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!userProfile) {
      router.push('/login');
      return;
    }
    loadSubscriptionData();
  }, [userProfile]);

  const loadSubscriptionData = async () => {
    try {
      if (!userProfile) return;

      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('subscription_type', 'customer_subscription')
        .maybeSingle();

      const { data: featuresData } = await supabase
        .from('subscription_features')
        .select('*')
        .eq('subscription_type', 'customer_subscription')
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
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please log in to upgrade');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planType: 'pro',
            subscriptionType: 'customer_subscription'
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create checkout session');
      }

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Error upgrading:', error);
      alert(error instanceof Error ? error.message : 'Failed to start checkout process');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;

    try {
      if (!userProfile) return;

      const { error } = await supabase
        .from('subscriptions')
        .update({ cancel_at_period_end: true })
        .eq('user_id', userProfile.id)
        .eq('subscription_type', 'customer_subscription');

      if (error) throw error;

      await refreshProfile();
      loadSubscriptionData();
    } catch (error) {
      console.error('Error canceling subscription:', error);
    }
  };

  if (!userProfile) return null;

  const currentPlan = subscription?.plan_tier || 'free';
  const isPro = hasCustomerPro;
  const freeFeatures = features.filter(f => f.plan_tier === 'free');
  const proFeatures = features.filter(f => f.plan_tier === 'pro');
  const proOnlyFeatures = proFeatures.filter(pf =>
    !freeFeatures.some(ff => ff.feature_key === pf.feature_key)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {userProfile && <MarketingHeader />}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <img
                  src="https://cdn.prod.website-files.com/65c4e3031d72984c18dbb698/65e621c26e369137d198cadf_Black%20logo%20-%20no%20background-p-500.png"
                  alt="MapSearch"
                  className="h-16 w-auto"
                />
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {userProfile ? (
                  <>
                    {!permissions.canAccessOwnerDashboard && (
                      <Link
                        href="/saved"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Bookmark className="h-5 w-5" />
                        <span className="font-medium">Saved Places</span>
                      </Link>
                    )}

                    {/* <Link
                      href="/subscription"
                      className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Crown className="h-5 w-5" />
                      <span className="font-medium">My Subscription</span>
                    </Link> */}

                    {permissions.canAccessOwnerDashboard && (
                      <>
                        <div className="pt-4 pb-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase">Restaurant Owner</p>
                        </div>
                        <Link
                          href="/owner/dashboard"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Store className="h-5 w-5" />
                          <span className="font-medium">Owner Dashboard</span>
                        </Link>
                        <Link
                          href="/owner/restaurants"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Settings className="h-5 w-5" />
                          <span className="font-medium">Manage Restaurants</span>
                        </Link>
                      </>
                    )}

                    {permissions.canAccessLocalHeroDashboard && (
                      <>
                        <div className="pt-4 pb-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase">Local Hero</p>
                        </div>
                        <Link
                          href="/local-hero/dashboard"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <TrendingUp className="h-5 w-5" />
                          <span className="font-medium">Hero Dashboard</span>
                        </Link>
                      </>
                    )}

                    {permissions.canApplyAsLocalHero && !permissions.canAccessOwnerDashboard && (
                      <Link
                        href="/local-hero/apply"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-5 w-5" />
                        <span className="font-medium">Become a Local Hero</span>
                      </Link>
                    )}

                    {permissions.canAccessAdminPanel && (
                      <>
                        <div className="pt-4 pb-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase">Administration</p>
                        </div>
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Shield className="h-5 w-5" />
                          <span className="font-medium">Admin Dashboard</span>
                        </Link>
                        <Link
                          href="/admin/users"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <User className="h-5 w-5" />
                          <span className="font-medium">Manage Users</span>
                        </Link>
                        <Link
                          href="/admin/local-heroes"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <TrendingUp className="h-5 w-5" />
                          <span className="font-medium">Manage Local Heroes</span>
                        </Link>
                      </>
                    )}

                  </>
                ) : (
                  <>
                    <Link
                      href="/owner/register"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Store className="h-5 w-5" />
                      <span className="font-medium">For Restaurants</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
          className="h-10 w-10 flex-shrink-0"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <Link href="/">
          <img
            src="https://cdn.prod.website-files.com/65c4e3031d72984c18dbb698/65e621c26e369137d198cadf_Black%20logo%20-%20no%20background-p-500.png"
            alt="Nugget"
            className="h-8"
          />
        </Link>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">Choose Your Plan</h1>
        <p className="text-lg text-muted-foreground">
          Unlock premium features and enhance your dining discovery experience
        </p>
      </div>

      {subscription?.cancel_at_period_end && (
        <Alert className="mb-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <Card className={currentPlan === 'free' ? 'border-2 border-slate-300 shadow-lg' : 'hover:shadow-lg transition-shadow'}>
          <CardHeader className="pb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <CardTitle className="text-2xl mb-2">Free Plan</CardTitle>
                <CardDescription className="text-base">Perfect for casual diners</CardDescription>
              </div>
              {currentPlan === 'free' && (
                <Badge variant="default" className="text-sm px-3 py-1">Current Plan</Badge>
              )}
            </div>
            <div className="mt-4">
              <span className="text-5xl font-bold">£0</span>
              <span className="text-lg text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide">What's Included</p>
              <ul className="space-y-3">
                {freeFeatures.map(feature => (
                  <li key={feature.id} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium">{feature.description}</span>
                      {feature.feature_limit && (
                        <span className="text-xs text-muted-foreground ml-2">
                          (Limit: {feature.feature_limit})
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {proOnlyFeatures.length > 0 && (
              <div className="pt-4 border-t space-y-3">
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Pro Features</p>
                <ul className="space-y-3">
                  {proOnlyFeatures.slice(0, 4).map(feature => (
                    <li key={feature.id} className="flex items-start gap-3 opacity-50">
                      <XCircle className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-500 line-through">{feature.description}</span>
                    </li>
                  ))}
                  {proOnlyFeatures.length > 4 && (
                    <li className="text-sm text-slate-500 ml-8">
                      + {proOnlyFeatures.length - 4} more premium features
                    </li>
                  )}
                </ul>
              </div>
            )}

            {currentPlan !== 'free' && (
              <div className="pt-4">
                <Button variant="outline" className="w-full" disabled>
                  Current Plan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={isPro ? 'border-2 shadow-2xl relative overflow-hidden' : 'hover:shadow-xl transition-shadow border-2'} style={{ borderColor: '#98be70' }}>
          {!isPro && (
            <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-4 py-1 text-xs font-bold uppercase">
              Most Popular
            </div>
          )}
          <CardHeader className="pb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <CardTitle className="text-2xl mb-2 flex items-center gap-2">
                  <Crown className="h-6 w-6 text-yellow-500" />
                  Pro Plan
                </CardTitle>
                <CardDescription className="text-base">Unlock the full experience</CardDescription>
              </div>
              {isPro && (
                <Badge className="bg-yellow-500 hover:bg-yellow-600 text-sm px-3 py-1">Current Plan</Badge>
              )}
            </div>
            <div className="mt-4">
              <span className="text-5xl font-bold">£4.99</span>
              <span className="text-lg text-muted-foreground">/month</span>
            </div>
            {!isPro && (
              <p className="text-sm text-green-600 font-medium mt-2">
                Save time and discover hidden gems!
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Everything in Free, Plus:</p>
              <ul className="space-y-3">
                {proOnlyFeatures.map(feature => (
                  <li key={feature.id} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: '#98be70' }} />
                    <div>
                      <span className="text-sm font-medium">{feature.description}</span>
                      {feature.feature_limit && (
                        <span className="text-xs text-muted-foreground ml-2">
                          (Limit: {feature.feature_limit})
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6">
              {!isPro ? (
                <Button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="w-full text-white font-semibold text-lg py-6"
                  style={{ backgroundColor: '#98be70' }}
                >
                  {loading ? 'Loading...' : 'Upgrade to Pro'}
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
            </div>
          </CardContent>
        </Card>
      </div>

      {subscription && isPro && (
        <Card>
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge>{subscription.status}</Badge>
              </div>
              {subscription.current_period_start && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current period started</span>
                  <span>{new Date(subscription.current_period_start).toLocaleDateString()}</span>
                </div>
              )}
              {subscription.current_period_end && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next billing date</span>
                  <span>{new Date(subscription.current_period_end).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
