import React from 'react';
import { Sparkles } from 'lucide-react';
import { useActiveRights, type ActiveRight } from '@/hooks/useActiveRights';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  onPick: (ri: ActiveRight) => void;
}

/**
 * Horizontal chip strip showing currently-active Indonesian right issues.
 * Renders nothing when the list is empty (no active RIs / fetch failed).
 */
const ActiveRightsChips: React.FC<Props> = ({ onPick }) => {
  const { language } = useLanguage();
  const { items, loading } = useActiveRights();

  if (!loading && items.length === 0) return null;

  return (
    <div className="card-calculator animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <h3 className="text-xs font-bold text-foreground">
          {language === 'id' ? 'RI aktif' : 'Active RIs'}
        </h3>
        <span className="text-[10px] text-muted-foreground">
          {language === 'id' ? 'sekali klik untuk prefill' : 'one tap to prefill'}
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1 scrollbar-hide">
        {loading && items.length === 0 && (
          <>
            <Skeleton className="h-14 w-32 rounded-xl flex-shrink-0" />
            <Skeleton className="h-14 w-32 rounded-xl flex-shrink-0" />
          </>
        )}
        {items.map((ri) => (
          <button
            key={ri.code}
            type="button"
            onClick={() => onPick(ri)}
            className="flex-shrink-0 text-left px-3 py-2 rounded-xl bg-primary/5 border border-primary/20 hover:bg-primary/10 hover:border-primary/40 active:scale-95 transition-all min-w-[9rem]"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-bold text-primary">{ri.code}</span>
              <span className="text-[10px] font-semibold text-muted-foreground">
                {ri.ratioOld}:{ri.ratioNew}
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground truncate max-w-[8rem]">
              {ri.name}
            </div>
            <div className="text-[10px] font-semibold text-foreground mt-0.5">
              Rp {new Intl.NumberFormat('id-ID').format(ri.rightPrice)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ActiveRightsChips;