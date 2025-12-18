import React from 'react';

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  highlight?: boolean;
}

const ReadOnlyField: React.FC<ReadOnlyFieldProps> = ({
  label,
  value,
  highlight = false
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <div className={`read-only-value ${highlight ? 'bg-primary/10 text-primary' : ''}`}>
        {value}
      </div>
    </div>
  );
};

export default ReadOnlyField;
