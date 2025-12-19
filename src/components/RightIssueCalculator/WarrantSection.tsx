import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import InfoTooltip from './InfoTooltip';

interface WarrantSectionProps {
  hasWarrant: boolean;
  onHasWarrantChange: (value: boolean) => void;
  warrantRatioOld: string;
  warrantRatioNew: string;
  onWarrantRatioOldChange: (value: string) => void;
  onWarrantRatioNewChange: (value: string) => void;
  warrantCount: string;
  isCalculated: boolean;
}

const WarrantSection: React.FC<WarrantSectionProps> = ({
  hasWarrant,
  onHasWarrantChange,
  warrantRatioOld,
  warrantRatioNew,
  onWarrantRatioOldChange,
  onWarrantRatioNewChange,
  warrantCount,
  isCalculated
}) => {
  return (
    <section className="card-calculator animate-fade-in" style={{ animationDelay: '0.15s' }}>
      <div className="flex items-center gap-2 mb-3">
        <Checkbox
          id="has-warrant"
          checked={hasWarrant}
          onCheckedChange={(checked) => onHasWarrantChange(checked === true)}
        />
        <label 
          htmlFor="has-warrant" 
          className="text-sm font-bold text-foreground cursor-pointer flex items-center"
        >
          Bonus Waran
          <InfoTooltip text="Centang jika right issue ini memberikan bonus waran." />
        </label>
      </div>

      {hasWarrant && (
        <div className="space-y-3 animate-fade-in">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center">
              Rasio Waran (RI : Waran)
              <InfoTooltip text="Contoh: 1:1 berarti setiap 1 lembar RI mendapat 1 waran." />
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={warrantRatioOld}
                onChange={(e) => onWarrantRatioOldChange(e.target.value.replace(/\D/g, ''))}
                placeholder="RI"
                className="input-calculator flex-1"
                inputMode="numeric"
              />
              <span className="text-lg font-bold text-muted-foreground">:</span>
              <input
                type="text"
                value={warrantRatioNew}
                onChange={(e) => onWarrantRatioNewChange(e.target.value.replace(/\D/g, ''))}
                placeholder="Waran"
                className="input-calculator flex-1"
                inputMode="numeric"
              />
            </div>
          </div>

          <div className={`space-y-1 transition-all duration-500 ${isCalculated ? 'opacity-100' : 'opacity-50'}`}>
            <label className="text-xs font-medium text-muted-foreground flex items-center">
              Total Waran
              <InfoTooltip text="Jumlah waran yang akan Anda dapatkan." />
            </label>
            <div className={`read-only-value ${isCalculated ? 'animate-number-pop' : ''}`}>
              {warrantCount}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default WarrantSection;
