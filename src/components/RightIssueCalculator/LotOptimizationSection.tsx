import React from 'react';
import { Info, Calculator } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LotOptimizationSectionProps {
  ratioOld: string;
  ratioNew: string;
  currentShares: string;
  onCurrentSharesChange: (value: string) => void;
  isCalculated: boolean;
}

const InfoTooltip: React.FC<{ text: string }> = ({ text }) => (
  <TooltipProvider delayDuration={100}>
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary cursor-help transition-colors ml-1">
          <Info size={10} />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[200px] text-xs">
        {text}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const LotOptimizationSection: React.FC<LotOptimizationSectionProps> = ({
  ratioOld,
  ratioNew,
  currentShares,
  onCurrentSharesChange,
  isCalculated
}) => {
  const rOld = parseInt(ratioOld) || 0;
  const rNew = parseInt(ratioNew) || 0;
  const shares = parseInt(currentShares) || 0;

  // Calculate minimum shares needed to get full lots
  const calculateOptimalShares = () => {
    if (rOld === 0 || rNew === 0) return null;
    
    // Find the LCM multiplier to ensure RI result is in full lots (100 shares)
    // RI shares = (currentShares / rOld) * rNew
    // For RI to be full lots: (currentShares / rOld) * rNew must be divisible by 100
    // currentShares must be divisible by (100 * rOld / gcd(rNew, 100))
    
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const g = gcd(rNew, 100);
    const multiplier = (100 * rOld) / g;
    
    // Find the nearest multiple of multiplier that's >= current shares
    const optimalShares = Math.ceil(shares / multiplier) * multiplier;
    const additionalShares = optimalShares - shares;
    const additionalLots = additionalShares / 100;
    
    // Calculate resulting RI shares
    const riShares = Math.floor((optimalShares / rOld) * rNew);
    const riLots = riShares / 100;
    
    return {
      optimalShares,
      additionalShares,
      additionalLots,
      riShares,
      riLots,
      isAlreadyOptimal: additionalShares === 0
    };
  };

  const optimization = calculateOptimalShares();

  const applyOptimization = () => {
    if (optimization) {
      onCurrentSharesChange(optimization.optimalShares.toString());
    }
  };

  if (!isCalculated || !optimization || rOld === 0 || rNew === 0) return null;

  return (
    <section className="card-calculator animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <h2 className="section-title flex items-center">
        <Calculator className="w-4 h-4 mr-1.5" />
        Optimasi Lot
        <InfoTooltip text="Hitung berapa lot yang perlu dibeli agar hasil RI genap (tidak ganjil)" />
      </h2>

      {optimization.isAlreadyOptimal ? (
        <div className="p-2.5 rounded-md bg-[hsl(142_76%_96%)] border border-[hsl(var(--success))]/30">
          <p className="text-xs text-[hsl(var(--success))] font-medium">
            ✅ Kepemilikan Anda sudah optimal! Hasil RI akan berupa lot genap.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="info-box">
            <p className="text-xs text-foreground leading-relaxed">
              Untuk mendapatkan <span className="font-bold">{optimization.riLots.toLocaleString('id-ID')} lot</span> RI (genap), 
              Anda perlu membeli tambahan <span className="font-bold text-primary">{optimization.additionalLots.toLocaleString('id-ID')} lot</span> ({optimization.additionalShares.toLocaleString('id-ID')} lembar).
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-muted">
              <span className="text-muted-foreground">Lembar optimal:</span>
              <div className="font-bold text-foreground">{optimization.optimalShares.toLocaleString('id-ID')}</div>
            </div>
            <div className="p-2 rounded bg-muted">
              <span className="text-muted-foreground">Hasil RI:</span>
              <div className="font-bold text-foreground">{optimization.riShares.toLocaleString('id-ID')} lembar</div>
            </div>
          </div>

          <button
            onClick={applyOptimization}
            className="w-full py-2 rounded-md bg-primary/10 text-primary font-medium text-xs hover:bg-primary/20 transition-colors"
          >
            Terapkan {optimization.optimalShares.toLocaleString('id-ID')} lembar
          </button>
        </div>
      )}
    </section>
  );
};

export default LotOptimizationSection;
