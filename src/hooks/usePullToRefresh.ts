import { useEffect, useRef, useState } from 'react';

interface Options {
  onRefresh: () => void;
  /** Distance in px the user must pull to trigger. */
  threshold?: number;
  /** Disable hook (e.g. on desktop). */
  enabled?: boolean;
}

/**
 * Pull-to-refresh gesture. Only activates when window.scrollY === 0.
 * Returns pull distance (0..threshold*1.5) for indicator UI.
 */
export function usePullToRefresh({ onRefresh, threshold = 80, enabled = true }: Options) {
  const [pull, setPull] = useState(0);
  const startY = useRef<number | null>(null);
  const triggered = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY > 0 || e.touches.length !== 1) {
        startY.current = null;
        return;
      }
      startY.current = e.touches[0].clientY;
      triggered.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (startY.current == null) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta <= 0) {
        setPull(0);
        return;
      }
      // Resistance curve
      const eased = Math.min(delta * 0.55, threshold * 1.5);
      setPull(eased);
    };

    const onTouchEnd = () => {
      if (startY.current == null) return;
      if (pull >= threshold && !triggered.current) {
        triggered.current = true;
        onRefresh();
      }
      startY.current = null;
      setPull(0);
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [enabled, threshold, pull, onRefresh]);

  return { pull, threshold, progress: Math.min(pull / threshold, 1) };
}