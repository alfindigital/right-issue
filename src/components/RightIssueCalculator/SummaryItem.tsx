import React from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SummaryItemProps {
  label: string;
  value: string;
  highlight?: boolean;
  animated?: boolean;
  delay?: number;
  tooltip?: string;
}

const SummaryItem: React.FC<SummaryItemProps> = ({
  label,
  value,
  highlight = false,
  animated = false,
  delay = 0,
  tooltip
}) => {
  return (
    <div 
      className={`flex justify-between items-center py-3 border-b border-border last:border-b-0 transition-all duration-500 ${animated ? 'animate-slide-in' : ''}`}
      style={{ animationDelay: animated ? `${delay}ms` : '0ms' }}
    >
      <span className="summary-label flex items-center">
        {label}
        {tooltip && (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary cursor-help transition-colors ml-1">
                  <Info size={10} />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px] text-xs">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </span>
      <span className={`transition-all duration-300 ${highlight ? 'summary-value-highlight' : 'summary-value'} ${animated ? 'animate-number-pop' : ''}`}>
        {value}
      </span>
    </div>
  );
};

export default SummaryItem;
