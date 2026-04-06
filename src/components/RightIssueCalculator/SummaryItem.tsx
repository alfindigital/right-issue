import React from 'react';
import InfoTooltip from './InfoTooltip';

interface SummaryItemProps {
  label: string;
  value: string;
  highlight?: boolean;
  animated?: boolean;
  delay?: number;
  tooltip?: string;
}

const SummaryItem = React.forwardRef<HTMLDivElement, SummaryItemProps>(({
  label,
  value,
  highlight = false,
  animated = false,
  delay = 0,
  tooltip
}, ref) => {
  return (
    <div 
      ref={ref}
      className={`flex justify-between items-center py-3 border-b border-border last:border-b-0 transition-all duration-500 ${animated ? 'animate-slide-in' : ''}`}
      style={{ animationDelay: animated ? `${delay}ms` : '0ms' }}
    >
      <span className="summary-label flex items-center">
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </span>
      <span className={`transition-all duration-300 ${highlight ? 'summary-value-highlight' : 'summary-value'} ${animated ? 'animate-number-pop' : ''}`}>
        {value}
      </span>
    </div>
  );
});

SummaryItem.displayName = 'SummaryItem';

export default SummaryItem;
