import { toast } from 'sonner';

/**
 * Safe, versioned localStorage helpers.
 * - Wraps every read/write in try/catch (Safari private mode, disabled storage, JSON errors).
 * - Adds a schema version envelope so future shape changes can reset old data instead of crashing.
 * - Surfaces QuotaExceededError to the user via a toast (once per session per key).
 */

interface Envelope<T> {
  v: number;
  data: T;
}

const quotaWarned = new Set<string>();

function isQuotaError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  // Different browsers use different names / codes
  return (
    err.name === 'QuotaExceededError' ||
    err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    /quota/i.test(err.message)
  );
}

export function readVersioned<T>(key: string, expectedVersion: number): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Envelope<T> | T;
    // Backwards compatibility: accept unwrapped legacy payloads only if no version mismatch is required.
    if (parsed && typeof parsed === 'object' && 'v' in (parsed as object) && 'data' in (parsed as object)) {
      const env = parsed as Envelope<T>;
      if (env.v !== expectedVersion) {
        // Schema drift — drop silently rather than crash the UI.
        try { localStorage.removeItem(key); } catch { /* noop */ }
        return null;
      }
      return env.data;
    }
    // Legacy unversioned payload — discard so future writes use the envelope.
    try { localStorage.removeItem(key); } catch { /* noop */ }
    return null;
  } catch {
    // Storage unavailable or corrupted JSON — recover by resetting.
    try { localStorage.removeItem(key); } catch { /* noop */ }
    return null;
  }
}

export function writeVersioned<T>(key: string, version: number, data: T): boolean {
  try {
    const env: Envelope<T> = { v: version, data };
    localStorage.setItem(key, JSON.stringify(env));
    return true;
  } catch (err) {
    if (isQuotaError(err)) {
      if (!quotaWarned.has(key)) {
        quotaWarned.add(key);
        toast.error('Penyimpanan browser penuh', {
          description: 'Hapus sebagian riwayat untuk menyimpan data baru.',
        });
      }
    }
    // Storage disabled (Safari private mode) — fail silently.
    return false;
  }
}

export function removeKey(key: string): void {
  try { localStorage.removeItem(key); } catch { /* noop */ }
}

/** Read any raw key for export. Returns the raw string or null. */
export function readRaw(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

/** Write a raw string (already JSON or primitive). Returns success. */
export function writeRaw(key: string, value: string): boolean {
  try { localStorage.setItem(key, value); return true; } catch (err) {
    if (isQuotaError(err) && !quotaWarned.has(key)) {
      quotaWarned.add(key);
      toast.error('Penyimpanan browser penuh');
    }
    return false;
  }
}