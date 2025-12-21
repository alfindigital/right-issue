import React from 'react';
import { History, Trash2, Clock, ChevronRight } from 'lucide-react';
import { CalculationHistoryItem } from '@/hooks/useCalculationHistory';

interface HistorySectionProps {
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
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const HistorySection: React.FC<HistorySectionProps> = ({
  history,
  onSelectHistory,
  onRemoveHistory,
  onClearHistory,
}) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Riwayat Perhitungan</h3>
          <span className="text-xs text-muted-foreground">({history.length})</span>
        </div>
        <button
          onClick={onClearHistory}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" />
          Hapus semua
        </button>
      </div>
      
      <div className="divide-y divide-border max-h-[280px] overflow-y-auto">
        {history.map((item) => (
          <div
            key={item.id}
            className="p-3 hover:bg-muted/30 transition-colors cursor-pointer group"
            onClick={() => onSelectHistory(item)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {item.stockCode && (
                    <span className="text-xs font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                      {item.stockCode}
                    </span>
                  )}
                  <span className="text-xs font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                    {item.inputs.ratioOld}:{item.inputs.ratioNew}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(item.timestamp)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
                  <div className="text-muted-foreground">
                    Lot: <span className="text-foreground font-medium">{item.inputs.currentLots}</span>
                  </div>
                  <div className="text-muted-foreground">
                    Harga RI: <span className="text-foreground font-medium">Rp {parseInt(item.inputs.rightPrice).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="text-muted-foreground">
                    Hasil: <span className="text-foreground font-medium">{item.results.newSharesCount} lembar</span>
                  </div>
                  <div className="text-muted-foreground">
                    Avg baru: <span className={`font-medium ${item.results.recommendation === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {item.results.finalAvgPrice}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveHistory(item.id);
                  }}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Hapus"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistorySection;
