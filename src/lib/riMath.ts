/**
 * Pure math helpers for Right Issue calculations.
 *
 * Rounding / lot-size rules (must stay stable — covered by unit tests):
 *  - 1 lot = 100 shares (IDX standard, no odd lots allowed in this app).
 *  - RI allocation: newShares = floor((currentShares / ratioOld) * ratioNew).
 *    Floor guarantees the resulting shares are never more than the entitlement,
 *    but may leave a fractional lot when currentShares does not divide cleanly.
 *  - TERP is rounded to the nearest integer rupiah (Math.round, banker-free).
 *  - Final average price is rounded to the nearest integer rupiah, and is 0
 *    when there are no shares at all (avoid divide-by-zero).
 *  - In "no ownership" mode, newShares comes directly from HMETD lots × 100
 *    (already a whole-lot quantity) and the HMETD purchase price is added to
 *    the total investment.
 */

export const SHARES_PER_LOT = 100;

export interface RiInputs {
  ratioOld: number;
  ratioNew: number;
  riPrice: number;
  cumPrice: number;
  currentLots: number;
  currentAvgPrice: number;
  /** When true, ignore currentLots/avg and use hmetdLots + hmetdPrice instead. */
  noOwnership?: boolean;
  hmetdLots?: number;
  hmetdPrice?: number;
}

export interface RiOutputs {
  newShares: number;
  newLots: number;
  isWholeLot: boolean;
  totalShares: number;
  totalLots: number;
  isWholeFinalLot: boolean;
  newValue: number;
  totalValue: number;
  finalAvgPrice: number;
  terp: number;
}

/** Number of new shares granted by the right issue (floored to be safe). */
export const calcNewShares = (
  currentShares: number,
  ratioOld: number,
  ratioNew: number,
): number => {
  if (!Number.isFinite(currentShares) || currentShares <= 0) return 0;
  if (!Number.isFinite(ratioOld) || ratioOld <= 0) return 0;
  if (!Number.isFinite(ratioNew) || ratioNew <= 0) return 0;
  return Math.floor((currentShares / ratioOld) * ratioNew);
};

/** Theoretical Ex-Right Price, rounded to nearest integer rupiah. */
export const calcTerp = (
  cumPrice: number,
  riPrice: number,
  ratioOld: number,
  ratioNew: number,
): number => {
  const denom = ratioOld + ratioNew;
  if (!Number.isFinite(denom) || denom <= 0) return 0;
  const raw = (cumPrice * ratioOld + riPrice * ratioNew) / denom;
  return Math.round(raw);
};

/**
 * Compute the full right issue outcome. All monetary outputs are integers;
 * lot counts may be fractional to expose the odd-lot warning.
 */
export const calcRightIssue = (inputs: RiInputs): RiOutputs => {
  const {
    ratioOld,
    ratioNew,
    riPrice,
    cumPrice,
    currentLots,
    currentAvgPrice,
    noOwnership = false,
    hmetdLots = 0,
    hmetdPrice = 0,
  } = inputs;

  const ownedLots = noOwnership ? 0 : currentLots;
  const shares = ownedLots * SHARES_PER_LOT;
  const avgPrice = noOwnership ? 0 : currentAvgPrice;

  const newShares = noOwnership
    ? Math.max(0, hmetdLots) * SHARES_PER_LOT
    : calcNewShares(shares, ratioOld, ratioNew);

  const newLots = newShares / SHARES_PER_LOT;
  const isWholeLot = Number.isInteger(newLots);

  const newValue = newShares * riPrice;
  const totalShares = shares + newShares;
  const totalLots = totalShares / SHARES_PER_LOT;
  const isWholeFinalLot = Number.isInteger(totalLots);

  const currentValue = shares * avgPrice;
  const hmetdPurchaseCost = noOwnership ? hmetdPrice * newShares : 0;
  const totalValue = currentValue + newValue + hmetdPurchaseCost;

  const finalAvgPrice =
    totalShares > 0 ? Math.round(totalValue / totalShares) : 0;

  const terp = calcTerp(cumPrice, riPrice, ratioOld, ratioNew);

  return {
    newShares,
    newLots,
    isWholeLot,
    totalShares,
    totalLots,
    isWholeFinalLot,
    newValue,
    totalValue,
    finalAvgPrice,
    terp,
  };
};