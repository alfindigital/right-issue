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
  isCalculateEnabled
}) => {
  return (
    <section className="card-calculator animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <h2 className="section-title">Kepemilikan Saham</h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Current Ownership */}
        <div className="space-y-5">
          <h3 className="subsection-title">Kepemilikan Saat Ini</h3>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Total Lembar Saham (1 lot = 100 lembar)
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
            label="Average Harga (Rp)"
            value={currentAvgPrice}
            onChange={onCurrentAvgPriceChange}
          />

          <ReadOnlyField
            label="Total Value"
            value={currentTotalValue}
          />
        </div>

        {/* Right Issue Allocation */}
        <div className="space-y-5">
          <h3 className="subsection-title">Jatah Right Issue (RI)</h3>
          
          <ReadOnlyField
            label="Total Lembar RI"
            value={newSharesCount}
          />

          <ReadOnlyField
            label="Average Harga RI"
            value={newAvgPrice}
          />

          <ReadOnlyField
            label="Total Value RI"
            value={newTotalValue}
          />
        </div>
      </div>

      <div className="my-6 border-t border-border" />

      <div className="space-y-1 mb-6">
        <SummaryItem label="Total Lembar Saham Akhir" value={finalShares} />
        <SummaryItem label="Average Harga Akhir" value={finalAvgPrice} />
        <SummaryItem label="Total Value Akhir" value={finalTotalValue} highlight />
      </div>

      <button
        onClick={onCalculate}
        disabled={!isCalculateEnabled}
        className="btn-calculate"
      >
        Kalkulasi
      </button>
    </section>
  );
};

export default OwnershipSection;
