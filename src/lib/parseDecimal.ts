/**
 * Parse Indonesian decimal format (using comma as separator)
 * Converts "1,5" to 1.5 (number)
 */
export const parseDecimalId = (value: string): number => {
  if (!value) return 0;
  // Replace comma with dot for JavaScript parsing
  const normalized = value.replace(',', '.');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Sanitize ratio input - allow only digits and single comma
 */
export const sanitizeRatioInput = (value: string): string => {
  // Remove all characters except digits and comma
  let cleaned = value.replace(/[^0-9,]/g, '');
  
  // Only allow one comma
  const parts = cleaned.split(',');
  if (parts.length > 2) {
    cleaned = parts[0] + ',' + parts.slice(1).join('');
  }
  
  return cleaned;
};
