import { describe, it, expect } from 'vitest';
import { parseDecimalId, sanitizeRatioInput } from './parseDecimal';

describe('parseDecimalId', () => {
  it('parses Indonesian comma decimals', () => {
    expect(parseDecimalId('1,5')).toBe(1.5);
    expect(parseDecimalId('10')).toBe(10);
  });
  it('returns 0 for empty or invalid input', () => {
    expect(parseDecimalId('')).toBe(0);
    expect(parseDecimalId('abc')).toBe(0);
  });
});

describe('sanitizeRatioInput', () => {
  it('strips non-numeric except comma', () => {
    expect(sanitizeRatioInput('a1.2b,3')).toBe('12,3');
  });
  it('collapses multiple commas into one', () => {
    expect(sanitizeRatioInput('1,2,3')).toBe('1,23');
  });
});

describe('TERP formula', () => {
  // TERP = (cumPrice * rOld + rightPrice * rNew) / (rOld + rNew)
  const terp = (cum: number, rOld: number, rNew: number, right: number) =>
    (cum * rOld + right * rNew) / (rOld + rNew);

  it('matches BRIS 2:1 @ Rp1500 with cum Rp2000', () => {
    expect(Math.round(terp(2000, 2, 1, 1500))).toBe(1833);
  });
  it('returns cum price when right price equals cum', () => {
    expect(terp(1000, 5, 3, 1000)).toBe(1000);
  });
});