import React, { useState, useEffect, useCallback, useRef, useMemo, lazy, Suspense } from 'react';
import { RotateCcw, Heart, ChevronRight, ChevronLeft, Zap } from 'lucide-react';
import ExportPDFButton from './ExportPDFButton';
import RightIssueInfoSection from './RightIssueInfoSection';
import OwnershipSection from './OwnershipSection';
import ConclusionSection from './ConclusionSection';
import WarrantResultSection from './WarrantSection';
import LotOptimizationSection from './LotOptimizationSection';
import HistoryDropdown from './HistoryDropdown';
import SettingsDropdown from './SettingsDropdown';
import ShareButtons from './ShareButtons';
import StockCodeInput from './StockCodeInput';
import BackToTopButton from './BackToTopButton';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';
import EmbedCodeModal from './EmbedCodeModal';
import ResultsDashboard from './ResultsDashboard';
import StepWizard from './StepWizard';
import ProgressRing from './ProgressRing';
import FloatingSummary from './FloatingSummary';
import BottomNav from './BottomNav';
import Logo from './Logo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCalculationHistory, CalculationHistoryItem } from '@/hooks/useCalculationHistory';
import { parseDecimalId } from '@/lib/parseDecimal';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load heavy components (charts, analysis)
const DilutionSimulator = lazy(() => import('./DilutionSimulator'));
const ScenarioComparison = lazy(() => import('./ScenarioComparison'));
const AdvancedAnalysisSection = lazy(() => import('./AdvancedAnalysisSection'));
const WhatIfTargetPrice = lazy(() => import('./WhatIfTargetPrice'));
const EducationSection = lazy(() => import('./EducationSection'));
const BudgetLotPlanner = lazy(() => import('./BudgetLotPlanner'));
// Lazy type import for callback
type BudgetPlannerData = import('./BudgetLotPlanner').BudgetPlannerData;

const LazyFallback = () => (
  <div className="space-y-3 p-4">
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-24 w-full" />
  </div>
);

