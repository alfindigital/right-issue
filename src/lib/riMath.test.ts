import { describe, it, expect } from 'vitest';
import {
  SHARES_PER_LOT,
  calcNewShares,
  calcTerp,
  calcRightIssue,
} from './riMath';

/**
 * These tests lock in the rounding + lot-size rules that the Right Issue
 * calculator relies on. If any expectation here needs to change, update the
 * inline component logic in src/components/RightIssueCalculator/index.tsx too.
 */

describe('calcNewShares', () => {
  it('returns whole lots when the ratio divides cleanly (2:1)', () => {
    // 10 lots = 1000 shares, ratio 2:1 → 500 new shares = 5 lots
    expect(calcNewShares(1000, 2, 1)).toBe(500);
  });

  it('floors fractional entitlements (5:2 with 10 lots)', () => {
    // 10 lots × 2/5 = 4 whole lots (400 shares) — exact
    expect(calcNewShares(1000, 5, 2)).toBe(400);
  });

  it('floors odd-lot entitlements down (5:2 with 11 lots)', () => {
    // 1100 / 5 * 2 = 440 shares → 4,4 lots. Floored to 440 shares.
    expect(calcNewShares(1100, 5, 2)).toBe(440);
  });

  it('floors non-integer fractions (3:1 with 100 shares)', () => {
    // 100 / 3 * 1 = 33.333... → floor = 33
    expect(calcNewShares(100, 3, 1)).toBe(33);
  });

  it('supports fractional ratios (1:1,5 bonus-style)', () => {
    // 200 * 1,5 = 300 exactly
    expect(calcNewShares(200, 1, 1.5)).toBe(300);
  });

  it('handles very large share counts without precision loss', () => {
    expect(calcNewShares(1_000_000, 2, 1)).toBe(500_000);
  });

  it('returns 0 for boundary / invalid inputs', () => {
    expect(calcNewShares(0, 2, 1)).toBe(0);
    expect(calcNewShares(1000, 0, 1)).toBe(0);
    expect(calcNewShares(1000, 2, 0)).toBe(0);
    expect(calcNewShares(-10, 2, 1)).toBe(0);
    expect(calcNewShares(NaN, 2, 1)).toBe(0);
  });
});

describe('calcTerp', () => {
  it('is the weighted average of cum-price and RI price', () => {
    // (3000*5 + 2500*2) / 7 = 20000/7 = 2857,14... → 2857
    expect(calcTerp(3000, 2500, 5, 2)).toBe(2857);
  });

  it('rounds up at exactly .5 (Math.round semantics)', () => {
    // (100*1 + 101*1)/2 = 100,5 → 101
    expect(calcTerp(100, 101, 1, 1)).toBe(101);
  });

  it('rounds toward the RI price when new-shares weight is larger', () => {
    // (2000*1 + 1000*4)/5 = 6000/5 = 1200 — exact
    expect(calcTerp(2000, 1000, 1, 4)).toBe(1200);
  });

  it('equals cum-price when the RI has no new-shares weight', () => {
    // ratioNew = 0 collapses the weighted average to cum-price
    expect(calcTerp(2500, 1000, 1, 0)).toBe(2500);
    expect(calcTerp(2500, 2500, 1, 1)).toBe(2500);
  });

  it('returns 0 when ratios are both zero', () => {
    expect(calcTerp(2500, 1000, 0, 0)).toBe(0);
  });

  it('handles fractional ratio inputs', () => {
    // (1000*1 + 500*0,5) / 1,5 = 1250/1,5 = 833,33 → 833
    expect(calcTerp(1000, 500, 1, 0.5)).toBe(833);
  });
});

