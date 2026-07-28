import React, { useState, useEffect, useCallback, useRef, lazy, Suspense, startTransition } from 'react';
import { RotateCcw } from 'lucide-react';
import RightIssueInfoSection from './RightIssueInfoSection';
import OwnershipSection from './OwnershipSection';
import ConclusionSection from './ConclusionSection';
import WarrantResultSection from './WarrantSection';
import LotOptimizationSection from './LotOptimizationSection';
import HistoryDropdown from './HistoryDropdown';
import SettingsDropdown from './SettingsDropdown';
import { InstallAppButton } from '@/components/InstallAppButton';
import ShareButtons from './ShareButtons';
import StockCodeInput from './StockCodeInput';
import BackToTopButton from './BackToTopButton';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';
import EmbedCodeModal from './EmbedCodeModal';
import ResultsDashboard from './ResultsDashboard';
import FloatingSummary from './FloatingSummary';
import BottomNav from './BottomNav';
import Logo from './Logo';
import EmptyStateCard from './EmptyStateCard';
import SmartResultBar from './SmartResultBar';
import { ViewMode } from './ViewModeToggle';
import AdvancedSectionsAccordion from './AdvancedSectionsAccordion';
import { ONBOARDING_STORAGE_KEY } from './OnboardingTour';
const OnboardingTour = lazy(() => import('./OnboardingTour'));
import StickyCalculateBar from './StickyCalculateBar';
import PullToRefreshIndicator from './PullToRefreshIndicator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCalculationHistory, CalculationHistoryItem } from '@/hooks/useCalculationHistory';
import { parseDecimalId } from '@/lib/parseDecimal';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useBackGestureClose } from '@/hooks/useBackGestureClose';
import { setOrder as setAutoAdvanceOrder, type FieldKey } from '@/lib/autoAdvance';
import { haptic, hapticSuccess, hapticTap } from '@/lib/haptics';
import { track } from '@/lib/analytics';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load heavy components (charts, analysis)
const importDilution = () => import('./DilutionSimulator');
const importScenario = () => import('./ScenarioComparison');
const importAdvanced = () => import('./AdvancedAnalysisSection');
const importWhatIf = () => import('./WhatIfTargetPrice');
const importEducation = () => import('./EducationSection');
const importBudget = () => import('./BudgetLotPlanner');
const DilutionSimulator = lazy(importDilution);
const ScenarioComparison = lazy(importScenario);
const AdvancedAnalysisSection = lazy(importAdvanced);
const WhatIfTargetPrice = lazy(importWhatIf);
const EducationSection = lazy(importEducation);
const BudgetLotPlanner = lazy(importBudget);
// Lazy type import for callback
type BudgetPlannerData = import('./BudgetLotPlanner').BudgetPlannerData;

const BudgetSkeleton = () => (
  <div className="space-y-3 animate-pulse" aria-busy="true" aria-label="Loading">
    <Skeleton className="h-10 w-2/3" />
    <div className="rounded-2xl border border-border p-4 space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <Skeleton className="h-24 rounded-2xl" />
      <Skeleton className="h-24 rounded-2xl" />
    </div>
    <Skeleton className="h-32 rounded-2xl" />
  </div>
);

