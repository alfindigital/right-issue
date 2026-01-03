import React from 'react';
import CurrencyInput from './CurrencyInput';
import RatioInput from './RatioInput';
import InfoTooltip from './InfoTooltip';
import { Checkbox } from '@/components/ui/checkbox';

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
  warrantRatioError
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
              Bonus Waran
              <InfoTooltip text="Centang jika right issue ini memberikan bonus waran." />
            </label>
          </div>

          {hasWarrant && (
            <div className="mt-3 animate-fade-in">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center">
                  Rasio Waran (RI : Waran)
                  <InfoTooltip text="Contoh: 1:1 berarti setiap 1 lembar RI mendapat 1 waran." />
                </label>
                <div className="flex items-center gap-2">
                  <RatioInput
                    value={warrantRatioOld}
                    onChange={onWarrantRatioOldChange}
                    placeholder="RI"
                  />
                  <span className="text-lg font-bold text-muted-foreground">:</span>
                  <RatioInput
                    value={warrantRatioNew}
                    onChange={onWarrantRatioNewChange}
                    placeholder="Waran"
                  />
                </div>
                {warrantRatioError && (
                  <p className="text-xs text-destructive mt-1 animate-fade-in">{warrantRatioError}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RightIssueInfoSection;
