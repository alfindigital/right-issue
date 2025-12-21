import React from 'react';
import { Target, TrendingUp, Percent, Calculator } from 'lucide-react';

interface BreakEvenROICalculatorProps {
  totalModal: number; // current value + RI cost
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
  // Break-Even Price = Total Modal / Total Shares
  const breakEvenPrice = totalShares > 0 ? totalModal / totalShares : 0;
  
  // ROI jika harga = TERP
  const roiAtTerp = avgBaru > 0 ? ((terp - avgBaru) / avgBaru) * 100 : 0;
  
  // Target harga untuk ROI tertentu
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
      <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-muted-foreground">BREAK-EVEN PRICE</span>
        </div>
        <p className="text-2xl font-bold text-primary">{formatCurrency(breakEvenPrice)}</p>
        <p className="text-xs text-muted-foreground mt-1">Harga minimal agar tidak rugi</p>
      </div>

      {/* ROI & Target Cards */}
      <div className="grid grid-cols-2 gap-2">
        {/* ROI @ TERP */}
        <div className="p-3 bg-card rounded-lg border border-border">
          <div className="flex items-center gap-1.5 mb-1">
            <Percent className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">ROI @ TERP</span>
          </div>
          <p className={`text-lg font-bold ${getRoiColor(roiAtTerp)}`}>
            {roiAtTerp >= 0 ? '+' : ''}{roiAtTerp.toFixed(1)}%
          </p>
        </div>

        {/* TERP Reminder */}
        <div className="p-3 bg-card rounded-lg border border-border">
          <div className="flex items-center gap-1.5 mb-1">
            <Calculator className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Harga TERP</span>
          </div>
          <p className="text-lg font-bold">{formatCurrency(terp)}</p>
        </div>

        {/* Target +10% */}
        <div className="p-3 bg-card rounded-lg border border-border">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-green-600" />
            <span className="text-[10px] text-muted-foreground">Target +10%</span>
          </div>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(targetFor10)}</p>
        </div>

        {/* Target +20% */}
        <div className="p-3 bg-card rounded-lg border border-border">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-green-600" />
            <span className="text-[10px] text-muted-foreground">Target +20%</span>
          </div>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(targetFor20)}</p>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="p-2.5 bg-muted/50 rounded-lg text-center">
        <p className="text-xs text-muted-foreground">
          Jual di <span className="font-semibold text-foreground">{formatCurrency(terp)}</span> → profit{' '}
          <span className={`font-semibold ${getRoiColor(roiAtTerp)}`}>
            {roiAtTerp >= 0 ? '+' : ''}{roiAtTerp.toFixed(1)}%
          </span>
        </p>
      </div>
    </div>
  );
};

export default BreakEvenROICalculator;
