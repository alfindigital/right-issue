import React from 'react';
import CurrencyInput from './CurrencyInput';
import RatioInput from './RatioInput';
import InfoTooltip from './InfoTooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';

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
  rightPriceError?: string;
  cumDatePriceError?: string;
  priceWarning?: string;
  // Warrant props
  hasWarrant: boolean;
  onHasWarrantChange: (value: boolean) => void;
  warrantRatioOld: string;
  warrantRatioNew: string;
  onWarrantRatioOldChange: (value: string) => void;
  onWarrantRatioNewChange: (value: string) => void;
  warrantRatioError?: string;
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
  rightPriceError,
  cumDatePriceError,
  priceWarning,
  hasWarrant,
  onHasWarrantChange,
  warrantRatioOld,
  warrantRatioNew,
  onWarrantRatioOldChange,
  onWarrantRatioNewChange,
  warrantRatioError
}) => {
  const { t, language } = useLanguage();
  
  return (
    <section className="card-calculator animate-fade-in">
      <h2 className="section-title flex items-center">
        {t('rightIssue.title')}
        <InfoTooltip text={language === 'id' ? "Informasi tentang right issue yang diterbitkan emiten." : "Information about the right issue issued by the company."} />
      </h2>
      
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
              placeholder={language === 'id' ? "cth: 4" : "e.g. 4"}
            />
            <span className="text-lg font-bold text-muted-foreground">:</span>
            <RatioInput
              value={ratioNew}
              onChange={onRatioNewChange}
              placeholder={language === 'id' ? "cth: 1" : "e.g. 1"}
            />
          </div>
          {ratioError && (
            <p className="text-xs text-destructive mt-1 animate-fade-in">{ratioError}</p>
          )}
          <p className="text-[10px] text-muted-foreground">
            {language === 'id' ? 'Contoh umum: 4 : 1 atau 2 : 1' : 'Common: 4 : 1 or 2 : 1'}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {language === 'id' ? 'Format: angka saja, mis. 4 : 1 (bukan "4/1")' : 'Format: numbers only, e.g. 4 : 1 (not "4/1")'}
          </p>
        </div>

        <CurrencyInput
          id="right-price"
          label={t('rightIssue.price')}
          value={rightPrice}
          onChange={onRightPriceChange}
          placeholder={language === 'id' ? 'cth: 500' : 'e.g. 500'}
          tooltip={t('rightIssue.priceHelp')}
          error={rightPriceError}
          hint={language === 'id' ? 'Format: angka saja tanpa "Rp" (mis. 500)' : 'Format: numbers only, no "Rp" (e.g. 500)'}
        />

        <CurrencyInput
          id="cum-date-price"
          label={t('rightIssue.cumPrice')}
          value={cumDatePrice}
          onChange={onCumDatePriceChange}
          placeholder={language === 'id' ? 'cth: 1.000' : 'e.g. 1,000'}
          tooltip={t('rightIssue.cumPriceHelp')}
          error={cumDatePriceError}
          hint={language === 'id' ? 'Format: angka saja tanpa "Rp" (mis. 1.000)' : 'Format: numbers only, no "Rp" (e.g. 1,000)'}
        />

        {priceWarning && !rightPriceError && !cumDatePriceError && (
          <p className="text-xs text-amber-600 dark:text-amber-400 animate-fade-in flex items-start gap-1">
            <span aria-hidden>⚠️</span>
            <span>{priceWarning}</span>
          </p>
        )}

        {/* Bonus Warrant Section */}
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
                    placeholder={language === 'id' ? "cth: 2" : "e.g. 2"}
                    className={!warrantRatioOld ? 'border-amber-400 dark:border-amber-500' : ''}
                  />
                  <span className="text-lg font-bold text-muted-foreground">:</span>
                  <RatioInput
                    value={warrantRatioNew}
                    onChange={onWarrantRatioNewChange}
                    placeholder={language === 'id' ? "cth: 1" : "e.g. 1"}
                    className={!warrantRatioNew ? 'border-amber-400 dark:border-amber-500' : ''}
                  />
                </div>
                {warrantRatioError ? (
                  <p className="text-xs text-destructive mt-1 animate-fade-in">{warrantRatioError}</p>
                ) : (!warrantRatioOld || !warrantRatioNew) && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                    {t('rightIssue.warrantRatioRequired')}
                  </p>
                )}
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {language === 'id' ? 'Format: angka saja, mis. 2 : 1' : 'Format: numbers only, e.g. 2 : 1'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RightIssueInfoSection;
