import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import { SWRProvider } from '@/providers/SWRProvider';
import { Toaster } from '@/components/ui/sonner';
import { ConditionalFooter } from '@/components/ConditionalFooter';
import { CookieConsent } from '@/components/CookieConsent';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';

export const metadata: Metadata = {
  metadataBase: new URL('https://yourdomain.com'),
  title: {
    default: 'Nugget - Find Family-Friendly Restaurants',
    template: '%s | Nugget',
  },
  description: 'Discover family-friendly restaurants with interactive maps, detailed reviews, and filters for kids menus, high chairs, parking, and more.',
  keywords: ['restaurants', 'family-friendly', 'kids menu', 'map search', 'restaurant finder', 'dining', 'food'],
  authors: [{ name: 'Nugget Team' }],
  creator: 'Nugget',
  publisher: 'Nugget',
  icons: {
    icon: '/fav_icon.png',
    shortcut: '/fav_icon.png',
    apple: '/fav_icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://yourdomain.com',
    title: 'Nugget - Find Family-Friendly Restaurants',
    description: 'Discover family-friendly restaurants with interactive maps, detailed reviews, and filters for kids menus, high chairs, parking, and more.',
    siteName: 'MapSearch',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nugget - Find Family-Friendly Restaurants',
    description: 'Discover family-friendly restaurants with interactive maps, detailed reviews, and filters for kids menus, high chairs, parking, and more.',
    creator: '@mapsearch',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <GoogleAnalytics />
        <AuthProvider>
          <SWRProvider>
            {children}
            <ConditionalFooter />
            <Toaster />
            <CookieConsent />
          </SWRProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
