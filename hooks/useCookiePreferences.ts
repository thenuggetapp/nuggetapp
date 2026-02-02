'use client';

import { useState, useEffect } from 'react';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

const COOKIE_PREFERENCES_NAME = 'nugget_cookie_preferences';

const defaultPreferences: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  functional: false,
};

function getCookiePreferences(): CookiePreferences {
  if (typeof document === 'undefined') return defaultPreferences;
  const value = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${COOKIE_PREFERENCES_NAME}=`));
  if (!value) return defaultPreferences;
  try {
    return JSON.parse(decodeURIComponent(value.split('=')[1]));
  } catch {
    return defaultPreferences;
  }
}

export function useCookiePreferences() {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    setPreferences(getCookiePreferences());

    const interval = setInterval(() => {
      setPreferences(getCookiePreferences());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return preferences;
}
