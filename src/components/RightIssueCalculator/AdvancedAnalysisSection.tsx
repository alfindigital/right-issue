import React from 'react';
import { BarChart3, Calculator, LineChart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HMETDCalculator from './HMETDCalculator';
import BreakEvenROICalculator from './BreakEvenROICalculator';
import AnalysisCharts from './AnalysisCharts';

interface AdvancedAnalysisSectionProps {
  isCalculated: boolean;
  cumPrice: number;
  riPrice: number;
  ratioOld: number;
  ratioNew: number;
  newSharesCount: number;
  totalModal: number;
  totalShares: number;
  avgBaru: number;
  terp: number;
}

const AdvancedAnalysisSection: React.FC<AdvancedAnalysisSectionProps> = ({
  isCalculated,
  cumPrice,
  riPrice,
  ratioOld,
  ratioNew,
  newSharesCount,
  totalModal,
  totalShares,
  avgBaru,
  terp,
}) => {
  if (!isCalculated) {
    return null;
  }

  // Calculate HMETD value for charts (menggunakan rumus standar)
  const hmetdValue = Math.max(0, (cumPrice - riPrice) / ((ratioOld / ratioNew) + 1));
  const sellHmetdProfit = newSharesCount * hmetdValue;
  const exercisePotentialGain = newSharesCount * (terp - riPrice);
  const breakEven = avgBaru; // Break-even = avg baru (totalModal / totalShares = avgBaru)

  return (
    <div className="card-calculator animate-slide-up overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold">Analisis Lanjutan</h3>
      </div>

      <Tabs defaultValue="hmetd" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-3 p-1 bg-muted/60 rounded-xl">
          <TabsTrigger value="hmetd" className="text-xs gap-1">
            <Calculator className="w-3 h-3" />
            <span className="hidden sm:inline">HMETD</span>
            <span className="sm:hidden">💰</span>
          </TabsTrigger>
          <TabsTrigger value="roi" className="text-xs gap-1">
            <LineChart className="w-3 h-3" />
            <span className="hidden sm:inline">ROI</span>
            <span className="sm:hidden">📈</span>
          </TabsTrigger>
          <TabsTrigger value="chart" className="text-xs gap-1">
            <BarChart3 className="w-3 h-3" />
            <span className="hidden sm:inline">Grafik</span>
            <span className="sm:hidden">📊</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hmetd" className="mt-0">
          <HMETDCalculator
            cumPrice={cumPrice}
            riPrice={riPrice}
            ratioOld={ratioOld}
            ratioNew={ratioNew}
            newSharesCount={newSharesCount}
          />
        </TabsContent>

        <TabsContent value="roi" className="mt-0">
          <BreakEvenROICalculator
            totalModal={totalModal}
            totalShares={totalShares}
            avgBaru={avgBaru}
            terp={terp}
          />
        </TabsContent>

        <TabsContent value="chart" className="mt-0">
          <AnalysisCharts
            cumPrice={cumPrice}
            riPrice={riPrice}
            terp={terp}
            avgBaru={avgBaru}
            breakEven={breakEven}
            sellHmetdValue={sellHmetdProfit}
            exerciseGain={exercisePotentialGain}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalysisSection;
