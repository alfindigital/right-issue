import React, { useState, useMemo } from 'react';
import { Wallet, Target, TrendingUp, CheckCircle2, AlertCircle, ArrowRight, Save } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import RatioInput from './RatioInput';
import { parseDecimalId } from '@/lib/parseDecimal';
import { ValidationResult } from '@/lib/validators';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import BudgetAllocationChart from './BudgetAllocationChart';
import { useBudgetPlannerHistory, BudgetPlannerHistoryItem } from '@/hooks/useBudgetPlannerHistory';
import BudgetPlannerHistoryDropdown from './BudgetPlannerHistoryDropdown';
import { toast } from 'sonner';
import InfoTooltip from './InfoTooltip';

interface LotOption {
  lots: number;
  buyingCost: number;
  riShares: number;
  riLots: number;
  riCost: number;
  totalCost: number;
  isOptimal: boolean;
  remainingBudget: number;
  warrants?: number;
}

export interface BudgetPlannerData {
  lots: number;
  ratioOld: string;
  ratioNew: string;
  rightPrice: string;
  cumDatePrice: string;
  currentAvgPrice: string;
  hasWarrant: boolean;
  warrantRatioOld: string;
  warrantRatioNew: string;
}

interface BudgetLotPlannerProps {
  onApplyToCalculator?: (data: BudgetPlannerData) => void;
}

