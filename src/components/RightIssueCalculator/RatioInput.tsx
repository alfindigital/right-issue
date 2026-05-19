import React from 'react';
import { sanitizeRatioInput } from '@/lib/parseDecimal';
import { validateRatio, validationClass, ValidationResult } from '@/lib/validators';

interface RatioInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  validation?: ValidationResult;
}

const RatioInput = React.forwardRef<HTMLInputElement, RatioInputProps>(({
  value,
  onChange,
  placeholder,
  className = '',
  validation,
}, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeRatioInput(e.target.value);
    onChange(sanitized);
  };

  const v = validation ?? validateRatio(value);
  const stateClass = validationClass(v.state);

  return (
    <input
      ref={ref}
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={`input-calculator flex-1 ${stateClass} ${className}`}
      inputMode="decimal"
    />
  );
});

RatioInput.displayName = 'RatioInput';

export default RatioInput;
