"use client";

import { useEffect, useState } from "react";
import { Check, Mail, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { safeLocalStorage } from "@/lib/storage-utils";

const STORAGE_KEY = "nugget_newsletter_popup";
const SHOW_DELAY_MS = 3000;
const MAX_SHOWS_PER_WINDOW = 2;
const WINDOW_DAYS = 30;
const WINDOW_MS = WINDOW_DAYS * 24 * 60 * 60 * 1000;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface PopupState {
  subscribed?: boolean;
  shownAt?: number[];
}

function readState(): PopupState {
  try {
    const raw = safeLocalStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeState(state: PopupState) {
  try {
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage failures (e.g. private browsing)
  }
}

function shouldShowPopup(state: PopupState): boolean {
  if (state.subscribed) return false;

  const now = Date.now();
  const recentShows = (state.shownAt || []).filter((t) => now - t < WINDOW_MS);
  return recentShows.length < MAX_SHOWS_PER_WINDOW;
}

export function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const state = readState();
    if (!shouldShowPopup(state)) return;

    const timer = setTimeout(() => {
      const latestState = readState();
      if (!shouldShowPopup(latestState)) return;

      const now = Date.now();
      const recentShows = (latestState.shownAt || []).filter((t) => now - t < WINDOW_MS);
      writeState({ ...latestState, shownAt: [...recentShows, now] });
      setVisible(true);
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setVisible(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (website) {
      // honeypot triggered, silently drop
      setVisible(false);
      return;
    }

    const trimmedEmail = email.trim();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, honeypot: website }),
      });

      const result = await response.json();

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(result.error || "Something went wrong. Please try again.");
        return;
      }
    } catch (error) {
      console.error("Newsletter signup error:", error);
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
      return;
    }

    setStatus("success");
    const state = readState();
    writeState({ ...state, subscribed: true });

    setTimeout(() => setVisible(false), 2500);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4">
      <div className="relative w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
        <button
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-sm text-slate-400 opacity-70 transition-opacity hover:opacity-100 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        {status === "success" ? (
          <div className="text-center py-4">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#8dbf65]/10">
              <Mail className="h-6 w-6 text-[#8dbf65]" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Almost there!</h3>
            <p className="text-slate-600">We sent you a link to confirm — check your inbox.</p>
          </div>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#8dbf65]/10">
              <Mail className="h-6 w-6 text-[#8dbf65]" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">
              Where to eat with the kids
              <br />
              (and actually enjoy it)
            </h3>
            <p className="text-slate-600 text-center mb-4">
              Family-friendly restaurant picks and tips,
              <br />
              straight to your inbox.
            </p>
            <ul className="mb-6 space-y-1.5">
              <li className="flex items-center gap-2 text-sm text-slate-700">
                <Check className="h-4 w-4 shrink-0 text-[#8dbf65]" />
                Two emails a month with the best family spots
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-700">
                <Check className="h-4 w-4 shrink-0 text-[#8dbf65]" />
                Unlock your free Nugget account to save your favorites
              </li>
            </ul>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "submitting"}
                required
              />
              {status === "error" && (
                <p className="text-sm text-red-600">{errorMessage}</p>
              )}
              <Button
                type="submit"
                disabled={status === "submitting"}
                className="w-full bg-[#8dbf65] hover:bg-[#7aad52] text-white"
              >
                {status === "submitting" ? "Sending..." : "Send me the good spots"}
              </Button>
            </form>
            <p className="mt-3 text-center text-xs text-slate-500 italic">
              Unsubscribe anytime.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
