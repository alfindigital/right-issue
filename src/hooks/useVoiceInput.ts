import { useCallback, useEffect, useRef, useState } from 'react';

type Lang = 'id' | 'en';

export type VoiceErrorCode =
  | 'not-supported'
  | 'not-allowed'
  | 'no-speech'
  | 'audio-capture'
  | 'network'
  | 'aborted'
  | 'service-not-allowed'
  | 'start-failed'
  | 'unknown';

export interface VoiceError {
  code: VoiceErrorCode;
  message: string;
}

const ERROR_MESSAGES: Record<Lang, Record<VoiceErrorCode, string>> = {
  id: {
    'not-supported': 'Browser tidak mendukung voice input. Coba Chrome/Edge.',
    'not-allowed': 'Akses mikrofon ditolak. Izinkan akses lalu coba lagi.',
    'service-not-allowed': 'Layanan suara diblokir. Periksa pengaturan browser.',
    'no-speech': 'Tidak terdengar suara. Coba bicara lebih dekat ke mikrofon.',
    'audio-capture': 'Mikrofon tidak terdeteksi. Periksa perangkat audio.',
    'network': 'Masalah jaringan. Periksa koneksi internet Anda.',
    'aborted': 'Dibatalkan.',
    'start-failed': 'Gagal memulai voice input. Coba lagi.',
    'unknown': 'Terjadi kesalahan tidak dikenal. Coba lagi.',
  },
  en: {
    'not-supported': 'Browser does not support voice input. Try Chrome/Edge.',
    'not-allowed': 'Microphone access denied. Allow access then retry.',
    'service-not-allowed': 'Speech service blocked. Check browser settings.',
    'no-speech': 'No speech detected. Try speaking closer to the mic.',
    'audio-capture': 'No microphone detected. Check your audio device.',
    'network': 'Network issue. Check your internet connection.',
    'aborted': 'Cancelled.',
    'start-failed': 'Failed to start voice input. Try again.',
    'unknown': 'An unknown error occurred. Try again.',
  },
};

export function isVoiceInputSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

export function useVoiceInput(lang: Lang = 'id') {
  const recognitionRef = useRef<any>(null);
  const onResultRef = useRef<((final: string, isFinal: boolean) => void) | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState<VoiceError | null>(null);

  const buildError = useCallback((code: VoiceErrorCode): VoiceError => ({
    code,
    message: ERROR_MESSAGES[lang][code] ?? ERROR_MESSAGES[lang].unknown,
  }), [lang]);

  useEffect(() => {
    return () => {
      try { recognitionRef.current?.abort?.(); } catch { /* noop */ }
    };
  }, []);

  const reset = useCallback(() => {
    setInterimTranscript('');
    setFinalTranscript('');
    setError(null);
  }, []);

  const start = useCallback((onResult: (transcript: string, isFinal: boolean) => void) => {
    if (!isVoiceInputSupported()) {
      setError(buildError('not-supported'));
      return;
    }
    reset();
    onResultRef.current = onResult;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = lang === 'id' ? 'id-ID' : 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => { setIsListening(true); setError(null); };
    recognition.onend = () => { setIsListening(false); };
    recognition.onerror = (e: any) => {
      const raw = (e?.error || 'unknown') as VoiceErrorCode;
      const known: VoiceErrorCode[] = [
        'not-allowed', 'no-speech', 'audio-capture', 'network',
        'aborted', 'service-not-allowed',
      ];
      const code = known.includes(raw) ? raw : 'unknown';
      setError(buildError(code));
      setIsListening(false);
    };
    recognition.onresult = (e: any) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const txt = res[0]?.transcript || '';
        if (res.isFinal) final += txt;
        else interim += txt;
      }
      if (interim) setInterimTranscript(interim);
      if (final) {
        setFinalTranscript(final);
        setInterimTranscript('');
        onResultRef.current?.(final, true);
      }
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch {
      setError(buildError('start-failed'));
      setIsListening(false);
    }
  }, [lang, buildError, reset]);

  const stop = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch { /* noop */ }
    setIsListening(false);
  }, []);

  const cancel = useCallback(() => {
    try { recognitionRef.current?.abort?.(); } catch { /* noop */ }
    setIsListening(false);
    reset();
  }, [reset]);

  return {
    start, stop, cancel, reset,
    isListening, interimTranscript, finalTranscript, error,
    supported: isVoiceInputSupported(),
  };
}
