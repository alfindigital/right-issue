import React from 'react';
import { Sparkles, Settings2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export type ViewMode = 'simple' | 'pro';

interface Props {
  mode: ViewMode;
  onChange: (m: ViewMode) => void;
}

const ViewModeToggle: React.FC<Props> = ({ mode, onChange }) => {
  const { language } = useLanguage();

  return (
    <div className="inline-flex items-center rounded-xl border border-border bg-card p-0.5 text-[11px] font-medium">
      <button
        type="button"
        onClick={() => onChange('simple')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
          mode === 'simple'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Sparkles className="w-3 h-3" />
        {language === 'id' ? 'Simple' : 'Simple'}
      </button>
      <button
        type="button"
        onClick={() => onChange('pro')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
          mode === 'pro'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Settings2 className="w-3 h-3" />
        Pro
      </button>
    </div>
  );
};

export default ViewModeToggle;