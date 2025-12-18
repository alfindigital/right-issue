import React from 'react';

interface SummaryItemProps {
  label: string;
  value: string;
  highlight?: boolean;
  animated?: boolean;
  delay?: number;
}

const SummaryItem: React.FC<SummaryItemProps> = ({
  label,
  value,
  highlight = false,
  animated = false,
  delay = 0
}) => {
  return (
    <div 
      className={`flex justify-between items-center py-3 border-b border-border last:border-b-0 transition-all duration-500 ${animated ? 'animate-slide-in' : ''}`}
      style={{ animationDelay: animated ? `${delay}ms` : '0ms' }}
    >
      <span className="summary-label">{label}</span>
      <span className={`transition-all duration-300 ${highlight ? 'summary-value-highlight' : 'summary-value'} ${animated ? 'animate-number-pop' : ''}`}>
        {value}
      </span>
    </div>
  );
};

export default SummaryItem;
