import React from 'react';
import SummaryItem from './SummaryItem';

interface ConclusionSectionProps {
  newShares: string;
  exercisePrice: string;
  totalCost: string;
  newAvgPrice: string;
  theoreticalPrice: string;
  recommendation: 'positive' | 'negative' | null;
  recommendationText: string;
  isCalculated: boolean;
}

const ConclusionSection: React.FC<ConclusionSectionProps> = ({
  newShares,
  exercisePrice,
  totalCost,
  newAvgPrice,
  theoreticalPrice,
  recommendation,
  recommendationText,
  isCalculated
}) => {
  return (
    <section className="card-calculator animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <h2 className="section-title">Kesimpulan</h2>
      
      <div className="space-y-1 mb-4">
        <SummaryItem label="Jatah RI (lembar)" value={newShares} />
        <SummaryItem label="Harga Tebus" value={exercisePrice} />
        <SummaryItem label="Total Biaya Tebus" value={totalCost} highlight />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="info-box">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Avg Baru</div>
          <div className="text-base md:text-lg font-bold text-foreground">{newAvgPrice}</div>
        </div>
        <div className="info-box border-primary/40 group relative">
          <div className="text-[10px] text-primary uppercase tracking-wide mb-0.5">TERP</div>
          <div className="text-base md:text-lg font-bold text-primary">{theoreticalPrice}</div>
          {/* TERP tooltip on hover */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1.5 bg-card border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none w-[200px] z-10">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              TERP = (Harga cum × Lama + Harga RI × Baru) / (Lama + Baru)
            </p>
          </div>
        </div>
      </div>

      {isCalculated && recommendation && (
        <div className={`text-sm ${recommendation === 'positive' ? 'recommendation-positive' : 'recommendation-negative'}`}>
          <p className="font-medium">{recommendationText}</p>
        </div>
      )}
    </section>
  );
};

export default ConclusionSection;
