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

/**
 * Floating CTA on mobile that sits above the on-screen keyboard.
 * Uses VisualViewport API to track keyboard height; falls back to bottom-nav offset.
 */
const StickyCalculateBar: React.FC<Props> = ({
  visible,
  isCalculated,
  isEnabled,
  label,
  onCalculate,
  onScrollToResult,
}) => {
  const [bottomOffset, setBottomOffset] = useState(72);

  useEffect(() => {
    if (!visible) return;
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const keyboardHeight = window.innerHeight - vv.height - vv.offsetTop;
      // 8px gap above keyboard; fall back to 72 (above BottomNav) when no keyboard
      setBottomOffset(keyboardHeight > 60 ? keyboardHeight + 8 : 72);
    };
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
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
      style={{ bottom: bottomOffset }}
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