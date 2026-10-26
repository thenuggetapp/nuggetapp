type GtagFn = (
  command: "event",
  eventName: string,
  params?: Record<string, string>
) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
  }
}

export interface RestaurantAnalyticsContext {
  restaurant_id: string;
  restaurant_name: string;
  city: string;
}

export type RestaurantActionType = "website" | "reservation";

const RETRY_DELAY_MS = 500;
const MAX_RETRIES = 10;

function hasAnalyticsConsent(): boolean {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("nugget_cookie_preferences="));
  if (!cookie) return false;
  try {
    return JSON.parse(decodeURIComponent(cookie.split("=")[1])).analytics === true;
  } catch {
    return false;
  }
}

// gtag is only defined once GoogleAnalytics has loaded, which requires analytics
// consent. If consent is granted but gtag.js hasn't finished loading yet (e.g. on
// first paint), retry briefly rather than dropping the event.
function sendEvent(
  eventName: string,
  params: Record<string, string>,
  attempt = 0
) {
  if (typeof window === "undefined") return;

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
    return;
  }

  if (attempt < MAX_RETRIES && hasAnalyticsConsent()) {
    window.setTimeout(
      () => sendEvent(eventName, params, attempt + 1),
      RETRY_DELAY_MS
    );
  }
}

export function trackRestaurantView(restaurant: RestaurantAnalyticsContext) {
  sendEvent("restaurant_view", { ...restaurant });
}

export function trackRestaurantAction(
  restaurant: RestaurantAnalyticsContext,
  actionType: RestaurantActionType,
  destinationUrl: string
) {
  sendEvent("restaurant_action", {
    ...restaurant,
    action_type: actionType,
    destination_url: destinationUrl,
  });
}
