import React from 'react';
import CurrencyInput from './CurrencyInput';
import RatioInput from './RatioInput';
import InfoTooltip from './InfoTooltip';

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
  ratioError
}) => {
  return (
    <section className="card-calculator animate-fade-in">
      <h2 className="section-title flex items-center">
        Info Right Issue
        <InfoTooltip text="Informasi tentang right issue yang diterbitkan emiten." />
      </h2>
      
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground flex items-center">
            Rasio (Lama : Baru)
            <InfoTooltip text="Contoh: 2:1 berarti setiap 2 lembar lama berhak 1 lembar baru." />
          </label>
          <div className="flex items-center gap-2">
            <RatioInput
              value={ratioOld}
              onChange={onRatioOldChange}
              placeholder="Lama"
            />
            <span className="text-lg font-bold text-muted-foreground">:</span>
            <RatioInput
              value={ratioNew}
              onChange={onRatioNewChange}
              placeholder="Baru"
            />
          </div>
          {ratioError && (
            <p className="text-xs text-destructive mt-1 animate-fade-in">{ratioError}</p>
          )}
        </div>

        <CurrencyInput
          id="right-price"
          label="Harga RI per lembar"
          value={rightPrice}
          onChange={onRightPriceChange}
          tooltip="Harga tebus untuk setiap lembar saham baru."
        />

        <CurrencyInput
          id="cum-date-price"
          label="Harga Cum Date"
          value={cumDatePrice}
          onChange={onCumDatePriceChange}
          tooltip="Harga saham saat terakhir berhak mendapat RI."
        />
      </div>
    </section>
  );
};

export default RightIssueInfoSection;
