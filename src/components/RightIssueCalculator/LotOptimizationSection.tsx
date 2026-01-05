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
    
    // For RI calculation: riShares = (lots * 100 / rOld) * rNew
    // For riShares to be divisible by 100 (full lots):
    // (lots * 100 * rNew) / rOld must be divisible by 100
    // lots * rNew / rOld must be integer
    // lots must be multiple of rOld / gcd(rOld, rNew)
    
    const riGcd = gcd(rOld, rNew);
    let multiplier = rOld / riGcd;
    
    // If warrant is enabled, also consider warrant ratio
    if (hasWarrant && wOld > 0 && wNew > 0) {
      // For warrants: warrants = (riShares / wOld) * wNew
      // riShares = (lots * 100 * rNew) / rOld
      // For warrants to be integer: (lots * 100 * rNew * wNew) / (rOld * wOld) must be integer
      // 
      // Simplified approach: 
      // 1. riShares must be divisible by wOld for whole warrants
      // 2. riShares = lots * 100 * rNew / rOld
      // 3. So (lots * 100 * rNew / rOld) must be divisible by wOld
      // 4. lots must make (lots * 100 * rNew) divisible by (rOld * wOld)
      
      // Calculate the combined requirement
      const riSharesNumerator = 100 * rNew; // per lot
      const riSharesDenominator = rOld;
      
      // We need (lots * riSharesNumerator / riSharesDenominator) % wOld === 0
      // Simplify: lots must be multiple of (riSharesDenominator * wOld) / gcd(riSharesNumerator, riSharesDenominator * wOld)
      const combinedGcd = gcd(riSharesNumerator, riSharesDenominator * wOld);
      const warrantMultiplier = (riSharesDenominator * wOld) / combinedGcd;
      
      // Take LCM of RI multiplier and warrant multiplier
      multiplier = lcm(multiplier, warrantMultiplier);
    }
    
    // Cap multiplier to prevent unreasonably large numbers
    if (multiplier > 10000) {
      // If multiplier is too large, just use RI optimization only
      multiplier = rOld / riGcd;
    }
    
    // Find the nearest multiple of multiplier that's >= current lots
    // If lots is 0, suggest the minimum multiplier
    const optimalLots = lots === 0 
      ? multiplier 
      : Math.max(multiplier, Math.ceil(lots / multiplier) * multiplier);
    const additionalLots = optimalLots - lots;
    
    // Calculate resulting RI shares and lots
    const riShares = Math.floor((optimalLots * 100 / rOld) * rNew);
    const riLots = riShares / 100;
    
    // Calculate resulting warrants
    let warrants = 0;
    if (hasWarrant && wOld > 0 && wNew > 0) {
      warrants = Math.floor((riShares / wOld) * wNew);
    }
    
    // Verify the optimization is actually whole numbers
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
