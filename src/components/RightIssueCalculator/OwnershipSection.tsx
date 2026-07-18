import React, { useEffect, useRef } from 'react';
import { Lightbulb } from 'lucide-react';
import CurrencyInput from './CurrencyInput';
import ReadOnlyField from './ReadOnlyField';
import SummaryItem from './SummaryItem';
import InfoTooltip from './InfoTooltip';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import Stepper from './Stepper';
import { registerField, advanceFrom, FieldKey } from '@/lib/autoAdvance';
import type { QuickChip } from './MobileNumpad';

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
  noOwnership: boolean;
  onNoOwnershipChange: (value: boolean) => void;
  hmetdLots: string;
  onHmetdLotsChange: (value: string) => void;
  hmetdPrice: string;
  onHmetdPriceChange: (value: string) => void;
  hmetdTotalCost?: string;
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
  isCalculated,
  noOwnership,
  onNoOwnershipChange,
  hmetdLots,
  onHmetdLotsChange,
  hmetdPrice,
  onHmetdPriceChange,
  hmetdTotalCost,
}) => {
  const { t, language } = useLanguage();
  const isMobile = useIsMobile();

  const lotsRef = useRef<HTMLInputElement | null>(null);
  const hmetdLotsRef = useRef<HTMLInputElement | null>(null);

  // Register lot inputs in the auto-advance registry.
  useEffect(() => {
    registerField('currentLots', lotsRef.current, () => currentLots);
    return () => registerField('currentLots', null);
  }, [currentLots]);

  useEffect(() => {
    registerField('hmetdLots', hmetdLotsRef.current, () => hmetdLots);
    return () => registerField('hmetdLots', null);
  }, [hmetdLots]);

  const priceChips: QuickChip[] = [
    { label: '+100', apply: (d) => String((parseInt(d || '0', 10) || 0) + 100) },
    { label: '+500', apply: (d) => String((parseInt(d || '0', 10) || 0) + 500) },
    { label: '+1.000', apply: (d) => String((parseInt(d || '0', 10) || 0) + 1000) },
    { label: '×2', apply: (d) => String((parseInt(d || '0', 10) || 0) * 2) },
    { label: '÷2', apply: (d) => String(Math.floor((parseInt(d || '0', 10) || 0) / 2)) },
    { label: 'C', apply: () => '' },
  ];

  const lotPresets = [1, 5, 10, 25, 50, 100];
  
  return (
    <section className="card-calculator animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <h2 className="section-title mb-2.5 flex items-center" data-tour="ownership">
        {t('ownership.title')}
        <InfoTooltip text={language === 'id' ? "Data kepemilikan saham Anda saat ini." : "Your current stock ownership data."} />
      </h2>

      {/* No Ownership Toggle */}
      <label className="flex items-center gap-2 mb-3 cursor-pointer select-none group">
        <input
          type="checkbox"
          checked={noOwnership}
          onChange={(e) => onNoOwnershipChange(e.target.checked)}
          className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 accent-primary"
        />
        <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {language === 'id' ? 'Belum punya saham ini (beli HMETD dari pasar)' : "Don't own this stock yet (buy HMETD from market)"}
        </span>
        <InfoTooltip text={language === 'id' 
          ? "Pilih ini jika Anda belum memiliki saham dan ingin membeli HMETD (hak memesan efek terlebih dahulu) dari pasar sekunder." 
          : "Select this if you don't currently own the stock and want to buy HMETD (rights) from the secondary market."} 
        />
      </label>
      
      <div className="grid md:grid-cols-2 gap-3 md:gap-5">
        {/* Current Ownership or HMETD Input */}
        <div className="space-y-2.5">
          {noOwnership ? (
            <>
              <h3 className="subsection-title flex items-center">
                {language === 'id' ? 'Beli HMETD' : 'Buy HMETD'}
                <InfoTooltip text={language === 'id' 
                  ? "Masukkan jumlah lot HMETD yang ingin Anda beli dari pasar sekunder untuk ditebus menjadi saham baru." 
                  : "Enter the number of HMETD lots you want to buy from the secondary market to exercise into new shares."} 
                />
              </h3>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center">
                  {language === 'id' ? 'Jumlah Lot HMETD' : 'HMETD Lots'}
                  <InfoTooltip text={language === 'id' ? "Jumlah lot HMETD yang ingin dibeli. 1 lot HMETD = hak tebus 100 lembar saham baru." : "Number of HMETD lots to buy. 1 HMETD lot = right to subscribe 100 new shares."} />
                </label>
                <input
                  id="hmetd-lots"
                  ref={hmetdLotsRef}
                  type="text"
                  value={hmetdLots ? new Intl.NumberFormat('id-ID').format(parseInt(hmetdLots)) : ''}
                  onChange={(e) => onHmetdLotsChange(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); advanceFrom('hmetdLots'); } }}
                  placeholder="5"
                  className="input-calculator"
                  inputMode="numeric"
              />
                {isMobile && (
                  <Stepper
                    value={hmetdLots}
                    onChange={onHmetdLotsChange}
                    step={1}
                    accelSteps={[5, 25]}
                    presets={lotPresets}
                    ariaLabel="HMETD lots stepper"
                  />
                )}
              </div>

              <CurrencyInput
                id="hmetd-price"
                label={language === 'id' ? 'Harga HMETD per Lembar' : 'HMETD Price per Share'}
                value={hmetdPrice}
                onChange={onHmetdPriceChange}
                placeholder="100"
                tooltip={language === 'id' ? "Harga beli HMETD per lembar di pasar sekunder. Cek harga HMETD-R di broker Anda." : "HMETD purchase price per share in secondary market. Check HMETD-R price at your broker."}
                fieldKey="hmetdPrice"
                stepperStep={50}
                stepperAccel={[500, 5000]}
                quickChips={priceChips}
              />

              {hmetdTotalCost && (
                <ReadOnlyField
                  label={language === 'id' ? 'Total Biaya Akuisisi' : 'Total Acquisition Cost'}
                  value={hmetdTotalCost}
                  tooltip={language === 'id' ? "Total biaya = (harga HMETD × lembar) + (harga pelaksanaan RI × lembar). Ini adalah total modal yang Anda keluarkan." : "Total cost = (HMETD price × shares) + (RI exercise price × shares). This is your total capital outlay."}
                />
              )}

              <div className="p-3 rounded-lg bg-primary/10 border border-primary/25 shadow-sm">
                <p className="text-[11px] font-medium text-foreground leading-relaxed flex items-start gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                  <span>
                    {language === 'id'
                      ? 'Anda akan membeli HMETD dari pasar, lalu menebus saham baru dengan harga pelaksanaan RI. Biaya total = (harga HMETD × lembar) + (harga RI × lembar).'
                      : 'You will buy HMETD from the market, then exercise new shares at the RI price. Total cost = (HMETD price × shares) + (RI price × shares).'}
                  </span>
                </p>
              </div>
            </>
          ) : (
            <>
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
                  id="current-lots"
                  ref={lotsRef}
                  type="text"
                  value={currentLots ? new Intl.NumberFormat('id-ID').format(parseInt(currentLots)) : ''}
                  onChange={(e) => onCurrentLotsChange(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); advanceFrom('currentLots'); } }}
                  placeholder="20"
                  className="input-calculator"
                  inputMode="numeric"
                />
                {isMobile && (
                  <Stepper
                    value={currentLots}
                    onChange={onCurrentLotsChange}
                    step={1}
                    accelSteps={[5, 25]}
                    presets={lotPresets}
                    ariaLabel="Current lots stepper"
                  />
                )}
              </div>

              <CurrencyInput
                id="current-avg-price"
                label={t('ownership.avgPrice')}
                value={currentAvgPrice}
                onChange={onCurrentAvgPriceChange}
                placeholder="1000"
                tooltip={t('ownership.avgPriceHelp')}
                fieldKey="currentAvgPrice"
                stepperStep={50}
                stepperAccel={[500, 5000]}
                quickChips={priceChips}
              />

              <ReadOnlyField
                label={t('ownership.totalValue')}
                value={currentTotalValue}
                tooltip={language === 'id' ? "Total nilai investasi saat ini." : "Current total investment value."}
              />
            </>
          )}

          {/* Calculate button - visible on mobile */}
          <button
            onClick={onCalculate}
            disabled={!isCalculateEnabled}
            className="btn-calculate md:hidden"
          >
            {t('ownership.calculate')}
          </button>
        </div>

        {/* Right Issue Allocation */}
        <div className={`space-y-2.5 transition-all duration-500 ${isCalculated ? 'opacity-100 translate-y-0' : 'opacity-50'}`}>
          <h3 className="subsection-title flex items-center">
            {noOwnership 
              ? (language === 'id' ? 'Saham Baru (dari HMETD)' : 'New Shares (from HMETD)')
              : (language === 'id' ? 'Jatah RI' : 'RI Allocation')}
            <InfoTooltip text={noOwnership
              ? (language === 'id' ? "Jumlah saham baru yang didapat dari HMETD yang dibeli." : "Number of new shares obtained from purchased HMETD.")
              : (language === 'id' ? "Jumlah lot baru yang berhak Anda tebus." : "Number of new lots you're entitled to subscribe.")} 
            />
          </h3>
          
          <ReadOnlyField
            label={noOwnership 
              ? (language === 'id' ? 'Lot Saham Baru' : 'New Share Lots')
              : (language === 'id' ? 'Jatah Lot RI' : 'RI Lot Allocation')}
            value={`${newLotsCount} lot`}
            animated={isCalculated}
            tooltip={noOwnership
              ? (language === 'id' ? "Jumlah lot saham baru dari HMETD." : "Number of new share lots from HMETD.")
              : (language === 'id' ? "Jumlah lot baru dari right issue." : "Number of new lots from right issue.")}
          />

          <ReadOnlyField
            label={language === 'id' ? 'Harga RI' : 'RI Price'}
            value={newAvgPrice}
            animated={isCalculated}
            delay={100}
            tooltip={language === 'id' ? "Harga per lembar untuk tebus RI." : "Price per share to exercise RI."}
          />

          <ReadOnlyField
            label={noOwnership
              ? (language === 'id' ? 'Total Biaya Tebus' : 'Total Exercise Cost')
              : (language === 'id' ? 'Total Value RI' : 'Total RI Value')}
            value={newTotalValue}
            animated={isCalculated}
            delay={200}
            tooltip={noOwnership
              ? (language === 'id' ? "Total biaya untuk menebus semua HMETD menjadi saham." : "Total cost to exercise all HMETD into shares.")
              : (language === 'id' ? "Total biaya untuk tebus semua jatah RI." : "Total cost to exercise all RI allocation.")}
          />
        </div>
      </div>

      <div className="my-3 border-t border-border" />

      {/* Calculate button - desktop */}
      <button
        onClick={onCalculate}
        disabled={!isCalculateEnabled}
        className="btn-calculate hidden md:block mb-3"
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
