'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Check,
  Crown,
  TrendingUp,
  Zap,
  Camera,
  BarChart3,
  Ticket,
  Star,
  Users,
} from 'lucide-react';

export default function MarketingPage() {
  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <div className="text-center space-y-4">
        <Badge className="bg-[#8dbf65] hover:bg-[#8dbf65]">Pricing</Badge>
        <h1 className="text-4xl font-bold text-slate-900">Upgrade to Pro</h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Unlock powerful tools to grow your restaurant business and reach more families
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="relative border-2 border-slate-200">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-2xl">Free Plan</CardTitle>
            <div className="mt-4">
              <span className="text-5xl font-bold">£0</span>
              <span className="text-slate-600 ml-2">forever</span>
            </div>
            <CardDescription className="mt-2">Perfect for getting started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">Basic restaurant listing</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">Up to 5 restaurant photos</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">Standard search placement</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">Basic analytics</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">Email support</span>
              </div>
            </div>

            <Button variant="outline" className="w-full" size="lg" disabled>
              Current Plan
            </Button>
          </CardContent>
        </Card>

        <Card className="relative border-2 border-[#8dbf65] shadow-xl">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-[#8dbf65] hover:bg-[#8dbf65] px-4 py-1">
              <Crown className="h-3 w-3 mr-1" />
              Most Popular
            </Badge>
          </div>
          <CardHeader className="text-center pb-8 bg-gradient-to-br from-[#8dbf65]/5 to-transparent">
            <CardTitle className="text-2xl">Pro Plan</CardTitle>
            <div className="mt-4">
              <span className="text-5xl font-bold">£29</span>
              <span className="text-slate-600 ml-2">/month</span>
            </div>
            <CardDescription className="mt-2">Everything you need to grow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-[#8dbf65] mt-0.5 flex-shrink-0" />
                <span className="text-slate-700 font-medium">Everything in Free, plus:</span>
              </div>
              <div className="flex items-start gap-3">
                <Camera className="h-5 w-5 text-[#8dbf65] mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">Unlimited restaurant photos</span>
              </div>
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-[#8dbf65] mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">Priority search placement</span>
              </div>
              <div className="flex items-start gap-3">
                <Crown className="h-5 w-5 text-[#8dbf65] mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">Featured restaurant badge</span>
              </div>
              <div className="flex items-start gap-3">
                <Ticket className="h-5 w-5 text-[#8dbf65] mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">Coupon and deals management</span>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-[#8dbf65] mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">Social media integration</span>
              </div>
              <div className="flex items-start gap-3">
                <BarChart3 className="h-5 w-5 text-[#8dbf65] mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">Advanced analytics & insights</span>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-[#8dbf65] mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">Promotional boost campaigns</span>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-[#8dbf65] mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">Priority customer support</span>
              </div>
            </div>

            <Button className="w-full bg-[#8dbf65] hover:bg-[#7aaa56]" size="lg">
              Upgrade to Pro
            </Button>

            <p className="text-xs text-center text-slate-500">
              14-day free trial · Cancel anytime · No credit card required
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#8dbf65] mb-2">3x</div>
              <p className="text-slate-300">More visibility with Pro</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#8dbf65] mb-2">50%</div>
              <p className="text-slate-300">Increase in bookings</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#8dbf65] mb-2">1000+</div>
              <p className="text-slate-300">Restaurants trust us</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Can I cancel anytime?</h4>
            <p className="text-slate-600">
              Yes! You can cancel your subscription at any time. You'll continue to have access
              to Pro features until the end of your billing period.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Do you offer refunds?</h4>
            <p className="text-slate-600">
              We offer a 14-day free trial. If you're not satisfied within the first 14 days,
              we'll provide a full refund, no questions asked.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Can I upgrade from Free to Pro later?</h4>
            <p className="text-slate-600">
              Absolutely! You can upgrade at any time. All your existing data will be preserved,
              and Pro features will be activated immediately.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Is there a setup fee?</h4>
            <p className="text-slate-600">
              No setup fees, no hidden charges. You only pay the monthly subscription fee.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
