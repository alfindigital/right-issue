import React from 'react';
import { TrendingUp, Layers, DollarSign, BarChart3, ArrowDown, ArrowUp, CheckCircle2, AlertTriangle } from 'lucide-react';
import StatCard from './StatCard';
import { useLanguage } from '@/contexts/LanguageContext';

interface ResultsDashboardProps {
  isCalculated: boolean;
  finalAvgPrice: string;
  theoreticalPrice: string;
  finalLots: string;
  finalTotalValue: string;
  newLotsCount: string;
  newTotalValue: string;
  recommendation: 'positive' | 'negative' | null;
  recommendationText: string;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  isCalculated,
  finalAvgPrice,
  theoreticalPrice,
  finalLots,
  finalTotalValue,
  newLotsCount,
  newTotalValue,
  recommendation,
  recommendationText,
}) => {
  const { language } = useLanguage();

  if (!isCalculated) return null;

  // Parse numeric values for comparison
  const avgNum = parseInt(finalAvgPrice.replace(/[^\d]/g, '')) || 0;
  const terpNum = parseInt(theoreticalPrice.replace(/[^\d]/g, '')) || 0;
  const isBelow = avgNum < terpNum;
  const diffPercent = avgNum > 0 ? (((terpNum - avgNum) / avgNum) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Hero Metric */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-primary/5 p-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            {language === 'id' ? 'Harga Rata-rata Baru' : 'New Average Price'}
          </p>
          <div className="flex items-end gap-3">
            <span className="text-2xl md:text-3xl font-black text-foreground animate-number-pop">
              {finalAvgPrice}
            </span>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mb-1 ${
              isBelow 
                ? 'bg-[hsl(142_76%_36%/0.15)] text-[hsl(var(--success))]' 
                : 'bg-[hsl(38_92%_50%/0.15)] text-[hsl(var(--warning))]'
            }`}>
              {isBelow ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
              {diffPercent}% vs TERP
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            TERP: {theoreticalPrice}
          </p>
        </div>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          icon={Layers}
          label={language === 'id' ? 'Total Lot' : 'Total Lots'}
          value={`${finalLots} lot`}
          accentColor="blue"
          animated
          delay={100}
        />
        <StatCard
          icon={DollarSign}
          label={language === 'id' ? 'Total Value' : 'Total Value'}
          value={finalTotalValue}
          accentColor="green"
          animated
          delay={200}
        />
        <StatCard
          icon={TrendingUp}
          label={language === 'id' ? 'Jatah RI' : 'RI Allocation'}
          value={`${newLotsCount} lot`}
          accentColor="amber"
          animated
          delay={300}
        />
        <StatCard
          icon={BarChart3}
          label={language === 'id' ? 'Biaya Tebus' : 'Exercise Cost'}
          value={newTotalValue}
          accentColor="purple"
          animated
          delay={400}
        />
      </div>

      {/* Recommendation Banner */}
      {recommendation && (
        <div className={`rounded-xl p-3.5 border transition-all duration-500 animate-fade-in ${
          recommendation === 'positive'
            ? 'bg-gradient-to-r from-[hsl(142_76%_96%)] to-[hsl(142_76%_98%)] border-[hsl(var(--success))]/30 dark:from-[hsl(142_76%_10%)] dark:to-[hsl(142_76%_8%)] dark:border-[hsl(var(--success))]/20'
            : 'bg-gradient-to-r from-[hsl(38_92%_96%)] to-[hsl(38_92%_98%)] border-[hsl(var(--warning))]/30 dark:from-[hsl(38_92%_10%)] dark:to-[hsl(38_92%_8%)] dark:border-[hsl(var(--warning))]/20'
        }`}>
          <div className="flex items-start gap-2.5">
            {recommendation === 'positive' ? (
              <CheckCircle2 className="w-5 h-5 text-[hsl(var(--success))] flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-[hsl(var(--warning))] flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-xs font-bold text-foreground mb-1">
                {recommendation === 'positive'
                  ? (language === 'id' ? '✅ Menebus RI Berpotensi Menguntungkan' : '✅ Exercising RI Potentially Profitable')
                  : (language === 'id' ? '⚠️ Pertimbangkan Alternatif Lain' : '⚠️ Consider Other Alternatives')}
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{recommendationText}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsDashboard;
