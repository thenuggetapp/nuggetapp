'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import {
  TrendingUp,
  MapPin,
  DollarSign,
  Users,
  Award,
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react';
import Link from 'next/link';

export default function LocalHeroLandingPage() {
  return (
    <div className="min-h-screen">
      <section className="relative text-white overflow-hidden min-h-[500px] md:min-h-[700px]">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/local_hero_hero.jpg"
            alt="Mother and daughter enjoying time together at a restaurant"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <div className="relative z-10">
          <Header />
        </div>

        <div className="container mx-auto px-4 pt-8 md:pt-16 pb-16 md:pb-24 max-w-6xl relative z-20">
          <div className="text-center mb-8 md:mb-12">
            <Badge className="bg-[#101729] text-white mb-4 px-4 py-1 text-xs sm:text-sm">
              Earn Money Doing What You Love
            </Badge>
            <h1 className="text-[2.8125rem] sm:text-4xl md:text-5xl lg:text-6xl font-extralight font-serif mb-6 leading-[0.924] sm:leading-tight text-white">
              Become a local hero
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white mb-8 max-w-3xl mx-auto">
              Help families discover welcoming restaurants in your city and earn for the impact you create.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/local-hero/apply" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-[#8dbf65] hover:bg-[#7aaa56] text-white px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg">
                Apply now
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 border-0 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <Card className="bg-[#101729] border-[#101729]">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[#8dbf65] rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Bring local knowledge to life </h3>
                <p className="text-white hidden">Get paid from events and partnerships secured</p>
              </CardContent>
            </Card>

            <Card className="bg-[#101729] border-[#101729]">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[#8dbf65] rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Build partnerships</h3>
                <p className="text-white hidden">Curate the best dining experiences in your neighborhood</p>
              </CardContent>
            </Card>

            <Card className="bg-[#101729] border-[#101729]">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[#8dbf65] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Strengthen your community</h3>
                <p className="text-white hidden">Connect food lovers with amazing local restaurants</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">What You’ll Do</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">Be the local face of The Nugget in your city.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Card>
              <CardContent className="p-6 flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-[#8dbf65] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Recommend family-friendly restaurants and help them join The Nugget</h3>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-[#8dbf65] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Verify and improve local data so families can plan with confidence</h3>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-[#8dbf65] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Connect with parents and businesses through events, groups, and partnerships</h3>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-[#8dbf65] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Host simple community moments like family dinner hours</h3>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-[#8dbf65] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Share local insights that help shape the future of The Nugget</h3>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-[#8dbf65] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Play an active role in building The Nugget from the very beginning</h3>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">What You Earn</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">Get rewarded for growing welcoming places.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            <div className="flex items-start gap-4">
              <Star className="h-6 w-6 text-[#8dbf65] flex-shrink-0 mt-1" />
              <div>
                <p className="text-gray-600">100% commission on partnerships and events you secure for your first 6 months
</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Star className="h-6 w-6 text-[#8dbf65] flex-shrink-0 mt-1" />
              <div>
                <p className="text-gray-600">Ongoing commission opportunities based on performance</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Star className="h-6 w-6 text-[#8dbf65] flex-shrink-0 mt-1" />
              <div>
                <p className="text-gray-600">Potential equity for top-performing Local Heroes</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Star className="h-6 w-6 text-[#8dbf65] flex-shrink-0 mt-1" />
              <div>
                <p className="text-gray-600">Lifetime access to The Nugget App</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-12 md:py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">You're Not Doing This Alone</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">Join a growing network across the US, UK, and Europe.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            <div className="flex items-start gap-4">
              <Star className="h-6 w-6 text-[#8dbf65] flex-shrink-0 mt-1" />
              <div>
                <p className="text-gray-600">Monthly check-ins and ongoing support</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Star className="h-6 w-6 text-[#8dbf65] flex-shrink-0 mt-1" />
              <div>
                <p className="text-gray-600">Private Local Hero community (Slack or WhatsApp)</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Star className="h-6 w-6 text-[#8dbf65] flex-shrink-0 mt-1" />
              <div>
                <p className="text-gray-600">Ready-to-use templates, talking points, and resources</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Star className="h-6 w-6 text-[#8dbf65] flex-shrink-0 mt-1" />
              <div>
                <p className="text-gray-600">Early access to new features and tools</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <Award className="h-12 w-12 md:h-16 md:w-16 text-[#8dbf65] mx-auto mb-6" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">Apply to Be a Local Hero</h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8">
           Ready to champion family-friendly restaurants in your city?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/local-hero/apply" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-[#8dbf65] hover:bg-[#7aaa56] text-white px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg">
                Apply to become a Local Hero
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-400">
            Already have an account? <Link href="/login" className="text-[#8dbf65] hover:underline">Sign in</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
