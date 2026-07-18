import React, { Suspense, lazy } from 'react';
import { TrendingUp, PieChart, Sparkles, Target, BarChart3, Layers } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import LotOptimizationSection from './LotOptimizationSection';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';

const DilutionSimulator = lazy(() => import('./DilutionSimulator'));
const ScenarioComparison = lazy(() => import('./ScenarioComparison'));
const AdvancedAnalysisSection = lazy(() => import('./AdvancedAnalysisSection'));
const WhatIfTargetPrice = lazy(() => import('./WhatIfTargetPrice'));

const LazyFallback = () => (
  <div className="space-y-2 p-2">
    <Skeleton className="h-3 w-24" />
    <Skeleton className="h-20 w-full" />
  </div>
);

interface Props {
  isCalculated: boolean;
  ratioOld: string;
  ratioNew: string;
  currentLots: string;
  onCurrentLotsChange: (v: string) => void;
  hasWarrant: boolean;
  warrantRatioOld: string;
  warrantRatioNew: string;
  cumPrice: number;
  riPrice: number;
  currentShares: number;
  newSharesCount: number;
  totalShares: number;
  avgBaru: number;
  terp: number;
  currentAvgPrice: number;
  ratioOldNum: number;
  ratioNewNum: number;
}

const AdvancedSectionsAccordion: React.FC<Props> = ({
  isCalculated,
  ratioOld,
  ratioNew,
  currentLots,
  onCurrentLotsChange,
  hasWarrant,
  warrantRatioOld,
  warrantRatioNew,
  cumPrice,
  riPrice,
  currentShares,
  newSharesCount,
  totalShares,
  avgBaru,
  terp,
  currentAvgPrice,
  ratioOldNum,
  ratioNewNum,
}) => {
  const { language } = useLanguage();

  const items: Array<{
    id: string;
    title: string;
    icon: React.ReactNode;
    desc: string;
    content: React.ReactNode;
  }> = [
    {
      id: 'lot-opt',
      title: language === 'id' ? 'Optimasi Lot' : 'Lot Optimization',
      desc: language === 'id' ? 'Hindari odd-lot dari rasio rights' : 'Avoid odd-lots from the rights ratio',
      icon: <Layers className="w-4 h-4 text-primary" />,
      content: (
        <LotOptimizationSection
          ratioOld={ratioOld}
          ratioNew={ratioNew}
          currentLots={currentLots}
          onCurrentLotsChange={onCurrentLotsChange}
          isCalculated={isCalculated}
          hasWarrant={hasWarrant}
          warrantRatioOld={warrantRatioOld}
          warrantRatioNew={warrantRatioNew}
        />
      ),
    },
    {
      id: 'dilution',
      title: language === 'id' ? 'Simulator Dilusi' : 'Dilution Simulator',
      desc: language === 'id' ? 'Bagaimana kepemilikan Anda berubah' : 'How your ownership shifts',
      icon: <PieChart className="w-4 h-4 text-primary" />,
      content: (
        <Suspense fallback={<LazyFallback />}>
          <DilutionSimulator
            isCalculated={isCalculated}
            currentShares={currentShares}
            newSharesEntitled={newSharesCount}
            ratioOld={ratioOldNum}
            ratioNew={ratioNewNum}
          />
        </Suspense>
      ),
    },
    // ScenarioComparison lifted out of accordion — now shown as a primary output.
    {
      id: 'whatif',
      title: language === 'id' ? 'Simulasi Harga Target' : 'Target Price What-If',
      desc: language === 'id' ? 'Hitung profit/loss di harga tujuan' : 'P/L at your target price',
      icon: <Target className="w-4 h-4 text-primary" />,
      content: (
        <Suspense fallback={<LazyFallback />}>
          <WhatIfTargetPrice
            isCalculated={isCalculated}
            currentShares={currentShares}
            newSharesCount={newSharesCount}
            currentAvgPrice={currentAvgPrice}
            riPrice={riPrice}
            cumPrice={cumPrice}
            terp={terp}
          />
        </Suspense>
      ),
    },
    {
      id: 'charts',
      title: language === 'id' ? 'Grafik Analisis' : 'Analysis Charts',
      desc: language === 'id' ? 'Visualisasi harga & strategi' : 'Price & strategy visuals',
      icon: <BarChart3 className="w-4 h-4 text-primary" />,
      content: (
        <Suspense fallback={<LazyFallback />}>
          <AdvancedAnalysisSection
            isCalculated={isCalculated}
            cumPrice={cumPrice}
            riPrice={riPrice}
            ratioOld={ratioOldNum}
            ratioNew={ratioNewNum}
            newSharesCount={newSharesCount}
            totalShares={totalShares}
            avgBaru={avgBaru}
            terp={terp}
          />
        </Suspense>
      ),
    },
  ];

  return (
    <div className="card-calculator !p-0 overflow-hidden">
      <div className="flex items-center gap-2 px-3.5 pt-3 pb-2">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold">
          {language === 'id' ? 'Analisis Lanjutan' : 'Advanced Analysis'}
        </h3>
        <span className="text-[10px] text-muted-foreground ml-auto">
          {language === 'id' ? 'Klik untuk buka' : 'Tap to expand'}
        </span>
      </div>
      <Accordion type="multiple" className="px-1">
        {items.map((item) => (
          <AccordionItem
            key={item.id}
            value={item.id}
            className="border-b border-border/60 last:border-b-0"
          >
            <AccordionTrigger className="px-3 py-2.5 hover:no-underline hover:bg-muted/40 rounded-lg transition-colors">
              <div className="flex items-start gap-3 flex-1 text-left">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground">{item.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-2.5">
              {item.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default AdvancedSectionsAccordion;