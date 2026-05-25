import React, { useEffect, useState } from 'react';
import { Zap, ArrowDown } from 'lucide-react';
import { haptic } from '@/lib/haptics';

interface Props {
  visible: boolean;
  /** True if results already exist (button switches to "Lihat Hasil"). */
  isCalculated: boolean;
  /** True if all required inputs are filled. */
  isEnabled: boolean;
  label: string;
  onCalculate: () => void;
  onScrollToResult: () => void;
}

/** Detects iOS (including iPadOS 13+ reporting as MacIntel with touch). */
const isIOS = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  return (
    navigator.platform === 'MacIntel' &&
    typeof navigator.maxTouchPoints === 'number' &&
    navigator.maxTouchPoints > 1
  );
};

const isEditableElement = (el: Element | null): boolean => {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'INPUT') {
    const type = (el as HTMLInputElement).type;
    return !['button', 'submit', 'checkbox', 'radio', 'file', 'range', 'color'].includes(type);
  }
  return tag === 'TEXTAREA' || (el as HTMLElement).isContentEditable === true;
};

/** Conservative estimate for the iOS on-screen keyboard (portrait, incl. suggestion bar). */
const IOS_KEYBOARD_FALLBACK_PX = 305;
/** Above this we consider the viewport delta to be a real keyboard, not URL bar collapse. */
const KEYBOARD_DETECT_THRESHOLD_PX = 120;

/**
 * Floating CTA on mobile that sits above the on-screen keyboard.
 *
 * Position strategy (in priority order):
 * 1. VisualViewport API delta (most accurate, modern browsers).
 * 2. iOS focus-based fallback (~305px) when VV is absent OR reports a delta
 *    that's clearly too small (iOS sometimes lags / under-reports during
 *    rotation, in-app browsers like Instagram/Gmail, and older Safari).
 * 3. Bottom-nav offset (72px) + safe-area inset when no input is focused.
 */
const StickyCalculateBar: React.FC<Props> = ({
  visible,
  isCalculated,
  isEnabled,
  label,
  onCalculate,
  onScrollToResult,
}) => {
  // Bottom offset in px. We avoid env(safe-area-inset-bottom) when the
  // keyboard is up because iOS already accounts for the home indicator there.
  const [bottomOffset, setBottomOffset] = useState(72);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const ios = isIOS();
    const vv = window.visualViewport;

    const compute = () => {
      const focused = isEditableElement(document.activeElement);
      let measured = 0;

      if (vv) {
        // Prefer documentElement.clientHeight on iOS — it ignores URL bar chrome
        // collapse, so the delta corresponds to the keyboard only.
        const layoutHeight = ios
          ? document.documentElement.clientHeight
          : window.innerHeight;
        measured = Math.max(0, layoutHeight - vv.height - vv.offsetTop);
      }

      const keyboardLikely = measured > KEYBOARD_DETECT_THRESHOLD_PX;

      if (keyboardLikely) {
        setKeyboardOpen(true);
        setBottomOffset(measured + 8);
        return;
      }

      // Fallback: input is focused but VV gave us nothing useful (no API,
      // iOS in-app browser, rotation lag, etc.). Use a sensible estimate.
      if (focused && (ios || !vv)) {
        setKeyboardOpen(true);
        setBottomOffset(IOS_KEYBOARD_FALLBACK_PX + 8);
        return;
      }

      setKeyboardOpen(false);
      setBottomOffset(72);
    };

    compute();

    // Re-measure shortly after focus — iOS animates the keyboard in over
    // ~250ms and VisualViewport.resize sometimes fires before it settles.
    const onFocusIn = () => {
      compute();
      window.setTimeout(compute, 80);
      window.setTimeout(compute, 320);
    };
    const onFocusOut = () => {
      // Defer so we don't flicker when focus moves between inputs.
      window.setTimeout(compute, 60);
    };

    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    window.addEventListener('orientationchange', compute);
    vv?.addEventListener('resize', compute);
    vv?.addEventListener('scroll', compute);

    return () => {
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      window.removeEventListener('orientationchange', compute);
      vv?.removeEventListener('resize', compute);
      vv?.removeEventListener('scroll', compute);
    };
  }, [visible]);

  if (!visible) return null;

  const handleClick = () => {
    haptic(12);
    (document.activeElement as HTMLElement | null)?.blur?.();
    if (isCalculated) {
      onScrollToResult();
    } else {
      onCalculate();
      setTimeout(onScrollToResult, 250);
    }
  };

  return (
    <div
      className="md:hidden fixed left-2 right-2 z-[60] animate-slide-up"
      style={{
        // When the keyboard is up iOS already lifts content above the home
        // indicator; only add safe-area inset when resting on the bottom nav.
        bottom: keyboardOpen
          ? bottomOffset
          : `calc(${bottomOffset}px + env(safe-area-inset-bottom, 0px))`,
      }}
      data-no-swipe="true"
    >
      <button
        type="button"
        onClick={handleClick}
        disabled={!isEnabled && !isCalculated}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground font-bold py-3 shadow-2xl shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
      >
        {isCalculated ? (
          <>
            <ArrowDown className="w-4 h-4" />
            {label}
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            {label}
          </>
        )}
      </button>
    </div>
  );
};

export default StickyCalculateBar;