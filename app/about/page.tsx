import { MapPin, Heart, Users, Award } from "lucide-react";
import { MarketingHeader } from "@/components/MarketingHeader";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <MarketingHeader />
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            About The Nugget
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Making dining out easier and more fun for families.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-semibold text-slate-900 mb-6">Vision</h2>
          <p className="text-slate-700 leading-relaxed mb-8">
            A world where families can easily enjoy more happy experiences
            together.
          </p>

          <h2 className="text-3xl font-semibold text-slate-900 mb-6">
            Mission
          </h2>
          <p className="text-slate-700 leading-relaxed mb-8">
            Our (first) mission is to make dining out easier and more fun for
            families.
          </p>

          <h2 className="text-3xl font-semibold text-slate-900 mb-6">Values</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Be Kind
              </h3>
              <p className="text-slate-700 leading-relaxed mb-2">
                We want all to feel welcome, no matter their age.
              </p>
              <p className="text-slate-700 leading-relaxed">
                We want our kids to see the best of us and the best of those
                around us, so we choose kindness and remember that we all have
                our off-days.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Be Helpful
              </h3>
              <p className="text-slate-700 leading-relaxed mb-2">
                We contribute reviews to help families find restaurants and to
                help restaurants make easy tweaks to fill more seats with happy
                diners.
              </p>
              <p className="text-slate-700 leading-relaxed">
                We want restaurants to know how much we appreciate their spaces
                so we take care of our mess the best we can.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Be Curious
              </h3>
              <p className="text-slate-700 leading-relaxed mb-2">
                We are eager to explore new food, restaurants, neighbourhoods,
                cities, and countries together.
              </p>
              <p className="text-slate-700 leading-relaxed">
                We value experiences that show our kids the beauty of the
                diverse world around us.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-semibold text-slate-900 mb-6">
            Founder Story
          </h2>

          <div className="float-right ml-6 mb-6 w-72">
            <div className="relative w-full aspect-[3/4]">
              <Image
                src="/faith_and_kids.jpeg"
                alt="Faith Lyons, Founder with her children"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <p className="text-slate-700 leading-relaxed mb-4">
              The cliché is true- I had kids, and everything changed. For 20
              years, I thrived in fast-paced global cities from Guatemala to
              Miami, Philly, Washington DC, Port-au-Prince, Singapore, NYC, and
              London. I managed multi-million dollar humanitarian responses and
              loved navigating the energy of city life. I thrived in chaos and
              problem-solving mode. BUT...then I became a mom.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              Suddenly, even grabbing a coffee became complicated. Is there a
              baby change? Can I bring a stroller? Should I just stay home? My
              husband faced the same frustrations when he could never find a
              baby change in the men's room.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              ➡️ Parenthood can be isolating and overwhelming. And isolated
              families lead to disconnected communities.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              We’re on a mission to change that. We're saving parents time and
              stress by making it easier to know where to go as a family,
              starting with restaurants. AND We're leveraging data for change at
              the main street and city levels.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              💚 The Nugget is a continuation of my life’s work: bringing people
              together to build something better. Because connected families
              create stronger communities.
            </p>
            <p className="text-slate-700 leading-relaxed font-medium">
              -Faith Lyons
              <br />
              Founder and Mom of 2 Nuggets
            </p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-semibold text-slate-900 mb-8 text-center">
            The Nugget's Four Pillars
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Local Insight, Local Impact
              </h3>
              <p className="text-slate-600">
                Powered by our Local Heroes who know their city best. We
                spotlight the most welcoming spots in every community.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Curated by Parents, for Parents
              </h3>
              <p className="text-slate-600">
                Every place on The Nugget is hand-picked by real families. We
                look beyond "family-friendly" labels to find spots that truly
                make dining out easier and more enjoyable.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-4">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Community-Driven Discovery
              </h3>
              <p className="text-slate-600">
                The Nugget is built with- and for - families. Our community of
                parents helps surface hidden gems, share honest experiences, and
                champion businesses that care.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-100 rounded-full mb-4">
                <Award className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Welcoming Places, Every Time
              </h3>
              <p className="text-slate-600">
                We celebrate restaurants that go the extra mile: thoughtful
                amenities, warm service, and spaces where kids and parents feel
                genuinely welcomed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
