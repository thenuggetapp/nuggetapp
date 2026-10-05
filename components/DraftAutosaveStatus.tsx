'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle2, History } from 'lucide-react';

const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleString(undefined, {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });

interface DraftRestoredBannerProps {
  savedAt: number;
  discardLabel: string;
  onDiscard: () => void;
}

export function DraftRestoredBanner({ savedAt, discardLabel, onDiscard }: DraftRestoredBannerProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <History className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
        <div>
          <p className="font-medium text-slate-900">We restored your unsaved work</p>
          <p className="text-sm text-slate-600">
            Last edited {formatTime(savedAt)}. Pick up where you left off and hit publish when it's ready.
          </p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onDiscard} className="flex-shrink-0">
        {discardLabel}
      </Button>
    </div>
  );
}

export function AutosaveIndicator({ lastSavedAt }: { lastSavedAt: number | null }) {
  if (!lastSavedAt) return null;

  return (
    <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500">
      <CheckCircle2 className="h-3.5 w-3.5" />
      Progress saved automatically on this device · {formatTime(lastSavedAt)}
    </p>
  );
}
