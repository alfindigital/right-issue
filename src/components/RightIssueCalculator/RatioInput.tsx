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

  return (
    <input
      ref={ref}
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={`input-calculator flex-1 ${className}`}
      inputMode="decimal"
    />
  );
});

RatioInput.displayName = 'RatioInput';

export default RatioInput;
