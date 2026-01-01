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
}

const LotOptimizationSection: React.FC<LotOptimizationSectionProps> = ({
  ratioOld,
  ratioNew,
  currentLots,
  onCurrentLotsChange,
  isCalculated
}) => {
  const rOld = parseDecimalId(ratioOld);
  const rNew = parseDecimalId(ratioNew);
  const lots = parseInt(currentLots) || 0;

  // Calculate minimum lots needed to get full lots from RI
  const calculateOptimalLots = () => {
    if (rOld === 0 || rNew === 0) return null;
    
    // RI shares = (currentLots * 100 / rOld) * rNew
    // For RI to be full lots: (currentLots * 100 / rOld) * rNew must be divisible by 100
    // currentLots must be divisible by (rOld / gcd(rNew, rOld))
    
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const g = gcd(rOld, rNew);
    const multiplier = rOld / g;
    
    // Find the nearest multiple of multiplier that's >= current lots
    const optimalLots = Math.ceil(lots / multiplier) * multiplier;
    const additionalLots = optimalLots - lots;
    
    // Calculate resulting RI shares
    const riShares = Math.floor((optimalLots * 100 / rOld) * rNew);
    const riLots = riShares / 100;
    
    return {
      optimalLots,
      additionalLots,
      riShares,
      riLots,
      isAlreadyOptimal: additionalLots === 0
    };
  };

  const optimization = calculateOptimalLots();

  const applyOptimization = () => {
    if (optimization) {
      onCurrentLotsChange(optimization.optimalLots.toString());
    }
  };

  if (!isCalculated || !optimization || rOld === 0 || rNew === 0) return null;

  return (
    <section className="card-calculator animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <h2 className="section-title flex items-center">
        <Calculator className="w-4 h-4 mr-1.5" />
        Optimasi Lot
        <InfoTooltip text="Hitung berapa lot yang perlu dibeli agar hasil RI genap (tidak ganjil)." />
      </h2>

      {optimization.isAlreadyOptimal ? (
        <div className="p-2.5 rounded-md bg-[hsl(142_76%_96%)] dark:bg-[hsl(142_76%_15%)] border border-[hsl(var(--success))]/30">
          <p className="text-xs text-[hsl(var(--success))] font-medium">
            ✅ Kepemilikan Anda sudah optimal! Hasil RI akan berupa lot genap.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="info-box">
            <p className="text-xs text-foreground leading-relaxed">
              Untuk mendapatkan <span className="font-bold">{optimization.riLots.toLocaleString('id-ID')} lot</span> RI (genap), 
              Anda perlu membeli tambahan <span className="font-bold text-primary">{optimization.additionalLots.toLocaleString('id-ID')} lot</span>.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-muted">
              <span className="text-muted-foreground">Lot optimal:</span>
              <div className="font-bold text-foreground">{optimization.optimalLots.toLocaleString('id-ID')} lot</div>
            </div>
            <div className="p-2 rounded bg-muted">
              <span className="text-muted-foreground">Hasil RI:</span>
              <div className="font-bold text-foreground">{optimization.riLots.toLocaleString('id-ID')} lot</div>
            </div>
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