const formatCurrency = (value: number): string => {
  return `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('id-ID').format(value);
};

const RightIssueCalculator: React.FC = () => {
  const resultRef = useRef<HTMLDivElement>(null);
  const { history, addToHistory, removeFromHistory, clearHistory } = useCalculationHistory();
  const { saveToStorage, loadFromStorage, clearStorage } = useAutoSave();
  const { t, language } = useLanguage();
  const hasRestoredRef = useRef(false);
  const pendingAutoCalculateRef = useRef(false);
  const isMobile = useIsMobile();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('calculator');
  
  // Wizard step state
  const [wizardStep, setWizardStep] = useState(1);
  const [useWizardMode, setUseWizardMode] = useState(false);
  
  // Stock Code
  const [stockCode, setStockCode] = useState('');
  
  // Right Issue Info
  const [ratioOld, setRatioOld] = useState('');
  const [ratioNew, setRatioNew] = useState('');
  const [rightPrice, setRightPrice] = useState('');
  const [cumDatePrice, setCumDatePrice] = useState('');

  // Current Ownership (in lots)
  const [currentLots, setCurrentLots] = useState('');
  const [currentAvgPrice, setCurrentAvgPrice] = useState('');
  
  // No ownership mode (buy HMETD from market)
  const [noOwnership, setNoOwnership] = useState(false);
  const [hmetdLots, setHmetdLots] = useState('');

  // Warrant
  const [hasWarrant, setHasWarrant] = useState(false);
  const [warrantRatioOld, setWarrantRatioOld] = useState('');
  const [warrantRatioNew, setWarrantRatioNew] = useState('');
  const [warrantCount, setWarrantCount] = useState('0');

  // Calculated Values
  const [currentTotalValue, setCurrentTotalValue] = useState('Rp 0');
  const [newLotsCount, setNewLotsCount] = useState('0');
  const [newAvgPrice, setNewAvgPrice] = useState('Rp 0');
  const [newTotalValue, setNewTotalValue] = useState('Rp 0');
  const [finalLots, setFinalLots] = useState('0');
  const [finalAvgPrice, setFinalAvgPrice] = useState('Rp 0');
  const [finalTotalValue, setFinalTotalValue] = useState('Rp 0');
  const [theoreticalPrice, setTheoreticalPrice] = useState('-');
  const [recommendation, setRecommendation] = useState<'positive' | 'negative' | null>(null);
  const [recommendationText, setRecommendationText] = useState('');
  const [isCalculated, setIsCalculated] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const [numericValues, setNumericValues] = useState({
    newSharesCount: 0,
    totalShares: 0,
    totalModal: 0,
    avgBaru: 0,
    terp: 0,
  });

  const [ratioError, setRatioError] = useState('');
  const [warrantRatioError, setWarrantRatioError] = useState('');
  const [resultsOutOfView, setResultsOutOfView] = useState(false);
  const resultsDashboardRef = useRef<HTMLDivElement>(null);

  // Completion percentage for progress ring
  const completionPercent = useMemo(() => {
    const fields = [ratioOld, ratioNew, rightPrice, cumDatePrice, currentLots, currentAvgPrice];
    const filled = fields.filter(f => f.trim() !== '').length;
    return Math.round((filled / fields.length) * 100);
  }, [ratioOld, ratioNew, rightPrice, cumDatePrice, currentLots, currentAvgPrice]);

  // IntersectionObserver for floating summary
  useEffect(() => {
    if (!isCalculated) { setResultsOutOfView(false); return; }
    const el = resultsDashboardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setResultsOutOfView(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isCalculated]);

  // Wizard step labels
  const stepLabels = language === 'id'
    ? ['Info RI', 'Kepemilikan', 'Waran', 'Hasil']
    : ['RI Info', 'Holdings', 'Warrants', 'Results'];

  // Parse URL params or restore from auto-save on mount
  useEffect(() => {
    if (hasRestoredRef.current) return;
    hasRestoredRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const sc = params.get('sc');
    const ro = params.get('ro');
    const rn = params.get('rn');
    const rp = params.get('rp');
    const cp = params.get('cp');
    const cs = params.get('cs');
    const ca = params.get('ca');

    if (sc) setStockCode(sc);
    if (ro && rn && rp && cp && cs && ca) {
      setRatioOld(ro);
      setRatioNew(rn);
      setRightPrice(rp);
      setCumDatePrice(cp);
      setCurrentLots(cs);
      setCurrentAvgPrice(ca);
      setUseWizardMode(false);
    } else {
      const saved = loadFromStorage();
      if (saved) {
        setStockCode(saved.stockCode);
        setRatioOld(saved.ratioOld);
        setRatioNew(saved.ratioNew);
        setRightPrice(saved.rightPrice);
        setCumDatePrice(saved.cumDatePrice);
        setCurrentLots(saved.currentLots);
        setCurrentAvgPrice(saved.currentAvgPrice);
        setHasWarrant(saved.hasWarrant);
        setWarrantRatioOld(saved.warrantRatioOld);
        setWarrantRatioNew(saved.warrantRatioNew);
        
        toast({
          title: "Data dipulihkan",
          description: "Input terakhir Anda telah dipulihkan.",
          duration: 3000,
        });
      }
    }
  }, [loadFromStorage]);

  // Auto-save
  useEffect(() => {
    const hasData = stockCode || ratioOld || ratioNew || rightPrice || cumDatePrice || currentLots || currentAvgPrice;
    if (!hasData) return;
    saveToStorage({ stockCode, ratioOld, ratioNew, rightPrice, cumDatePrice, currentLots, currentAvgPrice, hasWarrant, warrantRatioOld, warrantRatioNew });
  }, [stockCode, ratioOld, ratioNew, rightPrice, cumDatePrice, currentLots, currentAvgPrice, hasWarrant, warrantRatioOld, warrantRatioNew, saveToStorage]);

  // Validate ratios
  useEffect(() => {
    const rOld = parseDecimalId(ratioOld);
    const rNew = parseDecimalId(ratioNew);
    if (ratioOld && rOld === 0) setRatioError('Rasio lama tidak boleh 0');
    else if (ratioNew && rNew === 0) setRatioError('Rasio baru tidak boleh 0');
    else setRatioError('');
  }, [ratioOld, ratioNew]);

  useEffect(() => {
    if (!hasWarrant) { setWarrantRatioError(''); return; }
    const wOld = parseDecimalId(warrantRatioOld);
    const wNew = parseDecimalId(warrantRatioNew);
    if (warrantRatioOld && wOld === 0) setWarrantRatioError('Rasio RI tidak boleh 0');
    else if (warrantRatioNew && wNew === 0) setWarrantRatioError('Rasio waran tidak boleh 0');
    else setWarrantRatioError('');
  }, [hasWarrant, warrantRatioOld, warrantRatioNew]);

  const isWarrantRatioValid = !hasWarrant || (warrantRatioOld && warrantRatioNew && !warrantRatioError);
  const isCalculateEnabled = !!(ratioOld && ratioNew && rightPrice && cumDatePrice && !ratioError && isWarrantRatioValid && (noOwnership ? hmetdLots : (currentLots && currentAvgPrice)));

  useEffect(() => {
    const lots = parseInt(currentLots) || 0;
    const shares = lots * 100;
    const avgPrice = parseInt(currentAvgPrice) || 0;
    setCurrentTotalValue(formatCurrency(shares * avgPrice));
  }, [currentLots, currentAvgPrice]);

  const calculate = useCallback(() => {
    const rOld = parseDecimalId(ratioOld);
    const rNew = parseDecimalId(ratioNew);
    const riPrice = parseInt(rightPrice) || 0;
    const cumPrice = parseInt(cumDatePrice) || 0;
    
    // Handle noOwnership mode: user buys HMETD from market
    const lots = noOwnership ? 0 : (parseInt(currentLots) || 0);
    const shares = lots * 100;
    const avgPrice = noOwnership ? 0 : (parseInt(currentAvgPrice) || 0);

    if (rOld === 0 || rNew === 0) return;

    // In noOwnership mode, newShares = hmetdLots * 100 (direct purchase)
    const newShares = noOwnership 
      ? (parseInt(hmetdLots) || 0) * 100 
      : Math.floor((shares / rOld) * rNew);
    
    const newLots = newShares / 100;
    const isWholeLot = Number.isInteger(newLots);
    setNewLotsCount(isWholeLot ? formatNumber(newLots) : newLots.toFixed(2).replace('.', ','));
    setNewAvgPrice(formatCurrency(riPrice));
    
    const newValue = newShares * riPrice;
    setNewTotalValue(formatCurrency(newValue));

    const totalShares = shares + newShares;
    const totalLotsNum = totalShares / 100;
    const isWholeFinalLot = Number.isInteger(totalLotsNum);
    setFinalLots(isWholeFinalLot ? formatNumber(totalLotsNum) : totalLotsNum.toFixed(2).replace('.', ','));

    const currentValue = shares * avgPrice;
    const totalValue = currentValue + newValue;
    setFinalTotalValue(formatCurrency(totalValue));

    const finalAvg = totalShares > 0 ? Math.round(totalValue / totalShares) : 0;
    setFinalAvgPrice(formatCurrency(finalAvg));

    const terp = ((cumPrice * rOld) + (riPrice * rNew)) / (rOld + rNew);
    const terpRounded = Math.round(terp);
    setTheoreticalPrice(formatCurrency(terpRounded));

    setNumericValues({ newSharesCount: newShares, totalShares, totalModal: totalValue, avgBaru: finalAvg, terp: terpRounded });

    const wOld = parseDecimalId(warrantRatioOld);
    const wNew = parseDecimalId(warrantRatioNew);
    let calculatedWarrantCount = '0';
    if (hasWarrant && wOld > 0 && wNew > 0) {
      const warrants = Math.floor((newShares / wOld) * wNew);
      calculatedWarrantCount = formatNumber(warrants);
      setWarrantCount(calculatedWarrantCount);
    } else {
      setWarrantCount('0');
    }

    const priceDiff = terpRounded - finalAvg;
    const priceDiffPercent = finalAvg > 0 ? ((priceDiff / finalAvg) * 100).toFixed(2) : '0';

    if (finalAvg < terpRounded) {
      setRecommendation('positive');
      setRecommendationText(
        `Harga rata-rata baru Anda (${formatCurrency(finalAvg)}) berada Rp ${formatNumber(priceDiff)} (${priceDiffPercent}%) di bawah TERP (${formatCurrency(terpRounded)}). Secara teoritis, menebus RI berpotensi memberikan keuntungan.`
      );
      // 🎉 Confetti celebration (dynamic import)
      setTimeout(async () => {
        const { default: confetti } = await import('canvas-confetti');
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#22c55e', '#f59e0b', '#3b82f6', '#a855f7'],
        });
      }, 400);
    } else {
      setRecommendation('negative');
      const negativeDiff = Math.abs(priceDiff);
      const negativeDiffPercent = finalAvg > 0 ? ((negativeDiff / finalAvg) * 100).toFixed(2) : '0';
      setRecommendationText(
        `Harga rata-rata baru Anda (${formatCurrency(finalAvg)}) berada Rp ${formatNumber(negativeDiff)} (${negativeDiffPercent}%) di atas atau sama dengan TERP (${formatCurrency(terpRounded)}). Pertimbangkan alternatif seperti menjual HMETD.`
      );
    }

    // Show skeleton loading briefly before revealing results
    if (useWizardMode) {
      setIsCalculating(true);
      setWizardStep(4);
      setTimeout(() => {
        setIsCalculated(true);
        setIsCalculating(false);
      }, 600);
    } else {
      setIsCalculated(true);
    }

    addToHistory({
      stockCode: stockCode || undefined,
      inputs: { ratioOld, ratioNew, rightPrice, cumDatePrice, currentLots, currentAvgPrice, hasWarrant, warrantRatioOld, warrantRatioNew },
      results: {
        newSharesCount: formatNumber(newLots),
        finalShares: formatNumber(totalLotsNum),
        finalAvgPrice: formatCurrency(finalAvg),
        finalTotalValue: formatCurrency(totalValue),
        theoreticalPrice: formatCurrency(terpRounded),
        warrantCount: calculatedWarrantCount,
        recommendation: finalAvg < terpRounded ? 'positive' : 'negative',
      },
    });
  }, [ratioOld, ratioNew, rightPrice, cumDatePrice, currentLots, currentAvgPrice, hasWarrant, warrantRatioOld, warrantRatioNew, stockCode, addToHistory, useWizardMode, noOwnership, hmetdLots]);

  useEffect(() => {
    if (pendingAutoCalculateRef.current) {
      pendingAutoCalculateRef.current = false;
      calculate();
    }
  }, [ratioOld, ratioNew, rightPrice, cumDatePrice, currentLots, currentAvgPrice, calculate]);

  const reset = useCallback(() => {
    setStockCode(''); setRatioOld(''); setRatioNew(''); setRightPrice(''); setCumDatePrice('');
    setCurrentLots(''); setCurrentAvgPrice(''); setHasWarrant(false); setWarrantRatioOld(''); setWarrantRatioNew('');
    setNoOwnership(false); setHmetdLots('');
    setCurrentTotalValue('Rp 0'); setNewLotsCount('0'); setNewAvgPrice('Rp 0'); setNewTotalValue('Rp 0');
    setFinalLots('0'); setFinalAvgPrice('Rp 0'); setFinalTotalValue('Rp 0'); setTheoreticalPrice('-');
    setWarrantCount('0'); setRecommendation(null); setRecommendationText(''); setIsCalculated(false); setIsCalculating(false);
    setNumericValues({ newSharesCount: 0, totalShares: 0, totalModal: 0, avgBaru: 0, terp: 0 });
    setWizardStep(1);
    clearStorage();
  }, [clearStorage]);

  const handleShare = useCallback(() => {
    const params = new URLSearchParams();
    if (stockCode) params.set('sc', stockCode);
    if (ratioOld) params.set('ro', ratioOld);
    if (ratioNew) params.set('rn', ratioNew);
    if (rightPrice) params.set('rp', rightPrice);
    if (cumDatePrice) params.set('cp', cumDatePrice);
    if (currentLots) params.set('cs', currentLots);
    if (currentAvgPrice) params.set('ca', currentAvgPrice);
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    toast({ title: t('toast.copied'), description: t('toast.copiedDesc'), duration: 3000 });
  }, [stockCode, ratioOld, ratioNew, rightPrice, cumDatePrice, currentLots, currentAvgPrice, t]);

  useKeyboardShortcuts({ onCalculate: calculate, onReset: reset, onShare: handleShare, isCalculateEnabled });

  const handleApplyFromBudgetPlanner = useCallback((data: BudgetPlannerData) => {
    setRatioOld(data.ratioOld); setRatioNew(data.ratioNew); setRightPrice(data.rightPrice);
    setCumDatePrice(data.cumDatePrice); setCurrentLots(String(data.lots)); setCurrentAvgPrice(data.currentAvgPrice);
    setHasWarrant(data.hasWarrant); setWarrantRatioOld(data.warrantRatioOld); setWarrantRatioNew(data.warrantRatioNew);
    setActiveTab('calculator');
    setUseWizardMode(false);
    pendingAutoCalculateRef.current = true;
    toast({ title: t('budgetPlanner.applied'), description: `${data.lots} lot ${t('budgetPlanner.appliedDesc')}`, duration: 3000 });
  }, [t]);

  const loadFromHistory = useCallback((item: CalculationHistoryItem) => {
    setStockCode(item.stockCode || '');
    setRatioOld(item.inputs.ratioOld); setRatioNew(item.inputs.ratioNew); setRightPrice(item.inputs.rightPrice);
    setCumDatePrice(item.inputs.cumDatePrice); setCurrentLots(item.inputs.currentLots); setCurrentAvgPrice(item.inputs.currentAvgPrice);
    setHasWarrant(item.inputs.hasWarrant); setWarrantRatioOld(item.inputs.warrantRatioOld); setWarrantRatioNew(item.inputs.warrantRatioNew);
    setNewLotsCount(item.results.newSharesCount); setFinalLots(item.results.finalShares);
    setFinalAvgPrice(item.results.finalAvgPrice); setFinalTotalValue(item.results.finalTotalValue);
    setTheoreticalPrice(item.results.theoreticalPrice); setWarrantCount(item.results.warrantCount);
    setRecommendation(item.results.recommendation);
    
    const lots = parseInt(item.inputs.currentLots) || 0;
    const shares = lots * 100;
    const avgPrice = parseInt(item.inputs.currentAvgPrice) || 0;
    setCurrentTotalValue(formatCurrency(shares * avgPrice));
    
    const riPrice = parseInt(item.inputs.rightPrice) || 0;
    const newLots = parseFloat(item.results.newSharesCount.replace(/\./g, '').replace(',', '.')) || 0;
    const newShares = newLots * 100;
    setNewAvgPrice(formatCurrency(riPrice));
    setNewTotalValue(formatCurrency(newShares * riPrice));
    
    const finalAvg = parseInt(item.results.finalAvgPrice.replace(/[^\d]/g, '')) || 0;
    const terp = parseInt(item.results.theoreticalPrice.replace(/[^\d]/g, '')) || 0;
    const totalShares = shares + newShares;
    const totalValue = parseInt(item.results.finalTotalValue.replace(/[^\d]/g, '')) || 0;
    
    setNumericValues({ newSharesCount: newShares, totalShares, totalModal: totalValue, avgBaru: finalAvg, terp });
    
    const priceDiff = terp - finalAvg;
    const priceDiffPercent = finalAvg > 0 ? ((Math.abs(priceDiff) / finalAvg) * 100).toFixed(2) : '0';
    
    if (item.results.recommendation === 'positive') {
      setRecommendationText(
        `Harga rata-rata baru Anda (${item.results.finalAvgPrice}) berada Rp ${formatNumber(priceDiff)} (${priceDiffPercent}%) di bawah TERP (${item.results.theoreticalPrice}). Secara teoritis, menebus RI berpotensi memberikan keuntungan.`
      );
    } else {
      setRecommendationText(
        `Harga rata-rata baru Anda (${item.results.finalAvgPrice}) berada Rp ${formatNumber(Math.abs(priceDiff))} (${priceDiffPercent}%) di atas atau sama dengan TERP (${item.results.theoreticalPrice}). Pertimbangkan alternatif seperti menjual HMETD.`
      );
    }
    
    setIsCalculated(true);
    setUseWizardMode(false);
  }, []);

  // Wizard navigation
  const canGoNext = () => {
    if (wizardStep === 1) return !!(ratioOld && ratioNew && rightPrice && cumDatePrice && !ratioError);
    if (wizardStep === 2) return noOwnership ? !!hmetdLots : !!(currentLots && currentAvgPrice);
    if (wizardStep === 3) return isWarrantRatioValid;
    return false;
  };

  const [swipeDir, setSwipeDir] = useState<'left' | 'right'>('left');

  const handleNext = () => {
    setSwipeDir('left');
    if (wizardStep === 3) {
      calculate();
    } else {
      setWizardStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrev = () => {
    setSwipeDir('right');
    setWizardStep(prev => Math.max(prev - 1, 1));
  };

  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: () => {
      if (wizardStep < 4 && canGoNext()) handleNext();
    },
    onSwipeRight: () => {
      if (wizardStep > 1) handlePrev();
    },
    threshold: 50,
  });

  // Settings modal states
  const [keyboardHelpOpen, setKeyboardHelpOpen] = useState(false);
  const [embedOpen, setEmbedOpen] = useState(false);

  // Toolbar items
  const toolbarItems = (
    <>
      <ShareButtons
        resultRef={resultRef}
        isCalculated={isCalculated}
        shareData={{ stockCode, ratioOld, ratioNew, rightPrice, cumDatePrice, currentLots, currentAvgPrice }}
        exportData={{ currentTotalValue, newSharesCount: newLotsCount, newTotalValue, finalShares: finalLots, finalAvgPrice, finalTotalValue, theoreticalPrice, recommendation, recommendationText, hasWarrant, warrantCount }}
      />
      <ExportPDFButton
        isCalculated={isCalculated}
        data={{ stockCode, ratioOld, ratioNew, rightPrice, cumDatePrice, currentLots, currentAvgPrice, hasWarrant, warrantRatioOld, warrantRatioNew, newLotsCount, finalLots, finalAvgPrice, finalTotalValue, theoreticalPrice, recommendation, recommendationText, warrantCount, currentTotalValue, newTotalValue }}
      />
      <HistoryDropdown history={history} onSelectHistory={loadFromHistory} onRemoveHistory={removeFromHistory} onClearHistory={clearHistory} />
      {isCalculated && (
        <button onClick={reset} className="p-1.5 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground transition-colors" aria-label="Reset">
          <RotateCcw className="w-4 h-4" />
        </button>
      )}
      <SettingsDropdown
        onOpenKeyboardHelp={() => setKeyboardHelpOpen(true)}
        onOpenEmbed={() => setEmbedOpen(true)}
      />
      <KeyboardShortcutsHelp externalOpen={keyboardHelpOpen} onExternalOpenChange={setKeyboardHelpOpen} />
      <EmbedCodeModal externalOpen={embedOpen} onExternalOpenChange={setEmbedOpen} />
    </>
  );

  // Render calculator content based on wizard/full mode
  const renderCalculatorContent = () => {
    if (useWizardMode && activeTab === 'calculator') {
      return (
        <div className="space-y-3">
          <StepWizard
            currentStep={wizardStep}
            totalSteps={4}
            onStepClick={(s) => {
              if (s < wizardStep || (s === wizardStep + 1 && canGoNext())) setWizardStep(s);
            }}
            stepLabels={stepLabels}
          />

          {/* Step Content with Swipe */}
          <div
            className="min-h-[280px] overflow-hidden"
            {...swipeHandlers}
          >
            <div key={wizardStep} className={swipeDir === 'left' ? 'animate-slide-in-left' : 'animate-slide-in-right'}>
            {wizardStep === 1 && (
              <div className="space-y-3">
                <StockCodeInput value={stockCode} onChange={setStockCode} />
                <RightIssueInfoSection
                  ratioOld={ratioOld} ratioNew={ratioNew} rightPrice={rightPrice} cumDatePrice={cumDatePrice}
                  onRatioOldChange={setRatioOld} onRatioNewChange={setRatioNew} onRightPriceChange={setRightPrice} onCumDatePriceChange={setCumDatePrice}
                  ratioError={ratioError} hasWarrant={hasWarrant} onHasWarrantChange={setHasWarrant}
                  warrantRatioOld={warrantRatioOld} warrantRatioNew={warrantRatioNew}
                  onWarrantRatioOldChange={setWarrantRatioOld} onWarrantRatioNewChange={setWarrantRatioNew} warrantRatioError={warrantRatioError}
                />
              </div>
            )}

            {wizardStep === 2 && (
              <div>
                <OwnershipSection
                  currentLots={currentLots} currentAvgPrice={currentAvgPrice} currentTotalValue={currentTotalValue}
                  newLotsCount={newLotsCount} newAvgPrice={newAvgPrice} newTotalValue={newTotalValue}
                  finalLots={finalLots} finalAvgPrice={finalAvgPrice} finalTotalValue={finalTotalValue}
                  onCurrentLotsChange={setCurrentLots} onCurrentAvgPriceChange={setCurrentAvgPrice}
                  onCalculate={calculate} isCalculateEnabled={isCalculateEnabled} isCalculated={isCalculated}
                  noOwnership={noOwnership} onNoOwnershipChange={setNoOwnership}
                  hmetdLots={hmetdLots} onHmetdLotsChange={setHmetdLots}
                />
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-3">
                {hasWarrant && (
                  <WarrantResultSection warrantCount={warrantCount} isCalculated={isCalculated} />
                )}
                <LotOptimizationSection
                  ratioOld={ratioOld} ratioNew={ratioNew} currentLots={currentLots} onCurrentLotsChange={setCurrentLots}
                  isCalculated={isCalculated} hasWarrant={hasWarrant} warrantRatioOld={warrantRatioOld} warrantRatioNew={warrantRatioNew}
                />
              </div>
            )}

            {wizardStep === 4 && (isCalculated || isCalculating) && (
              <div className="space-y-3">
                <div ref={resultsDashboardRef}>
                  <ResultsDashboard
                    isCalculated={isCalculated} isLoading={isCalculating} finalAvgPrice={finalAvgPrice} theoreticalPrice={theoreticalPrice}
                    finalLots={finalLots} finalTotalValue={finalTotalValue} newLotsCount={newLotsCount} newTotalValue={newTotalValue}
                    recommendation={recommendation} recommendationText={recommendationText}
                  />
                </div>
                <ConclusionSection
                  newLots={newLotsCount} exercisePrice={rightPrice ? formatCurrency(parseInt(rightPrice)) : 'Rp 0'}
                  totalCost={newTotalValue} newAvgPrice={isCalculated ? finalAvgPrice : '-'} theoreticalPrice={theoreticalPrice}
                  recommendation={recommendation} recommendationText={recommendationText} isCalculated={isCalculated}
                />
                <Suspense fallback={<LazyFallback />}>
                  <DilutionSimulator isCalculated={isCalculated} currentShares={(parseInt(currentLots) || 0) * 100} newSharesEntitled={numericValues.newSharesCount} ratioOld={parseDecimalId(ratioOld)} ratioNew={parseDecimalId(ratioNew)} />
                  <ScenarioComparison isCalculated={isCalculated} cumPrice={parseInt(cumDatePrice) || 0} riPrice={parseInt(rightPrice) || 0} terp={numericValues.terp} ratioOld={parseDecimalId(ratioOld)} ratioNew={parseDecimalId(ratioNew)} currentShares={(parseInt(currentLots) || 0) * 100} newSharesCount={numericValues.newSharesCount} currentAvgPrice={parseInt(currentAvgPrice) || 0} />
                  <WhatIfTargetPrice isCalculated={isCalculated} currentShares={(parseInt(currentLots) || 0) * 100} newSharesCount={numericValues.newSharesCount} currentAvgPrice={parseInt(currentAvgPrice) || 0} riPrice={parseInt(rightPrice) || 0} cumPrice={parseInt(cumDatePrice) || 0} terp={numericValues.terp} />
                  <AdvancedAnalysisSection isCalculated={isCalculated} cumPrice={parseInt(cumDatePrice) || 0} riPrice={parseInt(rightPrice) || 0} ratioOld={parseDecimalId(ratioOld)} ratioNew={parseDecimalId(ratioNew)} newSharesCount={numericValues.newSharesCount} totalShares={numericValues.totalShares} avgBaru={numericValues.avgBaru} terp={numericValues.terp} />
                </Suspense>
              </div>
            )}
            </div>
          </div>

          {/* Wizard Navigation Buttons */}
          {wizardStep < 4 && (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handlePrev}
                disabled={wizardStep === 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                {language === 'id' ? 'Kembali' : 'Back'}
              </button>
              
              <span className="text-[10px] text-muted-foreground">
                {wizardStep} / 4
              </span>
              
              <button
                onClick={handleNext}
                disabled={!canGoNext()}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-primary/20"
              >
                {wizardStep === 3 ? (language === 'id' ? 'Hitung' : 'Calculate') : (language === 'id' ? 'Lanjut' : 'Next')}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* View mode toggle */}
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setUseWizardMode(false)}
              className="text-[10px] text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
            >
              {language === 'id' ? 'Tampilkan semua field sekaligus' : 'Show all fields at once'}
            </button>
          </div>
        </div>
      );
    }

    // Full mode (non-wizard)
    return (
      <div className="space-y-3">
        {activeTab === 'calculator' && useWizardMode === false && (
          <div className="flex justify-end mb-2">
            <button
              onClick={() => { setUseWizardMode(true); setWizardStep(1); }}
              className="text-[10px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <Zap className="w-3 h-3" />
              {language === 'id' ? 'Mode Step-by-Step' : 'Step-by-Step Mode'}
            </button>
          </div>
        )}
        <StockCodeInput value={stockCode} onChange={setStockCode} />
        <RightIssueInfoSection
          ratioOld={ratioOld} ratioNew={ratioNew} rightPrice={rightPrice} cumDatePrice={cumDatePrice}
          onRatioOldChange={setRatioOld} onRatioNewChange={setRatioNew} onRightPriceChange={setRightPrice} onCumDatePriceChange={setCumDatePrice}
          ratioError={ratioError} hasWarrant={hasWarrant} onHasWarrantChange={setHasWarrant}
          warrantRatioOld={warrantRatioOld} warrantRatioNew={warrantRatioNew}
          onWarrantRatioOldChange={setWarrantRatioOld} onWarrantRatioNewChange={setWarrantRatioNew} warrantRatioError={warrantRatioError}
        />
        <OwnershipSection
          currentLots={currentLots} currentAvgPrice={currentAvgPrice} currentTotalValue={currentTotalValue}
          newLotsCount={newLotsCount} newAvgPrice={newAvgPrice} newTotalValue={newTotalValue}
          finalLots={finalLots} finalAvgPrice={finalAvgPrice} finalTotalValue={finalTotalValue}
          onCurrentLotsChange={setCurrentLots} onCurrentAvgPriceChange={setCurrentAvgPrice}
          onCalculate={calculate} isCalculateEnabled={isCalculateEnabled} isCalculated={isCalculated}
          noOwnership={noOwnership} onNoOwnershipChange={setNoOwnership}
          hmetdLots={hmetdLots} onHmetdLotsChange={setHmetdLots}
        />

        {isCalculated && (
          <>
            <div ref={resultsDashboardRef}>
              <ResultsDashboard
                isCalculated={isCalculated} finalAvgPrice={finalAvgPrice} theoreticalPrice={theoreticalPrice}
                finalLots={finalLots} finalTotalValue={finalTotalValue} newLotsCount={newLotsCount} newTotalValue={newTotalValue}
                recommendation={recommendation} recommendationText={recommendationText}
              />
            </div>
            {/* Mobile action bar - share/export/reset */}
            <div className="flex md:hidden items-center justify-center gap-2 py-2">
              <ShareButtons
                resultRef={resultRef}
                isCalculated={isCalculated}
                shareData={{ stockCode, ratioOld, ratioNew, rightPrice, cumDatePrice, currentLots, currentAvgPrice }}
                exportData={{ currentTotalValue, newSharesCount: newLotsCount, newTotalValue, finalShares: finalLots, finalAvgPrice, finalTotalValue, theoreticalPrice, recommendation, recommendationText, hasWarrant, warrantCount }}
              />
              <ExportPDFButton
                isCalculated={isCalculated}
                data={{ stockCode, ratioOld, ratioNew, rightPrice, cumDatePrice, currentLots, currentAvgPrice, hasWarrant, warrantRatioOld, warrantRatioNew, newLotsCount, finalLots, finalAvgPrice, finalTotalValue, theoreticalPrice, recommendation, recommendationText, warrantCount, currentTotalValue, newTotalValue }}
              />
              <button onClick={reset} className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {hasWarrant && <WarrantResultSection warrantCount={warrantCount} isCalculated={isCalculated} />}
        <LotOptimizationSection ratioOld={ratioOld} ratioNew={ratioNew} currentLots={currentLots} onCurrentLotsChange={setCurrentLots} isCalculated={isCalculated} hasWarrant={hasWarrant} warrantRatioOld={warrantRatioOld} warrantRatioNew={warrantRatioNew} />
        <ConclusionSection newLots={newLotsCount} exercisePrice={rightPrice ? formatCurrency(parseInt(rightPrice)) : 'Rp 0'} totalCost={newTotalValue} newAvgPrice={isCalculated ? finalAvgPrice : '-'} theoreticalPrice={theoreticalPrice} recommendation={recommendation} recommendationText={recommendationText} isCalculated={isCalculated} />
        <Suspense fallback={<LazyFallback />}>
          <DilutionSimulator isCalculated={isCalculated} currentShares={(parseInt(currentLots) || 0) * 100} newSharesEntitled={numericValues.newSharesCount} ratioOld={parseDecimalId(ratioOld)} ratioNew={parseDecimalId(ratioNew)} />
          <ScenarioComparison isCalculated={isCalculated} cumPrice={parseInt(cumDatePrice) || 0} riPrice={parseInt(rightPrice) || 0} terp={numericValues.terp} ratioOld={parseDecimalId(ratioOld)} ratioNew={parseDecimalId(ratioNew)} currentShares={(parseInt(currentLots) || 0) * 100} newSharesCount={numericValues.newSharesCount} currentAvgPrice={parseInt(currentAvgPrice) || 0} />
          <WhatIfTargetPrice isCalculated={isCalculated} currentShares={(parseInt(currentLots) || 0) * 100} newSharesCount={numericValues.newSharesCount} currentAvgPrice={parseInt(currentAvgPrice) || 0} riPrice={parseInt(rightPrice) || 0} cumPrice={parseInt(cumDatePrice) || 0} terp={numericValues.terp} />
          <AdvancedAnalysisSection isCalculated={isCalculated} cumPrice={parseInt(cumDatePrice) || 0} riPrice={parseInt(rightPrice) || 0} ratioOld={parseDecimalId(ratioOld)} ratioNew={parseDecimalId(ratioNew)} newSharesCount={numericValues.newSharesCount} totalShares={numericValues.totalShares} avgBaru={numericValues.avgBaru} terp={numericValues.terp} />
        </Suspense>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Floating Summary Bar */}
      <FloatingSummary
        isVisible={resultsOutOfView && isCalculated}
        stockCode={stockCode || undefined}
        avgPrice={finalAvgPrice}
        terp={theoreticalPrice}
        recommendation={recommendation}
      />
      {/* Header - Gradient with branding (sticky) */}
      <header className="header-gradient relative overflow-hidden sticky top-0 z-50">
        {/* Mesh texture overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 40%)',
        }} />
        
        <div className="relative max-w-2xl mx-auto px-3 py-3 md:px-4 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <Logo size={24} color="#fff" className="flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-base md:text-xl font-black tracking-tight text-primary-foreground truncate">
                  {t('app.title')}
                </h1>
                <p className="text-[9px] md:text-xs text-primary-foreground/70 mt-0.5 truncate">
                  {language === 'id' ? 'Simulasi Right Issue Cepat & Akurat' : 'Fast & Accurate Right Issue Simulation'}
                </p>
              </div>
            </div>

            {/* Progress Ring - wizard mode, not yet calculated */}
            {useWizardMode && !isCalculated && activeTab === 'calculator' && (
              <ProgressRing percent={completionPercent} />
            )}
            
            {/* Desktop toolbar */}
            <div className="hidden md:flex items-center gap-1.5">
              {toolbarItems}
            </div>

            {/* Mobile: History + Settings only */}
            <div className="flex md:hidden items-center gap-1">
              <HistoryDropdown history={history} onSelectHistory={loadFromHistory} onRemoveHistory={removeFromHistory} onClearHistory={clearHistory} />
              <SettingsDropdown
                onOpenKeyboardHelp={() => setKeyboardHelpOpen(true)}
                onOpenEmbed={() => setEmbedOpen(true)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main ref={resultRef} className={`flex-1 max-w-2xl mx-auto w-full px-3 py-3 md:px-4 md:py-4 ${isMobile ? 'pb-20' : ''}`}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Desktop tabs */}
          <TabsList className="w-full mb-4 hidden md:flex">
            <TabsTrigger value="calculator" className="flex-1 text-xs">
              {t('tab.calculator')}
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex-1 text-xs">
              {t('tab.budgetPlanner')}
            </TabsTrigger>
            <TabsTrigger value="education" className="flex-1 text-xs">
              {t('tab.education')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="calculator" className="mt-0">
            {renderCalculatorContent()}
          </TabsContent>
          
          <TabsContent value="budget" className="mt-0">
            <Suspense fallback={<LazyFallback />}>
              <BudgetLotPlanner onApplyToCalculator={handleApplyFromBudgetPlanner} />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="education" className="mt-0">
            <Suspense fallback={<LazyFallback />}>
              <EducationSection />
            </Suspense>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer - same color as header */}
      <footer className={`header-gradient relative overflow-hidden py-3 px-4 mt-auto ${isMobile ? 'mb-14' : ''}`}>
        <div className="flex items-center justify-center gap-2 relative z-10">
          <Logo size={16} color="rgba(255,255,255,0.6)" />
          <p className="text-[11px] text-primary-foreground/70 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> by{' '}
            <a href="https://alfindigital.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary-foreground transition-colors text-primary-foreground/80">alfindigital</a>
          </p>
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      {isMobile && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}

      <BackToTopButton />
    </div>
  );
};

export default RightIssueCalculator;
