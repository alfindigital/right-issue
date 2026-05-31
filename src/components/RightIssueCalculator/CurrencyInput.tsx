import React, { useState, lazy, Suspense, useEffect, useRef } from 'react';
import InfoTooltip from './InfoTooltip';
import VoiceInputButton from './VoiceInputButton';
import { useIsMobile } from '@/hooks/use-mobile';
import { validatePrice, ValidationResult, validationClass } from '@/lib/validators';
import { registerField, advanceFrom, FieldKey } from '@/lib/autoAdvance';
import Stepper from './Stepper';
import type { QuickChip } from './MobileNumpad';

const MobileNumpad = lazy(() => import('./MobileNumpad'));

interface CurrencyInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  tooltip?: string;
  /** Pass custom validation result, defaults to validatePrice */
  validation?: ValidationResult;
  /** Disable voice input button */
  voiceInput?: boolean;
  /** Disable mobile numpad overlay */
  mobileNumpad?: boolean;
  /** Auto-advance key — if set, this input is registered and Done jumps to next empty field. */
  fieldKey?: FieldKey;
  /** Show a +/- stepper below the field (mobile only). */
  stepperStep?: number;
  stepperAccel?: number[];
  /** Quick chips shown above the numpad. */
  quickChips?: QuickChip[];
}

const CurrencyInput = React.forwardRef<HTMLDivElement, CurrencyInputProps>(({
  id,
  label,
  value,
  onChange,
  placeholder = "0",
  tooltip,
  validation,
  voiceInput = true,
  mobileNumpad = true,
  fieldKey,
  stepperStep,
  stepperAccel,
  quickChips,
}, ref) => {
  const isMobile = useIsMobile();
  const [numpadOpen, setNumpadOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Register with auto-advance registry.
  useEffect(() => {
    if (!fieldKey) return;
    registerField(fieldKey, inputRef.current, () => value);
    return () => registerField(fieldKey, null);
  }, [fieldKey, value]);

  const formatNumber = (num: string): string => {
    const cleanNum = num.replace(/\D/g, '');
    if (!cleanNum) return '';
    return new Intl.NumberFormat('id-ID').format(parseInt(cleanNum));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    onChange(rawValue);
  };

  const v = validation ?? validatePrice(value);
  const stateClass = validationClass(v.state);

  const numpadEnabled = mobileNumpad && isMobile &&
    (typeof window === 'undefined' || localStorage.getItem('numpad-enabled') !== 'false');

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (numpadEnabled) {
      e.target.blur();
      setNumpadOpen(true);
    }
  };

  const handleNumpadDone = () => {
    if (fieldKey) advanceFrom(fieldKey);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && fieldKey) {
      e.preventDefault();
      advanceFrom(fieldKey);
    }
  };

  return (
    <div className="space-y-1.5" ref={ref}>
      <label htmlFor={id} className="text-xs font-medium text-foreground flex items-center">
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground pointer-events-none select-none">
          Rp
        </span>
        <input
          ref={inputRef}
          type="text"
          id={id}
          value={formatNumber(value)}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`input-calculator pl-9 ${voiceInput ? 'pr-10' : ''} ${stateClass}`}
          inputMode="numeric"
          readOnly={numpadEnabled}
        />
        {voiceInput && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <VoiceInputButton onResult={(digits) => onChange(digits.replace(/\D/g, ''))} />
          </div>
        )}
      </div>
      {v.state === 'error' && v.message && (
        <p className="text-[10px] text-destructive">{v.message}</p>
      )}
      {isMobile && stepperStep && (
        <Stepper
          value={value}
          onChange={onChange}
          step={stepperStep}
          accelSteps={stepperAccel}
          ariaLabel={`${label} stepper`}
        />
      )}
      {numpadEnabled && (
        <Suspense fallback={null}>
          <MobileNumpad
            open={numpadOpen}
            onOpenChange={setNumpadOpen}
            value={value}
            onChange={onChange}
            onDone={handleNumpadDone}
            label={label}
            prefix="Rp"
            quickChips={quickChips}
          />
        </Suspense>
      )}
    </div>
  );
});

CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput;
