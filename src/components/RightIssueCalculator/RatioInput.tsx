import React from 'react';
import { sanitizeRatioInput } from '@/lib/parseDecimal';

interface RatioInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RatioInput = React.forwardRef<HTMLInputElement, RatioInputProps>(({
  value,
  onChange,
  placeholder,
  className = ''
}, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeRatioInput(e.target.value);
    onChange(sanitized);
  };

  // Auto-correct on blur:
  // - "0", "0,0", "0,00" -> ""
  // - trailing comma ("5,") -> "5"
  // - leading zeros ("007" -> "7"), but keep "0,5"
  const handleBlur = () => {
    if (!value) return;
    let next = value;
    if (next.endsWith(',')) next = next.slice(0, -1);
    if (/^0+(,0+)?$/.test(next)) {
      onChange('');
      return;
    }
    // trim leading zeros only on integer part, preserve "0,x"
    const [intPart, decPart] = next.split(',');
    const trimmedInt = intPart.replace(/^0+(?=\d)/, '');
    next = decPart !== undefined ? `${trimmedInt || '0'},${decPart}` : trimmedInt;
    if (next !== value) onChange(next);
  };

  return (
    <input
      ref={ref}
      type="text"
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={`input-calculator flex-1 ${className}`}
      inputMode="decimal"
    />
  );
});

RatioInput.displayName = 'RatioInput';

export default RatioInput;
