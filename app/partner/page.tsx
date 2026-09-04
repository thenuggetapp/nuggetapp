'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/Header';
import {
  Users,
  TrendingUp,
  Camera,
  BarChart3,
  Target,
  CheckCircle2,
  ArrowRight,
  Star,
  Heart,
  FileText
} from 'lucide-react';

export default function RestaurantPartnerPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="relative min-h-[400px] md:min-h-[500px] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/resturant_partner copy.jpg"
            alt="Restaurant owner managing operations"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10">
          <Header />
        </div>

        <div className="relative z-20 container mx-auto px-4 pt-8 md:pt-16 pb-16 md:pb-24">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-[2.25rem] sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extralight font-serif text-white mb-6 leading-[0.924] sm:leading-tight drop-shadow-lg">
              Open your place to local families – all in under 5 mins.
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white mb-8 leading-relaxed drop-shadow-md">
              Free listing. No contract needed. Show customers you're truly family-friendly, baby to grandparent.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-[#8dbf65] hover:bg-[#7aaa56] h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg">
                  Create Free Account
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Link href="/login?redirect=/owner/dashboard" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg border-slate-300">
                  Sign In
                </Button>
              </Link>
            </div>
            <div className="mt-6 md:mt-8 flex flex-wrap items-center justify-center gap-4 md:gap-8 text-xs sm:text-sm text-white">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-white" />
                <span>Featured listings</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-white" />
                <span>Quick setup</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-white" />
                <span>Local roots, growing reach</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-slate-900 mb-4">
               Why restaurants love Nugget
            </h2>
            <p className="text-center text-slate-600 text-base sm:text-lg mb-8 md:mb-12 max-w-3xl mx-auto">
             Local families are already looking for spots like yours. Nugget puts you in front of them.</p>

            


            <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
              <Card className="bg-[#1e2738] border-slate-700">
                <CardContent className="pt-8 text-center">
                  <div className="w-16 h-16 bg-[#8dbf65] rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-white/90 text-base leading-relaxed">
                    A free listing that shows off what makes you family-friendly
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#1e2738] border-slate-700">
                <CardContent className="pt-8 text-center">
                  <div className="w-16 h-16 bg-[#8dbf65] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-white/90 text-base leading-relaxed">
                    Local families and parent groups already searching here
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#1e2738] border-slate-700">
                <CardContent className="pt-8 text-center">
                  <div className="w-16 h-16 bg-[#8dbf65] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-white/90 text-base leading-relaxed">
                    A way for parents to feel welcome before they even walk in
                  </p>
                </CardContent>
              </Card>
            </div>

            <p className="text-center text-base sm:text-lg text-white/80 max-w-3xl mx-auto">
              No heavy tracking, no sales pitch — just a simple way to connect with families nearby.
            </p>
          </div>
        </div>
      </section>

      <section className="relative min-h-[320px] md:min-h-[420px] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/partner-family-dinner.jpg"
            alt="A family enjoying a meal together at a family-friendly restaurant"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-white drop-shadow-lg">
              No long talks. No long contracts. The fastest way to reach families nearby.
            </h2>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-[#8dbf65]/10 rounded-xl flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-[#8dbf65]" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    Be seen by the right people
                  </h3>
                  <p className="text-slate-600">
                    Local families and parent groups are already searching for kid-friendly spots like yours.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-[#8dbf65]/10 rounded-xl flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-[#8dbf65]" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    Share what makes you family-friendly
                  </h3>
                  <p className="text-slate-600">
                    High chairs, kids' menu, crayons, outdoor space, a calm vibe — tell parents what you've got.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-[#8dbf65]/10 rounded-xl flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-[#8dbf65]" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    Grow at your own pace
                  </h3>
                  <p className="text-slate-600">
                    Start with a free account, no credit card needed. Upgrade later for extras like featured listings or hosted events.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#151c2d] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Star className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-4 text-[#8dbf65]" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Get Started Today
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-8 text-white/90">
              Free, easy, and ready in under 5 minutes.
            </p>
            <div className="flex justify-center">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-[#8dbf65] text-white hover:bg-[#7aaa56] h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg">
                  Join Nugget today
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-slate-900 mb-8 md:mb-12">
              Let’s offer families more than just a meal
            </h2>

            <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#8dbf65] rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Share everything you love about your place in a clear and honest way.
                  </h3>

                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#8dbf65] rounded-lg flex items-center justify-center">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Let families know that they’re welcome.
                  </h3>

                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#8dbf65] rounded-lg flex items-center justify-center">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Add photos to bring your place to life - vibe, space, staff.
                  </h3>

                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#8dbf65] rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Turn new visitors into regulars
                  </h3>

                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-slate-900 mb-8 md:mb-12">
              What families are saying
            </h2>

            <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="pt-6">
                  <p className="text-slate-600 text-base leading-relaxed mb-4">
                    “Thanks to The Nugget I know that my 2 kids will have what they need, so we can all actually enjoy a meal together.”
                  </p>
                  <p className="text-slate-900 font-semibold">
                    Jenny, mom of 2
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardContent className="pt-6">
                  <p className="text-slate-600 text-base leading-relaxed mb-4">
                    “Finally a place where I can quickly find a restaurant with a kids' menu or a playground nearby. Such a lifesaver with two young kids!”
                  </p>
                  <p className="text-slate-900 font-semibold">
                    Brian, dad of 2
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
