'use client';

import { usePathname } from 'next/navigation';
import { Footer } from '@/components/Footer';

export function ConditionalFooter() {
  const pathname = usePathname();

  const hideFooterPaths = ['/search', '/restaurant', '/local-hero/dashboard', '/admin', '/login', '/signup'];
  const shouldHideFooter = hideFooterPaths.some(path => pathname?.startsWith(path));

  if (shouldHideFooter) {
    return null;
  }

  return <Footer />;
}
