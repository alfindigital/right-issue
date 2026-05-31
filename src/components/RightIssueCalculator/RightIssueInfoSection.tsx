import React from 'react';
import CurrencyInput from './CurrencyInput';
import RatioInput from './RatioInput';
import InfoTooltip from './InfoTooltip';
import PasteParserButton from './PasteParserButton';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';
import { haptic } from '@/lib/haptics';
import type { QuickChip } from './MobileNumpad';

interface RightIssueInfoSectionProps {
  ratioOld: string;
  ratioNew: string;
  rightPrice: string;
  cumDatePrice: string;
  onRatioOldChange: (value: string) => void;
  onRatioNewChange: (value: string) => void;
  onRightPriceChange: (value: string) => void;
  onCumDatePriceChange: (value: string) => void;
  ratioError?: string;
  // Warrant props
  hasWarrant: boolean;
  onHasWarrantChange: (value: boolean) => void;
  warrantRatioOld: string;
  warrantRatioNew: string;
  onWarrantRatioOldChange: (value: string) => void;
  onWarrantRatioNewChange: (value: string) => void;
  warrantRatioError?: string;
  onPasteParsed?: (data: { ratioOld?: string; ratioNew?: string; rightPrice?: string }) => void;
  /** Hide advanced fields (cum-date price, warrant) when true */
  simpleMode?: boolean;
}

