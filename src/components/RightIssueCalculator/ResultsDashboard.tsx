import React from 'react';
import { TrendingUp, Layers, DollarSign, BarChart3, ArrowDown, ArrowUp, CheckCircle2, AlertTriangle } from 'lucide-react';
import StatCard from './StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';

interface ResultsDashboardProps {
  isCalculated: boolean;
  isLoading?: boolean;
  finalAvgPrice: string;
  theoreticalPrice: string;
  finalLots: string;
  finalTotalValue: string;
  newLotsCount: string;
  newTotalValue: string;
  recommendation: 'positive' | 'negative' | null;
  recommendationText: string;
}

const ResultsSkeleton: React.FC = () => (
  <div className="space-y-3 animate-fade-in motion-reduce:animate-none" aria-busy="true" aria-live="polite">
    {/* Hero skeleton */}
    <div className="rounded-2xl border border-border/50 bg-card p-4 space-y-3">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-3 w-24" />
    </div>
    {/* Stat grid skeleton */}
    <div className="grid grid-cols-2 gap-2">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-border/50 border-l-[3px] border-l-muted p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3.5 w-3.5 rounded-full" />
            <Skeleton className="h-2.5 w-16" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
    {/* Recommendation skeleton */}
    <div className="rounded-xl border border-border/50 p-3.5 space-y-2">
      <div className="flex items-start gap-2.5">
        <Skeleton className="h-5 w-5 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    </div>
  </div>
);

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  isCalculated,
  isLoading = false,
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

  if (isLoading) return <ResultsSkeleton />;
  if (!isCalculated) return null;

  // Parse numeric values for comparison
  const avgNum = parseInt(finalAvgPrice.replace(/[^\d]/g, '')) || 0;
  const terpNum = parseInt(theoreticalPrice.replace(/[^\d]/g, '')) || 0;
  const isBelow = avgNum < terpNum;
  const diffPercent = avgNum > 0 ? (((terpNum - avgNum) / avgNum) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-2.5 animate-fade-in motion-reduce:animate-none" aria-live="polite">
      {/* Prominent Decision Banner — clear go/no-go at a glance */}
      {recommendation && (
        <div
          className={`relative overflow-hidden rounded-2xl p-3.5 border-2 animate-fade-in ${
            recommendation === 'positive'
              ? 'bg-gradient-to-br from-[hsl(142_76%_92%)] to-[hsl(142_76%_96%)] border-[hsl(var(--success))]/40 dark:from-[hsl(142_76%_14%)] dark:to-[hsl(142_76%_10%)]'
              : 'bg-gradient-to-br from-[hsl(38_92%_92%)] to-[hsl(38_92%_96%)] border-[hsl(var(--warning))]/40 dark:from-[hsl(38_92%_14%)] dark:to-[hsl(38_92%_10%)]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                recommendation === 'positive'
                  ? 'bg-[hsl(var(--success))]/20'
                  : 'bg-[hsl(var(--warning))]/20'
              }`}
            >
              {recommendation === 'positive' ? (
                <CheckCircle2 className="w-6 h-6 text-[hsl(var(--success))]" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-[hsl(var(--warning))]" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                {language === 'id' ? 'Rekomendasi' : 'Recommendation'}
              </p>
              <p className="text-base md:text-lg font-black text-foreground leading-tight">
                {recommendation === 'positive'
                  ? (language === 'id' ? 'Tebus berpotensi menguntungkan' : 'Exercise potentially profitable')
                  : (language === 'id' ? 'Pertimbangkan alternatif' : 'Consider alternatives')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Metric */}
      <div data-tour="terp" className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-primary/5 p-3.5">
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
      <div className="grid grid-cols-2 gap-2 md:gap-3">
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
                  ? (language === 'id' ? 'Menebus RI Berpotensi Menguntungkan' : 'Exercising RI Potentially Profitable')
                  : (language === 'id' ? 'Pertimbangkan Alternatif Lain' : 'Consider Other Alternatives')}
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
