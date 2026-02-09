import React from 'react';
import { FolderOpen, Trash2, Clock, ChevronRight } from 'lucide-react';
import { BudgetPlannerHistoryItem } from '@/hooks/useBudgetPlannerHistory';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useLanguage } from '@/contexts/LanguageContext';

interface BudgetPlannerHistoryDropdownProps {
  history: BudgetPlannerHistoryItem[];
  onSelectHistory: (item: BudgetPlannerHistoryItem) => void;
  onRemoveHistory: (id: string) => void;
  onClearHistory: () => void;
}

const formatBudget = (value: string): string => {
  const num = parseInt(value) || 0;
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}M`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(0)}jt`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}rb`;
  return value;
};

const BudgetPlannerHistoryDropdown: React.FC<BudgetPlannerHistoryDropdownProps> = ({
  history,
  onSelectHistory,
  onRemoveHistory,
  onClearHistory,
}) => {
  const { t, language } = useLanguage();
  const [open, setOpen] = React.useState(false);

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return language === 'id' ? 'Baru saja' : 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}${language === 'id' ? 'j' : 'h'}`;
    if (diffDays < 7) return `${diffDays}${language === 'id' ? 'h' : 'd'}`;
    
    return date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      day: 'numeric',
      month: 'short',
    });
  };

  if (history.length === 0) {
    return (
      <button
        className="p-1.5 rounded-md bg-primary/10 text-primary/50 cursor-not-allowed"
        disabled
        aria-label={language === 'id' ? 'Konfigurasi (kosong)' : 'Configurations (empty)'}
        title={t('budgetPlanner.noSavedConfigs')}
      >
        <FolderOpen className="w-4 h-4" />
      </button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="p-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors relative"
          aria-label={t('budgetPlanner.loadConfig')}
          title={t('budgetPlanner.loadConfig')}
        >
          <FolderOpen className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {history.length}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 bg-popover border border-border shadow-lg" 
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">{t('budgetPlanner.savedConfigs')}</h3>
            <span className="text-xs text-muted-foreground">({history.length})</span>
          </div>
          <button
            onClick={() => {
              onClearHistory();
              setOpen(false);
            }}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            {t('history.clear')}
          </button>
        </div>
        
        <div className="divide-y divide-border max-h-[320px] overflow-y-auto">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-2.5 hover:bg-muted/50 transition-colors cursor-pointer group"
              onClick={() => {
                onSelectHistory(item);
                setOpen(false);
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    {item.stockCode && (
                      <span className="text-[10px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                        {item.stockCode}
                      </span>
                    )}
                    <span className="text-[10px] font-medium bg-muted text-foreground px-1.5 py-0.5 rounded">
                      {item.config.ratioOld}:{item.config.ratioNew}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {formatDate(item.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-muted-foreground">
                      RI <span className="font-medium text-foreground">Rp{parseInt(item.config.rightPrice).toLocaleString('id-ID')}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Budget <span className="font-medium text-foreground">{formatBudget(item.config.budget)}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveHistory(item.id);
                    }}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    aria-label={t('history.delete')}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default BudgetPlannerHistoryDropdown;
