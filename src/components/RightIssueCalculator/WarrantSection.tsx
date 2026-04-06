import React from 'react';
import InfoTooltip from './InfoTooltip';
import { Gift } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface WarrantResultSectionProps {
  warrantCount: string;
  isCalculated: boolean;
}

const WarrantResultSection = React.forwardRef<HTMLElement, WarrantResultSectionProps>(({
  warrantCount,
  isCalculated
}, ref) => {
  const { t, language } = useLanguage();
  
  if (!isCalculated) return null;

  return (
    <section className="card-calculator animate-fade-in" style={{ animationDelay: '0.15s' }}>
      <h2 className="section-title flex items-center">
        <Gift className="w-4 h-4 mr-1.5" />
        {t('warrant.title')}
        <InfoTooltip text={language === 'id' ? "Jumlah waran yang akan Anda dapatkan dari right issue ini." : "Number of warrants you will receive from this right issue."} />
      </h2>

      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{t('warrant.count')}</span>
          <span className="text-lg font-bold text-primary animate-number-pop">
            {warrantCount} {language === 'id' ? 'unit' : 'units'}
          </span>
        </div>
      </div>
    </section>
  );
});

WarrantResultSection.displayName = 'WarrantResultSection';

export default WarrantResultSection;
