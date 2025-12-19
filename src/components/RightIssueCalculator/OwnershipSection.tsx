import React from 'react';
import CurrencyInput from './CurrencyInput';
import ReadOnlyField from './ReadOnlyField';
import SummaryItem from './SummaryItem';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface OwnershipSectionProps {
  currentShares: string;
  currentAvgPrice: string;
  currentTotalValue: string;
  newSharesCount: string;
  newAvgPrice: string;
  newTotalValue: string;
  finalShares: string;
  finalAvgPrice: string;
  finalTotalValue: string;
  onCurrentSharesChange: (value: string) => void;
  onCurrentAvgPriceChange: (value: string) => void;
  onCalculate: () => void;
  isCalculateEnabled: boolean;
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

const OwnershipSection: React.FC<OwnershipSectionProps> = ({
  currentShares,
  currentAvgPrice,
  currentTotalValue,
  newSharesCount,
  newAvgPrice,
  newTotalValue,
  finalShares,
  finalAvgPrice,
  finalTotalValue,
  onCurrentSharesChange,
  onCurrentAvgPriceChange,
  onCalculate,
  isCalculateEnabled,
  isCalculated
}) => {
  return (
    <section className="card-calculator animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <h2 className="section-title flex items-center">
        Kepemilikan
        <InfoTooltip text="Data kepemilikan saham Anda saat ini" />
      </h2>
      
      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        {/* Current Ownership */}
        <div className="space-y-3">
          <h3 className="subsection-title flex items-center">
            Saat Ini
            <InfoTooltip text="Jumlah dan harga rata-rata saham yang Anda miliki" />
          </h3>
          
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center">
              Total Lembar
              <InfoTooltip text="1 lot = 100 lembar saham" />
            </label>
            <input
              type="text"
              value={currentShares ? new Intl.NumberFormat('id-ID').format(parseInt(currentShares)) : ''}
              onChange={(e) => onCurrentSharesChange(e.target.value.replace(/\D/g, ''))}
              placeholder="0"
              className="input-calculator"
              inputMode="numeric"
            />
          </div>

          <CurrencyInput
            id="current-avg-price"
            label="Harga Rata-rata"
            value={currentAvgPrice}
            onChange={onCurrentAvgPriceChange}
            tooltip="Harga beli rata-rata per lembar"
          />

          <ReadOnlyField
            label="Total Value"
            value={currentTotalValue}
            tooltip="Total nilai investasi saat ini"
          />
        </div>

        {/* Right Issue Allocation */}
        <div className={`space-y-3 transition-all duration-500 ${isCalculated ? 'opacity-100 translate-y-0' : 'opacity-50'}`}>
          <h3 className="subsection-title flex items-center">
            Jatah RI
            <InfoTooltip text="Jumlah saham baru yang berhak Anda tebus" />
          </h3>
          
          <ReadOnlyField
            label="Total Lembar RI"
            value={newSharesCount}
            animated={isCalculated}
            tooltip="Jumlah lembar saham baru dari RI"
          />

          <ReadOnlyField
            label="Harga RI"
            value={newAvgPrice}
            animated={isCalculated}
            delay={100}
            tooltip="Harga per lembar untuk tebus RI"
          />

          <ReadOnlyField
            label="Total Value RI"
            value={newTotalValue}
            animated={isCalculated}
            delay={200}
            tooltip="Total biaya untuk tebus semua jatah RI"
          />
        </div>
      </div>

      <div className="my-4 border-t border-border" />

      <div className={`space-y-1 mb-4 transition-all duration-500 ${isCalculated ? 'opacity-100 translate-y-0' : 'opacity-70'}`}>
        <SummaryItem label="Total Lembar Akhir" value={finalShares} animated={isCalculated} tooltip="Jumlah saham setelah tebus RI" />
        <SummaryItem label="Avg Akhir" value={finalAvgPrice} animated={isCalculated} delay={100} tooltip="Harga rata-rata setelah tebus RI" />
        <SummaryItem label="Total Value Akhir" value={finalTotalValue} highlight animated={isCalculated} delay={200} tooltip="Total nilai investasi setelah tebus RI" />
      </div>

      <button
        onClick={onCalculate}
        disabled={!isCalculateEnabled}
        className="btn-calculate"
      >
        Hitung
      </button>
    </section>
  );
};

export default OwnershipSection;
