import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import RightIssueInfoSection from './RightIssueInfoSection';
import OwnershipSection from './OwnershipSection';
import ConclusionSection from './ConclusionSection';
import WarrantResultSection from './WarrantSection';
import LotOptimizationSection from './LotOptimizationSection';
import HistoryDropdown from './HistoryDropdown';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import ShareButtons from './ShareButtons';
import StockCodeInput from './StockCodeInput';
import AdvancedAnalysisSection from './AdvancedAnalysisSection';
import BackToTopButton from './BackToTopButton';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';
import EmbedCodeModal from './EmbedCodeModal';
import { useCalculationHistory, CalculationHistoryItem } from '@/hooks/useCalculationHistory';
import { parseDecimalId } from '@/lib/parseDecimal';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t } = useLanguage();
  const hasRestoredRef = useRef(false);
  
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

  // Warrant
  const [hasWarrant, setHasWarrant] = useState(false);
  const [warrantRatioOld, setWarrantRatioOld] = useState('');
  const [warrantRatioNew, setWarrantRatioNew] = useState('');
  const [warrantCount, setWarrantCount] = useState('0');

  // Calculated Values (display formatted)
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

  // Raw numeric values for charts (to avoid parsing formatted strings)
  const [numericValues, setNumericValues] = useState({
    newSharesCount: 0,
    totalShares: 0,
    totalModal: 0,
    avgBaru: 0,
    terp: 0,
  });

  // Validation errors
  const [ratioError, setRatioError] = useState('');
  const [warrantRatioError, setWarrantRatioError] = useState('');

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

    // Priority: URL params > auto-save
    if (sc) setStockCode(sc);
    if (ro && rn && rp && cp && cs && ca) {
      setRatioOld(ro);
      setRatioNew(rn);
      setRightPrice(rp);
      setCumDatePrice(cp);
      setCurrentLots(cs);
      setCurrentAvgPrice(ca);
    } else {
      // Try to restore from auto-save
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

  // Auto-save on input change
  useEffect(() => {
    // Skip if nothing has been entered yet
    const hasData = stockCode || ratioOld || ratioNew || rightPrice || cumDatePrice || currentLots || currentAvgPrice;
    if (!hasData) return;

    saveToStorage({
      stockCode,
      ratioOld,
      ratioNew,
      rightPrice,
      cumDatePrice,
      currentLots,
      currentAvgPrice,
      hasWarrant,
      warrantRatioOld,
      warrantRatioNew,
    });
  }, [stockCode, ratioOld, ratioNew, rightPrice, cumDatePrice, currentLots, currentAvgPrice, hasWarrant, warrantRatioOld, warrantRatioNew, saveToStorage]);

  // Validate ratios
  useEffect(() => {
    const rOld = parseDecimalId(ratioOld);
    const rNew = parseDecimalId(ratioNew);
    
    if (ratioOld && rOld === 0) {
      setRatioError('Rasio lama tidak boleh 0');
    } else if (ratioNew && rNew === 0) {
      setRatioError('Rasio baru tidak boleh 0');
    } else {
      setRatioError('');
    }
  }, [ratioOld, ratioNew]);

  useEffect(() => {
    if (!hasWarrant) {
      setWarrantRatioError('');
      return;
    }
    
    const wOld = parseDecimalId(warrantRatioOld);
    const wNew = parseDecimalId(warrantRatioNew);
    
    if (warrantRatioOld && wOld === 0) {
      setWarrantRatioError('Rasio RI tidak boleh 0');
    } else if (warrantRatioNew && wNew === 0) {
      setWarrantRatioError('Rasio waran tidak boleh 0');
    } else {
      setWarrantRatioError('');
    }
  }, [hasWarrant, warrantRatioOld, warrantRatioNew]);

  const isCalculateEnabled = !!(
    ratioOld && ratioNew && rightPrice && cumDatePrice && currentLots && currentAvgPrice && !ratioError
  );

  // Calculate current total value on input change
  useEffect(() => {
    const lots = parseInt(currentLots) || 0;
    const shares = lots * 100; // Convert lots to shares
    const avgPrice = parseInt(currentAvgPrice) || 0;
    const totalValue = shares * avgPrice;
    setCurrentTotalValue(formatCurrency(totalValue));
  }, [currentLots, currentAvgPrice]);

  const calculate = useCallback(() => {
    const rOld = parseDecimalId(ratioOld);
    const rNew = parseDecimalId(ratioNew);
    const riPrice = parseInt(rightPrice) || 0;
    const cumPrice = parseInt(cumDatePrice) || 0;
    const lots = parseInt(currentLots) || 0;
    const shares = lots * 100; // Convert lots to shares
    const avgPrice = parseInt(currentAvgPrice) || 0;

    if (rOld === 0 || rNew === 0) return;

    // Calculate new shares from right issue
    const newShares = Math.floor((shares / rOld) * rNew);
    const newLots = newShares / 100;
    
    // Check if it's a fractional lot
    const isWholeLot = Number.isInteger(newLots);
    setNewLotsCount(isWholeLot ? formatNumber(newLots) : newLots.toFixed(2).replace('.', ','));
    setNewAvgPrice(formatCurrency(riPrice));
    
    const newValue = newShares * riPrice;
    setNewTotalValue(formatCurrency(newValue));

    // Calculate final totals
    const totalShares = shares + newShares;
    const totalLotsNum = totalShares / 100;
    const isWholeFinalLot = Number.isInteger(totalLotsNum);
    setFinalLots(isWholeFinalLot ? formatNumber(totalLotsNum) : totalLotsNum.toFixed(2).replace('.', ','));

    const currentValue = shares * avgPrice;
    const totalValue = currentValue + newValue;
    setFinalTotalValue(formatCurrency(totalValue));

    const finalAvg = totalShares > 0 ? Math.round(totalValue / totalShares) : 0;
    setFinalAvgPrice(formatCurrency(finalAvg));

    // Calculate TERP (Theoretical Ex-Right Price)
    const terp = ((cumPrice * rOld) + (riPrice * rNew)) / (rOld + rNew);
    const terpRounded = Math.round(terp);
    setTheoreticalPrice(formatCurrency(terpRounded));

    // Store raw numeric values for charts
    setNumericValues({
      newSharesCount: newShares,
      totalShares: totalShares,
      totalModal: totalValue,
      avgBaru: finalAvg,
      terp: terpRounded,
    });

    // Calculate warrant count if enabled
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

    // Calculate difference for recommendation
    const priceDiff = terpRounded - finalAvg;
    const priceDiffPercent = finalAvg > 0 ? ((priceDiff / finalAvg) * 100).toFixed(2) : '0';

    // Determine recommendation (neutral language)
    if (finalAvg < terpRounded) {
      setRecommendation('positive');
      setRecommendationText(
        `Harga rata-rata baru Anda (${formatCurrency(finalAvg)}) berada Rp ${formatNumber(priceDiff)} (${priceDiffPercent}%) di bawah TERP (${formatCurrency(terpRounded)}). Secara teoritis, menebus RI berpotensi memberikan keuntungan.`
      );
    } else {
      setRecommendation('negative');
      const negativeDiff = Math.abs(priceDiff);
      const negativeDiffPercent = finalAvg > 0 ? ((negativeDiff / finalAvg) * 100).toFixed(2) : '0';
      setRecommendationText(
        `Harga rata-rata baru Anda (${formatCurrency(finalAvg)}) berada Rp ${formatNumber(negativeDiff)} (${negativeDiffPercent}%) di atas atau sama dengan TERP (${formatCurrency(terpRounded)}). Pertimbangkan alternatif seperti menjual HMETD.`
      );
    }

    setIsCalculated(true);

    // Save to history
    addToHistory({
      stockCode: stockCode || undefined,
      inputs: {
        ratioOld,
        ratioNew,
        rightPrice,
        cumDatePrice,
        currentLots,
        currentAvgPrice,
        hasWarrant,
        warrantRatioOld,
        warrantRatioNew,
      },
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
  }, [ratioOld, ratioNew, rightPrice, cumDatePrice, currentLots, currentAvgPrice, hasWarrant, warrantRatioOld, warrantRatioNew, stockCode, addToHistory]);

  const reset = useCallback(() => {
    // Reset inputs
    setStockCode('');
    setRatioOld('');
    setRatioNew('');
    setRightPrice('');
    setCumDatePrice('');
    setCurrentLots('');
    setCurrentAvgPrice('');
    setHasWarrant(false);
    setWarrantRatioOld('');
    setWarrantRatioNew('');
    
    // Reset calculated values
    setCurrentTotalValue('Rp 0');
    setNewLotsCount('0');
    setNewAvgPrice('Rp 0');
    setNewTotalValue('Rp 0');
    setFinalLots('0');
    setFinalAvgPrice('Rp 0');
    setFinalTotalValue('Rp 0');
    setTheoreticalPrice('-');
    setWarrantCount('0');
    setRecommendation(null);
    setRecommendationText('');
    setIsCalculated(false);
    setNumericValues({
      newSharesCount: 0,
      totalShares: 0,
      totalModal: 0,
      avgBaru: 0,
      terp: 0,
    });

    // Clear auto-save
    clearStorage();
  }, [clearStorage]);

  // Share function for keyboard shortcuts
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
    toast({
      title: t('toast.copied'),
      description: t('toast.copiedDesc'),
      duration: 3000,
    });
  }, [stockCode, ratioOld, ratioNew, rightPrice, cumDatePrice, currentLots, currentAvgPrice, t]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onCalculate: calculate,
    onReset: reset,
    onShare: handleShare,
    isCalculateEnabled,
  });

  // Load calculation from history
  const loadFromHistory = useCallback((item: CalculationHistoryItem) => {
    setStockCode(item.stockCode || '');
    setRatioOld(item.inputs.ratioOld);
    setRatioNew(item.inputs.ratioNew);
    setRightPrice(item.inputs.rightPrice);
    setCumDatePrice(item.inputs.cumDatePrice);
    setCurrentLots(item.inputs.currentLots);
    setCurrentAvgPrice(item.inputs.currentAvgPrice);
    setHasWarrant(item.inputs.hasWarrant);
    setWarrantRatioOld(item.inputs.warrantRatioOld);
    setWarrantRatioNew(item.inputs.warrantRatioNew);
    
    // Set calculated results
    setNewLotsCount(item.results.newSharesCount);
    setFinalLots(item.results.finalShares);
    setFinalAvgPrice(item.results.finalAvgPrice);
    setFinalTotalValue(item.results.finalTotalValue);
    setTheoreticalPrice(item.results.theoreticalPrice);
    setWarrantCount(item.results.warrantCount);
    setRecommendation(item.results.recommendation);
    
    // Calculate total values
    const lots = parseInt(item.inputs.currentLots) || 0;
    const shares = lots * 100;
    const avgPrice = parseInt(item.inputs.currentAvgPrice) || 0;
    setCurrentTotalValue(formatCurrency(shares * avgPrice));
    
    const riPrice = parseInt(item.inputs.rightPrice) || 0;
    const newLots = parseFloat(item.results.newSharesCount.replace(/\./g, '').replace(',', '.')) || 0;
    const newShares = newLots * 100;
    setNewAvgPrice(formatCurrency(riPrice));
    setNewTotalValue(formatCurrency(newShares * riPrice));
    
    // Parse values for numeric state
    const finalAvg = parseInt(item.results.finalAvgPrice.replace(/[^\d]/g, '')) || 0;
    const terp = parseInt(item.results.theoreticalPrice.replace(/[^\d]/g, '')) || 0;
    const totalShares = shares + newShares;
    const totalValue = parseInt(item.results.finalTotalValue.replace(/[^\d]/g, '')) || 0;
    
    setNumericValues({
      newSharesCount: newShares,
      totalShares: totalShares,
      totalModal: totalValue,
      avgBaru: finalAvg,
      terp: terp,
    });
    
    // Set recommendation text (neutral)
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
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="header-bar py-3 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-base md:text-lg font-bold">
            {t('app.title')}
          </h1>
          <div className="flex items-center gap-1.5">
            <ShareButtons
              resultRef={resultRef}
              isCalculated={isCalculated}
              shareData={{
                stockCode,
                ratioOld,
                ratioNew,
                rightPrice,
                cumDatePrice,
                currentLots,
                currentAvgPrice,
              }}
              exportData={{
                currentTotalValue,
                newSharesCount: newLotsCount,
                newTotalValue,
                finalShares: finalLots,
                finalAvgPrice,
                finalTotalValue,
                theoreticalPrice,
                recommendation,
                recommendationText,
                hasWarrant,
                warrantCount,
              }}
            />
            <HistoryDropdown
              history={history}
              onSelectHistory={loadFromHistory}
              onRemoveHistory={removeFromHistory}
              onClearHistory={clearHistory}
            />
            {isCalculated && (
              <button
                onClick={reset}
                className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <KeyboardShortcutsHelp />
            <EmbedCodeModal />
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main ref={resultRef} className="flex-1 max-w-2xl mx-auto w-full px-3 py-3 md:px-4 md:py-4 space-y-3">
        <StockCodeInput value={stockCode} onChange={setStockCode} />

        <RightIssueInfoSection
          ratioOld={ratioOld}
          ratioNew={ratioNew}
          rightPrice={rightPrice}
          cumDatePrice={cumDatePrice}
          onRatioOldChange={setRatioOld}
          onRatioNewChange={setRatioNew}
          onRightPriceChange={setRightPrice}
          onCumDatePriceChange={setCumDatePrice}
          ratioError={ratioError}
          hasWarrant={hasWarrant}
          onHasWarrantChange={setHasWarrant}
          warrantRatioOld={warrantRatioOld}
          warrantRatioNew={warrantRatioNew}
          onWarrantRatioOldChange={setWarrantRatioOld}
          onWarrantRatioNewChange={setWarrantRatioNew}
          warrantRatioError={warrantRatioError}
        />

        <OwnershipSection
          currentLots={currentLots}
          currentAvgPrice={currentAvgPrice}
          currentTotalValue={currentTotalValue}
          newLotsCount={newLotsCount}
          newAvgPrice={newAvgPrice}
          newTotalValue={newTotalValue}
          finalLots={finalLots}
          finalAvgPrice={finalAvgPrice}
          finalTotalValue={finalTotalValue}
          onCurrentLotsChange={setCurrentLots}
          onCurrentAvgPriceChange={setCurrentAvgPrice}
          onCalculate={calculate}
          isCalculateEnabled={isCalculateEnabled}
          isCalculated={isCalculated}
        />

        {hasWarrant && (
          <WarrantResultSection
            warrantCount={warrantCount}
            isCalculated={isCalculated}
          />
        )}

        <LotOptimizationSection
          ratioOld={ratioOld}
          ratioNew={ratioNew}
          currentLots={currentLots}
          onCurrentLotsChange={setCurrentLots}
          isCalculated={isCalculated}
          hasWarrant={hasWarrant}
          warrantRatioOld={warrantRatioOld}
          warrantRatioNew={warrantRatioNew}
        />

        <ConclusionSection
          newLots={newLotsCount}
          exercisePrice={rightPrice ? formatCurrency(parseInt(rightPrice)) : 'Rp 0'}
          totalCost={newTotalValue}
          newAvgPrice={isCalculated ? finalAvgPrice : '-'}
          theoreticalPrice={theoreticalPrice}
          recommendation={recommendation}
          recommendationText={recommendationText}
          isCalculated={isCalculated}
        />

        <AdvancedAnalysisSection
          isCalculated={isCalculated}
          cumPrice={parseInt(cumDatePrice) || 0}
          riPrice={parseInt(rightPrice) || 0}
          ratioOld={parseDecimalId(ratioOld)}
          ratioNew={parseDecimalId(ratioNew)}
          newSharesCount={numericValues.newSharesCount}
          totalShares={numericValues.totalShares}
          avgBaru={numericValues.avgBaru}
          terp={numericValues.terp}
        />
      </main>

      {/* Footer */}
      <footer className="py-3 px-4 border-t border-border mt-auto">
        <p className="text-center text-[10px] text-muted-foreground/70">
          © <a href="https://alfindigital.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary transition-colors">alfindigital</a>
        </p>
      </footer>

      <BackToTopButton />
    </div>
  );
};

export default RightIssueCalculator;
