import { useMemo } from 'react';
import { parseDecimalId } from '@/lib/parseDecimal';
import { useLanguage } from '@/contexts/LanguageContext';

// Sane upper bounds — protect against typos like 999999999999.
// IDX rarely sees prices above Rp 1jt/lembar or lots above 10jt for retail.
const MAX_PRICE = 10_000_000; // Rp 10 juta per lembar
const MAX_LOTS = 100_000_000; // 100 juta lot
const MAX_RATIO = 1_000_000;

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
    ): string | undefined => {
      if (!raw) return undefined; // empty: handled by enable-button logic
      const n = parseInt(raw) || 0;
      if (n <= 0) return t(`${labelId} harus lebih dari 0`, `${labelEn} must be greater than 0`);
      if (n > MAX_PRICE) {
        return t(
          `${labelId} tidak realistis (maks Rp ${MAX_PRICE.toLocaleString('id-ID')})`,
          `${labelEn} is unrealistic (max Rp ${MAX_PRICE.toLocaleString('id-ID')})`,
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
      if (requireAtLeastOne && n <= 0) {
        return t(`${labelId} minimal 1 lot`, `${labelEn} must be at least 1 lot`);
      }
      if (n > MAX_LOTS) {
        return t(
          `${labelId} tidak realistis (maks ${MAX_LOTS.toLocaleString('id-ID')} lot)`,
          `${labelEn} is unrealistic (max ${MAX_LOTS.toLocaleString('id-ID')} lots)`,
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
      if (n <= 0) return t(`${labelId} harus lebih dari 0`, `${labelEn} must be greater than 0`);
      if (n > MAX_RATIO) {
        return t(`${labelId} tidak realistis`, `${labelEn} is unrealistic`);
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
      // HMETD price can be 0 (free), but cap upper bound
      if (inputs.hmetdPrice) {
        const n = parseInt(inputs.hmetdPrice) || 0;
        if (n < 0) errors.hmetdPrice = t('Harga HMETD tidak boleh negatif', 'HMETD price cannot be negative');
        else if (n > MAX_PRICE) {
          errors.hmetdPrice = t(
            `Harga HMETD tidak realistis (maks Rp ${MAX_PRICE.toLocaleString('id-ID')})`,
            `HMETD price is unrealistic (max Rp ${MAX_PRICE.toLocaleString('id-ID')})`,
          );
        }
      }
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