import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  onLoadDemo: () => void;
}

const EmptyStateCard: React.FC<Props> = ({ onLoadDemo }) => {
  const { language } = useLanguage();

  return (
    <div className="card-calculator animate-fade-in border-dashed">
      <div className="flex flex-col items-center text-center py-6 px-3">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
          <Sparkles className="w-7 h-7 text-primary" />
        </div>
        <h3 className="text-sm font-bold text-foreground mb-1">
          {language === 'id' ? 'Belum ada hasil' : 'No results yet'}
        </h3>
        <p className="text-xs text-muted-foreground max-w-xs mb-4 leading-relaxed">
          {language === 'id'
            ? 'Isi rasio dan harga tebus untuk melihat estimasi otomatis. Atau coba contoh siap pakai di bawah.'
            : 'Fill in the ratio and exercise price to see an automatic estimate. Or try the ready-to-use example below.'}
        </p>
        <button
          type="button"
          onClick={onLoadDemo}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 active:scale-95 transition-all shadow-md shadow-primary/20"
        >
          {language === 'id' ? 'Pakai contoh ELPI' : 'Try ELPI example'}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default EmptyStateCard;