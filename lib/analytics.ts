declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// Sends a Google Analytics event. No-ops when GA isn't loaded
// (e.g. the visitor hasn't accepted analytics cookies).
export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}
