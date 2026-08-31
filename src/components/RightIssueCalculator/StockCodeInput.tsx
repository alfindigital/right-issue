// Stock code autocomplete removed (was powered by Supabase Edge Function).
// Now renders a plain text input — users type the IDX stock code manually (e.g. BBCA, TLKM).
import React from 'react';
import { Tag } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface StockCodeInputProps {
  value: string;
  onChange: (value: string) => void;
}

const StockCodeInput: React.FC<StockCodeInputProps> = ({ value, onChange }) => {
  const { t, language } = useLanguage();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
    onChange(val);
  };

  return (
    <div className="card-calculator">
      <div className="flex items-center gap-2 mb-2">
        <Tag className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">{t('stockCode.label')}</span>
        <span className="text-xs text-muted-foreground">
          ({language === 'id' ? 'opsional' : 'optional'})
        </span>
      </div>
      <input
        id="stock-code"
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={t('stockCode.placeholder')}
        className="input-calculator text-center font-bold tracking-widest text-lg"
        maxLength={4}
      />
    </div>
  );
};

export default StockCodeInput;