const RightIssueInfoSection: React.FC<RightIssueInfoSectionProps> = ({
  ratioOld,
  ratioNew,
  rightPrice,
  cumDatePrice,
  onRatioOldChange,
  onRatioNewChange,
  onRightPriceChange,
  onCumDatePriceChange,
  ratioError,
  hasWarrant,
  onHasWarrantChange,
  warrantRatioOld,
  warrantRatioNew,
  onWarrantRatioOldChange,
  onWarrantRatioNewChange,
  warrantRatioError,
  onPasteParsed,
  simpleMode = false,
}) => {
  const { t, language } = useLanguage();

  const priceChips: QuickChip[] = [
    { label: '+100', apply: (d) => String((parseInt(d || '0', 10) || 0) + 100) },
    { label: '+500', apply: (d) => String((parseInt(d || '0', 10) || 0) + 500) },
    { label: '+1.000', apply: (d) => String((parseInt(d || '0', 10) || 0) + 1000) },
    { label: '×2', apply: (d) => String((parseInt(d || '0', 10) || 0) * 2) },
    { label: '÷2', apply: (d) => String(Math.floor((parseInt(d || '0', 10) || 0) / 2)) },
    { label: 'C', apply: () => '' },
  ];

  const ratioPresetsOld = [1, 2, 4, 10];
  const ratioPresetsNew = [1, 2, 3];
  
  return (
    <section className="card-calculator animate-fade-in" data-tour="ri-info">
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-title mb-0 flex items-center">
          {t('rightIssue.title')}
          <InfoTooltip text={language === 'id' ? "Informasi tentang right issue yang diterbitkan emiten." : "Information about the right issue issued by the company."} />
        </h2>
        {onPasteParsed && (
          <PasteParserButton
            onParsed={(data) => onPasteParsed({
              ratioOld: data.ratioOld,
              ratioNew: data.ratioNew,
              rightPrice: data.rightPrice,
            })}
          />
        )}
      </div>
      
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground flex items-center">
            {t('rightIssue.ratio')} ({t('rightIssue.ratioOld')} : {t('rightIssue.ratioNew')})
            <InfoTooltip text={language === 'id' ? "Contoh: 2:1 berarti setiap 2 lembar lama berhak 1 lembar baru." : "Example: 2:1 means every 2 old shares entitled to 1 new share."} />
          </label>
          <div className="flex items-center gap-2">
            <RatioInput
              value={ratioOld}
              onChange={onRatioOldChange}
              placeholder={language === 'id' ? "Lama" : "Old"}
              fieldKey="ratioOld"
            />
            <span className="text-lg font-bold text-muted-foreground">:</span>
            <RatioInput
              value={ratioNew}
              onChange={onRatioNewChange}
              placeholder={language === 'id' ? "Baru" : "New"}
              fieldKey="ratioNew"
            />
          </div>
          {/* Ratio preset chips */}
          <div className="flex md:hidden items-center gap-1 overflow-x-auto no-scrollbar pt-1.5">
            <span className="text-[10px] text-muted-foreground shrink-0 mr-1">
              {language === 'id' ? 'Cepat:' : 'Quick:'}
            </span>
            {ratioPresetsOld.map((n) => (
              <button
                key={`old-${n}`}
                type="button"
                onClick={() => { haptic(6); onRatioOldChange(String(n)); }}
                className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-colors ${
                  ratioOld === String(n)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-transparent text-muted-foreground border-border hover:bg-muted'
                }`}
              >
                {n}
              </button>
            ))}
            <span className="text-[10px] text-muted-foreground shrink-0 mx-0.5">:</span>
            {ratioPresetsNew.map((n) => (
              <button
                key={`new-${n}`}
                type="button"
                onClick={() => { haptic(6); onRatioNewChange(String(n)); }}
                className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-colors ${
                  ratioNew === String(n)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-transparent text-muted-foreground border-border hover:bg-muted'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          {ratioError && (
            <p className="text-xs text-destructive mt-1 animate-fade-in">{ratioError}</p>
          )}
        </div>

        <CurrencyInput
          id="right-price"
          label={t('rightIssue.price')}
          value={rightPrice}
          onChange={onRightPriceChange}
          tooltip={t('rightIssue.priceHelp')}
          fieldKey="rightPrice"
          stepperStep={50}
          stepperAccel={[500, 5000]}
          quickChips={priceChips}
        />

        {!simpleMode && (
          <CurrencyInput
            id="cum-date-price"
            label={t('rightIssue.cumPrice')}
            value={cumDatePrice}
            onChange={onCumDatePriceChange}
            tooltip={t('rightIssue.cumPriceHelp')}
            fieldKey="cumDatePrice"
            stepperStep={50}
            stepperAccel={[500, 5000]}
            quickChips={priceChips}
          />
        )}

        {/* Bonus Warrant Section — hidden in Simple mode */}
        {!simpleMode && (
        <div className="pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <Checkbox
              id="has-warrant"
              checked={hasWarrant}
              onCheckedChange={(checked) => onHasWarrantChange(checked === true)}
            />
            <label 
              htmlFor="has-warrant" 
              className="text-xs font-medium text-foreground cursor-pointer flex items-center"
            >
              {t('rightIssue.hasWarrant')}
              <InfoTooltip text={language === 'id' ? "Centang jika right issue ini memberikan bonus waran." : "Check if this right issue provides bonus warrants."} />
            </label>
          </div>

          {hasWarrant && (
            <div className="mt-3 animate-fade-in">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center">
                  {t('rightIssue.warrantRatio')}
                  <span className="text-amber-500 ml-0.5">*</span>
                  <InfoTooltip text={language === 'id' ? "Contoh: 1:1 berarti setiap 1 lembar RI mendapat 1 waran." : "Example: 1:1 means every 1 RI share receives 1 warrant."} />
                </label>
                <div className="flex items-center gap-2">
                  <RatioInput
                    value={warrantRatioOld}
                    onChange={onWarrantRatioOldChange}
                    placeholder="RI"
                    className={!warrantRatioOld ? 'border-amber-400 dark:border-amber-500' : ''}
                    fieldKey="warrantRatioOld"
                  />
                  <span className="text-lg font-bold text-muted-foreground">:</span>
                  <RatioInput
                    value={warrantRatioNew}
                    onChange={onWarrantRatioNewChange}
                    placeholder={language === 'id' ? "Waran" : "Warrant"}
                    className={!warrantRatioNew ? 'border-amber-400 dark:border-amber-500' : ''}
                    fieldKey="warrantRatioNew"
                  />
                </div>
                {warrantRatioError ? (
                  <p className="text-xs text-destructive mt-1 animate-fade-in">{warrantRatioError}</p>
                ) : (!warrantRatioOld || !warrantRatioNew) && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                    {t('rightIssue.warrantRatioRequired')}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </section>
  );
};

export default RightIssueInfoSection;