const EducationSkeleton = () => (
  <div className="space-y-3 animate-pulse" aria-busy="true" aria-label="Loading">
    <Skeleton className="h-8 w-1/2" />
    <Skeleton className="h-4 w-3/4" />
    <div className="space-y-2 pt-2">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-14 w-full rounded-xl" />
      ))}
    </div>
  </div>
);

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
  const { saveToStorage, clearStorage } = useAutoSave();
  const { t, language } = useLanguage();
  const isMobile = useIsMobile();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('calculator');
  // Track which tabs have been visited — keep them mounted to avoid re-loading lazy chunks
  const [visitedTabs, setVisitedTabs] = useState<Record<string, boolean>>({ calculator: true });

  // Wrap tab change with haptic feedback
  const handleTabChange = useCallback((tab: string) => {
    hapticTap();
    startTransition(() => {
      setActiveTab(tab);
      setVisitedTabs((v) => (v[tab] ? v : { ...v, [tab]: true }));
    });
  }, []);

  // Preload heavy chunks during idle time so tab switches feel instant
  useEffect(() => {
    const idle = (cb: () => void) => {
      const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
      if (typeof w.requestIdleCallback === 'function') w.requestIdleCallback(cb);
      else setTimeout(cb, 1200);
    };
    // Stagger preloads across idle slots so we don't block first paint
    idle(() => {
      importBudget();
      importEducation();
    });
    idle(() => {
      importDilution();
      importScenario();
    });
    idle(() => {
      importAdvanced();
      importWhatIf();
    });
  }, []);

  // Mobile: track whether any input is focused (for sticky Hitung bar)
  const [inputFocused, setInputFocused] = useState(false);
  useEffect(() => {
    if (!isMobile) return;
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) {
        setInputFocused(true);
      }
    };
    const onFocusOut = () => {
      // small delay to allow focus to move between fields
      setTimeout(() => {
        const a = document.activeElement as HTMLElement | null;
        const stillInput = !!a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.isContentEditable);
        setInputFocused(stillInput);
      }, 80);
    };
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    return () => {
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, [isMobile]);
  
  // View mode is always 'pro' — all fields visible.
  const viewMode: ViewMode = 'pro';

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
  const [hmetdPrice, setHmetdPrice] = useState('');

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

  // Auto-save
  useEffect(() => {
    const hasData = stockCode || ratioOld || ratioNew || rightPrice || cumDatePrice || currentLots || currentAvgPrice;
    if (!hasData) return;
    saveToStorage({ stockCode, ratioOld, ratioNew, rightPrice, cumDatePrice, currentLots, currentAvgPrice, hasWarrant, warrantRatioOld, warrantRatioNew, noOwnership, hmetdLots, hmetdPrice });
  }, [stockCode, ratioOld, ratioNew, rightPrice, cumDatePrice, currentLots, currentAvgPrice, hasWarrant, warrantRatioOld, warrantRatioNew, noOwnership, hmetdLots, hmetdPrice, saveToStorage]);

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
    const wOldRaw = warrantRatioOld.trim();
    const wNewRaw = warrantRatioNew.trim();
    const wOld = parseDecimalId(warrantRatioOld);
    const wNew = parseDecimalId(warrantRatioNew);
    if (!wOldRaw || !wNewRaw) {
      setWarrantRatioError(t('validation.warrantRatioMissing'));
    } else if (wOld === 0) {
      setWarrantRatioError('Rasio RI tidak boleh 0');
    } else if (wNew === 0) {
      setWarrantRatioError('Rasio waran tidak boleh 0');
    } else {
      setWarrantRatioError('');
    }
  }, [hasWarrant, warrantRatioOld, warrantRatioNew, t]);

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

    // Satu sumber kebenaran: semua rumus dari src/lib/riMath.ts (ter-unit-test).
    const ri = calcRightIssue({
      ratioOld: rOld,
      ratioNew: rNew,
      riPrice,
      cumPrice,
      currentLots: lots,
      currentAvgPrice: avgPrice,
      noOwnership,
      hmetdLots: parseInt(hmetdLots) || 0,
      hmetdPrice: parseInt(hmetdPrice) || 0,
    });

    const { newShares, newLots, isWholeLot, totalShares, totalValue } = ri;
    setNewLotsCount(isWholeLot ? formatNumber(newLots) : newLots.toFixed(2).replace('.', ','));
    setNewAvgPrice(formatCurrency(riPrice));

    setNewTotalValue(formatCurrency(ri.newValue));

    const totalLotsNum = ri.totalLots;
    const isWholeFinalLot = ri.isWholeFinalLot;
    setFinalLots(isWholeFinalLot ? formatNumber(totalLotsNum) : totalLotsNum.toFixed(2).replace('.', ','));
    setFinalTotalValue(formatCurrency(totalValue));

    const finalAvg = ri.finalAvgPrice;
    setFinalAvgPrice(formatCurrency(finalAvg));

    const terpRounded = ri.terp;
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

    // Detect premium vs discount RI: harga pelaksanaan vs harga pasar (cum price).
    // - Discount (riPrice < cumPrice): HMETD punya nilai teoritis positif → biasanya rasional menebus.
    // - Premium (riPrice > cumPrice): HMETD tidak menguntungkan; menebus menaikkan avg. Umumnya lebih baik tidak menebus.
    // - Setara (riPrice ≈ cumPrice): netral.
    const isPremiumRI = cumPrice > 0 && riPrice > cumPrice;
    const isDiscountRI = cumPrice > 0 && riPrice < cumPrice;
    const priceGap = riPrice - cumPrice;
    const priceGapPct = cumPrice > 0 ? ((priceGap / cumPrice) * 100).toFixed(2) : '0';

    if (isPremiumRI) {
      // Premium: hampir selalu kurang menguntungkan menebus dari sisi harga.
      setRecommendation('negative');
      setRecommendationText(
        `Harga pelaksanaan (${formatCurrency(riPrice)}) berada Rp ${formatNumber(priceGap)} (${priceGapPct}%) di ATAS harga pasar (${formatCurrency(cumPrice)}). Rights berpotensi tidak bernilai (HMETD ≈ 0) sehingga menebus akan menaikkan harga rata-rata Anda. Umumnya lebih rasional untuk tidak menebus, atau menjual HMETD selama masih likuid.`
      );
      haptic(15);
    } else if (finalAvg < terpRounded) {
      setRecommendation('positive');
      const discountNote = isDiscountRI
        ? ` Harga pelaksanaan (${formatCurrency(riPrice)}) juga berada di bawah harga pasar (${formatCurrency(cumPrice)}) — HMETD memiliki nilai teoritis positif.`
        : '';
      setRecommendationText(
        `Harga rata-rata baru Anda (${formatCurrency(finalAvg)}) berada Rp ${formatNumber(priceDiff)} (${priceDiffPercent}%) di bawah TERP (${formatCurrency(terpRounded)}). Secara teoritis, menebus RI berpotensi memberikan keuntungan.${discountNote}`
      );
      hapticSuccess();
    } else {
      setRecommendation('negative');
      const negativeDiff = Math.abs(priceDiff);
      const negativeDiffPercent = finalAvg > 0 ? ((negativeDiff / finalAvg) * 100).toFixed(2) : '0';
      setRecommendationText(
        `Harga rata-rata baru Anda (${formatCurrency(finalAvg)}) berada Rp ${formatNumber(negativeDiff)} (${negativeDiffPercent}%) di atas atau sama dengan TERP (${formatCurrency(terpRounded)}). Pertimbangkan alternatif seperti menjual HMETD.`
      );
      haptic(15);
    }

    // Show skeleton loading briefly before revealing results (respects reduced motion)
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const skeletonDelay = prefersReducedMotion ? 0 : 350;
    if (skeletonDelay === 0) {
      setIsCalculated(true);
    } else {
      setIsCalculating(true);
      setIsCalculated(false);
      setTimeout(() => {
        setIsCalculated(true);
        setIsCalculating(false);
      }, skeletonDelay);
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
        recommendation: !isPremiumRI && finalAvg < terpRounded ? 'positive' : 'negative',
      },
    });
    track('calculate_clicked', {
      hasWarrant,
      noOwnership,
      hasStockCode: !!stockCode,
      recommendation: !isPremiumRI && finalAvg < terpRounded ? 'positive' : 'negative',
      riMode: isPremiumRI ? 'premium' : (isDiscountRI ? 'discount' : 'parity'),
    });
  }, [ratioOld, ratioNew, rightPrice, cumDatePrice, currentLots, currentAvgPrice, hasWarrant, warrantRatioOld, warrantRatioNew, stockCode, addToHistory, noOwnership, hmetdLots, hmetdPrice]);

  // Load ELPI demo data — right issue terbaru IDX 2026 (rasio 200:57 @ Rp350).
  const loadDemo = useCallback(() => {
    setStockCode('ELPI');
    setRatioOld('200');
    setRatioNew('57');
    setRightPrice('350');
    setCumDatePrice('1200');
    setCurrentLots('20');
    setCurrentAvgPrice('1000');
    setHasWarrant(false);
    setWarrantRatioOld(''); setWarrantRatioNew('');
    setNoOwnership(false);
    track('demo_loaded');
    toast({
      title: language === 'id' ? 'Contoh dimuat' : 'Example loaded',
      description: language === 'id' ? 'Data contoh ELPI (RI 200:57 @ Rp350) dipakai. Edit bebas.' : 'ELPI sample data (RI 200:57 @ Rp350) loaded. Edit freely.',
      duration: 2500,
    });
  }, [language]);

  const reset = useCallback(() => {
    setStockCode(''); setRatioOld(''); setRatioNew(''); setRightPrice(''); setCumDatePrice('');
    setCurrentLots(''); setCurrentAvgPrice(''); setHasWarrant(false); setWarrantRatioOld(''); setWarrantRatioNew('');
    setNoOwnership(false); setHmetdLots(''); setHmetdPrice('');
    setCurrentTotalValue('Rp 0'); setNewLotsCount('0'); setNewAvgPrice('Rp 0'); setNewTotalValue('Rp 0');
    setFinalLots('0'); setFinalAvgPrice('Rp 0'); setFinalTotalValue('Rp 0'); setTheoreticalPrice('-');
    setWarrantCount('0'); setRecommendation(null); setRecommendationText(''); setIsCalculated(false); setIsCalculating(false);
    setNumericValues({ newSharesCount: 0, totalShares: 0, totalModal: 0, avgBaru: 0, terp: 0 });
    clearStorage();
  }, [clearStorage]);

  // Pull-to-refresh (mobile) → reset form with mini confirm
  const handlePullRefresh = useCallback(() => {
    if (typeof window === 'undefined') return;
    haptic(20);
    const hasAnyData =
      stockCode || ratioOld || ratioNew || rightPrice || cumDatePrice ||
      currentLots || currentAvgPrice || isCalculated;
    if (!hasAnyData) return;
    const msg = language === 'id'
      ? 'Reset semua input dan hasil?'
      : 'Reset all inputs and results?';
    if (window.confirm(msg)) {
      reset();
      hapticSuccess();
      toast({
        title: language === 'id' ? 'Form direset' : 'Form reset',
        description: language === 'id' ? 'Semua input dikosongkan.' : 'All inputs cleared.',
        duration: 2200,
      });
    }
  }, [stockCode, ratioOld, ratioNew, rightPrice, cumDatePrice, currentLots, currentAvgPrice, isCalculated, language, reset]);

  const { pull, progress } = usePullToRefresh({
    onRefresh: handlePullRefresh,
    enabled: isMobile,
    threshold: 80,
  });

  const buildShareParams = useCallback(() => {
    const params = new URLSearchParams();
    if (stockCode) params.set('sc', stockCode);
    if (ratioOld) params.set('ro', ratioOld);
    if (ratioNew) params.set('rn', ratioNew);
    if (rightPrice) params.set('rp', rightPrice);
    if (cumDatePrice) params.set('cp', cumDatePrice);
    if (noOwnership) {
      params.set('no', '1');
      if (hmetdLots) params.set('hl', hmetdLots);
      if (hmetdPrice) params.set('hp', hmetdPrice);
    } else {
      if (currentLots) params.set('cs', currentLots);
      if (currentAvgPrice) params.set('ca', currentAvgPrice);
    }
    if (hasWarrant && warrantRatioOld && warrantRatioNew) {
      params.set('hw', '1');
      params.set('wro', warrantRatioOld);
      params.set('wrn', warrantRatioNew);
    }
    return params;
  }, [stockCode, ratioOld, ratioNew, rightPrice, cumDatePrice, currentLots, currentAvgPrice, noOwnership, hmetdLots, hmetdPrice, hasWarrant, warrantRatioOld, warrantRatioNew]);

  const handleShare = useCallback(() => {
    const params = buildShareParams();
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    track('share_link_copied');
    toast({ title: t('toast.copied'), description: t('toast.copiedDesc'), duration: 3000 });
  }, [buildShareParams, t]);

  // Sync URL with current inputs after a successful calculation so the address bar
  // is always a shareable deep-link (no history spam — uses replaceState).
  useEffect(() => {
    if (!isCalculated) return;
    if (typeof window === 'undefined') return;
    const params = buildShareParams();
    const qs = params.toString();
    const target = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    if (window.location.pathname + window.location.search !== target) {
      window.history.replaceState(null, '', target);
    }
  }, [isCalculated, buildShareParams]);

  useKeyboardShortcuts({ onCalculate: calculate, onReset: reset, onShare: handleShare, isCalculateEnabled });

  const handleApplyFromBudgetPlanner = useCallback((data: BudgetPlannerData) => {
    setRatioOld(data.ratioOld); setRatioNew(data.ratioNew); setRightPrice(data.rightPrice);
    setCumDatePrice(data.cumDatePrice); setCurrentLots(String(data.lots)); setCurrentAvgPrice(data.currentAvgPrice);
    setHasWarrant(data.hasWarrant); setWarrantRatioOld(data.warrantRatioOld); setWarrantRatioNew(data.warrantRatioNew);
    setActiveTab('calculator');
    // Defer calculate so state updates settle in the same render cycle.
    setTimeout(() => calculate(), 0);
    toast({ title: t('budgetPlanner.applied'), description: `${data.lots} lot ${t('budgetPlanner.appliedDesc')}`, duration: 3000 });
  }, [t, calculate]);

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
  }, [language]);

  // Settings modal states
  const [keyboardHelpOpen, setKeyboardHelpOpen] = useState(false);
  const [embedOpen, setEmbedOpen] = useState(false);
  const [tourReplayKey, setTourReplayKey] = useState(0);
  const [tourForceRun, setTourForceRun] = useState(false);

  // Back-gesture / Android back button closes modal first.
  useBackGestureClose(keyboardHelpOpen, () => setKeyboardHelpOpen(false));
  useBackGestureClose(embedOpen, () => setEmbedOpen(false));

  // Keep auto-advance field order in sync with the active mode.
  useEffect(() => {
    const base: FieldKey[] = ['ratioOld', 'ratioNew', 'rightPrice'];
    const order: FieldKey[] = [...base];
    order.push('cumDatePrice');
    if (noOwnership) {
      order.push('hmetdLots', 'hmetdPrice');
    } else {
      order.push('currentLots', 'currentAvgPrice');
    }
    if (hasWarrant) order.push('warrantRatioOld', 'warrantRatioNew');
    setAutoAdvanceOrder(order);
  }, [noOwnership, hasWarrant]);

  // Smart paste (explicit paste-parser button in RightIssueInfoSection) — the
  // ambient clipboard watcher was removed to keep behavior predictable.

  const replayTour = useCallback(() => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    setTourForceRun(true);
    setTourReplayKey((k) => k + 1);
  }, []);

  // Swipe between main tabs (mobile only)
  const TAB_ORDER = ['calculator', 'budget', 'education'];
  const goToAdjacentTab = useCallback((dir: 1 | -1) => {
    const i = TAB_ORDER.indexOf(activeTab);
    const next = i + dir;
    if (next >= 0 && next < TAB_ORDER.length) setActiveTab(TAB_ORDER[next]);
  }, [activeTab]);
  const tabSwipeHandlers = useSwipeGesture({
    onSwipeLeft: () => goToAdjacentTab(1),
    onSwipeRight: () => goToAdjacentTab(-1),
    threshold: 80,
    dominanceRatio: 1.8,
  });
  const enableTabSwipe = isMobile;

  // Prefetch lazy chunk for a given tab — used on touchstart/hover on bottom nav.
  const prefetchTab = useCallback((tab: string) => {
    if (tab === 'budget') importBudget();
    else if (tab === 'education') importEducation();
  }, []);

  // Long-press shortcuts for bottom nav tabs.
  const bottomNavShortcuts = useCallback(
    (tab: string) => {
      if (tab === 'calculator') {
        return [
          {
            label: language === 'id' ? 'Hitung ulang' : 'Recalculate',
            onSelect: () => { setActiveTab('calculator'); if (isCalculateEnabled) calculate(); },
          },
          {
            label: language === 'id' ? 'Reset form' : 'Reset form',
            onSelect: () => { setActiveTab('calculator'); reset(); },
          },
          {
            label: language === 'id' ? 'Muat contoh (ELPI)' : 'Load example (ELPI)',
            onSelect: () => { setActiveTab('calculator'); loadDemo(); },
          },
        ];
      }
      if (tab === 'budget') {
        return [
          {
            label: language === 'id' ? 'Buka Budget Planner' : 'Open Budget Planner',
            onSelect: () => setActiveTab('budget'),
          },
        ];
      }
      if (tab === 'education') {
        return [
          {
            label: language === 'id' ? 'Buka Edukasi' : 'Open Education',
            onSelect: () => setActiveTab('education'),
          },
        ];
      }
      return [];
    },
    [language, isCalculateEnabled, calculate, reset, loadDemo],
  );

  // Toolbar items
  const toolbarItems = (
    <>
      <ShareButtons
        resultRef={resultRef}
        isCalculated={isCalculated}
        shareData={{ stockCode, ratioOld, ratioNew, rightPrice, cumDatePrice, currentLots, currentAvgPrice }}
        exportData={{ currentTotalValue, newSharesCount: newLotsCount, newTotalValue, finalShares: finalLots, finalAvgPrice, finalTotalValue, theoreticalPrice, recommendation, recommendationText, hasWarrant, warrantCount }}
        pdfData={{ stockCode, ratioOld, ratioNew, rightPrice, cumDatePrice, currentLots, currentAvgPrice, hasWarrant, warrantRatioOld, warrantRatioNew, newLotsCount, finalLots, finalAvgPrice, finalTotalValue, theoreticalPrice, recommendation, recommendationText, warrantCount, currentTotalValue, newTotalValue }}
      />
      <HistoryDropdown history={history} onSelectHistory={loadFromHistory} onRemoveHistory={removeFromHistory} onClearHistory={clearHistory} />
      {isCalculated && (
        <button onClick={reset} className="p-1.5 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground transition-colors" aria-label="Reset">
          <RotateCcw className="w-4 h-4" />
        </button>
      )}
      <InstallAppButton />
      <SettingsDropdown
        onOpenKeyboardHelp={() => setKeyboardHelpOpen(true)}
        onOpenEmbed={() => setEmbedOpen(true)}
        onReplayTour={replayTour}
      />
      <KeyboardShortcutsHelp externalOpen={keyboardHelpOpen} onExternalOpenChange={setKeyboardHelpOpen} />
      <EmbedCodeModal externalOpen={embedOpen} onExternalOpenChange={setEmbedOpen} />
    </>
  );

  // Render calculator content
  const renderCalculatorContent = () => {
    const isSimple = false;
    return (
      <div className="space-y-3">
        <StockCodeInput value={stockCode} onChange={setStockCode} />
        <RightIssueInfoSection
          ratioOld={ratioOld} ratioNew={ratioNew} rightPrice={rightPrice} cumDatePrice={cumDatePrice}
          onRatioOldChange={setRatioOld} onRatioNewChange={setRatioNew} onRightPriceChange={setRightPrice} onCumDatePriceChange={setCumDatePrice}
          ratioError={ratioError} hasWarrant={hasWarrant} onHasWarrantChange={setHasWarrant}
          warrantRatioOld={warrantRatioOld} warrantRatioNew={warrantRatioNew}
          onWarrantRatioOldChange={setWarrantRatioOld} onWarrantRatioNewChange={setWarrantRatioNew} warrantRatioError={warrantRatioError}
          simpleMode={isSimple}
          onPasteParsed={(data) => {
            if (data.ratioOld) setRatioOld(data.ratioOld);
            if (data.ratioNew) setRatioNew(data.ratioNew);
            if (data.rightPrice) setRightPrice(data.rightPrice);
          }}
        />
        <OwnershipSection
          currentLots={currentLots} currentAvgPrice={currentAvgPrice} currentTotalValue={currentTotalValue}
          newLotsCount={newLotsCount} newAvgPrice={newAvgPrice} newTotalValue={newTotalValue}
          finalLots={finalLots} finalAvgPrice={finalAvgPrice} finalTotalValue={finalTotalValue}
          onCurrentLotsChange={setCurrentLots} onCurrentAvgPriceChange={setCurrentAvgPrice}
          onCalculate={calculate} isCalculateEnabled={isCalculateEnabled} isCalculated={isCalculated}
          noOwnership={noOwnership} onNoOwnershipChange={setNoOwnership}
          hmetdLots={hmetdLots} onHmetdLotsChange={setHmetdLots}
          hmetdPrice={hmetdPrice} onHmetdPriceChange={setHmetdPrice}
          hmetdTotalCost={noOwnership && isCalculated ? formatCurrency(((parseInt(hmetdPrice) || 0) + (parseInt(rightPrice) || 0)) * ((parseInt(hmetdLots) || 0) * 100)) : undefined}
        />

        {!isCalculated && !isCalculating && (
          <>
            <EmptyStateCard onLoadDemo={loadDemo} />
          </>
        )}

        {(isCalculated || isCalculating) && (
          <>
            <div ref={resultsDashboardRef}>
              <ResultsDashboard
                isCalculated={isCalculated} isLoading={isCalculating}
                finalAvgPrice={finalAvgPrice} theoreticalPrice={theoreticalPrice}
                finalLots={finalLots} finalTotalValue={finalTotalValue} newLotsCount={newLotsCount} newTotalValue={newTotalValue}
                recommendation={recommendation} recommendationText={recommendationText}
              />
            </div>
            {isCalculated && !noOwnership && (
              <Suspense fallback={<LazyFallback />}>
                <ScenarioComparison
                  isCalculated={isCalculated}
                  cumPrice={parseInt(cumDatePrice) || 0}
                  riPrice={parseInt(rightPrice) || 0}
                  terp={numericValues.terp}
                  ratioOld={parseDecimalId(ratioOld)}
                  ratioNew={parseDecimalId(ratioNew)}
                  currentShares={(parseInt(currentLots) || 0) * 100}
                  newSharesCount={numericValues.newSharesCount}
                  currentAvgPrice={parseInt(currentAvgPrice) || 0}
                />
              </Suspense>
            )}
          {isCalculated && (<>
            {/* Mobile action bar - share/export/reset */}
            <div className="flex md:hidden items-center justify-center gap-2 py-2">
              <ShareButtons
                resultRef={resultRef}
                isCalculated={isCalculated}
                shareData={{ stockCode, ratioOld, ratioNew, rightPrice, cumDatePrice, currentLots, currentAvgPrice }}
                exportData={{ currentTotalValue, newSharesCount: newLotsCount, newTotalValue, finalShares: finalLots, finalAvgPrice, finalTotalValue, theoreticalPrice, recommendation, recommendationText, hasWarrant, warrantCount }}
                pdfData={{ stockCode, ratioOld, ratioNew, rightPrice, cumDatePrice, currentLots, currentAvgPrice, hasWarrant, warrantRatioOld, warrantRatioNew, newLotsCount, finalLots, finalAvgPrice, finalTotalValue, theoreticalPrice, recommendation, recommendationText, warrantCount, currentTotalValue, newTotalValue }}
              />
              <button onClick={reset} className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </>)}
          </>
        )}

        {hasWarrant && <WarrantResultSection warrantCount={warrantCount} isCalculated={isCalculated} />}

        {/* Advanced sections — only in Pro mode */}
        {!isSimple && (
          <>
            <ConclusionSection newLots={newLotsCount} exercisePrice={rightPrice ? formatCurrency(parseInt(rightPrice)) : 'Rp 0'} totalCost={newTotalValue} newAvgPrice={isCalculated ? finalAvgPrice : '-'} theoreticalPrice={theoreticalPrice} recommendation={recommendation} recommendationText={recommendationText} isCalculated={isCalculated} />
            {isCalculated && (
              <AdvancedSectionsAccordion
                isCalculated={isCalculated}
                ratioOld={ratioOld}
                ratioNew={ratioNew}
                currentLots={currentLots}
                onCurrentLotsChange={setCurrentLots}
                hasWarrant={hasWarrant}
                warrantRatioOld={warrantRatioOld}
                warrantRatioNew={warrantRatioNew}
                cumPrice={parseInt(cumDatePrice) || 0}
                riPrice={parseInt(rightPrice) || 0}
                currentShares={(parseInt(currentLots) || 0) * 100}
                newSharesCount={numericValues.newSharesCount}
                totalShares={numericValues.totalShares}
                avgBaru={numericValues.avgBaru}
                terp={numericValues.terp}
                currentAvgPrice={parseInt(currentAvgPrice) || 0}
                ratioOldNum={parseDecimalId(ratioOld)}
                ratioNewNum={parseDecimalId(ratioNew)}
              />
            )}
          </>
        )}

        {/* Pro-only mode: no display-mode switch. */}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Floating Summary Bar — desktop only; mobile uses SmartResultBar */}
      <FloatingSummary
        isVisible={!isMobile && resultsOutOfView && isCalculated}
        stockCode={stockCode || undefined}
        avgPrice={finalAvgPrice}
        terp={theoreticalPrice}
        recommendation={recommendation}
      />
      {/* Mobile sticky result bar — always visible when calculated */}
      <SmartResultBar
        isVisible={isMobile && isCalculated}
        stockCode={stockCode || undefined}
        finalTotalValue={finalTotalValue}
        recommendation={recommendation}
        recommendationLabel={
          recommendation === 'positive'
            ? (language === 'id' ? 'Tebus' : 'Exercise')
            : (language === 'id' ? 'Tahan' : 'Hold')
        }
        onTap={() => resultsDashboardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
      />
      {/* Header - Gradient with branding (sticky) */}
      <header className="header-gradient relative overflow-hidden sticky top-0 z-50">
        {/* Mesh texture overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 40%)',
        }} />
        
        <div className="relative max-w-2xl mx-auto px-3 py-2.5 md:px-4 md:py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0 flex items-center gap-2.5">
              <Logo
                size={20}
                badge
                className="flex-shrink-0 text-primary-foreground"
              />
              <div className="min-w-0 leading-tight">
                <h1 className="text-sm md:text-base font-black tracking-tight text-primary-foreground truncate">
                  {t('app.title')}
                </h1>
                <p className="text-[8px] md:text-[10px] text-primary-foreground/70 mt-0.5 truncate">
                  {language === 'id' ? 'Simulasi Right Issue Cepat & Akurat' : 'Fast & Accurate Right Issue Simulation'}
                </p>
              </div>
            </div>

            {/* Desktop toolbar */}
            <div className="hidden md:flex items-center gap-1.5">
              {toolbarItems}
            </div>

            {/* Mobile: History + Settings only */}
            <div className="flex md:hidden items-center gap-1">
              <HistoryDropdown history={history} onSelectHistory={loadFromHistory} onRemoveHistory={removeFromHistory} onClearHistory={clearHistory} />
              <InstallAppButton />
              <SettingsDropdown
                onOpenKeyboardHelp={() => setKeyboardHelpOpen(true)}
                onOpenEmbed={() => setEmbedOpen(true)}
                onReplayTour={replayTour}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        ref={resultRef}
        className={`flex-1 max-w-2xl mx-auto w-full px-3 py-3 md:px-4 md:py-4 ${isMobile ? 'pb-20' : ''}`}
        {...(enableTabSwipe ? tabSwipeHandlers : {})}
      >
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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
          
          <TabsContent value="calculator" forceMount className="mt-0 data-[state=inactive]:hidden">
            {renderCalculatorContent()}
          </TabsContent>

          {visitedTabs.budget && (
            <TabsContent value="budget" forceMount className="mt-0 data-[state=inactive]:hidden">
              <Suspense fallback={<BudgetSkeleton />}>
                <BudgetLotPlanner onApplyToCalculator={handleApplyFromBudgetPlanner} />
              </Suspense>
            </TabsContent>
          )}

          {visitedTabs.education && (
            <TabsContent value="education" forceMount className="mt-0 data-[state=inactive]:hidden">
              <Suspense fallback={<EducationSkeleton />}>
                <EducationSection />
              </Suspense>
            </TabsContent>
          )}
        </Tabs>
      </main>


      {/* Mobile Bottom Nav */}
      {isMobile && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onTabPrefetch={prefetchTab}
          shortcutsFor={bottomNavShortcuts}
        />
      )}

      <BackToTopButton />
      <Suspense fallback={null}>
        <OnboardingTour
          key={tourReplayKey}
          forceRun={tourForceRun}
          onFinish={() => setTourForceRun(false)}
        />
      </Suspense>

      {/* Pull-to-refresh indicator (mobile) */}
      <PullToRefreshIndicator
        pull={pull}
        progress={progress}
        label={language === 'id' ? 'Tarik untuk reset' : 'Pull to reset'}
        readyLabel={language === 'id' ? 'Lepas untuk reset' : 'Release to reset'}
      />

      {/* Sticky Calculate / Scroll-to-result bar (mobile, while typing) */}
      <StickyCalculateBar
        visible={isMobile && inputFocused && activeTab === 'calculator' && (isCalculateEnabled || isCalculated)}
        isCalculated={isCalculated}
        isEnabled={isCalculateEnabled}
        label={
          isCalculated
            ? (language === 'id' ? 'Lihat Hasil' : 'View Result')
            : (language === 'id' ? 'Hitung Sekarang' : 'Calculate Now')
        }
        onCalculate={calculate}
        onScrollToResult={() =>
          resultsDashboardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      />
    </div>
  );
};

export default RightIssueCalculator;
