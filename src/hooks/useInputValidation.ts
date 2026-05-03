import { useMemo } from 'react';
import { parseDecimalId } from '@/lib/parseDecimal';
import { useLanguage } from '@/contexts/LanguageContext';

// Realistic IDX retail ranges — protect against typos and extreme values.
// Sources: IDX min price Rp 1, retail caps based on common usage.
const MIN_PRICE = 1;            // IDX minimum tick price
const MAX_PRICE = 1_000_000;    // Rp 1 juta/lembar (very few IDX stocks exceed this)
const SOFT_PRICE_WARN = 100_000; // above this is unusual for retail
const MIN_LOTS = 1;
const MAX_LOTS = 1_000_000;     // 1 juta lot = 100 juta lembar (cap retail)
const MIN_RATIO = 1;
const MAX_RATIO = 1_000;        // RI ratios rarely exceed 100:1

export interface ValidationErrors {
  ratioOld?: string;
  ratioNew?: string;
  rightPrice?: string;
  cumDatePrice?: string;
  currentLots?: string;
  currentAvgPrice?: string;
  hmetdLots?: string;
  hmetdPrice?: string;
  warrantRatioOld?: string;
  warrantRatioNew?: string;
  // Cross-field warnings (non-blocking)
  priceWarning?: string;
}

export interface ValidationInputs {
  ratioOld: string;
  ratioNew: string;
  rightPrice: string;
  cumDatePrice: string;
  currentLots: string;
  currentAvgPrice: string;
  noOwnership: boolean;
  hmetdLots: string;
  hmetdPrice: string;
  hasWarrant: boolean;
  warrantRatioOld: string;
  warrantRatioNew: string;
}

