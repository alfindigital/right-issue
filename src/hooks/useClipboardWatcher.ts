import { useEffect, useRef } from 'react';
import { parseAnnouncement, ParsedAnnouncement } from '@/lib/parseAnnouncement';

const STORAGE_KEY = 'ri-clip-watch';
const SESSION_SEEN_KEY = 'ri-clip-seen';

export const isClipWatchEnabled = (): boolean => {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(STORAGE_KEY) !== '0';
};

export const setClipWatchEnabled = (enabled: boolean) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
};

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return String(h);
};

interface Options {
  /** Only act when this returns true (e.g. form is empty + tab is calculator). */
  shouldRun: () => boolean;
  /** Called with parsed result when ≥2 fields detected and not yet seen. */
  onDetected: (parsed: ParsedAnnouncement) => void;
  /** Min fields required (default 2). */
  minFields?: number;
}

/**
 * Proactively read the clipboard on mount + when the tab regains focus.
 * Fires `onDetected` once per unique clipboard payload per session.
 */
export function useClipboardWatcher({ shouldRun, onDetected, minFields = 2 }: Options) {
  const onDetectedRef = useRef(onDetected);
  const shouldRunRef = useRef(shouldRun);
  onDetectedRef.current = onDetected;
  shouldRunRef.current = shouldRun;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (typeof navigator === 'undefined' || !navigator.clipboard?.readText) return;

    let cancelled = false;

    const tryRead = async () => {
      if (cancelled) return;
      if (!isClipWatchEnabled()) return;
      if (!shouldRunRef.current()) return;
      if (document.visibilityState !== 'visible') return;

      try {
        const text = await navigator.clipboard.readText();
        if (!text || text.length > 5000) return;
        const sig = hash(text);
        const seen = sessionStorage.getItem(SESSION_SEEN_KEY);
        if (seen === sig) return;
        const parsed = parseAnnouncement(text);
        if (parsed.matchedFields.length >= minFields) {
          sessionStorage.setItem(SESSION_SEEN_KEY, sig);
          onDetectedRef.current(parsed);
        }
      } catch {
        /* permission denied or focus issue — silently skip */
      }
    };

    // Initial check after small delay so first paint isn't blocked.
    const t = setTimeout(tryRead, 800);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') tryRead();
    };
    const onFocus = () => tryRead();

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);

    return () => {
      cancelled = true;
      clearTimeout(t);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
    };
  }, []);
}