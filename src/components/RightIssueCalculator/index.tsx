import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import RightIssueInfoSection from './RightIssueInfoSection';
import OwnershipSection from './OwnershipSection';
import ConclusionSection from './ConclusionSection';
import ThemeToggle from './ThemeToggle';

const formatCurrency = (value: number): string => {
  return `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('id-ID').format(value);
};

const RightIssueCalculator: React.FC = () => {
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
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Kalkulator Right Issue
            </h1>
            <div className="flex items-center gap-2">
              {isCalculated && (
                <button
                  onClick={reset}
                  className="p-2.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-all duration-300 hover:scale-105 flex items-center gap-2"
                  aria-label="Reset"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              )}
              <ThemeToggle />
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Jika Anda memiliki saham di Indonesia dan emitennya mengumumkan untuk Right Issue, 
            Anda bisa gunakan Kalkulator ini untuk:
          </p>
          <ul className="text-muted-foreground space-y-2 list-disc list-inside mb-4">
            <li>
              Menghitung perkiraan <strong className="text-foreground">jumlah lembar Right Issue (RI)</strong> yang bisa Anda tebus,
            </li>
            <li>
              Menghitung total <strong className="text-foreground">biaya yang dibutuhkan</strong> untuk menebus Right Issue (RI),
            </li>
            <li>
              Melihat apakah Right Issue <strong className="text-foreground">perlu ditebus atau tidak</strong> setelah diketahui perkiraan average saham barunya jika ditebus.
            </li>
          </ul>
          <p className="text-sm text-primary font-medium">
            💡 Semakin rendah harga average barumu, semakin besar peluang profit dari penebusan Right Issue
          </p>
        </header>

        {/* Main Content */}
        <main className="space-y-6">
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
        <footer className="mt-12 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            <strong>Disclaimer:</strong> Not a financial advice, always DYOR (Do Your Own Research). 
            Tidak ada data yang direkam maupun dikirim ke server, semua data diproses di browser Anda secara lokal.
          </p>
          <p className="text-sm text-muted-foreground">
            © 2025. Originally created by{' '}
            <a 
              href="https://x.com/mikelsaham" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              @MikelSaham
            </a>
            , Vibe-coded by{' '}
            <a 
              href="https://x.com/ArnantoAkbar" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              @ArnantoAkbar
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default RightIssueCalculator;
