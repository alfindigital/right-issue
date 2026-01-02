import React from 'react';
import { History, Trash2, Clock, ChevronRight } from 'lucide-react';
import { CalculationHistoryItem } from '@/hooks/useCalculationHistory';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface HistoryDropdownProps {
  history: CalculationHistoryItem[];
  onSelectHistory: (item: CalculationHistoryItem) => void;
  onRemoveHistory: (id: string) => void;
  onClearHistory: () => void;
}

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}j`;
  if (diffDays < 7) return `${diffDays}h`;
  
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  });
};

const HistoryDropdown: React.FC<HistoryDropdownProps> = ({
  history,
  onSelectHistory,
  onRemoveHistory,
  onClearHistory,
}) => {
  const [open, setOpen] = React.useState(false);

  if (history.length === 0) {
    return (
      <button
        className="p-1.5 rounded-md bg-white/10 text-white/50 cursor-not-allowed"
        disabled
        aria-label="History (kosong)"
      >
        <History className="w-4 h-4" />
      </button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors relative"
          aria-label="History"
        >
          <History className="w-4 h-4" />
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
            <History className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Riwayat</h3>
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
            Hapus
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
                      {item.inputs.ratioOld}:{item.inputs.ratioNew}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {formatDate(item.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-muted-foreground">
                      <span className="font-medium text-foreground">{item.inputs.currentLots}</span> lot
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className={`font-medium ${item.results.recommendation === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {item.results.finalAvgPrice}
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
                    aria-label="Hapus"
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

export default HistoryDropdown;
