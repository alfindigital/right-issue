import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';

interface BudgetAllocationChartProps {
  buyingCost: number;
  exerciseCost: number;
  remainingBudget: number;
  totalBudget: number;
}

const formatCurrency = (value: number): string => {
  return `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;
};

const BudgetAllocationChart: React.FC<BudgetAllocationChartProps> = ({
  buyingCost,
  exerciseCost,
  remainingBudget,
  totalBudget,
}) => {
  const { t } = useLanguage();

  const data = [
    { name: t('budgetPlanner.buyingCost'), value: buyingCost, color: 'hsl(var(--primary))' },
    ...(exerciseCost > 0 ? [{ name: t('budgetPlanner.exerciseCost'), value: exerciseCost, color: 'hsl(142 76% 36%)' }] : []),
    ...(remainingBudget > 0 ? [{ name: t('budgetPlanner.remaining'), value: remainingBudget, color: 'hsl(var(--muted-foreground))' }] : []),
  ].filter(d => d.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalBudget) * 100).toFixed(1);
      return (
        <div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
          <p className="text-xs font-medium">{data.name}</p>
          <p className="text-sm font-bold">{formatCurrency(data.value)}</p>
          <p className="text-[10px] text-muted-foreground">{percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {payload.map((entry: any, index: number) => {
          const percentage = ((entry.payload.value / totalBudget) * 100).toFixed(0);
          return (
            <div key={index} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-[10px] text-muted-foreground">
                {entry.value} ({percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="mt-4 p-3 bg-muted/30 rounded-lg">
      <h3 className="text-xs font-semibold text-muted-foreground mb-2">
        {t('budgetPlanner.allocation')}
      </h3>
      <div className="h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={55}
              paddingAngle={2}
              dataKey="value"
              animationBegin={0}
              animationDuration={600}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Summary bar */}
      <div className="mt-3 h-2 rounded-full overflow-hidden bg-muted flex">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${(buyingCost / totalBudget) * 100}%` }}
        />
        {exerciseCost > 0 && (
          <div
            className="h-full bg-[hsl(142_76%_36%)] transition-all duration-500"
            style={{ width: `${(exerciseCost / totalBudget) * 100}%` }}
          />
        )}
      </div>
      <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
        <span>{t('budgetPlanner.used')}: {formatCurrency(buyingCost + exerciseCost)}</span>
        <span>{t('budgetPlanner.remaining')}: {formatCurrency(remainingBudget)}</span>
      </div>
    </div>
  );
};

export default BudgetAllocationChart;
