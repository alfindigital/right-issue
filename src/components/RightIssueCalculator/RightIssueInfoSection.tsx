import React from 'react';
import CurrencyInput from './CurrencyInput';
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
}

const RightIssueInfoSection: React.FC<RightIssueInfoSectionProps> = ({
  ratioOld,
  ratioNew,
  rightPrice,
  cumDatePrice,
  onRatioOldChange,
  onRatioNewChange,
  onRightPriceChange,
  onCumDatePriceChange
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
            <input
              type="text"
              value={ratioOld}
              onChange={(e) => onRatioOldChange(e.target.value.replace(/\D/g, ''))}
              placeholder="Lama"
              className="input-calculator flex-1"
              inputMode="numeric"
            />
            <span className="text-lg font-bold text-muted-foreground">:</span>
            <input
              type="text"
              value={ratioNew}
              onChange={(e) => onRatioNewChange(e.target.value.replace(/\D/g, ''))}
              placeholder="Baru"
              className="input-calculator flex-1"
              inputMode="numeric"
            />
          </div>
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
