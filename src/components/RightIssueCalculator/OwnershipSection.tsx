import React from 'react';
import CurrencyInput from './CurrencyInput';
import ReadOnlyField from './ReadOnlyField';
import SummaryItem from './SummaryItem';

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
      <h2 className="section-title">Kepemilikan</h2>
      
      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        {/* Current Ownership */}
        <div className="space-y-3">
          <h3 className="subsection-title">Saat Ini</h3>
          
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-foreground">
              Total Lembar (1 lot = 100)
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
          />

          <ReadOnlyField
            label="Total Value"
            value={currentTotalValue}
          />
        </div>

        {/* Right Issue Allocation */}
        <div className={`space-y-3 transition-all duration-500 ${isCalculated ? 'opacity-100 translate-y-0' : 'opacity-50'}`}>
          <h3 className="subsection-title">Jatah RI</h3>
          
          <ReadOnlyField
            label="Total Lembar RI"
            value={newSharesCount}
            animated={isCalculated}
          />

          <ReadOnlyField
            label="Harga RI"
            value={newAvgPrice}
            animated={isCalculated}
            delay={100}
          />

          <ReadOnlyField
            label="Total Value RI"
            value={newTotalValue}
            animated={isCalculated}
            delay={200}
          />
        </div>
      </div>

      <div className="my-4 border-t border-border" />

      <div className={`space-y-1 mb-4 transition-all duration-500 ${isCalculated ? 'opacity-100 translate-y-0' : 'opacity-70'}`}>
        <SummaryItem label="Total Lembar Akhir" value={finalShares} animated={isCalculated} />
        <SummaryItem label="Harga Rata-rata Akhir" value={finalAvgPrice} animated={isCalculated} delay={100} />
        <SummaryItem label="Total Value Akhir" value={finalTotalValue} highlight animated={isCalculated} delay={200} />
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
