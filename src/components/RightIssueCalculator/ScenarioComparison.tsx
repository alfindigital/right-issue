import React, { useMemo } from 'react';
import { Scale, TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList, ReferenceLine } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface ScenarioComparisonProps {
  isCalculated: boolean;
  cumPrice: number;
  riPrice: number;
  terp: number;
  ratioOld: number;
  ratioNew: number;
  currentShares: number;
  newSharesCount: number;
  currentAvgPrice: number;
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  profit: number;
  percentage: number;
  totalCost: number;
  finalValue: number;
  finalShares: number;
  color: string;
  icon: React.ReactNode;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('id-ID').format(value);
};

const formatPercent = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({
  isCalculated,
  cumPrice,
  riPrice,
  terp,
  ratioOld,
  ratioNew,
  currentShares,
  newSharesCount,
  currentAvgPrice,
}) => {
  const { t, language } = useLanguage();

  const scenarios = useMemo((): Scenario[] => {
    if (!isCalculated || ratioOld === 0) return [];

    // HMETD theoretical value
    const hmetdValue = Math.max(0, (cumPrice - riPrice) / ((ratioOld / ratioNew) + 1));
    
    // Scenario 1: Full Exercise (Tebus Penuh)
    const fullExerciseCost = newSharesCount * riPrice;
    const fullExerciseTotalShares = currentShares + newSharesCount;
    const fullExerciseFinalValue = fullExerciseTotalShares * terp;
    const fullExerciseInitialValue = currentShares * cumPrice;
    const fullExerciseProfit = fullExerciseFinalValue - fullExerciseInitialValue - fullExerciseCost;
    const fullExercisePercentage = fullExerciseInitialValue > 0 
      ? ((fullExerciseProfit / fullExerciseInitialValue) * 100)
      : 0;

    // Scenario 2: Partial Exercise (50%)
    const partialNewShares = Math.floor(newSharesCount / 2);
    const partialSellShares = newSharesCount - partialNewShares;
    const partialExerciseCost = partialNewShares * riPrice;
    const partialHmetdProfit = partialSellShares * hmetdValue;
    const partialTotalShares = currentShares + partialNewShares;
    const partialFinalValue = partialTotalShares * terp + partialHmetdProfit;
    const partialInitialValue = currentShares * cumPrice;
    const partialProfit = partialFinalValue - partialInitialValue - partialExerciseCost;
    const partialPercentage = partialInitialValue > 0
      ? ((partialProfit / partialInitialValue) * 100)
      : 0;

    // Scenario 3: Sell All HMETD
    const sellAllHmetdProfit = newSharesCount * hmetdValue;
    const sellAllFinalValue = currentShares * terp + sellAllHmetdProfit;
    const sellAllInitialValue = currentShares * cumPrice;
    const sellAllNetProfit = sellAllFinalValue - sellAllInitialValue;
    const sellAllPercentage = sellAllInitialValue > 0
      ? ((sellAllNetProfit / sellAllInitialValue) * 100)
      : 0;

    return [
      {
        id: 'full',
        name: t('scenario.fullExercise'),
        description: t('scenario.fullExerciseDesc'),
        profit: fullExerciseProfit,
        percentage: fullExercisePercentage,
        totalCost: fullExerciseCost,
        finalValue: fullExerciseFinalValue,
        finalShares: fullExerciseTotalShares,
        color: '#10b981',
        icon: <TrendingUp className="w-4 h-4" />,
      },
      {
        id: 'partial',
        name: t('scenario.partialExercise'),
        description: t('scenario.partialExerciseDesc'),
        profit: partialProfit,
        percentage: partialPercentage,
        totalCost: partialExerciseCost,
        finalValue: partialFinalValue,
        finalShares: partialTotalShares,
        color: '#f59e0b',
        icon: <Scale className="w-4 h-4" />,
      },
      {
        id: 'sell',
        name: t('scenario.sellHmetd'),
        description: t('scenario.sellHmetdDesc'),
        profit: sellAllNetProfit,
        percentage: sellAllPercentage,
        totalCost: 0,
        finalValue: sellAllFinalValue,
        finalShares: currentShares,
        color: '#6366f1',
        icon: <DollarSign className="w-4 h-4" />,
      },
    ];
  }, [isCalculated, cumPrice, riPrice, terp, ratioOld, ratioNew, currentShares, newSharesCount, t]);

  const chartData = useMemo(() => {
    return scenarios.map(s => ({
      name: s.name.split(' ')[0],
      profit: s.profit,
      color: s.color,
      fullName: s.name,
    }));
  }, [scenarios]);

  const bestScenario = useMemo(() => {
    if (scenarios.length === 0) return null;
    return scenarios.reduce((best, current) => 
      current.profit > best.profit ? current : best
    );
  }, [scenarios]);

  if (!isCalculated || scenarios.length === 0) {
    return null;
  }

  const maxProfit = Math.max(...scenarios.map(s => Math.abs(s.profit)));
  const minProfit = Math.min(...scenarios.map(s => s.profit));
  const yDomain = [Math.min(0, minProfit * 1.1), maxProfit * 1.2];

  return (
    <div className="card-calculator animate-slide-up overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <Scale className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold">{t('scenario.title')}</h3>
      </div>

      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="chart" className="text-xs">{t('scenario.chartView')}</TabsTrigger>
          <TabsTrigger value="detail" className="text-xs">{t('scenario.detailView')}</TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="mt-0">
          {/* Profit/Loss Chart */}
          <div className="h-[180px] w-full mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  domain={yDomain}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => {
                    if (Math.abs(v) >= 1000000) return `${(v / 1000000).toFixed(1)}jt`;
                    if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(0)}rb`;
                    return v.toString();
                  }}
                />
                <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <Bar 
                  dataKey="profit" 
                  radius={[6, 6, 0, 0]}
                  isAnimationActive={true}
                  animationBegin={0}
                  animationDuration={800}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.profit >= 0 ? entry.color : '#ef4444'}
                    />
                  ))}
                  <LabelList 
                    dataKey="profit" 
                    position="top" 
                    formatter={(v: number) => {
                      if (Math.abs(v) >= 1000000) return `${(v / 1000000).toFixed(1)}jt`;
                      if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(0)}rb`;
                      return v.toString();
                    }}
                    style={{ fontSize: 10, fontWeight: 600, fill: 'hsl(var(--foreground))' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Best Scenario Badge */}
          {bestScenario && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary">{t('scenario.bestOption')}</span>
              </div>
              <p className="text-sm font-bold mt-1" style={{ color: bestScenario.color }}>
                {bestScenario.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('scenario.potentialProfit')}: <span className={bestScenario.profit >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {formatCurrency(bestScenario.profit)} ({formatPercent(bestScenario.percentage)})
                </span>
              </p>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-3 justify-center">
            {scenarios.map((s) => (
              <div key={s.id} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: s.color }} />
                <span className="text-[10px] text-muted-foreground">{s.name}</span>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="detail" className="mt-0 space-y-3">
          {scenarios.map((scenario) => (
            <div 
              key={scenario.id}
              className={`border rounded-lg p-3 transition-all ${
                bestScenario?.id === scenario.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="p-1.5 rounded-md"
                    style={{ backgroundColor: `${scenario.color}20`, color: scenario.color }}
                  >
                    {scenario.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{scenario.name}</h4>
                    <p className="text-[10px] text-muted-foreground">{scenario.description}</p>
                  </div>
                </div>
                {bestScenario?.id === scenario.id && (
                  <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">
                    {t('scenario.best')}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="bg-muted/50 rounded-md p-2">
                  <p className="text-[10px] text-muted-foreground">{t('scenario.cost')}</p>
                  <p className="text-xs font-semibold">{formatCurrency(scenario.totalCost)}</p>
                </div>
                <div className="bg-muted/50 rounded-md p-2">
                  <p className="text-[10px] text-muted-foreground">{t('scenario.finalShares')}</p>
                  <p className="text-xs font-semibold">{formatNumber(scenario.finalShares)}</p>
                </div>
                <div className="bg-muted/50 rounded-md p-2">
                  <p className="text-[10px] text-muted-foreground">{t('scenario.finalValue')}</p>
                  <p className="text-xs font-semibold">{formatCurrency(scenario.finalValue)}</p>
                </div>
                <div className={`rounded-md p-2 ${scenario.profit >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    {t('scenario.profitLoss')}
                  </p>
                  <p className={`text-xs font-bold ${scenario.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(scenario.profit)}
                    <span className="text-[10px] ml-1">({formatPercent(scenario.percentage)})</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScenarioComparison;
