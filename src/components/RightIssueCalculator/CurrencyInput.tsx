import React from 'react';
import InfoTooltip from './InfoTooltip';

interface CurrencyInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  tooltip?: string;
}

const CurrencyInput = React.forwardRef<HTMLDivElement, CurrencyInputProps>(({
  id,
  label,
  value,
  onChange,
  placeholder = "0",
  tooltip
}, ref) => {
  const formatNumber = (num: string): string => {
    const cleanNum = num.replace(/\D/g, '');
    if (!cleanNum) return '';
    return new Intl.NumberFormat('id-ID').format(parseInt(cleanNum));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    onChange(rawValue);
  };

  return (
    <div className="space-y-1.5" ref={ref}>
      <label htmlFor={id} className="text-xs font-medium text-foreground flex items-center">
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </label>
      <input
        type="text"
        id={id}
        value={formatNumber(value)}
        onChange={handleChange}
        placeholder={placeholder}
        className="input-calculator"
        inputMode="numeric"
      />
    </div>
  );
});

CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput;
