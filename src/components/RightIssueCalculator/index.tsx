import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import RightIssueInfoSection from './RightIssueInfoSection';
import OwnershipSection from './OwnershipSection';
import ConclusionSection from './ConclusionSection';
import ThemeToggle from './ThemeToggle';
import ShareButtons from './ShareButtons';

const formatCurrency = (value: number): string => {
  return `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('id-ID').format(value);
};

const RightIssueCalculator: React.FC = () => {
  const resultRef = useRef<HTMLDivElement>(null);
  
  // Right Issue Info
  const [ratioOld, setRatioOld] = useState('');
  const [ratioNew, setRatioNew] = useState('');
  const [rightPrice, setRightPrice] = useState('');
  const [cumDatePrice, setCumDatePrice] = useState('');

  // Current Ownership
  const [currentShares, setCurrentShares] = useState('');
  const [currentAvgPrice, setCurrentAvgPrice] = useState('');

  // Calculated Values
  const [currentTotalValue, setCurrentTotalValue] = useState('Rp 0');
  const [newSharesCount, setNewSharesCount] = useState('0');
  const [newAvgPrice, setNewAvgPrice] = useState('Rp 0');
  const [newTotalValue, setNewTotalValue] = useState('Rp 0');
  const [finalShares, setFinalShares] = useState('0');
  const [finalAvgPrice, setFinalAvgPrice] = useState('Rp 0');
  const [finalTotalValue, setFinalTotalValue] = useState('Rp 0');
  const [theoreticalPrice, setTheoreticalPrice] = useState('-');
  const [recommendation, setRecommendation] = useState<'positive' | 'negative' | null>(null);
  const [recommendationText, setRecommendationText] = useState('');
  const [isCalculated, setIsCalculated] = useState(false);

  // Parse URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ro = params.get('ro');
    const rn = params.get('rn');
    const rp = params.get('rp');
    const cp = params.get('cp');
    const cs = params.get('cs');
    const ca = params.get('ca');

    if (ro && rn && rp && cp && cs && ca) {
      setRatioOld(ro);
      setRatioNew(rn);
      setRightPrice(rp);
      setCumDatePrice(cp);
      setCurrentShares(cs);
      setCurrentAvgPrice(ca);
    }
  }, []);

  const isCalculateEnabled = !!(
    ratioOld && ratioNew && rightPrice && cumDatePrice && currentShares && currentAvgPrice
  );

  // Calculate current total value on input change
  useEffect(() => {
    const shares = parseInt(currentShares) || 0;
    const avgPrice = parseInt(currentAvgPrice) || 0;
    const totalValue = shares * avgPrice;
    setCurrentTotalValue(formatCurrency(totalValue));
  }, [currentShares, currentAvgPrice]);

  const calculate = useCallback(() => {
    const rOld = parseInt(ratioOld) || 0;
    const rNew = parseInt(ratioNew) || 0;
    const riPrice = parseInt(rightPrice) || 0;
    const cumPrice = parseInt(cumDatePrice) || 0;
    const shares = parseInt(currentShares) || 0;
    const avgPrice = parseInt(currentAvgPrice) || 0;

    if (rOld === 0 || rNew === 0) return;

    // Calculate new shares from right issue
    const newShares = Math.floor((shares / rOld) * rNew);
    setNewSharesCount(formatNumber(newShares));
    setNewAvgPrice(formatCurrency(riPrice));
    
    const newValue = newShares * riPrice;
    setNewTotalValue(formatCurrency(newValue));

    // Calculate final totals
    const totalShares = shares + newShares;
    setFinalShares(formatNumber(totalShares));

    const currentValue = shares * avgPrice;
    const totalValue = currentValue + newValue;
    setFinalTotalValue(formatCurrency(totalValue));

    const finalAvg = totalShares > 0 ? Math.round(totalValue / totalShares) : 0;
    setFinalAvgPrice(formatCurrency(finalAvg));

    // Calculate TERP (Theoretical Ex-Right Price)
    const terp = ((cumPrice * rOld) + (riPrice * rNew)) / (rOld + rNew);
    setTheoreticalPrice(formatCurrency(Math.round(terp)));

    // Determine recommendation
    if (finalAvg < terp) {
      setRecommendation('positive');
      setRecommendationText(
        `✅ LAYAK DITEBUS! Average harga baru Anda (${formatCurrency(finalAvg)}) lebih rendah dari Harga Teoritis (${formatCurrency(Math.round(terp))}). Dengan menebus Right Issue, potensi profit Anda semakin besar.`
      );
    } else {
      setRecommendation('negative');
      setRecommendationText(
        `⚠️ PERTIMBANGKAN KEMBALI! Average harga baru Anda (${formatCurrency(finalAvg)}) lebih tinggi atau sama dengan Harga Teoritis (${formatCurrency(Math.round(terp))}). Menebus Right Issue mungkin kurang menguntungkan.`
      );
    }

    setIsCalculated(true);
  }, [ratioOld, ratioNew, rightPrice, cumDatePrice, currentShares, currentAvgPrice]);

  const reset = useCallback(() => {
    // Reset inputs
    setRatioOld('');
    setRatioNew('');
    setRightPrice('');
    setCumDatePrice('');
    setCurrentShares('');
    setCurrentAvgPrice('');
    
    // Reset calculated values
    setCurrentTotalValue('Rp 0');
    setNewSharesCount('0');
    setNewAvgPrice('Rp 0');
    setNewTotalValue('Rp 0');
    setFinalShares('0');
    setFinalAvgPrice('Rp 0');
    setFinalTotalValue('Rp 0');
    setTheoreticalPrice('-');
    setRecommendation(null);
    setRecommendationText('');
    setIsCalculated(false);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-3 py-4 md:px-4 md:py-6">
        {/* Header */}
        <header className="mb-4 md:mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              Kalkulator Right Issue
            </h1>
            <div className="flex items-center gap-1.5">
              <ShareButtons
                resultRef={resultRef}
                isCalculated={isCalculated}
                shareData={{
                  ratioOld,
                  ratioNew,
                  rightPrice,
                  cumDatePrice,
                  currentShares,
                  currentAvgPrice,
                }}
              />
              {isCalculated && (
                <button
                  onClick={reset}
                  className="p-2 rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-all duration-300 hover:scale-105"
                  aria-label="Reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main ref={resultRef} className="space-y-4">
          <RightIssueInfoSection
            ratioOld={ratioOld}
            ratioNew={ratioNew}
            rightPrice={rightPrice}
            cumDatePrice={cumDatePrice}
            onRatioOldChange={setRatioOld}
            onRatioNewChange={setRatioNew}
            onRightPriceChange={setRightPrice}
            onCumDatePriceChange={setCumDatePrice}
          />

          <OwnershipSection
            currentShares={currentShares}
            currentAvgPrice={currentAvgPrice}
            currentTotalValue={currentTotalValue}
            newSharesCount={newSharesCount}
            newAvgPrice={newAvgPrice}
            newTotalValue={newTotalValue}
            finalShares={finalShares}
            finalAvgPrice={finalAvgPrice}
            finalTotalValue={finalTotalValue}
            onCurrentSharesChange={setCurrentShares}
            onCurrentAvgPriceChange={setCurrentAvgPrice}
            onCalculate={calculate}
            isCalculateEnabled={isCalculateEnabled}
            isCalculated={isCalculated}
          />

          <ConclusionSection
            newShares={newSharesCount}
            exercisePrice={rightPrice ? formatCurrency(parseInt(rightPrice)) : 'Rp 0'}
            totalCost={newTotalValue}
            newAvgPrice={isCalculated ? finalAvgPrice : '-'}
            theoreticalPrice={theoreticalPrice}
            recommendation={recommendation}
            recommendationText={recommendationText}
            isCalculated={isCalculated}
          />
        </main>

        {/* Footer */}
        <footer className="mt-8 pt-4 border-t border-border text-center group relative">
          <p className="text-xs text-muted-foreground">
            © 2025{' '}
            <a 
              href="https://alfindigital.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              alfindigital
            </a>
          </p>
          {/* Hover disclaimer */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-card border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none w-[280px] md:w-[320px]">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Bukan saran investasi. DYOR. Data diproses lokal di browser.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default RightIssueCalculator;
