import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import InfoTooltip from './InfoTooltip';
import { useLanguage } from '@/contexts/LanguageContext';

interface DilutionSimulatorProps {
  isCalculated: boolean;
  currentShares: number;
  newSharesEntitled: number;
  ratioOld: number;
  ratioNew: number;
}

const COLORS = {
  yourShares: 'hsl(var(--primary))',
  riShares: '#10b981',
  otherShares: 'hsl(var(--muted-foreground) / 0.3)',
};

const DilutionSimulator: React.FC<DilutionSimulatorProps> = ({
  isCalculated,
  currentShares,
  newSharesEntitled,
  ratioOld,
  ratioNew,
}) => {
  const { language } = useLanguage();

  const scenarios = useMemo(() => {
    if (!isCalculated || currentShares <= 0 || ratioOld <= 0) return null;

    // Assume a hypothetical total outstanding shares (use investor's shares as base)
    // We show relative dilution: investor's % of the "pool" they care about
    // Simple model: total old shares in market, total new shares issued
    // Since we don't know total outstanding, we show dilution ratio effect
    
    // For illustration: assume investor holds `currentShares` out of a hypothetical pool
    // The RI creates (pool / ratioOld) * ratioNew new shares total
    // We use a simplified model showing the investor's portion

    const totalOldPool = currentShares * 10; // Assume investor holds 10% of company
    const totalNewIssued = Math.floor((totalOldPool / ratioOld) * ratioNew);
    const totalAfterRI = totalOldPool + totalNewIssued;

    // Scenario 1: Full participation
    const fullParticipation = {
      label: language === 'id' ? 'Ikut Penuh' : 'Full Participation',
      yourShares: currentShares + newSharesEntitled,
      totalShares: totalAfterRI,
      pct: ((currentShares + newSharesEntitled) / totalAfterRI) * 100,
    };

    // Scenario 2: Partial (50%)
    const partialNew = Math.floor(newSharesEntitled / 2);
    const partialParticipation = {
      label: language === 'id' ? 'Ikut 50%' : '50% Participation',
      yourShares: currentShares + partialNew,
      totalShares: totalAfterRI,
      pct: ((currentShares + partialNew) / totalAfterRI) * 100,
    };

    // Scenario 3: No participation
    const noParticipation = {
      label: language === 'id' ? 'Tidak Ikut' : 'No Participation',
      yourShares: currentShares,
      totalShares: totalAfterRI,
      pct: (currentShares / totalAfterRI) * 100,
    };

    // Before RI
    const beforeRI = {
      label: language === 'id' ? 'Sebelum RI' : 'Before RI',
      yourShares: currentShares,
      totalShares: totalOldPool,
      pct: (currentShares / totalOldPool) * 100,
    };

    return { beforeRI, fullParticipation, partialParticipation, noParticipation };
  }, [isCalculated, currentShares, newSharesEntitled, ratioOld, ratioNew, language]);

  if (!isCalculated || !scenarios) {
    return null;
  }

  const allScenarios = [
    scenarios.beforeRI,
    scenarios.fullParticipation,
    scenarios.partialParticipation,
    scenarios.noParticipation,
  ];

  const getChartData = (scenario: typeof scenarios.beforeRI) => [
    { name: language === 'id' ? 'Saham Anda' : 'Your Shares', value: scenario.yourShares },
    { name: language === 'id' ? 'Saham Lain' : 'Other Shares', value: scenario.totalShares - scenario.yourShares },
  ];

  const dilutionDelta = scenarios.beforeRI.pct - scenarios.noParticipation.pct;

  return (
    <section className="card-calculator animate-fade-in" style={{ animationDelay: '0.3s' }}>
      <h2 className="section-title flex items-center">
        {language === 'id' ? 'Simulasi Dilusi Kepemilikan' : 'Ownership Dilution Simulator'}
        <InfoTooltip
          text={
            language === 'id'
              ? 'Simulasi persentase kepemilikan Anda di berbagai skenario partisipasi RI. Menggunakan asumsi Anda memiliki ~10% dari total saham beredar.'
              : 'Simulates your ownership percentage under different RI participation scenarios. Assumes you hold ~10% of total outstanding shares.'
          }
        />
      </h2>

      {/* Dilution Warning */}
      <div className="mb-4 p-2.5 rounded-xl bg-gradient-to-r from-amber-100 to-amber-50 border border-amber-200 dark:from-amber-900/30 dark:to-amber-950/20 dark:border-amber-800">
        <p className="text-xs text-foreground leading-relaxed">
          {language === 'id'
            ? `⚠️ Jika Anda tidak ikut RI, kepemilikan Anda terdilusi sebesar ~${dilutionDelta.toFixed(2)}% (dari ${scenarios.beforeRI.pct.toFixed(2)}% → ${scenarios.noParticipation.pct.toFixed(2)}%).`
            : `⚠️ If you don't participate in RI, your ownership dilutes by ~${dilutionDelta.toFixed(2)}% (from ${scenarios.beforeRI.pct.toFixed(2)}% → ${scenarios.noParticipation.pct.toFixed(2)}%).`}
        </p>
      </div>

      {/* Donut Charts Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {allScenarios.map((scenario, idx) => {
          const data = getChartData(scenario);
          const isBeforeRI = idx === 0;
          const isFull = idx === 1;

          return (
            <div
              key={scenario.label}
              className={`rounded-xl p-3 text-center border transition-all ${
                isFull
                  ? 'border-primary/40 bg-primary/5'
                  : isBeforeRI
                  ? 'border-border bg-muted/30'
                  : 'border-border bg-background'
              }`}
            >
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                {scenario.label}
              </p>
              <div className="h-[90px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={38}
                      dataKey="value"
                      strokeWidth={1}
                      stroke="hsl(var(--background))"
                      isAnimationActive={true}
                      animationBegin={idx * 150}
                      animationDuration={600}
                    >
                      <Cell fill={COLORS.yourShares} />
                      <Cell fill={COLORS.otherShares} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className={`text-lg font-bold ${isFull ? 'text-primary' : 'text-foreground'}`}>
                {scenario.pct.toFixed(2)}%
              </p>
              <p className="text-[9px] text-muted-foreground">
                {new Intl.NumberFormat('id-ID').format(scenario.yourShares)} / {new Intl.NumberFormat('id-ID').format(scenario.totalShares)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 text-[10px]">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS.yourShares }} />
          <span className="text-muted-foreground">{language === 'id' ? 'Saham Anda' : 'Your Shares'}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS.otherShares }} />
          <span className="text-muted-foreground">{language === 'id' ? 'Pemegang Lain' : 'Other Holders'}</span>
        </div>
      </div>
    </section>
  );
};

export default DilutionSimulator;
