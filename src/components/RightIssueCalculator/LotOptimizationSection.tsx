import React from 'react';
import { Calculator } from 'lucide-react';
import InfoTooltip from './InfoTooltip';
import { parseDecimalId } from '@/lib/parseDecimal';

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
    
    // For RI to be full lots: (currentLots * 100 / rOld) * rNew must be divisible by 100
    // currentLots must be divisible by (rOld / gcd(rNew * 100, rOld * 100) * 100)
    // Simplified: currentLots must be divisible by (rOld / gcd(rOld, rNew))
    
    const g = gcd(rOld, rNew);
    let multiplier = rOld / g;
    
    // If warrant is enabled, also consider warrant ratio
    // For warrant to be whole number: (riShares / wOld) * wNew must be integer
    // riShares = (currentLots * 100 / rOld) * rNew
    // So: ((currentLots * 100 / rOld) * rNew / wOld) * wNew must be integer
    
    let warrantMultiplier = 1;
    if (hasWarrant && wOld > 0 && wNew > 0) {
      // Find LCM of RI multiplier and warrant requirement
      // Warrant needs riShares to be divisible by wOld
      // riShares = (lots * 100 * rNew) / rOld
      // So (lots * 100 * rNew) / rOld must be divisible by wOld
      // lots must be divisible by (wOld * rOld) / gcd(100 * rNew, wOld * rOld)
      const warrantGcd = gcd(100 * rNew, wOld * rOld);
      warrantMultiplier = (wOld * rOld) / warrantGcd;
      
      // Combine with RI multiplier
      multiplier = lcm(multiplier, warrantMultiplier);
    }
    
    // Find the nearest multiple of multiplier that's >= current lots
    const optimalLots = Math.max(multiplier, Math.ceil(lots / multiplier) * multiplier);
    const additionalLots = optimalLots - lots;
    
    // Calculate resulting RI shares and lots
    const riShares = Math.floor((optimalLots * 100 / rOld) * rNew);
    const riLots = riShares / 100;
    
    // Calculate resulting warrants
    let warrants = 0;
    if (hasWarrant && wOld > 0 && wNew > 0) {
      warrants = Math.floor((riShares / wOld) * wNew);
    }
    
    return {
      optimalLots,
      additionalLots,
      riShares,
      riLots,
      warrants,
      isAlreadyOptimal: additionalLots === 0 && lots > 0
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
        Optimasi Lot
        <InfoTooltip text={showWarrantInfo 
          ? "Hitung berapa lot yang perlu dibeli agar hasil RI dan Waran genap." 
          : "Hitung berapa lot yang perlu dibeli agar hasil RI genap (tidak ganjil)."
        } />
      </h2>

      {optimization.isAlreadyOptimal ? (
        <div className="p-2.5 rounded-md bg-[hsl(142_76%_96%)] dark:bg-[hsl(142_76%_15%)] border border-[hsl(var(--success))]/30">
          <p className="text-xs text-[hsl(var(--success))] font-medium">
            ✅ Kepemilikan Anda sudah optimal! Hasil RI{showWarrantInfo ? ' dan Waran' : ''} akan genap.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="info-box">
            <p className="text-xs text-foreground leading-relaxed">
              Untuk mendapatkan hasil genap, Anda perlu membeli tambahan{' '}
              <span className="font-bold text-primary">{optimization.additionalLots.toLocaleString('id-ID')} lot</span>.
            </p>
          </div>
          
          <div className={`grid ${showWarrantInfo ? 'grid-cols-3' : 'grid-cols-2'} gap-2 text-xs`}>
            <div className="p-2 rounded bg-muted">
              <span className="text-muted-foreground">Lot optimal:</span>
              <div className="font-bold text-foreground">{optimization.optimalLots.toLocaleString('id-ID')} lot</div>
            </div>
            <div className="p-2 rounded bg-muted">
              <span className="text-muted-foreground">Hasil RI:</span>
              <div className="font-bold text-foreground">{optimization.riLots.toLocaleString('id-ID')} lot</div>
            </div>
            {showWarrantInfo && (
              <div className="p-2 rounded bg-muted">
                <span className="text-muted-foreground">Hasil Waran:</span>
                <div className="font-bold text-foreground">{optimization.warrants.toLocaleString('id-ID')} unit</div>
              </div>
            )}
          </div>

          <button
            onClick={applyOptimization}
            className="w-full py-2 rounded-md bg-primary/10 text-primary font-medium text-xs hover:bg-primary/20 transition-colors"
          >
            Terapkan {optimization.optimalLots.toLocaleString('id-ID')} lot
          </button>
        </div>
      )}
    </section>
  );
};

export default LotOptimizationSection;
