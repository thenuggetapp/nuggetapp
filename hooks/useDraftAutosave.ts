'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { safeLocalStorage } from '@/lib/storage-utils';

// Drafts older than this are ignored and cleaned up
const DRAFT_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export interface StoredDraft<T> {
  data: T;
  savedAt: number;
}

export function readDraft<T>(key: string): StoredDraft<T> | null {
  const raw = safeLocalStorage.getItem(key);
  if (!raw) return null;

  try {
    const draft = JSON.parse(raw) as StoredDraft<T>;
    if (!draft?.data || typeof draft.savedAt !== 'number') return null;
    if (Date.now() - draft.savedAt > DRAFT_MAX_AGE_MS) {
      safeLocalStorage.removeItem(key);
      return null;
    }
    return draft;
  } catch {
    safeLocalStorage.removeItem(key);
    return null;
  }
}

interface UseDraftAutosaveOptions<T> {
  /** Storage key; pass null until the key is known (e.g. user not loaded yet) */
  key: string | null;
  data: T | null;
  /** Form state that counts as "nothing to save" (initial or last-saved server data) */
  baseline: T | null;
  /** Don't write until any existing draft has been restored, or it would be overwritten */
  enabled: boolean;
  delay?: number;
}

/**
 * Continuously saves form state to localStorage so in-progress work survives
 * refreshes, accidental navigation, and expired sessions.
 */
export function useDraftAutosave<T>({
  key,
  data,
  baseline,
  enabled,
  delay = 800,
}: UseDraftAutosaveOptions<T>) {
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const pendingRef = useRef<(() => void) | null>(null);
  // Set once the work has been saved to the server, so nothing re-writes the draft
  const clearedRef = useRef(false);

  const write = useCallback(() => {
    if (!key || data == null || clearedRef.current) return;

    if (baseline != null && JSON.stringify(data) === JSON.stringify(baseline)) {
      safeLocalStorage.removeItem(key);
      setLastSavedAt(null);
      return;
    }

    const savedAt = Date.now();
    safeLocalStorage.setItem(key, JSON.stringify({ data, savedAt }));
    setLastSavedAt(savedAt);
  }, [key, data, baseline]);

  useEffect(() => {
    if (!enabled) return;

    pendingRef.current = write;
    const timeout = setTimeout(() => {
      write();
      pendingRef.current = null;
    }, delay);

    return () => clearTimeout(timeout);
  }, [enabled, write, delay]);

  // Flush anything typed in the last moments before the tab closes
  useEffect(() => {
    const flush = () => pendingRef.current?.();
    window.addEventListener('pagehide', flush);
    return () => window.removeEventListener('pagehide', flush);
  }, []);

  /** Throw away the stored draft but keep autosaving (e.g. "start over") */
  const discardDraft = useCallback(() => {
    pendingRef.current = null;
    if (key) safeLocalStorage.removeItem(key);
    setLastSavedAt(null);
  }, [key]);

  /** Call after the work is saved to the server; stops further autosaves */
  const clearDraft = useCallback(() => {
    clearedRef.current = true;
    discardDraft();
  }, [discardDraft]);

  return { lastSavedAt, clearDraft, discardDraft };
}
