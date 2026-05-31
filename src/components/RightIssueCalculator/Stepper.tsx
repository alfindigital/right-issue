import React, { useCallback, useEffect, useRef } from 'react';
import { Minus, Plus } from 'lucide-react';
import { haptic } from '@/lib/haptics';

interface StepperProps {
  value: string;
  onChange: (next: string) => void;
  /** Base step (e.g. 1 for lots, 50 for prices). */
  step?: number;
  /** Larger steps unlocked while long-pressing, in order. e.g. [5, 25]. */
  accelSteps?: number[];
  /** Time (ms) before moving to next accel tier. */
  accelAfterMs?: number;
  /** Minimum value (default 0). */
  min?: number;
  /** Optional preset chips rendered between the buttons. */
  presets?: number[];
  className?: string;
  ariaLabel?: string;
}

const parseNum = (v: string): number => {
  const n = parseInt((v || '').replace(/\D/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
};

const Stepper: React.FC<StepperProps> = ({
  value,
  onChange,
  step = 1,
  accelSteps = [],
  accelAfterMs = 600,
  min = 0,
  presets,
  className = '',
  ariaLabel,
}) => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tierTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tierRef = useRef(0);
  const valueRef = useRef(value);
  valueRef.current = value;

  const currentStep = useCallback(() => {
    const tier = tierRef.current;
    if (tier === 0) return step;
    return accelSteps[Math.min(tier - 1, accelSteps.length - 1)] ?? step;
  }, [accelSteps, step]);

  const apply = useCallback(
    (dir: 1 | -1) => {
      const next = Math.max(min, parseNum(valueRef.current) + dir * currentStep());
      onChange(String(next));
    },
    [currentStep, min, onChange],
  );

  const stopRepeat = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (tierTimerRef.current) { clearTimeout(tierTimerRef.current); tierTimerRef.current = null; }
    tierRef.current = 0;
  }, []);

  useEffect(() => () => stopRepeat(), [stopRepeat]);

  const beginRepeat = (dir: 1 | -1) => {
    haptic(8);
    apply(dir); // immediate
    // After hold delay, start auto-repeat and tier escalation.
    tierTimerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => apply(dir), 110);
      // Tier escalation
      const escalate = () => {
        if (tierRef.current < accelSteps.length) {
          tierRef.current += 1;
          haptic(12);
          tierTimerRef.current = setTimeout(escalate, accelAfterMs);
        }
      };
      tierTimerRef.current = setTimeout(escalate, accelAfterMs);
    }, 380);
  };

  const btnClass =
    'h-9 w-9 rounded-full bg-muted hover:bg-muted/80 active:scale-95 text-foreground flex items-center justify-center transition-transform touch-manipulation select-none disabled:opacity-40';

  return (
    <div className={`flex items-center gap-1.5 ${className}`} aria-label={ariaLabel}>
      <button
        type="button"
        className={btnClass}
        onPointerDown={(e) => { e.preventDefault(); beginRepeat(-1); }}
        onPointerUp={stopRepeat}
        onPointerLeave={stopRepeat}
        onPointerCancel={stopRepeat}
        disabled={parseNum(value) <= min}
        aria-label="Kurangi"
      >
        <Minus className="w-4 h-4" />
      </button>

      {presets && presets.length > 0 && (
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1 min-w-0 px-1">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => { haptic(8); onChange(String(p)); }}
              className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              {new Intl.NumberFormat('id-ID').format(p)}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        className={btnClass}
        onPointerDown={(e) => { e.preventDefault(); beginRepeat(1); }}
        onPointerUp={stopRepeat}
        onPointerLeave={stopRepeat}
        onPointerCancel={stopRepeat}
        aria-label="Tambah"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Stepper;