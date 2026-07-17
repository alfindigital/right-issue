import React, { useEffect, useRef } from 'react';
import { sanitizeRatioInput } from '@/lib/parseDecimal';
import { validateRatio, validationClass, ValidationResult } from '@/lib/validators';
import { registerField, advanceFrom, FieldKey } from '@/lib/autoAdvance';

interface RatioInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  validation?: ValidationResult;
  fieldKey?: FieldKey;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

const RatioInput = React.forwardRef<HTMLInputElement, RatioInputProps>(({
  value,
  onChange,
  placeholder,
  className = '',
  validation,
  fieldKey,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
}, ref) => {
  const innerRef = useRef<HTMLInputElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Combine forwarded ref + local ref
  const setRef = (el: HTMLInputElement | null) => {
    innerRef.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
  };

  useEffect(() => {
    if (!fieldKey) return;
    registerField(fieldKey, innerRef.current, () => value);
    return () => registerField(fieldKey, null);
  }, [fieldKey, value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeRatioInput(e.target.value);
    onChange(sanitized);
    // Auto-advance after user types a valid value and pauses briefly.
    if (fieldKey && sanitized) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (document.activeElement === innerRef.current) advanceFrom(fieldKey);
      }, 700);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && fieldKey) {
      e.preventDefault();
      advanceFrom(fieldKey);
    }
  };

  const v = validation ?? validateRatio(value);
  const stateClass = validationClass(v.state);

  return (
    <input
      ref={setRef}
      type="text"
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={`input-calculator flex-1 ${stateClass} ${className}`}
      inputMode="decimal"
      aria-label={ariaLabel ?? placeholder}
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid ?? v.state === 'error'}
    />
  );
});

RatioInput.displayName = 'RatioInput';

export default RatioInput;
