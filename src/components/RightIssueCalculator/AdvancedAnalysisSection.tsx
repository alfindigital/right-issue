import React from 'react';
import { BarChart3 } from 'lucide-react';
import AnalysisCharts from './AnalysisCharts';
import { useLanguage } from '@/contexts/LanguageContext';

interface AdvancedAnalysisSectionProps {
  isCalculated: boolean;
  cumPrice: number;
  riPrice: number;
  ratioOld: number;
  ratioNew: number;
  newSharesCount: number;
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
  avgBaru,
  terp,
}) => {
  const { t } = useLanguage();

  if (!isCalculated) {
    return null;
  }

  // Calculate values for charts
  const hmetdValue = Math.max(0, (cumPrice - riPrice) / ((ratioOld / ratioNew) + 1));
  const sellHmetdProfit = newSharesCount * hmetdValue;
  const exercisePotentialGain = newSharesCount * (terp - riPrice);
  const breakEven = avgBaru;

  return (
    <div className="card-calculator animate-slide-up overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold">{t('charts.title')}</h3>
      </div>

      <AnalysisCharts
        cumPrice={cumPrice}
        riPrice={riPrice}
        terp={terp}
        avgBaru={avgBaru}
        breakEven={breakEven}
        sellHmetdValue={sellHmetdProfit}
        exerciseGain={exercisePotentialGain}
      />
    </div>
  );
};

export default AdvancedAnalysisSection;
