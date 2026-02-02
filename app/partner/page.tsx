'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/Header';
import {
  Users,
  TrendingUp,
  Clock,
  Camera,
  BarChart3,
  Gift,
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
              Welcome, Restaurants &amp; Family-Friendly Spots!
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white mb-8 leading-relaxed drop-shadow-md">
              Showcase your space. Get new customers.
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
                <span>Feature listings</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-white" />
                <span>Performance dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-white" />
                <span>5-Min Setup</span>
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
             We're glad you're here. Nugget is all about connecting great places like yours with families who want to enjoy relaxed, kid-friendly dining experiences — without the stress.</p>

            


            <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
              <Card className="bg-[#1e2738] border-slate-700">
                <CardContent className="pt-8 text-center">
                  <div className="w-16 h-16 bg-[#8dbf65] rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-white/90 text-base leading-relaxed">
                    A simple listing that highlights your family-friendly features
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#1e2738] border-slate-700">
                <CardContent className="pt-8 text-center">
                  <div className="w-16 h-16 bg-[#8dbf65] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-white/90 text-base leading-relaxed">
                    A platform families already use to find great places to eat together
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#1e2738] border-slate-700">
                <CardContent className="pt-8 text-center">
                  <div className="w-16 h-16 bg-[#8dbf65] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-white/90 text-base leading-relaxed">
                    Stories and community engagement that help parents feel confident choosing your venue
                  </p>
                </CardContent>
              </Card>
            </div>

            <p className="text-center text-base sm:text-lg text-white/80 max-w-3xl mx-auto">
              We're not about heavy tracking or complicated sales language — just helping you connect meaningfully with families in your neighbourhood.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4">
                No pitchy sales talk. No long contracts. Just a simple way to share what makes your place special with parents looking for just what you offer.
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
                    Families don’t want to guess what to expect — they want to find places where everyone feels comfortable, from toddlers to grandparents. Nugget helps you get in front of those families actively searching for kid-friendly spots in your city. 
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
                    Whether you’ve got high chairs, crayons & kids’ menus, outdoor space, or a calm vibe that parents appreciate, you can highlight those features in your listing. Parents want to know what’s there so they can plan great family time out together.
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
                    Getting started is free and only takes a few minutes — no credit card required. You control what you show and update. Upgrade only when you’re ready for extras like more photos or priority placement.

                  </p>

                  Sharing this kind of info helps families trust your place and choose you confidently for meals out — whether that's a casual weeknight dinner or a weekend treat. Kid Friendly Near Me
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-slate-900 mb-8 md:mb-12">
              Families Look for More than Food
            </h2>

            <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#8dbf65] rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Clear, honest details about what to expect
                  </h3>

                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#8dbf65] rounded-lg flex items-center justify-center">
                    <Gift className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                   Visuals that show your space and vibe
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
                    A sense that kids (and parents!) will be welcomed and comfortable
                  </h3>

                </div>
              </div>

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
              It’s easy, quick, and free to join. You set up your listing in minutes, show off what you offer, and start welcoming more families who genuinely value what you do.
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
    </div>
  );
}