export const useInputValidation = (inputs: ValidationInputs) => {
  const { language } = useLanguage();

  return useMemo(() => {
    const errors: ValidationErrors = {};
    const warnings: ValidationErrors = {};
    const t = (id: string, en: string) => (language === 'id' ? id : en);

    // Helpers
    const checkPrice = (
      raw: string,
      fieldId: string,
      labelId: string,
      labelEn: string,
      allowZero = false,
    ): string | undefined => {
      if (!raw) return undefined; // empty: handled by enable-button logic
      const n = parseInt(raw) || 0;
      if (n < 0) {
        return t(
          `${labelId} tidak boleh negatif — harga saham selalu positif.`,
          `${labelEn} cannot be negative — share prices are always positive.`,
        );
      }
      if (!allowZero && n === 0) {
        return t(
          `${labelId} harus > 0 — harga 0 tidak mungkin di pasar saham.`,
          `${labelEn} must be > 0 — a price of 0 is impossible on the market.`,
        );
      }
      if (n > 0 && n < MIN_PRICE) {
        return t(
          `${labelId} minimal Rp ${MIN_PRICE} (tick terkecil IDX).`,
          `${labelEn} must be at least Rp ${MIN_PRICE} (IDX min tick).`,
        );
      }
      if (n > MAX_PRICE) {
        return t(
          `${labelId} di atas Rp ${MAX_PRICE.toLocaleString('id-ID')} sangat tidak realistis untuk saham IDX. Cek lagi jumlah nol.`,
          `${labelEn} above Rp ${MAX_PRICE.toLocaleString('id-ID')} is unrealistic for IDX stocks. Recheck the zeros.`,
        );
      }
      return undefined;
    };

    const checkLots = (
      raw: string,
      labelId: string,
      labelEn: string,
      requireAtLeastOne = true,
    ): string | undefined => {
      if (!raw) return undefined;
      const n = parseInt(raw) || 0;
      if (n < 0) {
        return t(
          `${labelId} tidak boleh negatif — lot saham selalu ≥ 0.`,
          `${labelEn} cannot be negative — lot count is always ≥ 0.`,
        );
      }
      if (requireAtLeastOne && n < MIN_LOTS) {
        return t(
          `${labelId} minimal ${MIN_LOTS} lot — tidak ada transaksi 0 lot.`,
          `${labelEn} must be at least ${MIN_LOTS} lot — no 0-lot transactions.`,
        );
      }
      if (n > MAX_LOTS) {
        return t(
          `${labelId} di atas ${MAX_LOTS.toLocaleString('id-ID')} lot tidak wajar untuk investor retail. Cek lagi jumlah nol.`,
          `${labelEn} above ${MAX_LOTS.toLocaleString('id-ID')} lots is uncommon for retail. Recheck the zeros.`,
        );
      }
      return undefined;
    };

    const checkRatio = (
      raw: string,
      labelId: string,
      labelEn: string,
    ): string | undefined => {
      if (!raw) return undefined;
      const n = parseDecimalId(raw);
      if (n < 0) {
        return t(
          `${labelId} tidak boleh negatif — rasio selalu positif.`,
          `${labelEn} cannot be negative — ratios are always positive.`,
        );
      }
      if (n === 0) {
        return t(
          `${labelId} harus > 0 — rasio 0 berarti tidak ada hak/saham.`,
          `${labelEn} must be > 0 — a ratio of 0 means no rights/shares.`,
        );
      }
      if (n < MIN_RATIO && n > 0 && n < 1) {
        // ratios are integer-like (e.g. 4:1); fractional ratios are unusual
        return t(
          `${labelId} biasanya bilangan bulat ≥ 1 (mis. 4 atau 2).`,
          `${labelEn} is usually a whole number ≥ 1 (e.g. 4 or 2).`,
        );
      }
      if (n > MAX_RATIO) {
        return t(
          `${labelId} di atas ${MAX_RATIO} sangat tidak wajar untuk right issue. Cek penulisan rasio.`,
          `${labelEn} above ${MAX_RATIO} is highly unusual for a right issue. Recheck the ratio.`,
        );
      }
      return undefined;
    };

    // Right Issue ratios
    errors.ratioOld = checkRatio(inputs.ratioOld, 'Rasio lama', 'Old ratio');
    errors.ratioNew = checkRatio(inputs.ratioNew, 'Rasio baru', 'New ratio');

    // Prices
    errors.rightPrice = checkPrice(inputs.rightPrice, 'rightPrice', 'Harga pelaksanaan', 'Exercise price');
    errors.cumDatePrice = checkPrice(inputs.cumDatePrice, 'cumDatePrice', 'Harga cum-date', 'Cum-date price');

    // Ownership / HMETD
    if (inputs.noOwnership) {
      errors.hmetdLots = checkLots(inputs.hmetdLots, 'Lot HMETD', 'HMETD lots', true);
      // HMETD price can be 0 (illiquid HMETD often trades near 0)
      errors.hmetdPrice = checkPrice(
        inputs.hmetdPrice,
        'hmetdPrice',
        'Harga HMETD',
        'HMETD price',
        true, // allow 0
      );
    } else {
      errors.currentLots = checkLots(inputs.currentLots, 'Jumlah lot', 'Number of lots', true);
      errors.currentAvgPrice = checkPrice(
        inputs.currentAvgPrice,
        'currentAvgPrice',
        'Harga rata-rata',
        'Average price',
      );
    }

    // Warrant ratio
    if (inputs.hasWarrant) {
      errors.warrantRatioOld = checkRatio(inputs.warrantRatioOld, 'Rasio RI', 'RI ratio');
      errors.warrantRatioNew = checkRatio(inputs.warrantRatioNew, 'Rasio waran', 'Warrant ratio');
    }

    // Cross-field warning: RI price >= cum price is unusual (no theoretical gain)
    const ri = parseInt(inputs.rightPrice) || 0;
    const cum = parseInt(inputs.cumDatePrice) || 0;
    if (ri > 0 && cum > 0 && ri >= cum) {
      warnings.priceWarning = t(
        'Harga pelaksanaan ≥ harga cum-date — biasanya RI lebih murah dari harga pasar.',
        'Exercise price ≥ cum-date price — RI is usually below market price.',
      );
    }

    // Soft warning: prices above SOFT_PRICE_WARN are unusual but legal
    const softCheck = (n: number) => n > SOFT_PRICE_WARN && n <= MAX_PRICE;
    if (!warnings.priceWarning) {
      if (softCheck(ri) || softCheck(cum)) {
        warnings.priceWarning = t(
          `Harga di atas Rp ${SOFT_PRICE_WARN.toLocaleString('id-ID')}/lembar jarang di IDX. Pastikan jumlah nol benar.`,
          `Prices above Rp ${SOFT_PRICE_WARN.toLocaleString('id-ID')}/share are rare on IDX. Verify the zero count.`,
        );
      }
    }

    // Strip undefined keys for cleaner consumer
    const clean = (obj: ValidationErrors): ValidationErrors => {
      const out: ValidationErrors = {};
      (Object.keys(obj) as (keyof ValidationErrors)[]).forEach((k) => {
        if (obj[k]) out[k] = obj[k];
      });
      return out;
    };

    const cleanedErrors = clean(errors);
    const hasErrors = Object.keys(cleanedErrors).length > 0;

    return {
      errors: cleanedErrors,
      warnings: clean(warnings),
      hasErrors,
    };
  }, [
    inputs.ratioOld,
    inputs.ratioNew,
    inputs.rightPrice,
    inputs.cumDatePrice,
    inputs.currentLots,
    inputs.currentAvgPrice,
    inputs.noOwnership,
    inputs.hmetdLots,
    inputs.hmetdPrice,
    inputs.hasWarrant,
    inputs.warrantRatioOld,
    inputs.warrantRatioNew,
    language,
  ]);
};

export default useInputValidation;