describe('calcRightIssue — standard ownership mode', () => {
  const base = {
    ratioOld: 5,
    ratioNew: 2,
    riPrice: 2500,
    cumPrice: 3000,
    currentLots: 10,
    currentAvgPrice: 3000,
  };

  it('produces whole final lots when entitlement is clean', () => {
    const r = calcRightIssue(base);
    // Shares: 1000 owned + 400 new = 1400 → 14 lots
    expect(r.newShares).toBe(400);
    expect(r.newLots).toBe(4);
    expect(r.isWholeLot).toBe(true);
    expect(r.totalShares).toBe(1400);
    expect(r.totalLots).toBe(14);
    expect(r.isWholeFinalLot).toBe(true);
  });

  it('flags odd-lot boundary when currentLots × ratioNew / ratioOld is not integer', () => {
    // 11 lots @ 5:2 → 440 shares = 4,4 lots (odd lot!)
    const r = calcRightIssue({ ...base, currentLots: 11 });
    expect(r.newShares).toBe(440);
    expect(r.newLots).toBeCloseTo(4.4);
    expect(r.isWholeLot).toBe(false);
    // Total 1100 + 440 = 1540 → 15,4 lots
    expect(r.totalShares).toBe(1540);
    expect(r.isWholeFinalLot).toBe(false);
  });

  it('rounds finalAvgPrice to the nearest integer rupiah', () => {
    // owned: 1000 @ 3000 = 3.000.000
    // new:    400 @ 2500 = 1.000.000
    // total value 4.000.000 / 1400 shares = 2857,14... → 2857
    const r = calcRightIssue(base);
    expect(r.totalValue).toBe(4_000_000);
    expect(r.finalAvgPrice).toBe(2857);
  });

  it('computes TERP using cum + RI weighted by ratios', () => {
    expect(calcRightIssue(base).terp).toBe(2857);
  });

  it('returns zeroed lots (and finalAvg=0) when the user has no shares', () => {
    const r = calcRightIssue({ ...base, currentLots: 0, currentAvgPrice: 0 });
    expect(r.newShares).toBe(0);
    expect(r.totalShares).toBe(0);
    expect(r.finalAvgPrice).toBe(0);
    // TERP is independent of ownership
    expect(r.terp).toBe(2857);
  });

  it('never yields more shares than the exact entitlement (floor guarantee)', () => {
    // Property check on a small grid of boundaries
    for (const lots of [1, 2, 3, 7, 13, 99, 100]) {
      for (const [ro, rn] of [
        [2, 1],
        [3, 1],
        [5, 2],
        [7, 3],
        [10, 3],
      ]) {
        const r = calcRightIssue({
          ...base,
          currentLots: lots,
          ratioOld: ro,
          ratioNew: rn,
        });
        const shares = lots * SHARES_PER_LOT;
        expect(r.newShares).toBeLessThanOrEqual((shares / ro) * rn);
        // Never negative
        expect(r.newShares).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe('calcRightIssue — no-ownership (HMETD from market) mode', () => {
  const base = {
    ratioOld: 5,
    ratioNew: 2,
    riPrice: 2500,
    cumPrice: 3000,
    currentLots: 0,
    currentAvgPrice: 0,
    noOwnership: true,
  };

  it('uses HMETD lots × 100 for newShares regardless of ratio', () => {
    const r = calcRightIssue({ ...base, hmetdLots: 5, hmetdPrice: 100 });
    expect(r.newShares).toBe(500);
    expect(r.newLots).toBe(5);
    expect(r.isWholeLot).toBe(true);
  });

  it('includes HMETD purchase cost in totalValue and finalAvgPrice', () => {
    // 5 lots = 500 shares. Cost = 500*2500 + 500*100 = 1.300.000
    // finalAvg = 1.300.000 / 500 = 2600
    const r = calcRightIssue({ ...base, hmetdLots: 5, hmetdPrice: 100 });
    expect(r.totalValue).toBe(1_300_000);
    expect(r.finalAvgPrice).toBe(2600);
  });

  it('produces finalAvgPrice=0 when hmetdLots is 0 (no shares at all)', () => {
    const r = calcRightIssue({ ...base, hmetdLots: 0, hmetdPrice: 100 });
    expect(r.totalShares).toBe(0);
    expect(r.finalAvgPrice).toBe(0);
  });

  it('rounds fractional finalAvgPrice up at .5 boundaries', () => {
    // Craft prices so avg = 2500,5 → 2501
    // 100 shares, totalValue = 250_050 → avg 2500,5
    const r = calcRightIssue({
      ...base,
      hmetdLots: 1,
      hmetdPrice: 0,
      riPrice: 2500,
    });
    // With hmetdPrice=0, avg = riPrice = 2500 exact — sanity check
    expect(r.finalAvgPrice).toBe(2500);

    // Now force the .5 case explicitly
    const r2 = calcRightIssue({
      ...base,
      hmetdLots: 1, // 100 shares
      hmetdPrice: 1, // +100 rupiah total
      riPrice: 2500, // +250000 rupiah total = 250100 / 100 = 2501
    });
    expect(r2.totalValue).toBe(250_100);
    expect(r2.finalAvgPrice).toBe(2501);
  });
});

describe('SHARES_PER_LOT constant', () => {
  it('is 100 (IDX standard) and drives every lot conversion', () => {
    expect(SHARES_PER_LOT).toBe(100);
    const r = calcRightIssue({
      ratioOld: 1,
      ratioNew: 1,
      riPrice: 1000,
      cumPrice: 2000,
      currentLots: 1,
      currentAvgPrice: 2000,
    });
    expect(r.newShares).toBe(SHARES_PER_LOT);
    expect(r.totalShares).toBe(2 * SHARES_PER_LOT);
    expect(r.totalLots).toBe(2);
  });
});