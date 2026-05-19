import React, { useEffect, useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Delete, Check } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onChange: (value: string) => void;
  onDone?: () => void;
  allowDecimal?: boolean;
  label?: string;
  prefix?: string;
}

const vibrate = (ms = 8) => {
  try { navigator.vibrate?.(ms); } catch { /* noop */ }
};

const MobileNumpad: React.FC<Props> = ({
  open, onOpenChange, value, onChange, onDone, allowDecimal = false, label, prefix,
}) => {
  const [draft, setDraft] = useState(value);

  useEffect(() => { if (open) setDraft(value); }, [open, value]);

  const press = (key: string) => {
    vibrate();
    if (key === 'back') {
      setDraft((d) => d.slice(0, -1));
      return;
    }
    if (key === '.') {
      if (!draft.includes('.') && !draft.includes(',')) setDraft((d) => (d || '0') + ',');
      return;
    }
    setDraft((d) => (d + key).replace(/^0+(\d)/, '$1'));
  };

  const handleDone = () => {
    vibrate(15);
    onChange(draft);
    onOpenChange(false);
    onDone?.();
  };

  const display = draft
    ? (allowDecimal
      ? draft
      : new Intl.NumberFormat('id-ID').format(parseInt(draft.replace(/\D/g, '') || '0', 10)))
    : '0';

  const keys = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    allowDecimal ? '.' : '', '0', 'back',
  ];

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="px-3 pb-4">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-sm text-muted-foreground font-medium">
            {label || 'Input angka'}
          </DrawerTitle>
        </DrawerHeader>

        <div className="bg-muted/40 rounded-xl p-4 mb-3 text-right">
          <div className="text-2xl font-bold text-foreground tabular-nums">
            {prefix && <span className="text-muted-foreground mr-1">{prefix}</span>}
            {display}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {keys.map((k, i) => {
            if (!k) return <div key={i} />;
            const isBack = k === 'back';
            return (
              <button
                key={i}
                type="button"
                onClick={() => press(k)}
                className="h-14 rounded-2xl bg-card border border-border text-xl font-semibold text-foreground active:scale-95 active:bg-accent/30 transition-transform flex items-center justify-center"
              >
                {isBack ? <Delete className="w-5 h-5" /> : k}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleDone}
          className="mt-3 w-full h-12 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Check className="w-4 h-4" /> Done
        </button>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileNumpad;