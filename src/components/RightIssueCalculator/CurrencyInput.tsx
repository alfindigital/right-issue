import React from 'react';
import InfoTooltip from './InfoTooltip';

interface CurrencyInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  tooltip?: string;
  error?: string;
  hint?: string;
}

const CurrencyInput = React.forwardRef<HTMLDivElement, CurrencyInputProps>(({
  id,
  label,
  value,
  onChange,
  placeholder = "0",
  tooltip,
  error,
  hint,
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

  // Auto-correct on blur: clear "0"/all-zero, trim leading zeros (e.g. "007" -> "7")
  const handleBlur = () => {
    if (!value) return;
    if (/^0+$/.test(value)) {
      onChange('');
      return;
    }
    const trimmed = value.replace(/^0+/, '');
    if (trimmed !== value) onChange(trimmed);
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
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`input-calculator ${error ? 'border-destructive focus:border-destructive ring-1 ring-destructive/30' : ''}`}
        inputMode="numeric"
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive mt-1 animate-fade-in">
          {error}
        </p>
      )}
      {!error && hint && (
        <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>
      )}
    </div>
  );
});

CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput;
