export type ValidationState = 'idle' | 'valid' | 'error';
export interface ValidationResult {
  state: ValidationState;
  message?: string;
}

const idle: ValidationResult = { state: 'idle' };

export function validateRatio(value: string, msg = 'Tidak boleh 0'): ValidationResult {
  if (!value) return idle;
  // value may contain comma decimal
  const num = parseFloat(value.replace(',', '.'));
  if (!isFinite(num)) return { state: 'error', message: 'Angka tidak valid' };
  if (num <= 0) return { state: 'error', message: msg };
  return { state: 'valid' };
}

export function validatePrice(value: string, msg = 'Harga harus > 0'): ValidationResult {
  if (!value) return idle;
  const num = parseInt(value, 10);
  if (!isFinite(num) || isNaN(num)) return { state: 'error', message: 'Angka tidak valid' };
  if (num <= 0) return { state: 'error', message: msg };
  return { state: 'valid' };
}

export function validateLots(value: string, msg = 'Lot harus > 0'): ValidationResult {
  if (!value) return idle;
  const num = parseInt(value, 10);
  if (!isFinite(num) || isNaN(num)) return { state: 'error', message: 'Angka tidak valid' };
  if (num <= 0) return { state: 'error', message: msg };
  return { state: 'valid' };
}

export function validationClass(state: ValidationState): string {
  if (state === 'valid') return 'is-valid';
  if (state === 'error') return 'is-error';
  return '';
}