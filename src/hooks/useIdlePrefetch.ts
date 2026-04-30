import { useEffect } from 'react';

type IdleImporter = () => Promise<unknown>;

interface IdleCallbackHandle {
  cancel: () => void;
}

const scheduleIdle = (cb: () => void, timeout = 2000): IdleCallbackHandle => {
  // requestIdleCallback isn't available on Safari/iOS — fall back to setTimeout
  const w = window as Window & {
    requestIdleCallback?: (cb: IdleRequestCallback, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (handle: number) => void;
  };

  if (typeof w.requestIdleCallback === 'function') {
    const id = w.requestIdleCallback(cb, { timeout });
    return { cancel: () => w.cancelIdleCallback?.(id) };
  }

  const id = window.setTimeout(cb, timeout);
  return { cancel: () => window.clearTimeout(id) };
};

/**
 * Prefetch lazy-loaded chunks once the browser is idle.
 * Triggered after first paint so it never competes with critical rendering.
 */
export const useIdlePrefetch = (importers: IdleImporter[], delay = 2000) => {
  useEffect(() => {
    // Skip on slow connections or data-saver mode
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (conn?.saveData) return;
    if (conn?.effectiveType && /(2g|slow-2g)/.test(conn.effectiveType)) return;

    const handle = scheduleIdle(() => {
      importers.forEach((imp) => {
        // Fire-and-forget; failures are non-fatal (chunk will load on demand later)
        imp().catch(() => {});
      });
    }, delay);

    return () => handle.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export default useIdlePrefetch;