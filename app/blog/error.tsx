'use client';

import { useEffect } from 'react';
import { MarketingHeader } from '@/components/MarketingHeader';
import { Button } from '@/components/ui/button';

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Blog failed to load:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <MarketingHeader />
      <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">The Nugget Blog</h1>
        <p className="text-xl text-slate-600 mb-8">
          We couldn&apos;t load the articles just now. Please try again.
        </p>
        <Button onClick={reset} className="bg-[#8dbf65] hover:bg-[#7aad52] text-white">
          Try again
        </Button>
      </div>
    </div>
  );
}
