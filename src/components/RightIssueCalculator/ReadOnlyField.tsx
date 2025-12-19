import React from 'react';
import InfoTooltip from './InfoTooltip';

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
        {tooltip && <InfoTooltip text={tooltip} />}
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
