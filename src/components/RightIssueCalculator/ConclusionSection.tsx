import React from 'react';
import SummaryItem from './SummaryItem';
import InfoTooltip from './InfoTooltip';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ConclusionSectionProps {
  newLots: string;
  exercisePrice: string;
  totalCost: string;
  newAvgPrice: string;
  theoreticalPrice: string;
  recommendation: 'positive' | 'negative' | null;
  recommendationText: string;
  isCalculated: boolean;
}

const ConclusionSection: React.FC<ConclusionSectionProps> = ({
  newLots,
  exercisePrice,
  totalCost,
  newAvgPrice,
  theoreticalPrice,
  recommendation,
  recommendationText,
  isCalculated
}) => {
  const { t, language } = useLanguage();
  
  return (
    <section className="card-calculator animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <h2 className="section-title flex items-center">
        {t('conclusion.title')}
        <InfoTooltip text={language === 'id' ? "Ringkasan dan analisis berdasarkan kalkulasi." : "Summary and analysis based on calculation."} />
      </h2>
      
      <div className="space-y-1 mb-4">
        <SummaryItem label={t('conclusion.newLots')} value={`${newLots} lot`} tooltip={language === 'id' ? "Jumlah lot RI yang berhak ditebus." : "Number of RI lots entitled to exercise."} />
        <SummaryItem label={t('conclusion.exercisePrice')} value={exercisePrice} tooltip={language === 'id' ? "Harga per lembar untuk menebus RI." : "Price per share to exercise RI."} />
        <SummaryItem label={t('conclusion.totalCost')} value={totalCost} highlight tooltip={language === 'id' ? "Dana yang dibutuhkan untuk tebus semua jatah RI." : "Funds required to exercise all RI allocation."} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="info-box">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5 flex items-center">
            {t('conclusion.newAvg')}
            <InfoTooltip text={language === 'id' ? "Harga rata-rata setelah tebus RI." : "Average price after exercising RI."} />
          </div>
          <div className="text-base md:text-lg font-bold text-foreground">{newAvgPrice}</div>
        </div>
        <div className="info-box border-primary/40">
          <div className="text-[10px] text-primary uppercase tracking-wide mb-0.5 flex items-center">
            {t('conclusion.terp')}
            <InfoTooltip text={language === 'id' ? "Theoretical Ex-Right Price: harga teoritis saham setelah right issue berdasarkan formula (harga cum × rasio lama + harga RI × rasio baru) / (rasio lama + rasio baru)." : "Theoretical Ex-Right Price: theoretical share price after right issue based on formula (cum price × old ratio + RI price × new ratio) / (old ratio + new ratio)."} />
          </div>
          <div className="text-base md:text-lg font-bold text-primary">{theoreticalPrice}</div>
        </div>
      </div>

      {isCalculated && recommendation && (
        <>
          <div className={`text-sm p-3 rounded-xl transition-all duration-300 ${
            recommendation === 'positive' 
              ? 'bg-gradient-to-r from-green-100 to-green-50 border border-green-200 dark:from-green-900/30 dark:to-green-950/20 dark:border-green-800' 
              : 'bg-gradient-to-r from-amber-100 to-amber-50 border border-amber-200 dark:from-amber-900/30 dark:to-amber-950/20 dark:border-amber-800'
          }`}>
            <p className="font-medium text-foreground leading-relaxed">{recommendationText}</p>
          </div>

          {/* Disclaimer */}
          <div className="mt-3 p-2.5 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                <strong className="text-foreground/70">Disclaimer:</strong>{' '}
                {language === 'id' 
                  ? 'Hasil kalkulasi ini bersifat teoritis dan tidak memperhitungkan biaya transaksi, pajak, pergerakan harga pasar, serta faktor fundamental perusahaan. TERP adalah harga teoritis, bukan jaminan harga pasar. Keputusan investasi sepenuhnya tanggung jawab pengguna.'
                  : 'This calculation is theoretical and does not account for transaction fees, taxes, market price movements, or company fundamentals. TERP is a theoretical price, not a market price guarantee. Investment decisions are entirely the user\'s responsibility.'}
              </p>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default ConclusionSection;
