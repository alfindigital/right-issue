/**
 * Light haptic feedback wrapper. Haptics are always on by default
 * and only disabled when the device has no vibrate API or the user
 * prefers reduced motion.
 */
const canVibrate = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  if (typeof navigator.vibrate !== 'function') return false;
  try {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  } catch {
    /* noop */
  }
  return true;
};

export const haptic = (pattern: number | number[] = 10): void => {
  if (!canVibrate()) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* noop */
  }
};

export const hapticSuccess = (): void => haptic([12, 40, 18]);
export const hapticTap = (): void => haptic(8);
export const hapticWarn = (): void => haptic([20, 60, 20]);