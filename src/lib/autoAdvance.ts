/**
 * Module-level auto-advance registry.
 * Inputs register a key + their underlying HTMLInputElement, and the form
 * declares the order. After a field is "completed" (numpad Done, Enter, or
 * debounced edit), `advanceFrom(key)` focuses the next *empty* registered
 * field in order.
 */

export type FieldKey =
  | 'stockCode'
  | 'ratioOld'
  | 'ratioNew'
  | 'rightPrice'
  | 'cumDatePrice'
  | 'currentLots'
  | 'currentAvgPrice'
  | 'hmetdLots'
  | 'hmetdPrice'
  | 'warrantRatioOld'
  | 'warrantRatioNew';

type ValueGetter = () => string;

const STORAGE_KEY = 'ri-auto-advance';

const refs = new Map<FieldKey, { el: HTMLInputElement; getValue?: ValueGetter }>();
let order: FieldKey[] = [];

export const isAutoAdvanceEnabled = (): boolean => {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(STORAGE_KEY) !== '0';
};

export const setAutoAdvanceEnabled = (enabled: boolean) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
};

export const setOrder = (next: FieldKey[]) => {
  order = next.slice();
};

export const registerField = (
  key: FieldKey,
  el: HTMLInputElement | null,
  getValue?: ValueGetter,
) => {
  if (!el) {
    refs.delete(key);
    return;
  }
  refs.set(key, { el, getValue });
};

export const unregisterField = (key: FieldKey) => {
  refs.delete(key);
};

const isFilled = (key: FieldKey): boolean => {
  const entry = refs.get(key);
  if (!entry) return false;
  const raw = entry.getValue ? entry.getValue() : entry.el.value;
  const v = (raw || '').toString().replace(/\D/g, '');
  return v.length > 0 && Number(v) > 0;
};

/** Focus the next registered, empty field after `from`. */
export const advanceFrom = (from: FieldKey): boolean => {
  if (!isAutoAdvanceEnabled()) return false;
  const i = order.indexOf(from);
  if (i < 0) return false;
  for (let j = i + 1; j < order.length; j++) {
    const key = order[j];
    const entry = refs.get(key);
    if (!entry) continue;
    if (isFilled(key)) continue;
    // Use rAF so any in-flight blur/state updates settle first.
    requestAnimationFrame(() => {
      try {
        entry.el.focus({ preventScroll: false });
      } catch {
        entry.el.focus();
      }
    });
    return true;
  }
  return false;
};