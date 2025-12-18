import React from 'react';
import CurrencyInput from './CurrencyInput';

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
      <h2 className="section-title">Informasi Right Issue Saham</h2>
      
      <div className="space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Rasio (Lama : Baru)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={ratioOld}
              onChange={(e) => onRatioOldChange(e.target.value.replace(/\D/g, ''))}
              placeholder="Rasio Lama"
              className="input-calculator flex-1"
              inputMode="numeric"
            />
            <span className="text-xl font-bold text-muted-foreground">:</span>
            <input
              type="text"
              value={ratioNew}
              onChange={(e) => onRatioNewChange(e.target.value.replace(/\D/g, ''))}
              placeholder="Rasio Baru"
              className="input-calculator flex-1"
              inputMode="numeric"
            />
          </div>
        </div>

        <CurrencyInput
          id="right-price"
          label="Harga Right Issue per lembar (Rp)"
          value={rightPrice}
          onChange={onRightPriceChange}
        />

        <CurrencyInput
          id="cum-date-price"
          label="Harga saham perkiraan saat Cum Date (Rp)"
          value={cumDatePrice}
          onChange={onCumDatePriceChange}
        />
      </div>
    </section>
  );
};

export default RightIssueInfoSection;
