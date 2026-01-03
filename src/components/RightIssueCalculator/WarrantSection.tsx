import React from 'react';
import InfoTooltip from './InfoTooltip';
import { Gift } from 'lucide-react';

interface WarrantResultSectionProps {
  warrantCount: string;
  isCalculated: boolean;
}

const WarrantResultSection: React.FC<WarrantResultSectionProps> = ({
  warrantCount,
  isCalculated
}) => {
  if (!isCalculated) return null;

  return (
    <section className="card-calculator animate-fade-in" style={{ animationDelay: '0.15s' }}>
      <h2 className="section-title flex items-center">
        <Gift className="w-4 h-4 mr-1.5" />
        Bonus Waran
        <InfoTooltip text="Jumlah waran yang akan Anda dapatkan dari right issue ini." />
      </h2>

      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Total Waran</span>
          <span className="text-lg font-bold text-primary animate-number-pop">
            {warrantCount} unit
          </span>
        </div>
      </div>
    </section>
  );
};

export default WarrantResultSection;
