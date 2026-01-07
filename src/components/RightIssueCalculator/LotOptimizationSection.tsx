import React from 'react';
import { Calculator } from 'lucide-react';
import InfoTooltip from './InfoTooltip';
import { parseDecimalId } from '@/lib/parseDecimal';
import { useLanguage } from '@/contexts/LanguageContext';

interface LotOptimizationSectionProps {
  ratioOld: string;
  ratioNew: string;
  currentLots: string;
  onCurrentLotsChange: (value: string) => void;
  isCalculated: boolean;
  // Warrant props
  hasWarrant: boolean;
  warrantRatioOld: string;
  warrantRatioNew: string;
}

const LotOptimizationSection: React.FC<LotOptimizationSectionProps> = ({
  ratioOld,
  ratioNew,
  currentLots,
  onCurrentLotsChange,
  isCalculated,
  hasWarrant,
  warrantRatioOld,
  warrantRatioNew
}) => {
  const { t, language } = useLanguage();
  const rOld = parseDecimalId(ratioOld);
  const rNew = parseDecimalId(ratioNew);
  const wOld = parseDecimalId(warrantRatioOld);
  const wNew = parseDecimalId(warrantRatioNew);
  const lots = parseInt(currentLots) || 0;

  // GCD and LCM helper functions
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);

  // Calculate minimum lots needed to get full lots from RI (and optionally full warrants)
  const calculateOptimalLots = () => {
    if (rOld === 0 || rNew === 0) return null;
    
    const riGcd = gcd(rOld, rNew);
    let multiplier = rOld / riGcd;
    
    if (hasWarrant && wOld > 0 && wNew > 0) {
      const riSharesNumerator = 100 * rNew;
      const riSharesDenominator = rOld;
      
      const combinedGcd = gcd(riSharesNumerator, riSharesDenominator * wOld);
      const warrantMultiplier = (riSharesDenominator * wOld) / combinedGcd;
      
      multiplier = lcm(multiplier, warrantMultiplier);
    }
    
    if (multiplier > 10000) {
      multiplier = rOld / riGcd;
    }
    
    const optimalLots = lots === 0 
      ? multiplier 
      : Math.max(multiplier, Math.ceil(lots / multiplier) * multiplier);
    const additionalLots = optimalLots - lots;
    
    const riShares = Math.floor((optimalLots * 100 / rOld) * rNew);
    const riLots = riShares / 100;
    
    let warrants = 0;
    if (hasWarrant && wOld > 0 && wNew > 0) {
      warrants = Math.floor((riShares / wOld) * wNew);
    }
    
    const isRiWhole = Number.isInteger(riLots);
    const isWarrantWhole = !hasWarrant || wOld === 0 || wNew === 0 || Number.isInteger(warrants);
    
    return {
      optimalLots,
      additionalLots,
      riShares,
      riLots,
      warrants,
      isAlreadyOptimal: additionalLots === 0 && lots > 0 && isRiWhole && isWarrantWhole
    };
  };

  const optimization = calculateOptimalLots();

  const applyOptimization = () => {
    if (optimization) {
      onCurrentLotsChange(optimization.optimalLots.toString());
    }
  };

  if (!isCalculated || !optimization || rOld === 0 || rNew === 0) return null;

  const showWarrantInfo = hasWarrant && wOld > 0 && wNew > 0;

  return (
    <section className="card-calculator animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <h2 className="section-title flex items-center">
        <Calculator className="w-4 h-4 mr-1.5" />
        {t('lotOptimization.title')}
        <InfoTooltip text={showWarrantInfo 
          ? (language === 'id' ? "Hitung berapa lot yang perlu dibeli agar hasil RI dan Waran genap." : "Calculate how many lots needed to get even RI and Warrant results.")
          : (language === 'id' ? "Hitung berapa lot yang perlu dibeli agar hasil RI genap (tidak ganjil)." : "Calculate how many lots needed to get even RI results.")
        } />
      </h2>

      {optimization.isAlreadyOptimal ? (
        <div className="p-2.5 rounded-md bg-[hsl(142_76%_96%)] dark:bg-[hsl(142_76%_15%)] border border-[hsl(var(--success))]/30">
          <p className="text-xs text-[hsl(var(--success))] font-medium">
            ✅ {language === 'id' 
              ? `Kepemilikan Anda sudah optimal! Hasil RI${showWarrantInfo ? ' dan Waran' : ''} akan genap.`
              : `Your ownership is already optimal! RI${showWarrantInfo ? ' and Warrant' : ''} results will be even.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="info-box">
            <p className="text-xs text-foreground leading-relaxed">
              {language === 'id' 
                ? <>Untuk mendapatkan hasil genap, Anda perlu membeli tambahan{' '}<span className="font-bold text-primary">{optimization.additionalLots.toLocaleString('id-ID')} lot</span>.</>
                : <>To get even results, you need to buy an additional{' '}<span className="font-bold text-primary">{optimization.additionalLots.toLocaleString('id-ID')} lots</span>.</>
              }
            </p>
          </div>
          
          <div className={`grid ${showWarrantInfo ? 'grid-cols-3' : 'grid-cols-2'} gap-2 text-xs`}>
            <div className="p-2 rounded bg-muted">
              <span className="text-muted-foreground">{language === 'id' ? 'Lot optimal:' : 'Optimal lots:'}</span>
              <div className="font-bold text-foreground">{optimization.optimalLots.toLocaleString('id-ID')} lot</div>
            </div>
            <div className="p-2 rounded bg-muted">
              <span className="text-muted-foreground">{language === 'id' ? 'Hasil RI:' : 'RI Result:'}</span>
              <div className="font-bold text-foreground">{optimization.riLots.toLocaleString('id-ID')} lot</div>
            </div>
            {showWarrantInfo && (
              <div className="p-2 rounded bg-muted">
                <span className="text-muted-foreground">{language === 'id' ? 'Hasil Waran:' : 'Warrant Result:'}</span>
                <div className="font-bold text-foreground">{optimization.warrants.toLocaleString('id-ID')} {language === 'id' ? 'unit' : 'units'}</div>
              </div>
            )}
          </div>

          <button
            onClick={applyOptimization}
            className="w-full py-2 rounded-md bg-primary/10 text-primary font-medium text-xs hover:bg-primary/20 transition-colors"
          >
            {t('lotOptimization.apply')} {optimization.optimalLots.toLocaleString('id-ID')} lot
          </button>
        </div>
      )}
    </section>
  );
};

export default LotOptimizationSection;
