import React, { useState, lazy, Suspense } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChartSkeleton } from './ChartSkeleton';
import { cn } from '@/lib/utils';

const ScenarioComparison = lazy(() => import('./ScenarioComparison'));
const WhatIfTargetPrice = lazy(() => import('./WhatIfTargetPrice'));
const BreakEvenROICalculator = lazy(() => import('./BreakEvenROICalculator'));

interface ScenarioProjectionTabsProps {
  isCalculated: boolean;
  cumPrice: number;
  riPrice: number;
  terp: number;
  ratioOld: number;
  ratioNew: number;
  currentShares: number;
  newSharesCount: number;
  currentAvgPrice: number;
  totalShares: number;
  totalModal: number;
  avgBaru: number;
}

type SubTab = 'scenario' | 'whatif' | 'breakeven';

const ScenarioProjectionTabs: React.FC<ScenarioProjectionTabsProps> = (props) => {
  const { language } = useLanguage();
  const [active, setActive] = useState<SubTab>('scenario');

  const tabs: { id: SubTab; label: string }[] = [
    { id: 'scenario', label: language === 'id' ? 'Skenario' : 'Scenarios' },
    { id: 'whatif', label: language === 'id' ? 'What-If Harga' : 'What-If Price' },
    { id: 'breakeven', label: language === 'id' ? 'Break-Even' : 'Break-Even' },
  ];

  return (
    <div className="space-y-3">
      {/* Pill sub-tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={cn(
              'flex-1 min-w-fit px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
              active === t.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Suspense fallback={<ChartSkeleton height={180} />}>
        {active === 'scenario' && (
          <ScenarioComparison
            isCalculated={props.isCalculated}
            cumPrice={props.cumPrice}
            riPrice={props.riPrice}
            terp={props.terp}
            ratioOld={props.ratioOld}
            ratioNew={props.ratioNew}
            currentShares={props.currentShares}
            newSharesCount={props.newSharesCount}
            currentAvgPrice={props.currentAvgPrice}
          />
        )}
        {active === 'whatif' && (
          <WhatIfTargetPrice
            isCalculated={props.isCalculated}
            currentShares={props.currentShares}
            newSharesCount={props.newSharesCount}
            currentAvgPrice={props.currentAvgPrice}
            riPrice={props.riPrice}
            cumPrice={props.cumPrice}
            terp={props.terp}
          />
        )}
        {active === 'breakeven' && (
          <BreakEvenROICalculator
            totalModal={props.totalModal}
            totalShares={props.totalShares}
            avgBaru={props.avgBaru}
            terp={props.terp}
          />
        )}
      </Suspense>
    </div>
  );
};

export default ScenarioProjectionTabs;
