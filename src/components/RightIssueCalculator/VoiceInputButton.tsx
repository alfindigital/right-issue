import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { parseSpokenNumber } from '@/lib/parseSpokenNumber';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';

interface Props {
  onResult: (digits: string) => void;
  /** 'integer' or 'decimal' — decimal keeps comma/period */
  mode?: 'integer' | 'decimal';
  className?: string;
}

const VoiceInputButton: React.FC<Props> = ({ onResult, mode = 'integer', className = '' }) => {
  const { language } = useLanguage();
  const { start, stop, isListening, supported } = useVoiceInput(language);

  if (!supported) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isListening) {
      stop();
      return;
    }
    start((transcript) => {
      let value = parseSpokenNumber(transcript, language);
      if (mode === 'decimal' && /[.,]/.test(transcript)) {
        // Keep first decimal separator
        const m = transcript.replace(/[^\d.,]/g, '').match(/^(\d+)[.,](\d+)/);
        if (m) value = `${m[1]},${m[2]}`;
      }
      if (!value) {
        toast({
          title: language === 'id' ? 'Tidak terdengar angka' : 'No number detected',
          description: transcript ? `"${transcript}"` : undefined,
          variant: 'destructive',
        });
        return;
      }
      onResult(value);
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isListening ? 'Stop listening' : 'Voice input'}
      className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
        isListening
          ? 'bg-destructive/15 text-destructive animate-pulse'
          : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
      } ${className}`}
    >
      {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
    </button>
  );
};

export default VoiceInputButton;