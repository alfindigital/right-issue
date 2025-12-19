import React from 'react';
import SummaryItem from './SummaryItem';
import InfoTooltip from './InfoTooltip';

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
      <h2 className="section-title flex items-center">
        Kesimpulan
        <InfoTooltip text="Ringkasan dan rekomendasi berdasarkan kalkulasi." />
      </h2>
      
      <div className="space-y-1 mb-4">
        <SummaryItem label="Jatah RI" value={newShares} tooltip="Jumlah lembar saham RI yang berhak ditebus." />
        <SummaryItem label="Harga Tebus" value={exercisePrice} tooltip="Harga per lembar untuk menebus RI." />
        <SummaryItem label="Total Biaya" value={totalCost} highlight tooltip="Dana yang dibutuhkan untuk tebus semua jatah RI." />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="info-box">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5 flex items-center">
            Avg Baru
            <InfoTooltip text="Harga rata-rata setelah tebus RI." />
          </div>
          <div className="text-base md:text-lg font-bold text-foreground">{newAvgPrice}</div>
        </div>
        <div className="info-box border-primary/40">
          <div className="text-[10px] text-primary uppercase tracking-wide mb-0.5 flex items-center">
            TERP
            <InfoTooltip text="Theoretical ex-right price: (harga cum × lama + harga RI × baru) / (lama + baru)." />
          </div>
          <div className="text-base md:text-lg font-bold text-primary">{theoreticalPrice}</div>
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
