'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { useAuth } from '@/contexts/AuthContext';
import { isAnalyticsHost, isInternalRole } from '@/lib/analytics';

const GA_MEASUREMENT_ID = 'G-0ZM993QL32';

export function GoogleAnalytics() {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [onAnalyticsHost, setOnAnalyticsHost] = useState(false);
  const { userProfile, loading: authLoading } = useAuth();

  // Evaluated after mount so server and client markup match.
  useEffect(() => {
    setOnAnalyticsHost(isAnalyticsHost());
  }, []);

  useEffect(() => {
    const checkAnalyticsCookie = () => {
      if (typeof document === 'undefined') return;

      const cookiePrefs = document.cookie
        .split('; ')
        .find(row => row.startsWith('nugget_cookie_preferences='));

      if (cookiePrefs) {
        try {
          const prefs = JSON.parse(decodeURIComponent(cookiePrefs.split('=')[1]));
          setAnalyticsEnabled(prefs.analytics === true);
        } catch {
          setAnalyticsEnabled(false);
        }
      }
    };

    checkAnalyticsCookie();

    const interval = setInterval(checkAnalyticsCookie, 1000);

    return () => clearInterval(interval);
  }, []);

  const isInternal = isInternalRole(userProfile?.role);

  // Keep traffic_type current if the visitor signs in or out after gtag loaded.
  // (The initial value is passed to config below, so the first page_view has it.)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
    window.gtag('set', { traffic_type: isInternal ? 'internal' : undefined });
  }, [isInternal]);

  if (!onAnalyticsHost || !analyticsEnabled) return null;

  // Wait for auth to resolve so the very first page_view already knows whether
  // this is a team account.
  if (authLoading) return null;

  const configParams = isInternal ? `, { traffic_type: 'internal' }` : '';

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}'${configParams});
        `}
      </Script>
    </>
  );
}
