"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Heart,
  MapPin,
  MessageCircle,
  Pencil,
  Tag,
  UtensilsCrossed,
  X,
  type LucideIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { safeLocalStorage } from "@/lib/storage-utils";

const STORAGE_KEY = "nugget_home_survey";
const SHOW_DELAY_MS = 20000;
const SHOW_SCROLL_RATIO = 0.5;
const DISMISS_DAYS = 30;
const DISMISS_MS = DISMISS_DAYS * 24 * 60 * 60 * 1000;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Choice = "more_restaurants" | "add_city" | "deals" | "parent_reviews" | "other";

interface Option {
  value: Choice;
  label: string;
  icon: LucideIcon;
}

const SHUFFLED_OPTIONS: Option[] = [
  { value: "more_restaurants", label: "More family-friendly restaurants in my city", icon: UtensilsCrossed },
  { value: "add_city", label: "Add my city to The Nugget", icon: MapPin },
  { value: "deals", label: "Deals and offers, like free kids' meals or money off the bill", icon: Tag },
  { value: "parent_reviews", label: "Reviews from other parents", icon: MessageCircle },
];

const OTHER_OPTION: Option = { value: "other", label: "Something else…", icon: Pencil };

interface SurveyState {
  answeredAt?: number;
  dismissedAt?: number;
}

