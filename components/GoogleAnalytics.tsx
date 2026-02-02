'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

const GA_MEASUREMENT_ID = 'G-0ZM993QL32';

export function GoogleAnalytics() {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

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

  if (!analyticsEnabled) return null;

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
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
