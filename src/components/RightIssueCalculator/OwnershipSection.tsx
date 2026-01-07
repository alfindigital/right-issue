import React from 'react';
import CurrencyInput from './CurrencyInput';
import ReadOnlyField from './ReadOnlyField';
import SummaryItem from './SummaryItem';
import InfoTooltip from './InfoTooltip';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t, language } = useLanguage();
  
  return (
    <section className="card-calculator animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <h2 className="section-title flex items-center">
        {t('ownership.title')}
        <InfoTooltip text={language === 'id' ? "Data kepemilikan saham Anda saat ini." : "Your current stock ownership data."} />
      </h2>
      
      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        {/* Current Ownership */}
        <div className="space-y-3">
          <h3 className="subsection-title flex items-center">
            {language === 'id' ? 'Saat Ini' : 'Current'}
            <InfoTooltip text={language === 'id' ? "Jumlah lot dan harga rata-rata saham yang Anda miliki." : "Number of lots and average price of shares you own."} />
          </h3>
          
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center">
              {t('ownership.currentLots')}
              <InfoTooltip text={language === 'id' ? "1 lot = 100 lembar saham." : "1 lot = 100 shares."} />
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
            label={t('ownership.avgPrice')}
            value={currentAvgPrice}
            onChange={onCurrentAvgPriceChange}
            tooltip={t('ownership.avgPriceHelp')}
          />

          <ReadOnlyField
            label={t('ownership.totalValue')}
            value={currentTotalValue}
            tooltip={language === 'id' ? "Total nilai investasi saat ini." : "Current total investment value."}
          />

          {/* Calculate button - visible on mobile, placed here for mobile UX */}
          <button
            onClick={onCalculate}
            disabled={!isCalculateEnabled}
            className="btn-calculate md:hidden"
          >
            {t('ownership.calculate')}
          </button>
        </div>

        {/* Right Issue Allocation */}
        <div className={`space-y-3 transition-all duration-500 ${isCalculated ? 'opacity-100 translate-y-0' : 'opacity-50'}`}>
          <h3 className="subsection-title flex items-center">
            {language === 'id' ? 'Jatah RI' : 'RI Allocation'}
            <InfoTooltip text={language === 'id' ? "Jumlah lot baru yang berhak Anda tebus." : "Number of new lots you're entitled to subscribe."} />
          </h3>
          
          <ReadOnlyField
            label={language === 'id' ? 'Jatah Lot RI' : 'RI Lot Allocation'}
            value={`${newLotsCount} lot`}
            animated={isCalculated}
            tooltip={language === 'id' ? "Jumlah lot baru dari right issue." : "Number of new lots from right issue."}
          />

          <ReadOnlyField
            label={language === 'id' ? 'Harga RI' : 'RI Price'}
            value={newAvgPrice}
            animated={isCalculated}
            delay={100}
            tooltip={language === 'id' ? "Harga per lembar untuk tebus RI." : "Price per share to exercise RI."}
          />

          <ReadOnlyField
            label={language === 'id' ? 'Total Value RI' : 'Total RI Value'}
            value={newTotalValue}
            animated={isCalculated}
            delay={200}
            tooltip={language === 'id' ? "Total biaya untuk tebus semua jatah RI." : "Total cost to exercise all RI allocation."}
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
        {t('ownership.calculate')}
      </button>

      <div className={`space-y-1 transition-all duration-500 ${isCalculated ? 'opacity-100 translate-y-0' : 'opacity-70'}`}>
        <SummaryItem label={language === 'id' ? 'Total Lot Akhir' : 'Final Total Lots'} value={`${finalLots} lot`} animated={isCalculated} tooltip={language === 'id' ? "Jumlah lot setelah tebus RI." : "Number of lots after exercising RI."} />
        <SummaryItem label={language === 'id' ? 'Avg Akhir' : 'Final Avg'} value={finalAvgPrice} animated={isCalculated} delay={100} tooltip={language === 'id' ? "Harga rata-rata setelah tebus RI." : "Average price after exercising RI."} />
        <SummaryItem label={language === 'id' ? 'Total Value Akhir' : 'Final Total Value'} value={finalTotalValue} highlight animated={isCalculated} delay={200} tooltip={language === 'id' ? "Total nilai investasi setelah tebus RI." : "Total investment value after exercising RI."} />
      </div>
    </section>
  );
};

export default OwnershipSection;
