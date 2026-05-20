import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, RotateCcw, AlertCircle, X } from 'lucide-react';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { parseSpokenNumber } from '@/lib/parseSpokenNumber';
import { useLanguage } from '@/contexts/LanguageContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Props {
  onResult: (digits: string) => void;
  /** 'integer' or 'decimal' — decimal keeps comma/period */
  mode?: 'integer' | 'decimal';
  className?: string;
}

const VoiceInputButton: React.FC<Props> = ({ onResult, mode = 'integer', className = '' }) => {
  const { language } = useLanguage();
  const {
    start, stop, cancel, reset,
    isListening, interimTranscript, finalTranscript, error, supported,
  } = useVoiceInput(language);
  const [open, setOpen] = useState(false);
  const [lastParsed, setLastParsed] = useState<string>('');
  const lastTranscriptRef = useRef<string>('');

  // Auto-close popover after successful result
  useEffect(() => {
    if (!isListening && !error && lastParsed && open) {
      const t = setTimeout(() => setOpen(false), 1200);
      return () => clearTimeout(t);
    }
  }, [isListening, error, lastParsed, open]);

  if (!supported) return null;

  const t = (id: string, en: string) => (language === 'id' ? id : en);

  const handleStart = () => {
    setLastParsed('');
    lastTranscriptRef.current = '';
    setOpen(true);
    start((transcript, isFinal) => {
      lastTranscriptRef.current = transcript;
      if (!isFinal) return;
      let value = parseSpokenNumber(transcript, language);
      if (mode === 'decimal' && /[.,]/.test(transcript)) {
        const m = transcript.replace(/[^\d.,]/g, '').match(/^(\d+)[.,](\d+)/);
        if (m) value = `${m[1]},${m[2]}`;
      }
      if (value) {
        setLastParsed(value);
        onResult(value);
      }
    });
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isListening) { stop(); return; }
    handleStart();
  };

  const handleRetry = () => {
    cancel();
    setTimeout(handleStart, 100);
  };

  const handleClose = () => {
    cancel();
    setOpen(false);
  };

  const noNumberDetected =
    !isListening && !error && !lastParsed && lastTranscriptRef.current.length > 0;

  return (
    <Popover open={open} onOpenChange={(o) => { if (!o) handleClose(); else setOpen(true); }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={handleToggle}
          aria-label={isListening ? t('Berhenti mendengar', 'Stop listening') : t('Voice input', 'Voice input')}
          aria-pressed={isListening}
          title={isListening ? t('Berhenti', 'Stop') : t('Bicara untuk mengisi', 'Speak to fill')}
          className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
            isListening
              ? 'bg-destructive/15 text-destructive animate-pulse ring-2 ring-destructive/30'
              : error
              ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
              : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
          } ${className}`}
        >
          {isListening
            ? <Square className="w-3.5 h-3.5 fill-current" />
            : error
            ? <AlertCircle className="w-3.5 h-3.5" />
            : <Mic className="w-3.5 h-3.5" />}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-3"
        align="end"
        side="bottom"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            {isListening ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive" />
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {t('Mendengarkan…', 'Listening…')}
                </span>
              </>
            ) : error ? (
              <>
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-xs font-semibold text-destructive">
                  {t('Voice error', 'Voice error')}
                </span>
              </>
            ) : lastParsed ? (
              <span className="text-xs font-semibold text-foreground">
                {t('Terdeteksi', 'Detected')}
              </span>
            ) : (
              <span className="text-xs font-semibold text-foreground">
                {t('Voice input', 'Voice input')}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label={t('Tutup', 'Close')}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live transcript area */}
        <div className="min-h-[44px] rounded-lg bg-muted/40 px-2.5 py-2 text-xs text-foreground">
          {isListening && !interimTranscript && (
            <span className="text-muted-foreground italic">
              {t('Mulai bicara, contoh: "dua juta lima ratus ribu"',
                 'Start speaking, e.g. "two million five hundred thousand"')}
            </span>
          )}
          {interimTranscript && (
            <span className="text-muted-foreground">{interimTranscript}</span>
          )}
          {!isListening && lastParsed && (
            <div className="space-y-0.5">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                {t('Hasil', 'Result')}
              </div>
              <div className="font-bold text-sm text-primary tabular-nums">{lastParsed}</div>
              {finalTranscript && (
                <div className="text-[10px] text-muted-foreground truncate">
                  "{finalTranscript.trim()}"
                </div>
              )}
            </div>
          )}
          {error && (
            <div className="text-destructive">{error.message}</div>
          )}
          {noNumberDetected && (
            <div className="text-destructive">
              {t('Tidak terdeteksi angka', 'No number detected')}
              {lastTranscriptRef.current && (
                <span className="block text-[10px] text-muted-foreground mt-0.5 truncate">
                  "{lastTranscriptRef.current}"
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-2.5">
          {isListening ? (
            <button
              type="button"
              onClick={() => stop()}
              className="flex-1 h-8 rounded-lg bg-destructive text-destructive-foreground text-xs font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-[0.98] transition"
            >
              <Square className="w-3 h-3 fill-current" />
              {t('Stop', 'Stop')}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRetry}
              className="flex-1 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-[0.98] transition"
            >
              <RotateCcw className="w-3 h-3" />
              {lastParsed || error || noNumberDetected
                ? t('Coba lagi', 'Try again')
                : t('Mulai', 'Start')}
            </button>
          )}
        </div>

        {/* Hint */}
        {!error && (
          <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
            {t('Tip: ucapkan angka jelas. Contoh: "lima ratus ribu", "2 juta".',
               'Tip: speak digits clearly. e.g. "five hundred thousand", "2 million".')}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default VoiceInputButton;
