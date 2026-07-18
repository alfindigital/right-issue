import React, { useEffect, useRef, useState } from 'react';
import { Tag, TrendingUp, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface StockCodeInputProps {
  value: string;
  onChange: (value: string) => void;
}

interface Suggestion {
  code: string;
  name: string;
  exchange: string;
}

const StockCodeInput: React.FC<StockCodeInputProps> = ({ value, onChange }) => {
  const { t, language } = useLanguage();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastQueryRef = useRef<string>('');
  const justPickedRef = useRef(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
    justPickedRef.current = false;
    onChange(val);
    if (val.length >= 2) setOpen(true);
    else setOpen(false);
  };

  const pick = (s: Suggestion) => {
    justPickedRef.current = true;
    onChange(s.code.slice(0, 4));
    setOpen(false);
    setActiveIndex(-1);
  };

  // Debounced fetch
  useEffect(() => {
    if (justPickedRef.current) return;
    if (!value || value.length < 2) {
      setSuggestions([]);
      return;
    }
    const q = value;
    if (q === lastQueryRef.current) return;
    const timer = setTimeout(async () => {
      lastQueryRef.current = q;
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('stock-search', {
          body: { q },
        });
        if (error) throw error;
        const results: Suggestion[] = Array.isArray(data?.results) ? data.results : [];
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      pick(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className={`card-calculator relative ${open ? 'z-50' : ''}`} data-tour="stock-code">
      <div className="flex items-center gap-2 mb-2">
        <Tag className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">{t('stockCode.label')}</span>
        <span className="text-xs text-muted-foreground">({language === 'id' ? 'opsional' : 'optional'})</span>
      </div>
      <div ref={containerRef} className="relative">
        <input
          id="stock-code"
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => value.length >= 2 && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={t('stockCode.placeholder')}
          className="input-calculator text-center font-bold tracking-widest text-lg"
          maxLength={4}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls="stock-suggestions"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
        )}
        {open && value.length >= 2 && (
          <div
            id="stock-suggestions"
            role="listbox"
            className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-border bg-popover/95 backdrop-blur-lg shadow-xl overflow-hidden animate-fade-in"
          >
            {suggestions.length > 0 ? (
              <>
                <ul className="max-h-72 overflow-y-auto py-1">
                  {suggestions.map((s, i) => (
                    <li
                      key={s.code}
                      id={`stock-opt-${i}`}
                      role="option"
                      aria-selected={i === activeIndex}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        pick(s);
                      }}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer min-h-[44px] transition-colors ${
                        i === activeIndex ? 'bg-primary/10' : 'hover:bg-muted/50'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-bold tracking-wider text-sm shrink-0 w-12">{s.code}</span>
                      <span className="text-xs text-muted-foreground truncate">{s.name}</span>
                    </li>
                  ))}
                </ul>
                <div className="px-3 py-1.5 text-[10px] text-muted-foreground border-t border-border/50 text-right">
                  {t('stockCode.poweredBy')}
                </div>
              </>
            ) : (
              <div className="px-3 py-3 text-xs text-muted-foreground text-center">
                {loading ? t('stockCode.searching') : t('stockCode.noResults')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StockCodeInput;
