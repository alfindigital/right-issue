import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';

interface AnalysisChartsProps {
  cumPrice: number;
  riPrice: number;
  terp: number;
  avgBaru: number;
  breakEven: number;
  sellHmetdValue: number;
  exerciseGain: number;
}

const formatCurrencyShort = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}jt`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}rb`;
  }
  return value.toString();
};

const AnalysisCharts: React.FC<AnalysisChartsProps> = ({
  cumPrice,
  riPrice,
  terp,
  avgBaru,
  breakEven,
  sellHmetdValue,
  exerciseGain,
}) => {
  const { t, language } = useLanguage();

  // Guard against all zero/invalid values
  const hasValidPriceData = cumPrice > 0 || riPrice > 0 || terp > 0 || avgBaru > 0;
  const hasValidComparisonData = sellHmetdValue > 0 || exerciseGain > 0;

  if (!hasValidPriceData && !hasValidComparisonData) {
    return (
      <div className="text-center p-4 text-muted-foreground text-sm">
        {t('charts.noData')}
      </div>
    );
  }

  const priceData = [
    { name: 'Cum', value: cumPrice, color: '#6366f1' },
    { name: 'RI', value: riPrice, color: '#f59e0b' },
    { name: 'TERP', value: terp, color: '#3b82f6' },
    { name: 'Avg', value: avgBaru, color: '#10b981' },
    { name: 'BEP', value: breakEven, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const comparisonData = [
    { name: t('charts.sellHmetd'), value: sellHmetdValue, color: '#f59e0b' },
    { name: t('charts.exerciseRi'), value: exerciseGain, color: '#10b981' },
  ].filter(item => item.value > 0);

  const maxPrice = priceData.length > 0 ? Math.max(...priceData.map(d => d.value)) * 1.15 : 100;
  const maxComparison = comparisonData.length > 0 ? Math.max(...comparisonData.map(d => d.value)) * 1.15 : 100;

  // Currency format based on language
  const formatCurrency = (v: number) => {
    if (language === 'en') {
      if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
      if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
      return `$${v}`;
    }
    return `Rp${formatCurrencyShort(v)}`;
  };

  return (
    <div className="space-y-4">
      {/* Price Comparison Chart */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2">{t('charts.priceComparison')}</p>
        <div className="h-[140px] w-full" data-no-swipe="true">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priceData} layout="vertical" margin={{ top: 5, right: 50, left: 35, bottom: 5 }}>
              <XAxis type="number" domain={[0, maxPrice]} hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                width={35}
              />
              <Bar 
                dataKey="value" 
                radius={[0, 6, 6, 0]} 
                barSize={20}
                isAnimationActive={true}
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {priceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList 
                  dataKey="value" 
                  position="right" 
                  formatter={formatCurrency}
                  style={{ fontSize: 10, fill: 'hsl(var(--foreground))' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* HMETD vs Exercise Comparison */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2">{t('charts.hmetdVsExercise')}</p>
        <div className="h-[80px] w-full" data-no-swipe="true">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} layout="vertical" margin={{ top: 5, right: 60, left: 70, bottom: 5 }}>
              <XAxis type="number" domain={[0, maxComparison]} hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                width={70}
              />
              <Bar 
                dataKey="value" 
                radius={[0, 6, 6, 0]} 
                barSize={24}
                isAnimationActive={true}
                animationBegin={200}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {comparisonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList 
                  dataKey="value" 
                  position="right" 
                  formatter={formatCurrency}
                  style={{ fontSize: 11, fontWeight: 600, fill: 'hsl(var(--foreground))' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 justify-center text-[10px]">
        {priceData.map((item) => (
          <div key={item.name} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: item.color }} />
            <span className="text-muted-foreground">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisCharts;
