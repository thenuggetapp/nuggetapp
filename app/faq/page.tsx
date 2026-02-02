'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useState } from 'react';
import { MarketingHeader } from '@/components/MarketingHeader';

const faqs = [
  {
    category: 'General',
    questions: [
      {
        q: 'What is the Nugget?',
        a: 'The Nugget is a family-friendly restaurant finder built by parents, for parents.\n\nYou define what "family friendly" means for you. Search from 30+ amenities and real-life features like:\n\n• Baby changing in women\'s, men\'s, or unisex toilets\n• High chairs\n• Kids\' menu\n• Dietary-friendly options\n• Fast service\n• Dog-friendly\n• Outdoor seating\n• And more\n\nFor best results, use one or two keywords + your location.\n\nWe\'re continuously adding new cities, so request yours here.'
      },
      {
        q: 'Is it free to use?',
        a: 'Yes! Create an account to like your favorites and bookmark restaurants for future events.\n\nPremium subscription with exclusive offers, invites, and more coming soon!'
      },
      {
        q: 'How do I create an account?',
        a: 'Click the "Sign Up" button in the top right corner, enter your email and password, and you\'re ready to start discovering great restaurants!'
      }
    ]
  },
  {
    category: 'For Diners',
    questions: [
      {
        q: 'How do I search for restaurants?',
        a: 'Use our intelligent search bar to find restaurants by cuisine type, location, dietary preferences, or specific features like "outdoor seating" or "high chairs".'
      },
      {
        q: 'Can I save my favorite restaurants?',
        a: 'Use the bookmark feature to save places for later - perfect for planning family meals, weekends, or trips. You\'ll need a free login to use this feature.'
      },
      {
        q: 'Can I filter search results?',
        a: 'Yes! Use our advanced filters to narrow down results by family amenities, dietary options, coloring available, outdoor seating, and more.'
      }
    ]
  },
  {
    category: 'For Restaurant Owners',
    questions: [
      {
        q: 'Is there a cost to list my restaurant?',
        a: 'We offer different subscription tiers for restaurant owners. Basic listings are free.\n\nComing soon: premium options available for enhanced visibility and additional features.'
      }
    ]
  },
  {
    category: 'Local Heroes Program',
    questions: [
      {
        q: 'What is the Local Heroes program?',
        a: 'Local Heroes are community champions who help grow The Nugget in their city by building partnerships, curating great family-friendly spots, and fostering local engagement.'
      },
      {
        q: 'How do I become a Local Hero?',
        a: 'Visit the Local Hero page and submit an application. You\'ll then be interviewed by one of our team. Once approved, you\'ll have your very own dashboard to track your commissions.'
      },
      {
        q: 'How much can I earn as a Local Hero?',
        a: 'Our first Local Heroes keep 100% of the commission they bring in for the first 6 months.\n\nCommission rates will then be reassessed based off performance and Nugget revenue.'
      }
    ]
  },
  {
    category: 'Partnerships',
    questions: [
      {
        q: 'Can my business partner with The Nugget?',
        a: 'Yes! We partner with restaurants, hotels, attractions, cafés, breweries, and other businesses that want to welcome families.\n\nGet in touch to explore partnership options.'
      }
    ]
  },
  {
    category: 'Technical Support',
    questions: [
      {
        q: 'Is there a mobile app?',
        a: 'We\'re a parent-led, bootstrapped startup focused on speed and impact.\n\nFor now, The Nugget is a web app that you can easily save to your phone.\n\nTo add it to your Home Screen:\n1. Open The Nugget in your mobile browser\n2. Tap the Share icon\n3. Select Add to Home Screen\n\nIt will look and feel like any other app.\n\nYour feedback helps us know where to go next. Tell us what you love, what you\'d change, and what you need.'
      }
    ]
  },
  {
    category: 'Privacy & Security',
    questions: [
      {
        q: 'How is my personal information protected?',
        a: 'We use industry-standard encryption and security measures to protect your data. Read our Privacy Policy for detailed information on how we handle your information.'
      },
      {
        q: 'Do you share my data with third parties?',
        a: 'We do not sell your personal information. We only share data with service providers necessary to operate our platform, and when required by law. See our Privacy Policy for details.'
      }
    ]
  }
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      item =>
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <MarketingHeader />
      <main className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Find answers to common questions about our platform
          </p>

          <div className="relative max-w-xl mx-auto">
            <Label htmlFor="faq-search" className="sr-only">
              Search frequently asked questions
            </Label>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" aria-hidden="true" />
            <Input
              id="faq-search"
              type="search"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 text-lg"
              aria-label="Search frequently asked questions"
            />
          </div>
        </div>

        <div className="space-y-8" role="region" aria-live="polite" aria-atomic="false">
          {searchQuery && (
            <div className="sr-only" aria-live="polite" aria-atomic="true">
              {filteredFaqs.length === 0
                ? `No results found for ${searchQuery}`
                : `Found ${filteredFaqs.reduce((sum, cat) => sum + cat.questions.length, 0)} results in ${filteredFaqs.length} categories`
              }
            </div>
          )}
          {filteredFaqs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
              <p className="text-slate-600 text-lg">No results found for "{searchQuery}"</p>
              <p className="text-slate-500 mt-2">Try a different search term or browse all categories</p>
            </div>
          ) : (
            filteredFaqs.map((category, idx) => (
              <section key={idx} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 md:p-8" aria-labelledby={`category-${idx}`}>
                <h2 id={`category-${idx}`} className="text-2xl font-semibold text-slate-900 mb-4">{category.category}</h2>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((item, qIdx) => (
                    <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`}>
                      <AccordionTrigger className="text-left text-slate-900 hover:text-slate-700">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-700 leading-relaxed whitespace-pre-line">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            ))
          )}
        </div>

        <section className="mt-12 bg-white rounded-lg border border-slate-200 p-8 text-center" aria-labelledby="contact-support-heading">
          <h3 id="contact-support-heading" className="text-xl font-semibold text-slate-900 mb-2">Still have questions?</h3>
          <p className="text-slate-700 mb-4">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#8dbf65] text-white font-medium rounded-lg hover:bg-[#7aad52] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8dbf65] focus:ring-offset-2"
            aria-label="Contact support team"
          >
            Contact Support
          </a>
        </section>
      </main>
    </div>
  );
}