const formatCurrency = (value: number): string => {
  return `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('id-ID').format(value);
};

const formatInputNumber = (num: string): string => {
  const cleanNum = num.replace(/\D/g, '');
  if (!cleanNum) return '';
  return new Intl.NumberFormat('id-ID').format(parseInt(cleanNum));
};

const BudgetLotPlanner = React.forwardRef<HTMLDivElement, BudgetLotPlannerProps>(({ onApplyToCalculator }, ref) => {
  const { t } = useLanguage();
  
  // RI Info inputs
  const [ratioOld, setRatioOld] = useState('');
  const [ratioNew, setRatioNew] = useState('');
  const [rightPrice, setRightPrice] = useState('');
  const [cumDatePrice, setCumDatePrice] = useState('');
  const [currentAvgPrice, setCurrentAvgPrice] = useState('');
  
  // Stock code (optional identifier)
  const [stockCode, setStockCode] = useState('');
  
  // Warrant
  const [hasWarrant, setHasWarrant] = useState(false);
  const [warrantRatioOld, setWarrantRatioOld] = useState('');
  const [warrantRatioNew, setWarrantRatioNew] = useState('');
  
  // Budget inputs
  const [budget, setBudget] = useState('');
  const [includeExerciseFund, setIncludeExerciseFund] = useState(true);
  
  // Show all options
  const [showAllOptions, setShowAllOptions] = useState(false);

  // Warrant ratio validation
  const warrantRatioError = useMemo(() => {
    if (!hasWarrant) return '';
    const oldRaw = warrantRatioOld.trim();
    const newRaw = warrantRatioNew.trim();
    if (!oldRaw || !newRaw) return t('validation.warrantRatioMissing');
    const wOld = parseDecimalId(warrantRatioOld);
    const wNew = parseDecimalId(warrantRatioNew);
    if (wOld === 0) return 'Rasio RI tidak boleh 0';
    if (wNew === 0) return 'Rasio waran tidak boleh 0';
    return '';
  }, [hasWarrant, warrantRatioOld, warrantRatioNew, t]);

  const warrantValidation: ValidationResult | undefined = warrantRatioError
    ? { state: 'error', message: warrantRatioError }
    : undefined;
  
  // Budget Planner History
  const { history, addToHistory, removeFromHistory, clearHistory } = useBudgetPlannerHistory();
  
  // Save config handler
  const handleSaveConfig = () => {
    addToHistory({
      ratioOld,
      ratioNew,
      rightPrice,
      cumDatePrice,
      currentAvgPrice,
      budget,
      includeExerciseFund,
      hasWarrant,
      warrantRatioOld,
      warrantRatioNew,
    }, stockCode || undefined);
    
    toast.success(t('budgetPlanner.configSaved'));
  };
  
  // Load config handler
  const handleLoadConfig = (item: BudgetPlannerHistoryItem) => {
    const { config, stockCode: savedCode } = item;
    setRatioOld(config.ratioOld);
    setRatioNew(config.ratioNew);
    setRightPrice(config.rightPrice);
    setCumDatePrice(config.cumDatePrice);
    setCurrentAvgPrice(config.currentAvgPrice);
    setBudget(config.budget);
    setIncludeExerciseFund(config.includeExerciseFund);
    setHasWarrant(config.hasWarrant);
    setWarrantRatioOld(config.warrantRatioOld);
    setWarrantRatioNew(config.warrantRatioNew);
    if (savedCode) setStockCode(savedCode);
    
    toast.success(t('budgetPlanner.configLoaded'));
  };

  // GCD helper
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

  // Calculate optimal lots
  const results = useMemo((): LotOption[] => {
    const rOld = parseDecimalId(ratioOld);
    const rNew = parseDecimalId(ratioNew);
    const riPrice = parseInt(rightPrice) || 0;
    const cumPrice = parseInt(cumDatePrice) || 0;
    const totalBudget = parseInt(budget) || 0;
    
    if (rOld === 0 || rNew === 0 || riPrice === 0 || cumPrice === 0 || totalBudget === 0) {
      return [];
    }

    // Find base multiplier for optimal lots (results in even RI lots)
    const g = gcd(rOld, rNew);
    const baseMultiplier = rOld / g;
    
    const options: LotOption[] = [];
    let lots = baseMultiplier;
    
    // Also calculate warrant ratio if enabled
    const wOld = hasWarrant ? parseDecimalId(warrantRatioOld) : 0;
    const wNew = hasWarrant ? parseDecimalId(warrantRatioNew) : 0;
    
    while (lots <= 1000) { // Cap at 1000 lots to prevent infinite loop
      const buyingCost = lots * 100 * cumPrice;
      const shares = lots * 100;
      const riShares = Math.floor((shares / rOld) * rNew);
      const riCost = includeExerciseFund ? riShares * riPrice : 0;
      const totalCost = buyingCost + riCost;
      
      if (totalCost > totalBudget) break;
      
      const isOptimal = Number.isInteger(riShares / 100);
      
      // Calculate warrants
      let warrants = 0;
      if (hasWarrant && wOld > 0 && wNew > 0) {
        warrants = Math.floor((riShares / wOld) * wNew);
      }
      
      options.push({
        lots,
        buyingCost,
        riShares,
        riLots: riShares / 100,
        riCost,
        totalCost,
        isOptimal,
        remainingBudget: totalBudget - totalCost,
        warrants: hasWarrant ? warrants : undefined,
      });
      
      lots += baseMultiplier;
    }
    
    return options;
  }, [ratioOld, ratioNew, rightPrice, cumDatePrice, budget, includeExerciseFund, hasWarrant, warrantRatioOld, warrantRatioNew]);

  // Get recommended option (highest optimal lot that fits budget)
  const recommendedOption = useMemo(() => {
    const optimalOptions = results.filter(r => r.isOptimal);
    return optimalOptions.length > 0 ? optimalOptions[optimalOptions.length - 1] : null;
  }, [results]);

  // Budget presets
  const budgetPresets = [1000000, 5000000, 10000000, 25000000, 50000000];

  const handlePresetClick = (preset: number) => {
    setBudget(String(preset));
  };

  const handlePriceChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    setter(rawValue);
  };

  const isInputComplete = ratioOld && ratioNew && rightPrice && cumDatePrice && budget;

  return (
    <div className="space-y-4">
      {/* RI Info Section */}
      <div className="card-calculator">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title flex items-center gap-2 mb-0">
            <TrendingUp className="w-4 h-4 text-primary" />
            {t('rightIssue.title')}
          </h2>
          
          <div className="flex items-center gap-1">
            {/* Load Dropdown */}
            <BudgetPlannerHistoryDropdown
              history={history}
              onSelectHistory={handleLoadConfig}
              onRemoveHistory={removeFromHistory}
              onClearHistory={clearHistory}
            />
            
            {/* Save Button */}
            <button
              onClick={handleSaveConfig}
              disabled={!isInputComplete}
              className="p-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={t('budgetPlanner.saveConfig')}
            >
              <Save className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          {/* Stock Code Input - Optional */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              {t('stockCode.label')} <span className="text-muted-foreground/60">({t('stockCode.optional')})</span>
            </label>
            <input
              type="text"
              value={stockCode}
              onChange={(e) => setStockCode(e.target.value.toUpperCase().slice(0, 4))}
              placeholder="ELPI"
              className="input-calculator w-24"
              maxLength={4}
            />
          </div>
          
          {/* Ratio */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block flex items-center">
              {t('rightIssue.ratio')}
              <InfoTooltip text={t('rightIssue.ratio') === 'Rasio RI' ? 'Contoh: 2:1 berarti setiap 2 lembar lama berhak 1 lembar baru.' : 'Example: 2:1 means every 2 old shares entitled to 1 new share.'} />
            </label>
            <div className="flex items-center gap-2">
              <RatioInput
                value={ratioOld}
                onChange={setRatioOld}
                placeholder={t('rightIssue.ratioOld')}
              />
              <span className="text-sm font-medium text-muted-foreground">:</span>
              <RatioInput
                value={ratioNew}
                onChange={setRatioNew}
                placeholder={t('rightIssue.ratioNew')}
              />
            </div>
          </div>
          
          {/* Prices */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block flex items-center">
                {t('rightIssue.price')}
                <InfoTooltip text={t('rightIssue.price') === 'Harga Pelaksanaan' ? 'Harga per lembar untuk menebus right issue.' : 'Price per share to exercise the right issue.'} />
              </label>
              <input
                type="text"
                value={formatInputNumber(rightPrice)}
                onChange={handlePriceChange(setRightPrice)}
                placeholder="500"
                className="input-calculator"
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block flex items-center">
                {t('rightIssue.cumPrice')}
                <InfoTooltip text={t('rightIssue.cumPrice') === 'Harga Cum Date' ? 'Harga saham terakhir sebelum ex-date.' : 'Last stock price before ex-date.'} />
              </label>
              <input
                type="text"
                value={formatInputNumber(cumDatePrice)}
                onChange={handlePriceChange(setCumDatePrice)}
                placeholder="2.500"
                className="input-calculator"
                inputMode="numeric"
              />
            </div>
          </div>
          
          {/* Current Average Price - Required */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1">
              {t('budgetPlanner.currentAvgPrice')}
              <span className="text-destructive">*</span>
              <InfoTooltip text={t('budgetPlanner.currentAvgPrice') === 'Harga Avg Saat Ini' ? 'Harga rata-rata pembelian saham Anda saat ini.' : 'Your current average purchase price.'} />
            </label>
            <input
              type="text"
              value={formatInputNumber(currentAvgPrice)}
              onChange={handlePriceChange(setCurrentAvgPrice)}
              placeholder="1.800"
              className={`input-calculator ${!currentAvgPrice && budget ? 'border-amber-400 dark:border-amber-500' : ''}`}
              inputMode="numeric"
            />
            <p className="text-[10px] text-muted-foreground/70 mt-0.5">
              {t('budgetPlanner.currentAvgPriceHelp')}
            </p>
          </div>
          
          {/* Warrant Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <Label htmlFor="warrant-toggle-bp" className="text-xs text-muted-foreground flex items-center">
              {t('rightIssue.hasWarrant')}
              <InfoTooltip text={t('rightIssue.hasWarrant') === 'Bonus Waran' ? 'Centang jika right issue memberikan bonus waran.' : 'Check if RI provides bonus warrants.'} />
            </Label>
            <Switch
              id="warrant-toggle-bp"
              checked={hasWarrant}
              onCheckedChange={setHasWarrant}
            />
          </div>
          
          {/* Warrant Ratio */}
          {hasWarrant && (
            <div className="animate-fade-in">
              <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1">
                {t('rightIssue.warrantRatio')}
                <span className="text-amber-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <RatioInput
                  value={warrantRatioOld}
                  onChange={setWarrantRatioOld}
                  placeholder="RI"
                  className={!warrantRatioOld ? 'border-amber-400 dark:border-amber-500' : ''}
                />
                <span className="text-sm font-medium text-muted-foreground">:</span>
                <RatioInput
                  value={warrantRatioNew}
                  onChange={setWarrantRatioNew}
                  placeholder="Waran"
                  className={!warrantRatioNew ? 'border-amber-400 dark:border-amber-500' : ''}
                />
              </div>
              {(!warrantRatioOld || !warrantRatioNew) && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                  {t('rightIssue.warrantRatioRequired')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Budget Section */}
      <div className="card-calculator">
        <h2 className="section-title flex items-center gap-2">
          <Wallet className="w-4 h-4 text-primary" />
          {t('budgetPlanner.budget')}
        </h2>
        
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block flex items-center">
              {t('budgetPlanner.totalBudget')}
              <InfoTooltip text={t('budgetPlanner.totalBudget') === 'Total Budget' ? 'Total dana yang tersedia untuk investasi.' : 'Total funds available for investment.'} />
            </label>
            <input
              type="text"
              value={formatInputNumber(budget)}
              onChange={handlePriceChange(setBudget)}
              placeholder="10.000.000"
              className="input-calculator"
              inputMode="numeric"
            />
          </div>
          
          {/* Budget Presets */}
          <div className="flex flex-wrap gap-1.5">
            {budgetPresets.map((preset) => (
              <button
                key={preset}
                onClick={() => handlePresetClick(preset)}
                className="text-[10px] px-2 py-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
              >
                {preset >= 1000000 ? `${preset / 1000000}jt` : formatNumber(preset)}
              </button>
            ))}
          </div>
          
          {/* Include Exercise Fund Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <Label htmlFor="exercise-fund-toggle" className="text-xs text-muted-foreground flex items-center">
              {t('budgetPlanner.includeExercise')}
              <InfoTooltip text={t('budgetPlanner.includeExercise') === 'Sertakan Dana Tebus' ? 'Apakah budget sudah termasuk dana untuk menebus RI.' : 'Whether the budget includes funds to exercise RI.'} />
            </Label>
            <Switch
              id="exercise-fund-toggle"
              checked={includeExerciseFund}
              onCheckedChange={setIncludeExerciseFund}
            />
          </div>
          
          <p className="text-[10px] text-muted-foreground/70">
            {includeExerciseFund 
              ? t('budgetPlanner.includeExerciseDesc')
              : t('budgetPlanner.excludeExerciseDesc')
            }
          </p>
        </div>
      </div>

      {/* Results Section */}
      {isInputComplete && results.length > 0 && (
        <div className="card-calculator animate-fade-in">
          <h2 className="section-title flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            {t('budgetPlanner.recommendation')}
          </h2>
          
          {/* Recommended Option Highlight */}
          {recommendedOption && (
            <div className="p-3 rounded-lg bg-[hsl(142_76%_96%)] dark:bg-[hsl(142_76%_15%)] border border-[hsl(var(--success))]/30 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-[hsl(var(--success))]" />
                <span className="text-sm font-bold text-[hsl(var(--success))]">
                  {t('budgetPlanner.optimalLot')}: {recommendedOption.lots} Lot
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">{t('budgetPlanner.buyingCost')}:</span>
                  <span className="ml-1 font-semibold">{formatCurrency(recommendedOption.buyingCost)}</span>
                </div>
                {includeExerciseFund && (
                  <div>
                    <span className="text-muted-foreground">{t('budgetPlanner.exerciseCost')}:</span>
                    <span className="ml-1 font-semibold">{formatCurrency(recommendedOption.riCost)}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">{t('budgetPlanner.totalCost')}:</span>
                  <span className="ml-1 font-bold text-primary">{formatCurrency(recommendedOption.totalCost)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('budgetPlanner.remaining')}:</span>
                  <span className="ml-1 font-semibold">{formatCurrency(recommendedOption.remainingBudget)}</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-[hsl(var(--success))]/20 mt-1">
                  <span className="text-muted-foreground">{t('budgetPlanner.riResult')}:</span>
                  <span className="ml-1 font-bold text-[hsl(var(--success))]">
                    {recommendedOption.riLots} Lot ({formatNumber(recommendedOption.riShares)} {t('budgetPlanner.shares')})
                  </span>
                </div>
                {hasWarrant && recommendedOption.warrants !== undefined && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">{t('warrant.count')}:</span>
                    <span className="ml-1 font-bold text-[hsl(var(--success))]">
                      {formatNumber(recommendedOption.warrants)}
                    </span>
                  </div>
                )}
              </div>
              
              {onApplyToCalculator && (
                <div className="mt-3 space-y-1">
                  <button
                    onClick={() => onApplyToCalculator({
                      lots: recommendedOption.lots,
                      ratioOld,
                      ratioNew,
                      rightPrice,
                      cumDatePrice,
                      currentAvgPrice,
                      hasWarrant,
                      warrantRatioOld,
                      warrantRatioNew,
                    })}
                    disabled={!currentAvgPrice || (hasWarrant && (!warrantRatioOld || !warrantRatioNew))}
                    className="w-full py-2 rounded-lg bg-[hsl(var(--success))] text-white font-semibold text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('budgetPlanner.applyToCalculator')}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  {!currentAvgPrice ? (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 text-center">
                      {t('budgetPlanner.avgPriceRequired')}
                    </p>
                  ) : hasWarrant && (!warrantRatioOld || !warrantRatioNew) ? (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 text-center">
                      {t('validation.warrantRatioMissing')}
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          )}

          {/* Chart Visualization */}
          {recommendedOption && (
            <BudgetAllocationChart
              buyingCost={recommendedOption.buyingCost}
              exerciseCost={recommendedOption.riCost}
              remainingBudget={recommendedOption.remainingBudget}
              totalBudget={parseInt(budget) || 0}
            />
          )}

          {/* All Options Table */}
          {results.length > 1 && (
            <div className="mt-4">
              <button
                onClick={() => setShowAllOptions(!showAllOptions)}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                {showAllOptions ? t('budgetPlanner.hideOptions') : t('budgetPlanner.showAllOptions')} ({results.length})
              </button>
              
              {showAllOptions && (
                <div className="mt-3 space-y-2 max-h-[300px] overflow-y-auto">
                  {results.map((option, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded-lg border text-xs transition-all ${
                        option.isOptimal
                          ? 'border-[hsl(var(--success))]/30 bg-[hsl(142_76%_96%)] dark:bg-[hsl(142_76%_15%)]'
                          : 'border-border/50 bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold">
                          {option.lots} Lot
                          {option.isOptimal && (
                            <span className="ml-1 text-[10px] text-[hsl(var(--success))]">✓ Optimal</span>
                          )}
                        </span>
                        <span className="font-semibold text-primary">
                          {formatCurrency(option.totalCost)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>RI: {option.riLots} lot ({formatNumber(option.riShares)} lembar)</span>
                        <span>Sisa: {formatCurrency(option.remainingBudget)}</span>
                      </div>
                      {hasWarrant && option.warrants !== undefined && (
                        <div className="text-muted-foreground mt-1">
                          Waran: {formatNumber(option.warrants)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* No Results State */}
      {isInputComplete && results.length === 0 && (
        <div className="card-calculator">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{t('budgetPlanner.insufficientBudget')}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('budgetPlanner.insufficientBudgetDesc')}
          </p>
        </div>
      )}
    </div>
  );
});

BudgetLotPlanner.displayName = 'BudgetLotPlanner';

export default React.memo(BudgetLotPlanner);
