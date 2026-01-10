import React, { useState, useCallback, useEffect } from 'react';
import { Calculator, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { parseDecimalId } from '@/lib/parseDecimal';

interface MiniCalculatorProps {
  theme?: 'light' | 'dark' | 'auto';
  onCalculate?: (data: CalculationResult) => void;
}

interface CalculationResult {
  terp: number;
  newLots: number;
  totalCost: number;
  newAvgPrice: number;
}

const formatCurrency = (value: number): string => {
  return `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('id-ID').format(value);
};

const MiniCalculator: React.FC<MiniCalculatorProps> = ({ onCalculate }) => {
  const { t, language } = useLanguage();
  
  // Form state
  const [ratioOld, setRatioOld] = useState('');
  const [ratioNew, setRatioNew] = useState('');
  const [rightPrice, setRightPrice] = useState('');
  const [cumDatePrice, setCumDatePrice] = useState('');
  const [currentLots, setCurrentLots] = useState('');

  // Result state
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);

  const isValid = !!(ratioOld && ratioNew && rightPrice && cumDatePrice && currentLots);

  const calculate = useCallback(() => {
    const rOld = parseDecimalId(ratioOld);
    const rNew = parseDecimalId(ratioNew);
    const riPrice = parseInt(rightPrice) || 0;
    const cumPrice = parseInt(cumDatePrice) || 0;
    const lots = parseInt(currentLots) || 0;
    const shares = lots * 100;

    if (rOld === 0 || rNew === 0) return;

    // Calculate new shares
    const newShares = Math.floor((shares / rOld) * rNew);
    const newLots = newShares / 100;
    const totalCost = newShares * riPrice;

    // Calculate TERP
    const terp = Math.round(((cumPrice * rOld) + (riPrice * rNew)) / (rOld + rNew));

    // Calculate new average price
    const currentValue = shares * cumPrice;
    const totalShares = shares + newShares;
    const totalValue = currentValue + totalCost;
    const newAvgPrice = totalShares > 0 ? Math.round(totalValue / totalShares) : 0;

    const resultData: CalculationResult = {
      terp,
      newLots,
      totalCost,
      newAvgPrice,
    };

    setResult(resultData);
    setIsCalculated(true);
    onCalculate?.(resultData);

    // PostMessage to parent window
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'RI_CALCULATED',
        data: resultData,
      }, '*');
    }
  }, [ratioOld, ratioNew, rightPrice, cumDatePrice, currentLots, onCalculate]);

  // Send ready event to parent
  useEffect(() => {
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'RI_READY',
        height: document.body.scrollHeight,
      }, '*');
    }
  }, []);

  // Auto-resize on content change
  useEffect(() => {
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'RI_RESIZE',
        height: document.body.scrollHeight,
      }, '*');
    }
  }, [isCalculated, result]);

  const openFullVersion = () => {
    const params = new URLSearchParams();
    if (ratioOld) params.set('ro', ratioOld);
    if (ratioNew) params.set('rn', ratioNew);
    if (rightPrice) params.set('rp', rightPrice);
    if (cumDatePrice) params.set('cp', cumDatePrice);
    if (currentLots) params.set('cs', currentLots);
    
    const url = `${window.location.origin}/?${params.toString()}`;
    window.open(url, '_blank');
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-card rounded-xl border border-border shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-primary" />
        <h2 className="font-semibold text-foreground">
          {language === 'id' ? 'Kalkulator Right Issue' : 'Right Issue Calculator'}
        </h2>
      </div>

      {/* Form */}
      <div className="space-y-3">
        {/* Ratio */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-muted-foreground">
              {t('rightIssue.ratioOld')}
            </Label>
            <Input
              type="text"
              inputMode="decimal"
              value={ratioOld}
              onChange={(e) => setRatioOld(e.target.value)}
              placeholder="1"
              className="h-9 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              {t('rightIssue.ratioNew')}
            </Label>
            <Input
              type="text"
              inputMode="decimal"
              value={ratioNew}
              onChange={(e) => setRatioNew(e.target.value)}
              placeholder="2"
              className="h-9 text-sm"
            />
          </div>
        </div>

        {/* RI Price */}
        <div>
          <Label className="text-xs text-muted-foreground">
            {t('rightIssue.price')}
          </Label>
          <Input
            type="text"
            inputMode="numeric"
            value={rightPrice}
            onChange={(e) => setRightPrice(e.target.value.replace(/\D/g, ''))}
            placeholder="1000"
            className="h-9 text-sm"
          />
        </div>

        {/* Cum Date Price */}
        <div>
          <Label className="text-xs text-muted-foreground">
            {t('rightIssue.cumPrice')}
          </Label>
          <Input
            type="text"
            inputMode="numeric"
            value={cumDatePrice}
            onChange={(e) => setCumDatePrice(e.target.value.replace(/\D/g, ''))}
            placeholder="2000"
            className="h-9 text-sm"
          />
        </div>

        {/* Current Lots */}
        <div>
          <Label className="text-xs text-muted-foreground">
            {t('ownership.currentLots')}
          </Label>
          <Input
            type="text"
            inputMode="numeric"
            value={currentLots}
            onChange={(e) => setCurrentLots(e.target.value.replace(/\D/g, ''))}
            placeholder="100"
            className="h-9 text-sm"
          />
        </div>

        {/* Calculate Button */}
        <Button
          onClick={calculate}
          disabled={!isValid}
          className="w-full"
        >
          {t('ownership.calculate')}
        </Button>
      </div>

      {/* Results */}
      {isCalculated && result && (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg space-y-2 animate-fade-in">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">TERP</span>
            <span className="font-semibold text-primary">{formatCurrency(result.terp)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {language === 'id' ? 'Hak Lot Baru' : 'New Lots'}
            </span>
            <span className="font-semibold">{formatNumber(result.newLots)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {language === 'id' ? 'Dana Dibutuhkan' : 'Funds Required'}
            </span>
            <span className="font-semibold">{formatCurrency(result.totalCost)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {language === 'id' ? 'Avg Baru' : 'New Avg'}
            </span>
            <span className="font-semibold">{formatCurrency(result.newAvgPrice)}</span>
          </div>
        </div>
      )}

      {/* Footer - Open Full Version */}
      <button
        onClick={openFullVersion}
        className="mt-4 w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        <ExternalLink className="w-3 h-3" />
        {language === 'id' ? 'Buka Versi Lengkap' : 'Open Full Version'}
      </button>

      {/* Powered by */}
      <p className="mt-2 text-center text-[10px] text-muted-foreground/60">
        Powered by{' '}
        <a
          href={window.location.origin}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-primary"
        >
          Right Issue Calculator
        </a>
      </p>
    </div>
  );
};

export default MiniCalculator;
