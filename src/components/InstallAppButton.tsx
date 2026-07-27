import React, { useState } from 'react';
import { Download, X, Share, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

const useCopy = () => {
  const { language } = useLanguage();
  const id = language === 'id';
  return {
    install: id ? 'Install aplikasi' : 'Install app',
    title: id ? 'Install Lotmetrik' : 'Install Lotmetrik',
    desc: id
      ? 'Tambahkan ke layar home untuk akses cepat dan bisa dipakai offline.'
      : 'Add it to your home screen for quick access and offline use.',
    iosSteps: id
      ? ['Ketuk tombol Bagikan di Safari', 'Pilih "Tambahkan ke Layar Utama"', 'Ketuk "Tambah"']
      : ['Tap the Share button in Safari', 'Choose "Add to Home Screen"', 'Tap "Add"'],
    later: id ? 'Nanti' : 'Later',
    close: id ? 'Tutup' : 'Close',
  };
};

export const InstallAppButton = React.forwardRef<HTMLButtonElement>((_, ref) => {
  const { canInstall, needsManualSteps, promptInstall } = useInstallPrompt();
  const [open, setOpen] = useState(false);
  const c = useCopy();

  if (!canInstall) return null;

  return (
    <>
      <button
        ref={ref}
        onClick={() => (needsManualSteps ? setOpen(true) : promptInstall())}
        className="p-1.5 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground transition-colors"
        aria-label={c.install}
        title={c.install}
      >
        <Download className="w-4 h-4" />
      </button>
      <IOSInstructions open={open} onOpenChange={setOpen} />
    </>
  );
});
InstallAppButton.displayName = 'InstallAppButton';

const IOSInstructions = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => {
  const c = useCopy();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle>{c.title}</DialogTitle>
          <DialogDescription>{c.desc}</DialogDescription>
        </DialogHeader>
        <ol className="space-y-2 text-sm text-foreground">
          {c.iosSteps.map((step, i) => (
            <li key={step} className="flex items-center gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold grid place-items-center">
                {i + 1}
              </span>
              {i === 0 ? <Share className="w-4 h-4 text-primary" /> : i === 1 ? <Plus className="w-4 h-4 text-primary" /> : null}
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <Button className="w-full" onClick={() => onOpenChange(false)}>
          {c.close}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export const InstallAppPrompt = () => {
  const { canInstall, needsManualSteps, dismissed, dismiss, promptInstall } = useInstallPrompt();
  const [open, setOpen] = useState(false);
  const c = useCopy();

  if (!canInstall || dismissed) return null;

  return (
    <>
      <div className="fixed bottom-20 md:bottom-4 left-3 right-3 md:left-auto md:right-4 md:w-80 z-40 bg-card border border-border rounded-2xl shadow-lg p-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary grid place-items-center flex-shrink-0">
            <Download className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{c.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{c.desc}</p>
          </div>
          <button onClick={dismiss} aria-label={c.later} className="text-muted-foreground hover:text-foreground p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <Button variant="outline" size="sm" className="flex-1" onClick={dismiss}>
            {c.later}
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => (needsManualSteps ? setOpen(true) : promptInstall())}
          >
            {c.install}
          </Button>
        </div>
      </div>
      <IOSInstructions open={open} onOpenChange={setOpen} />
    </>
  );
};

export default InstallAppButton;
