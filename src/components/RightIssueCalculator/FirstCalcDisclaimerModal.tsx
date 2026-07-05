import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const STORAGE_KEY = 'ri-disclaimer-seen-v1';

interface Props {
  /** True after user first successfully calculates. */
  trigger: boolean;
}

/**
 * One-time disclaimer modal shown after the user's very first calculation.
 * Persisted in localStorage so it never nags the same device again.
 */
const FirstCalcDisclaimerModal: React.FC<Props> = ({ trigger }) => {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!trigger) return;
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') return;
    } catch {
      /* noop */
    }
    setOpen(true);
  }, [trigger]);

  const acknowledge = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* noop */
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) acknowledge(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="mx-auto w-11 h-11 rounded-2xl bg-[hsl(var(--warning))]/15 flex items-center justify-center mb-1">
            <AlertTriangle className="w-6 h-6 text-[hsl(var(--warning))]" />
          </div>
          <DialogTitle className="text-center">
            {language === 'id' ? 'Bukan Nasihat Investasi' : 'Not Investment Advice'}
          </DialogTitle>
          <DialogDescription className="text-center leading-relaxed">
            {language === 'id'
              ? 'Hasil kalkulasi bersifat estimasi berdasarkan input Anda. Kalkulator ini tidak menggantikan analisis pribadi atau nasihat dari profesional berlisensi. Selalu verifikasi angka dengan sumber resmi IDX/KSEI dan pertimbangkan profil risiko sebelum mengambil keputusan.'
              : 'Results are estimates based on your inputs. This calculator is not a substitute for personal analysis or advice from a licensed professional. Always verify figures against official IDX/KSEI sources and consider your risk profile before deciding.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={acknowledge} className="w-full">
            {language === 'id' ? 'Saya mengerti' : 'I understand'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FirstCalcDisclaimerModal;