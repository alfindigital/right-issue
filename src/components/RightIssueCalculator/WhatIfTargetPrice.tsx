import React, { useState, useMemo } from 'react';
import { Target, Plus, X, TrendingUp, TrendingDown, ArrowRightLeft, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';
import InfoTooltip from './InfoTooltip';
import { useLanguage } from '@/contexts/LanguageContext';

interface WhatIfTargetPriceProps {
  isCalculated: boolean;
  currentShares: number;
  newSharesCount: number;
  currentAvgPrice: number;
  riPrice: number;
  cumPrice: number;
  terp: number;
}

const formatCurrency = (value: number): string =>
  `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;

const formatPercent = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

const WhatIfTargetPrice = React.forwardRef<HTMLDivElement, WhatIfTargetPriceProps>(({
  isCalculated,
  currentShares,
  newSharesCount,
  currentAvgPrice,
  riPrice,
  cumPrice,
  terp,
}, ref) => {
  const { language } = useLanguage();
  const [targets, setTargets] = useState<string[]>(['']);

  const addTarget = () => {
    if (targets.length < 5) setTargets([...targets, '']);
  };

  const removeTarget = (idx: number) => {
    if (targets.length > 1) setTargets(targets.filter((_, i) => i !== idx));
  };

  const updateTarget = (idx: number, val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    const next = [...targets];
    next[idx] = cleaned;
    setTargets(next);
  };

  const scenarios = useMemo(() => {
    if (!isCalculated || currentShares <= 0) return [];

    const validTargets = targets
      .map((t) => parseInt(t))
      .filter((t) => t > 0);

    if (validTargets.length === 0) return [];

    const initialInvestment = currentShares * currentAvgPrice;
    const exerciseCost = newSharesCount * riPrice;
    const totalSharesAfterRI = currentShares + newSharesCount;
    const newAvg = totalSharesAfterRI > 0
      ? Math.round((initialInvestment + exerciseCost) / totalSharesAfterRI)
      : 0;

    return validTargets.map((sellPrice) => {
      // Scenario A: Ikut RI (full exercise) lalu jual di target
      const valueIfExercise = totalSharesAfterRI * sellPrice;
      const costIfExercise = initialInvestment + exerciseCost;
      const plExercise = valueIfExercise - costIfExercise;
      const roiExercise = costIfExercise > 0 ? (plExercise / costIfExercise) * 100 : 0;

      // Scenario B: Tidak ikut RI, jual di target
      const valueIfSkip = currentShares * sellPrice;
      const costIfSkip = initialInvestment;
      const plSkip = valueIfSkip - costIfSkip;
      const roiSkip = costIfSkip > 0 ? (plSkip / costIfSkip) * 100 : 0;

      // Difference
      const plDifference = plExercise - plSkip;

      return {
        sellPrice,
        exercise: { value: valueIfExercise, cost: costIfExercise, pl: plExercise, roi: roiExercise, shares: totalSharesAfterRI },
        skip: { value: valueIfSkip, cost: costIfSkip, pl: plSkip, roi: roiSkip, shares: currentShares },
        plDifference,
        newAvg,
        betterOption: plExercise >= plSkip ? 'exercise' : 'skip',
      };
    });
  }, [isCalculated, targets, currentShares, newSharesCount, currentAvgPrice, riPrice]);

  if (!isCalculated) return null;

  return (
    <section className="card-calculator animate-fade-in" style={{ animationDelay: '0.35s' }}>
      <h2 className="section-title flex items-center">
        <Target className="w-4 h-4 mr-1.5 text-primary" />
        {language === 'id' ? 'What-If Target Harga' : 'What-If Target Price'}
        <InfoTooltip
          text={
            language === 'id'
              ? 'Masukkan target harga jual, lalu bandingkan profit/loss jika ikut RI vs tidak ikut RI.'
              : 'Enter sell price targets and compare profit/loss for exercising RI vs skipping RI.'
          }
        />
      </h2>

      {/* Target Price Inputs */}
      <div className="space-y-2 mb-4">
        <label className="text-xs font-medium text-foreground">
          {language === 'id' ? 'Target Harga Jual' : 'Sell Price Targets'}
        </label>
        {targets.map((val, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={val ? new Intl.NumberFormat('id-ID').format(parseInt(val)) : ''}
                onChange={(e) => updateTarget(idx, e.target.value)}
                placeholder={language === 'id' ? `Target ${idx + 1}` : `Target ${idx + 1}`}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            {targets.length > 1 && (
              <button
                onClick={() => removeTarget(idx)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
        {targets.length < 5 && (
          <button
            onClick={addTarget}
            className="flex items-center gap-1 text-xs text-primary font-medium hover:text-primary/80 transition-colors px-1 py-0.5"
          >
            <Plus className="w-3 h-3" />
            {language === 'id' ? 'Tambah target' : 'Add target'}
          </button>
        )}
      </div>

      {/* Reference Prices */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { label: 'TERP', value: terp },
          { label: language === 'id' ? 'Avg Lama' : 'Old Avg', value: currentAvgPrice },
          { label: language === 'id' ? 'Harga RI' : 'RI Price', value: riPrice },
          { label: 'Cum Price', value: cumPrice },
        ].map((ref) => (
          <div key={ref.label} className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 text-[10px]">
            <span className="text-muted-foreground">{ref.label}:</span>
            <span className="font-semibold text-foreground">{formatCurrency(ref.value)}</span>
          </div>
        ))}
      </div>

      {/* Results Table */}
      {scenarios.length > 0 && (
        <div className="space-y-3">
          {scenarios.map((s, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border bg-card overflow-hidden animate-fade-in"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b border-border">
                <div className="flex items-center gap-1.5">
                  <Target className="w-3 h-3 text-primary" />
                  <span className="text-xs font-bold text-foreground">
                    {formatCurrency(s.sellPrice)}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    s.betterOption === 'exercise'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    {s.betterOption === 'exercise' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                    {s.betterOption === 'exercise'
                      ? language === 'id' ? 'Ikut RI lebih baik' : 'Exercise is better'
                      : language === 'id' ? 'Skip RI lebih baik' : 'Skipping is better'}
                  </span>
                </span>
              </div>

              {/* Comparison Grid */}
              <div className="grid grid-cols-2 divide-x divide-border">
                {/* Exercise Column */}
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-1 mb-2">
                    <TrendingUp className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">
                      {language === 'id' ? 'Ikut RI' : 'Exercise RI'}
                    </span>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground">{language === 'id' ? 'Saham' : 'Shares'}</p>
                    <p className="text-xs font-medium text-foreground">
                      {new Intl.NumberFormat('id-ID').format(s.exercise.shares)} 
                      <span className="text-muted-foreground"> ({(s.exercise.shares / 100).toLocaleString('id-ID')} lot)</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground">{language === 'id' ? 'Total Modal' : 'Total Cost'}</p>
                    <p className="text-xs font-medium text-foreground">{formatCurrency(s.exercise.cost)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground">{language === 'id' ? 'Nilai Jual' : 'Sell Value'}</p>
                    <p className="text-xs font-medium text-foreground">{formatCurrency(s.exercise.value)}</p>
                  </div>
                  <div className="pt-1 border-t border-border">
                    <p className="text-[9px] text-muted-foreground">P/L</p>
                    <p className={`text-sm font-bold ${s.exercise.pl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {s.exercise.pl >= 0 ? '+' : ''}{formatCurrency(s.exercise.pl)}
                    </p>
                    <p className={`text-[10px] font-semibold ${s.exercise.roi >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      ROI: {formatPercent(s.exercise.roi)}
                    </p>
                  </div>
                </div>

                {/* Skip Column */}
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-1 mb-2">
                    <TrendingDown className="w-3 h-3 text-amber-500" />
                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                      {language === 'id' ? 'Tidak Ikut' : 'Skip RI'}
                    </span>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground">{language === 'id' ? 'Saham' : 'Shares'}</p>
                    <p className="text-xs font-medium text-foreground">
                      {new Intl.NumberFormat('id-ID').format(s.skip.shares)}
                      <span className="text-muted-foreground"> ({(s.skip.shares / 100).toLocaleString('id-ID')} lot)</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground">{language === 'id' ? 'Total Modal' : 'Total Cost'}</p>
                    <p className="text-xs font-medium text-foreground">{formatCurrency(s.skip.cost)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground">{language === 'id' ? 'Nilai Jual' : 'Sell Value'}</p>
                    <p className="text-xs font-medium text-foreground">{formatCurrency(s.skip.value)}</p>
                  </div>
                  <div className="pt-1 border-t border-border">
                    <p className="text-[9px] text-muted-foreground">P/L</p>
                    <p className={`text-sm font-bold ${s.skip.pl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {s.skip.pl >= 0 ? '+' : ''}{formatCurrency(s.skip.pl)}
                    </p>
                    <p className={`text-[10px] font-semibold ${s.skip.roi >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      ROI: {formatPercent(s.skip.roi)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Difference Footer */}
              <div className="px-3 py-2 bg-muted/20 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <ArrowRightLeft className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">
                    {language === 'id' ? 'Selisih P/L' : 'P/L Difference'}
                  </span>
                </div>
                <span className={`text-xs font-bold ${s.plDifference >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {s.plDifference >= 0 ? '+' : ''}{formatCurrency(Math.abs(s.plDifference))}
                  <span className="text-[9px] font-normal text-muted-foreground ml-1">
                    {s.betterOption === 'exercise'
                      ? language === 'id' ? 'untung ikut RI' : 'gain from RI'
                      : language === 'id' ? 'rugi ikut RI' : 'loss from RI'}
                  </span>
                </span>
              </div>
            </div>
          ))}

          {/* Summary Insight */}
          {scenarios.length > 1 && (
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/10">
              <p className="text-[11px] text-foreground leading-relaxed flex items-start gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>
                  {language === 'id'
                    ? `Avg baru jika ikut RI: ${formatCurrency(scenarios[0].newAvg)}. Harga jual di atas avg baru akan menghasilkan profit untuk skenario ikut RI.`
                    : `New avg if exercising RI: ${formatCurrency(scenarios[0].newAvg)}. Selling above the new avg will generate profit for the exercise scenario.`}
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {scenarios.length === 0 && (
        <div className="text-center py-6">
          <Target className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">
            {language === 'id'
              ? 'Masukkan target harga jual untuk melihat perbandingan'
              : 'Enter sell price targets to see comparison'}
          </p>
        </div>
      )}
    </section>
  );
});

WhatIfTargetPrice.displayName = 'WhatIfTargetPrice';

export default WhatIfTargetPrice;
