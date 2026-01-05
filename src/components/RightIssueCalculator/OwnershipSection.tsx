import React from 'react';
import CurrencyInput from './CurrencyInput';
import ReadOnlyField from './ReadOnlyField';
import SummaryItem from './SummaryItem';
import InfoTooltip from './InfoTooltip';

interface OwnershipSectionProps {
  currentLots: string;
  currentAvgPrice: string;
  currentTotalValue: string;
  newLotsCount: string;
  newAvgPrice: string;
  newTotalValue: string;
  finalLots: string;
  finalAvgPrice: string;
  finalTotalValue: string;
  onCurrentLotsChange: (value: string) => void;
  onCurrentAvgPriceChange: (value: string) => void;
  onCalculate: () => void;
  isCalculateEnabled: boolean;
  isCalculated: boolean;
}

const OwnershipSection: React.FC<OwnershipSectionProps> = ({
  currentLots,
  currentAvgPrice,
  currentTotalValue,
  newLotsCount,
  newAvgPrice,
  newTotalValue,
  finalLots,
  finalAvgPrice,
  finalTotalValue,
  onCurrentLotsChange,
  onCurrentAvgPriceChange,
  onCalculate,
  isCalculateEnabled,
  isCalculated
}) => {
  return (
    <section className="card-calculator animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <h2 className="section-title flex items-center">
        Kepemilikan
        <InfoTooltip text="Data kepemilikan saham Anda saat ini." />
      </h2>
      
      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        {/* Current Ownership */}
        <div className="space-y-3">
          <h3 className="subsection-title flex items-center">
            Saat Ini
            <InfoTooltip text="Jumlah lot dan harga rata-rata saham yang Anda miliki." />
          </h3>
          
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center">
              Total Lot
              <InfoTooltip text="1 lot = 100 lembar saham." />
            </label>
            <input
              type="text"
              value={currentLots ? new Intl.NumberFormat('id-ID').format(parseInt(currentLots)) : ''}
              onChange={(e) => onCurrentLotsChange(e.target.value.replace(/\D/g, ''))}
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
            tooltip="Harga beli rata-rata per lembar."
          />

          <ReadOnlyField
            label="Total Value"
            value={currentTotalValue}
            tooltip="Total nilai investasi saat ini."
          />

          {/* Calculate button - visible on mobile, placed here for mobile UX */}
          <button
            onClick={onCalculate}
            disabled={!isCalculateEnabled}
            className="btn-calculate md:hidden"
          >
            Hitung
          </button>
        </div>

        {/* Right Issue Allocation */}
        <div className={`space-y-3 transition-all duration-500 ${isCalculated ? 'opacity-100 translate-y-0' : 'opacity-50'}`}>
          <h3 className="subsection-title flex items-center">
            Jatah RI
            <InfoTooltip text="Jumlah lot baru yang berhak Anda tebus." />
          </h3>
          
          <ReadOnlyField
            label="Jatah Lot RI"
            value={`${newLotsCount} lot`}
            animated={isCalculated}
            tooltip="Jumlah lot baru dari right issue."
          />

          <ReadOnlyField
            label="Harga RI"
            value={newAvgPrice}
            animated={isCalculated}
            delay={100}
            tooltip="Harga per lembar untuk tebus RI."
          />

          <ReadOnlyField
            label="Total Value RI"
            value={newTotalValue}
            animated={isCalculated}
            delay={200}
            tooltip="Total biaya untuk tebus semua jatah RI."
          />
        </div>
      </div>

      <div className="my-4 border-t border-border" />

      {/* Calculate button - moved above summary */}
      <button
        onClick={onCalculate}
        disabled={!isCalculateEnabled}
        className="btn-calculate hidden md:block mb-4"
      >
        Hitung
      </button>

      <div className={`space-y-1 transition-all duration-500 ${isCalculated ? 'opacity-100 translate-y-0' : 'opacity-70'}`}>
        <SummaryItem label="Total Lot Akhir" value={`${finalLots} lot`} animated={isCalculated} tooltip="Jumlah lot setelah tebus RI." />
        <SummaryItem label="Avg Akhir" value={finalAvgPrice} animated={isCalculated} delay={100} tooltip="Harga rata-rata setelah tebus RI." />
        <SummaryItem label="Total Value Akhir" value={finalTotalValue} highlight animated={isCalculated} delay={200} tooltip="Total nilai investasi setelah tebus RI." />
      </div>
    </section>
  );
};

export default OwnershipSection;
