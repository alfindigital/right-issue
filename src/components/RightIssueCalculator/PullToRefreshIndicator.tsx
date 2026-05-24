import React from 'react';
import { RotateCcw } from 'lucide-react';

interface Props {
  pull: number;
  progress: number;
  label: string;
  readyLabel: string;
}

const PullToRefreshIndicator: React.FC<Props> = ({ pull, progress, label, readyLabel }) => {
  if (pull <= 2) return null;
  const ready = progress >= 1;
  return (
    <div
      className="md:hidden fixed top-0 left-0 right-0 z-[55] pointer-events-none flex items-start justify-center"
      style={{ transform: `translateY(${Math.min(pull, 90)}px)` }}
    >
      <div
        className={`mt-2 flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border text-[11px] font-semibold transition-colors ${
          ready
            ? 'bg-[hsl(var(--warning))]/15 border-[hsl(var(--warning))]/40 text-[hsl(var(--warning))]'
            : 'bg-card/80 border-border text-muted-foreground'
        }`}
      >
        <RotateCcw
          className="w-3.5 h-3.5 transition-transform"
          style={{ transform: `rotate(${progress * 270}deg)` }}
        />
        <span>{ready ? readyLabel : label}</span>
      </div>
    </div>
  );
};

export default PullToRefreshIndicator;