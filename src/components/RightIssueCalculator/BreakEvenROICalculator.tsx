import React from 'react';
import { Target, TrendingUp, Percent, Calculator } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface BreakEvenROICalculatorProps {
  totalModal: number;
  totalShares: number;
  avgBaru: number;
  terp: number;
}

const formatCurrency = (value: number): string => {
  return `Rp ${new Intl.NumberFormat('id-ID').format(Math.round(value))}`;
};

const BreakEvenROICalculator: React.FC<BreakEvenROICalculatorProps> = ({
  totalModal,
  totalShares,
  avgBaru,
  terp,
}) => {
  const { language } = useLanguage();
  
  if (totalShares === 0 || avgBaru === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground text-sm">
        {language === 'id' 
          ? 'Klik "Hitung" terlebih dahulu untuk melihat analisis ROI'
          : 'Click "Calculate" first to see ROI analysis'}
      </div>
    );
  }
  
  const breakEvenPrice = totalShares > 0 ? totalModal / totalShares : 0;
  const roiAtTerp = avgBaru > 0 ? ((terp - avgBaru) / avgBaru) * 100 : 0;
  const targetFor10 = avgBaru * 1.10;
  const targetFor20 = avgBaru * 1.20;

  const getRoiColor = (roi: number) => {
    if (roi >= 10) return 'text-green-600 dark:text-green-400';
    if (roi >= 0) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-3">
      {/* Break-Even Price - Featured */}
      <div className="stagger-item p-4 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 rounded-xl border border-primary/20 transition-all duration-300 hover:border-primary/40" style={{ animationDelay: '0ms' }}>
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-muted-foreground">
            {language === 'id' ? 'BREAK-EVEN PRICE' : 'BREAK-EVEN PRICE'}
          </span>
        </div>
        <p className="text-2xl font-bold text-primary">{formatCurrency(breakEvenPrice)}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {language === 'id' ? 'Harga minimal agar tidak rugi' : 'Minimum price to break even'}
        </p>
      </div>

      {/* ROI & Target Cards */}
      <div className="grid grid-cols-2 gap-2">
        {/* ROI @ TERP */}
        <div className="stagger-item p-3 bg-card rounded-xl border border-border transition-all duration-300 hover:border-primary/30 hover:shadow-sm" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-1.5 mb-1">
            <Percent className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">ROI @ TERP</span>
          </div>
          <p className={`text-lg font-bold ${getRoiColor(roiAtTerp)}`}>
            {roiAtTerp >= 0 ? '+' : ''}{roiAtTerp.toFixed(1)}%
          </p>
        </div>

        {/* TERP Reminder */}
        <div className="stagger-item p-3 bg-card rounded-xl border border-border transition-all duration-300 hover:border-primary/30 hover:shadow-sm" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center gap-1.5 mb-1">
            <Calculator className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">
              {language === 'id' ? 'Harga TERP' : 'TERP Price'}
            </span>
          </div>
          <p className="text-lg font-bold">{formatCurrency(terp)}</p>
        </div>

        {/* Target +10% */}
        <div className="stagger-item p-3 bg-card rounded-xl border border-border transition-all duration-300 hover:border-green-500/30 hover:shadow-sm" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-green-600" />
            <span className="text-[10px] text-muted-foreground">Target +10%</span>
          </div>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(targetFor10)}</p>
        </div>

        {/* Target +20% */}
        <div className="stagger-item p-3 bg-card rounded-xl border border-border transition-all duration-300 hover:border-green-500/30 hover:shadow-sm" style={{ animationDelay: '250ms' }}>
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-green-600" />
            <span className="text-[10px] text-muted-foreground">Target +20%</span>
          </div>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(targetFor20)}</p>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="stagger-item p-2.5 bg-muted/50 rounded-xl text-center" style={{ animationDelay: '300ms' }}>
        <p className="text-xs text-muted-foreground">
          {language === 'id' ? 'Jual di' : 'Sell at'}{' '}
          <span className="font-semibold text-foreground">{formatCurrency(terp)}</span> → profit{' '}
          <span className={`font-semibold ${getRoiColor(roiAtTerp)}`}>
            {roiAtTerp >= 0 ? '+' : ''}{roiAtTerp.toFixed(1)}%
          </span>
        </p>
      </div>
    </div>
  );
};

export default BreakEvenROICalculator;
