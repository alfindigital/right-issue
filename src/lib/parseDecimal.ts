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
  // Normalize pasted values: convert dot decimal -> comma, strip spaces/symbols.
  // Examples:
  //   "1.5"        -> "1,5"
  //   "Rp 1.500"   -> "1500"   (interpreted as thousands separator)
  //   "1,234.56"   -> "1234,56" (US format)
  //   " 2 , 5 "    -> "2,5"
  let s = value.replace(/\s+/g, '').replace(/[^0-9.,\-]/g, '');
  // Strip leading minus (ratios cannot be negative)
  s = s.replace(/-/g, '');

  const hasComma = s.includes(',');
  const hasDot = s.includes('.');

  if (hasComma && hasDot) {
    // Mixed: assume the LAST separator is the decimal mark, others are thousands
    const lastComma = s.lastIndexOf(',');
    const lastDot = s.lastIndexOf('.');
    const decimalIdx = Math.max(lastComma, lastDot);
    const intPart = s.slice(0, decimalIdx).replace(/[.,]/g, '');
    const decPart = s.slice(decimalIdx + 1).replace(/[.,]/g, '');
    s = decPart ? `${intPart},${decPart}` : intPart;
  } else if (hasDot) {
    const parts = s.split('.');
    // In ID context, dot is usually a thousands separator. Treat as decimal only
    // if exactly one dot AND right side is 1-2 digits (e.g. "1.5", "0.25").
    // "1.500" stays as thousands -> "1500".
    if (parts.length === 2 && parts[1].length > 0 && parts[1].length <= 2) {
      s = `${parts[0]},${parts[1]}`;
    } else {
      s = parts.join('');
    }
  } else if (hasComma) {
    // Collapse multiple commas into one (keep first as decimal)
    const parts = s.split(',');
    if (parts.length > 2) {
      s = parts[0] + ',' + parts.slice(1).join('');
    }
  }

  return s;
};
