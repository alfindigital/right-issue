/**
 * Light haptic feedback wrapper. Respects prefers-reduced-motion and
 * silently no-ops on unsupported devices.
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