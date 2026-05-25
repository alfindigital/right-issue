/**
 * Light haptic feedback wrapper. Respects prefers-reduced-motion and
 * silently no-ops on unsupported devices or when the user disabled
 * haptics via the app settings.
 */
const HAPTIC_STORAGE_KEY = 'haptics-enabled';

export const isHapticsEnabled = (): boolean => {
  if (typeof window === 'undefined') return true;
  try {
    const v = window.localStorage.getItem(HAPTIC_STORAGE_KEY);
    return v === null ? true : v === 'true';
  } catch {
    return true;
  }
};

export const setHapticsEnabled = (enabled: boolean): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(HAPTIC_STORAGE_KEY, String(enabled));
    window.dispatchEvent(new CustomEvent('haptics-changed', { detail: enabled }));
  } catch {
    /* noop */
  }
};

const canVibrate = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  if (typeof navigator.vibrate !== 'function') return false;
  if (!isHapticsEnabled()) return false;
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