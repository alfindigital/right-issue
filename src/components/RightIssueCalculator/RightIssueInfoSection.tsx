import React from 'react';
import CurrencyInput from './CurrencyInput';
import RatioInput from './RatioInput';
import InfoTooltip from './InfoTooltip';
import PasteParserButton from './PasteParserButton';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';
import { ValidationResult } from '@/lib/validators';
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

  const warrantValidation: ValidationResult | undefined = warrantRatioError
    ? { state: 'error', message: warrantRatioError }
    : undefined;

  const priceChips: QuickChip[] = [
    { label: '+100', apply: (d) => String((parseInt(d || '0', 10) || 0) + 100) },
    { label: '+500', apply: (d) => String((parseInt(d || '0', 10) || 0) + 500) },
    { label: '+1.000', apply: (d) => String((parseInt(d || '0', 10) || 0) + 1000) },
    { label: '×2', apply: (d) => String((parseInt(d || '0', 10) || 0) * 2) },
    { label: '÷2', apply: (d) => String(Math.floor((parseInt(d || '0', 10) || 0) / 2)) },
    { label: 'C', apply: () => '' },
  ];

  return (
    <section className="card-calculator animate-fade-in">
      <div className="flex items-center justify-between mb-2.5">
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
      
      <div className="space-y-2.5">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground flex items-center">
            {t('rightIssue.ratio')} ({t('rightIssue.ratioOld')} : {t('rightIssue.ratioNew')})
            <InfoTooltip text={language === 'id' ? "Contoh: 2:1 berarti setiap 2 lembar lama berhak 1 lembar baru." : "Example: 2:1 means every 2 old shares entitled to 1 new share."} />
          </label>
          <div className="flex items-center gap-2">
            <RatioInput
              value={ratioOld}
              onChange={onRatioOldChange}
              placeholder="200"
              fieldKey="ratioOld"
              aria-label={language === 'id' ? 'Rasio lama' : 'Old ratio'}
              aria-describedby={ratioError ? 'ratio-error' : undefined}
              aria-invalid={!!ratioError}
            />
            <span className="text-lg font-bold text-muted-foreground">:</span>
            <RatioInput
              value={ratioNew}
              onChange={onRatioNewChange}
              placeholder="57"
              fieldKey="ratioNew"
              aria-label={language === 'id' ? 'Rasio baru' : 'New ratio'}
              aria-describedby={ratioError ? 'ratio-error' : undefined}
              aria-invalid={!!ratioError}
            />
          </div>
          {ratioError && (
            <p id="ratio-error" role="alert" className="text-xs text-destructive mt-1 animate-fade-in">{ratioError}</p>
          )}
        </div>

        <CurrencyInput
          id="right-price"
          label={t('rightIssue.price')}
          value={rightPrice}
          onChange={onRightPriceChange}
          placeholder="350"
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
            placeholder="1200"
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
              aria-label={language === 'id' ? "Right issue ini memberikan bonus waran" : "This right issue provides bonus warrants"}
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
                  <InfoTooltip text={language === 'id' ? "Contoh: 1:1 berarti setiap 1 lembar RI mendapat 1 waran." : "Example: 1:1 means every 1 RI share receives 1 warrant."} />
                </label>
                <div className="flex items-center gap-2">
                  <RatioInput
                    value={warrantRatioOld}
                    onChange={onWarrantRatioOldChange}
                    placeholder="RI"
                    fieldKey="warrantRatioOld"
                    validation={warrantValidation}
                    aria-label={language === 'id' ? 'Rasio RI waran' : 'Warrant RI ratio'}
                    aria-describedby={warrantRatioError ? 'warrant-ratio-error' : undefined}
                    aria-invalid={!!warrantRatioError}
                  />
                  <span className="text-lg font-bold text-muted-foreground">:</span>
                  <RatioInput
                    value={warrantRatioNew}
                    onChange={onWarrantRatioNewChange}
                    placeholder={language === 'id' ? "Waran" : "Warrant"}
                    fieldKey="warrantRatioNew"
                    validation={warrantValidation}
                    aria-label={language === 'id' ? 'Rasio waran' : 'Warrant ratio'}
                    aria-describedby={warrantRatioError ? 'warrant-ratio-error' : undefined}
                    aria-invalid={!!warrantRatioError}
                  />
                </div>
                {warrantRatioError && (
                  <p id="warrant-ratio-error" role="alert" className="text-xs text-destructive mt-1 animate-fade-in">{warrantRatioError}</p>
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
