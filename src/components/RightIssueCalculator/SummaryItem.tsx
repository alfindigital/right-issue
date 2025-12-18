import React from 'react';

interface SummaryItemProps {
  label: string;
  value: string;
  highlight?: boolean;
}

const SummaryItem: React.FC<SummaryItemProps> = ({
  label,
  value,
  highlight = false
}) => {
  return (
    <div className="flex justify-between items-center py-3 border-b border-border last:border-b-0">
      <span className="summary-label">{label}</span>
      <span className={highlight ? 'summary-value-highlight' : 'summary-value'}>
        {value}
      </span>
    </div>
  );
};

export default SummaryItem;
