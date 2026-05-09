import { useRef, useCallback } from 'react';

interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  /** Required ratio of |deltaX| / |deltaY| to count as horizontal. */
  dominanceRatio?: number;
}

const INTERACTIVE_SELECTOR =
  'input,textarea,select,button,[role="slider"],[role="switch"],[contenteditable="true"],[data-no-swipe="true"]';

const isInsideNoSwipeZone = (target: EventTarget | null): boolean => {
  if (!(target instanceof Element)) return false;
  if (target.closest(INTERACTIVE_SELECTOR)) return true;
  // Skip if any ancestor is horizontally scrollable (charts, code blocks, tables)
  let el: Element | null = target;
  while (el && el !== document.body) {
    const style = window.getComputedStyle(el);
    const overflowX = style.overflowX;
    if ((overflowX === 'auto' || overflowX === 'scroll') && el.scrollWidth > el.clientWidth) {
      return true;
    }
    el = el.parentElement;
  }
  return false;
};

export const useSwipeGesture = ({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  dominanceRatio = 1.5,
}: SwipeConfig) => {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const blockedRef = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    // Ignore multi-touch (pinch/zoom) and interactive/scrollable targets
    if (e.touches.length > 1 || isInsideNoSwipeZone(e.target)) {
      blockedRef.current = true;
      return;
    }
    blockedRef.current = false;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (blockedRef.current) return;
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      const deltaY = e.changedTouches[0].clientY - touchStartY.current;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX > threshold && absX > absY * dominanceRatio) {
        if (navigator.vibrate) navigator.vibrate(10);
        if (deltaX < 0) onSwipeLeft?.();
        else onSwipeRight?.();
      }
    },
    [onSwipeLeft, onSwipeRight, threshold, dominanceRatio],
  );

  return { onTouchStart, onTouchEnd };
};
