'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const COOKIE_CONSENT_NAME = 'nugget_cookie_consent';
const COOKIE_PREFERENCES_NAME = 'nugget_cookie_preferences';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

const defaultPreferences: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  functional: false,
};

function getCookieConsent(): boolean | null {
  if (typeof document === 'undefined') return null;
  const value = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${COOKIE_CONSENT_NAME}=`));
  if (!value) return null;
  return value.split('=')[1] === 'true';
}

function setCookieConsent(accepted: boolean) {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${COOKIE_CONSENT_NAME}=${accepted};${expires};path=/`;
}

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

function setCookiePreferences(preferences: CookiePreferences) {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${COOKIE_PREFERENCES_NAME}=${encodeURIComponent(JSON.stringify(preferences))};${expires};path=/`;
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    const consent = getCookieConsent();
    if (consent === null) {
      setShowBanner(true);
    }
    setPreferences(getCookiePreferences());
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    setCookieConsent(true);
    setCookiePreferences(allAccepted);
    setShowBanner(false);
    setShowModal(false);
  };

  const handleManage = () => {
    setShowModal(true);
  };

  const handleSavePreferences = () => {
    setCookieConsent(true);
    setCookiePreferences(preferences);
    setShowBanner(false);
    setShowModal(false);
  };

  const handleRejectAll = () => {
    const onlyEssential: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    setCookieConsent(true);
    setCookiePreferences(onlyEssential);
    setPreferences(onlyEssential);
    setShowBanner(false);
    setShowModal(false);
  };

  if (!showBanner) return null;

  return (
    <>
      <Dialog open={showBanner && !showModal} onOpenChange={(open) => !open && handleRejectAll()}>
        <DialogContent className="max-w-md bg-[#121727] text-white border-[#121727] [&>button]:hidden" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">Cookie Settings</DialogTitle>
            <DialogDescription className="text-base leading-relaxed pt-2 text-gray-300">
              We use cookies to make The Nugget even more welcoming. They help us improve your experience, show you relevant local restaurants based on your location, and keep things running smoothly.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={handleAcceptAll}
              className="w-full bg-[#8dbf65] hover:bg-[#7aaa56] text-white"
            >
              Accept All Cookies
            </Button>
            <Button
              onClick={handleManage}
              variant="outline"
              className="w-full border-slate-600 text-black bg-white hover:bg-gray-100"
            >
              Manage Preferences
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Cookie Preferences</DialogTitle>
            <DialogDescription>
              We use cookies to enhance your experience. You can choose which types of cookies to allow below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="essential" className="text-base font-semibold">
                    Essential Cookies
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    These cookies are necessary for the website to function properly. They enable core functionality such as security, authentication, and network management. These cannot be disabled.
                  </p>
                </div>
                <Switch
                  id="essential"
                  checked={true}
                  disabled
                  className="mt-1"
                />
              </div>

              <Separator />

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="analytics" className="text-base font-semibold">
                    Analytics Cookies
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website's performance.
                  </p>
                </div>
                <Switch
                  id="analytics"
                  checked={preferences.analytics}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, analytics: checked })
                  }
                  className="mt-1"
                />
              </div>

              <Separator />

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="marketing" className="text-base font-semibold">
                    Marketing Cookies
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    These cookies track your online activity to help advertisers deliver more relevant advertising or to limit how many times you see an ad. This helps support our content.
                  </p>
                </div>
                <Switch
                  id="marketing"
                  checked={preferences.marketing}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, marketing: checked })
                  }
                  className="mt-1"
                />
              </div>

              <Separator />

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="functional" className="text-base font-semibold">
                    Functional Cookies
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings, detecting your approximate location (via IP address) to show relevant local restaurants, and saving your recent searches for quick access.
                  </p>
                </div>
                <Switch
                  id="functional"
                  checked={preferences.functional}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, functional: checked })
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleRejectAll}
              variant="outline"
              className="flex-1"
            >
              Reject All
            </Button>
            <Button
              onClick={handleSavePreferences}
              variant="outline"
              className="flex-1"
            >
              Save Preferences
            </Button>
            <Button
              onClick={handleAcceptAll}
              className="flex-1 bg-[#8dbf65] hover:bg-[#7aaa56] text-white"
            >
              Accept All
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
