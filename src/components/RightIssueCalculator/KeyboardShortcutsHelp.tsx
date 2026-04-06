import React, { useState, useEffect } from 'react';
import { Keyboard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';

interface ShortcutItem {
  keys: string[];
  descriptionId: string;
  descriptionEn: string;
}

interface KeyboardShortcutsHelpProps {
  externalOpen?: boolean;
  onExternalOpenChange?: (open: boolean) => void;
}

const KeyboardShortcutsHelp = React.forwardRef<HTMLDivElement, KeyboardShortcutsHelpProps>(({ externalOpen, onExternalOpenChange }, ref) => {
  const { language, t } = useLanguage();
  const [isMac, setIsMac] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onExternalOpenChange || setInternalOpen;

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  const modKey = isMac ? '⌘' : 'Ctrl';

  const shortcuts: ShortcutItem[] = [
    {
      keys: ['Enter'],
      descriptionId: 'Hitung kalkulasi',
      descriptionEn: 'Calculate',
    },
    {
      keys: [modKey, 'R'],
      descriptionId: 'Reset form',
      descriptionEn: 'Reset form',
    },
    {
      keys: [modKey, 'S'],
      descriptionId: 'Salin link',
      descriptionEn: 'Copy link',
    },
    {
      keys: ['Esc'],
      descriptionId: 'Tutup fokus input',
      descriptionEn: 'Close input focus',
    },
    {
      keys: ['?'],
      descriptionId: 'Buka bantuan ini',
      descriptionEn: 'Open this help',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            {t('shortcuts.title')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <span className="text-sm text-foreground">
                {language === 'id' ? shortcut.descriptionId : shortcut.descriptionEn}
              </span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <React.Fragment key={keyIndex}>
                    {keyIndex > 0 && (
                      <span className="text-xs text-muted-foreground">+</span>
                    )}
                    <kbd className="px-2 py-1 text-xs font-mono bg-muted border border-border rounded shadow-sm min-w-[28px] text-center">
                      {key}
                    </kbd>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          {language === 'id'
            ? `Tip: Gunakan ${modKey} untuk shortcut di ${isMac ? 'Mac' : 'Windows/Linux'}`
            : `Tip: Use ${modKey} for shortcuts on ${isMac ? 'Mac' : 'Windows/Linux'}`}
        </p>
      </DialogContent>
    </Dialog>
  );
});

KeyboardShortcutsHelp.displayName = 'KeyboardShortcutsHelp';

export default KeyboardShortcutsHelp;
