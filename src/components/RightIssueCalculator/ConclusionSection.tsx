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
      
      <div className="space-y-1 mb-6">
        <SummaryItem label="Total Jatah Right Issue (lembar)" value={newShares} />
        <SummaryItem label="Harga Tebus Right Issue (Rp)" value={exercisePrice} />
        <SummaryItem label="Total Biaya Untuk Menebus Right Issue (Rp)" value={totalCost} highlight />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="info-box">
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Avg Harga Baru</div>
          <div className="text-xl font-bold text-foreground">{newAvgPrice}</div>
        </div>
        <div className="info-box border-primary/40">
          <div className="text-xs text-primary uppercase tracking-wide mb-1">Harga Teoritis (TERP)</div>
          <div className="text-xl font-bold text-primary">{theoreticalPrice}</div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
        <strong>TERP</strong> (Theoretical Ex-Right Price) adalah harga teoritis yang dapat dihitung dengan menggunakan formula: 
        (Harga cum date × Rasio Lama) + (Harga tebus × Rasio Baru) / (Rasio lama + Rasio baru)
      </p>

      {isCalculated && recommendation && (
        <div className={recommendation === 'positive' ? 'recommendation-positive' : 'recommendation-negative'}>
          <p className="font-medium">{recommendationText}</p>
        </div>
      )}
    </section>
  );
};

export default ConclusionSection;
