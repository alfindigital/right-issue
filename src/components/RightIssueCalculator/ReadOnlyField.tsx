import React from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  highlight?: boolean;
  animated?: boolean;
  delay?: number;
  tooltip?: string;
}

const ReadOnlyField: React.FC<ReadOnlyFieldProps> = ({
  label,
  value,
  highlight = false,
  animated = false,
  delay = 0,
  tooltip
}) => {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground flex items-center">
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
      </label>
      <div 
        className={`read-only-value transition-all duration-500 ${highlight ? 'bg-primary/10 text-primary' : ''} ${animated ? 'animate-scale-pop' : ''}`}
        style={{ animationDelay: animated ? `${delay}ms` : '0ms' }}
      >
        {value}
      </div>
    </div>
  );
};

export default ReadOnlyField;
