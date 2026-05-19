import { useCallback, useEffect, useRef, useState } from 'react';

type Lang = 'id' | 'en';

export function isVoiceInputSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

export function useVoiceInput(lang: Lang = 'id') {
  const recognitionRef = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      try { recognitionRef.current?.stop(); } catch { /* noop */ }
    };
  }, []);

  const start = useCallback((onResult: (transcript: string) => void) => {
    if (!isVoiceInputSupported()) {
      setError('Voice input tidak didukung di browser ini');
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = lang === 'id' ? 'id-ID' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => { setIsListening(true); setError(null); };
    recognition.onend = () => { setIsListening(false); };
    recognition.onerror = (e: any) => {
      setError(e?.error || 'voice-error');
      setIsListening(false);
    };
    recognition.onresult = (e: any) => {
      const transcript = e.results?.[0]?.[0]?.transcript || '';
      onResult(transcript);
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch (err) {
      setError('start-failed');
      setIsListening(false);
    }
  }, [lang]);

  const stop = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch { /* noop */ }
    setIsListening(false);
  }, []);

  return { start, stop, isListening, error, supported: isVoiceInputSupported() };
}