function readState(): SurveyState {
  try {
    const raw = safeLocalStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeState(state: SurveyState) {
  try {
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage failures (e.g. private browsing)
  }
}

function shouldShowSurvey(state: SurveyState): boolean {
  if (state.answeredAt) return false;
  if (state.dismissedAt && Date.now() - state.dismissedAt < DISMISS_MS) return false;
  return true;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function HomeSurveyPopup() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [entered, setEntered] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [otherText, setOtherText] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!shouldShowSurvey(readState())) return;

    let shown = false;
    const show = () => {
      if (shown || !shouldShowSurvey(readState())) return;
      shown = true;
      cleanup();
      setOptions([...shuffle(SHUFFLED_OPTIONS), OTHER_OPTION]);
      setVisible(true);
      requestAnimationFrame(() => setEntered(true));
    };

    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable > 0 && window.scrollY / scrollable >= SHOW_SCROLL_RATIO) show();
    };

    const timer = setTimeout(show, SHOW_DELAY_MS);
    window.addEventListener("scroll", onScroll, { passive: true });

    function cleanup() {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    }

    return cleanup;
  }, []);

  const submit = async (details: { city?: string; email?: string; other_text?: string } = {}) => {
    if (!choice || submittedRef.current) return true;

    const { error } = await supabase.from("home_survey_responses").insert({
      choice,
      city: details.city || null,
      email: details.email || null,
      other_text: details.other_text || null,
      page_path: window.location.pathname,
      user_id: user?.id || null,
    });

    if (error) {
      console.error("Error submitting home survey:", error);
      return false;
    }

    submittedRef.current = true;
    writeState({ ...readState(), answeredAt: Date.now() });
    return true;
  };

  const hide = () => {
    setEntered(false);
    setTimeout(() => setVisible(false), 300);
  };

  const handleClose = () => {
    if (choice && status !== "done") {
      // They picked an option but skipped the follow-up: keep the answer anyway
      void submit();
    } else if (!choice) {
      writeState({ ...readState(), dismissedAt: Date.now() });
    }
    hide();
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const details: { city?: string; email?: string; other_text?: string } = {};
    if (choice === "more_restaurants" || choice === "add_city") {
      details.city = city.trim();
    } else if (choice === "deals") {
      const trimmedEmail = email.trim();
      if (trimmedEmail && !EMAIL_REGEX.test(trimmedEmail)) {
        setErrorMessage("Please enter a valid email address");
        return;
      }
      details.email = trimmedEmail;
    } else if (choice === "other") {
      details.other_text = otherText.trim();
    }

    setStatus("submitting");
    const ok = await submit(details);
    if (!ok) {
      setStatus("idle");
      setErrorMessage("Something went wrong. Please try again.");
      return;
    }

    setStatus("done");
    setTimeout(hide, 3000);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="home-survey-title"
      className={`fixed inset-x-0 bottom-0 z-[60] rounded-t-2xl bg-white p-6 pb-8 shadow-[0_-8px_30px_rgba(0,0,0,0.15)] transition-all duration-300 ease-out sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[380px] sm:rounded-xl sm:pb-6 sm:shadow-xl ${
        entered ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <button
        onClick={handleClose}
        aria-label="Close"
        className="absolute right-4 top-4 rounded-sm text-slate-400 opacity-70 transition-opacity hover:opacity-100 hover:text-slate-600"
      >
        <X className="h-5 w-5" />
      </button>

      {status === "done" ? (
        <div className="py-4 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#8dbf65]/10">
            <Heart className="h-6 w-6 text-[#8dbf65]" />
          </div>
          <h3 id="home-survey-title" className="mb-2 text-xl font-bold text-slate-900">
            Thank you!
          </h3>
          <p className="text-slate-600">You're helping other parents eat out more easily.</p>
        </div>
      ) : !choice ? (
        <>
          <h3 id="home-survey-title" className="mb-1 pr-6 text-lg font-bold text-slate-900">
            Help us shape The Nugget
          </h3>
          <p className="mb-4 text-sm text-slate-600">
            What would make The Nugget most useful for you?
          </p>
          <div className="space-y-2">
            {options.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setChoice(value)}
                className="flex w-full items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-left text-sm text-slate-800 transition-colors hover:border-[#8dbf65] hover:bg-[#8dbf65]/5 focus-visible:border-[#8dbf65] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8dbf65]/40"
              >
                <Icon className="h-4 w-4 shrink-0 text-[#8dbf65]" />
                {label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <form onSubmit={handleDetailsSubmit}>
          <button
            type="button"
            onClick={() => {
              setChoice(null);
              setErrorMessage("");
            }}
            className="mb-3 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {(choice === "more_restaurants" || choice === "add_city") && (
            <>
              <h3 id="home-survey-title" className="mb-1 pr-6 text-lg font-bold text-slate-900">
                Which city?
              </h3>
              <p className="mb-4 text-sm text-slate-600">
                We'll use this to decide where to add restaurants next.
              </p>
              <Input
                placeholder="e.g., Manchester"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                maxLength={120}
                autoFocus
                aria-label="Your city"
              />
            </>
          )}

          {choice === "deals" && (
            <>
              <h3 id="home-survey-title" className="mb-1 pr-6 text-lg font-bold text-slate-900">
                Want to hear when deals launch?
              </h3>
              <p className="mb-4 text-sm text-slate-600">
                Leave your email and we'll let you know. This is optional.
              </p>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={254}
                autoFocus
                aria-label="Your email"
              />
            </>
          )}

          {choice === "parent_reviews" && (
            <>
              <h3 id="home-survey-title" className="mb-1 pr-6 text-lg font-bold text-slate-900">
                Great choice
              </h3>
              <p className="mb-4 text-sm text-slate-600">
                We're working on ways for parents to share what they think about high chairs,
                changing tables, kids' menus, and more.
              </p>
            </>
          )}

          {choice === "other" && (
            <>
              <h3 id="home-survey-title" className="mb-1 pr-6 text-lg font-bold text-slate-900">
                What would you like to see?
              </h3>
              <Textarea
                placeholder="Tell us your idea…"
                rows={3}
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                maxLength={1000}
                autoFocus
                aria-label="Your idea"
                className="mt-3"
              />
            </>
          )}

          {errorMessage && <p className="mt-2 text-sm text-red-600">{errorMessage}</p>}

          <Button
            type="submit"
            disabled={status === "submitting"}
            className="mt-4 w-full bg-[#8dbf65] text-white hover:bg-[#7aad52]"
          >
            {status === "submitting" ? "Sending..." : "Send"}
          </Button>
        </form>
      )}
    </div>
  );
}
