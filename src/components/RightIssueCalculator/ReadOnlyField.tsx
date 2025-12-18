import React from 'react';

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  highlight?: boolean;
  animated?: boolean;
  delay?: number;
}

const ReadOnlyField: React.FC<ReadOnlyFieldProps> = ({
  label,
  value,
  highlight = false,
  animated = false,
  delay = 0
}) => {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-muted-foreground">
        {label}
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
