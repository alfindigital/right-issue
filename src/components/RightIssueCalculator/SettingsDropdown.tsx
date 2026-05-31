import React, { useState, useEffect } from 'react';
import { Settings, Sun, Moon, Keyboard, Code, Globe, HelpCircle, Vibrate, Zap, Sparkles, Settings2, Check, Hand, Type, Activity } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { Switch } from '@/components/ui/switch';
import { isHapticsEnabled, setHapticsEnabled, haptic } from '@/lib/haptics';
import { isAutoAdvanceEnabled, setAutoAdvanceEnabled } from '@/lib/autoAdvance';
import { isClipWatchEnabled, setClipWatchEnabled } from '@/hooks/useClipboardWatcher';
import { ArrowRight, Clipboard } from 'lucide-react';

export type DisplayMode = 'wizard' | 'simple' | 'pro';

interface SettingsDropdownProps {
  onOpenKeyboardHelp: () => void;
  onOpenEmbed: () => void;
  onReplayTour?: () => void;
  displayMode?: DisplayMode;
  onDisplayModeChange?: (mode: DisplayMode) => void;
}

const SettingsDropdown = React.forwardRef<HTMLDivElement, SettingsDropdownProps>(({ onOpenKeyboardHelp, onOpenEmbed, onReplayTour, displayMode, onDisplayModeChange }, ref) => {
  const { language, setLanguage, t } = useLanguage();
  const [isDark, setIsDark] = useState(false);
  const [hapticsOn, setHapticsOn] = useState(true);
  const [oneHand, setOneHand] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [typeScale, setTypeScale] = useState<'sm' | 'md' | 'lg'>('md');
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [clipWatch, setClipWatch] = useState(true);
  const hasVibrateApi = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      if (!savedTheme) localStorage.setItem('theme', 'light');
    }
    setHapticsOn(isHapticsEnabled());

    // One-hand mode
    const oh = localStorage.getItem('ri-one-hand') === '1';
    setOneHand(oh);
    document.documentElement.classList.toggle('one-hand-mode', oh);

    // Reduce motion (opt-in)
    const rm = localStorage.getItem('ri-reduce-motion') === '1';
    setReduceMotion(rm);
    document.documentElement.classList.toggle('reduce-motion', rm);

    // Type scale
    const ts = (localStorage.getItem('ri-type-scale') as 'sm' | 'md' | 'lg') || 'md';
    setTypeScale(ts);
    document.documentElement.classList.remove('type-sm', 'type-md', 'type-lg');
    document.documentElement.classList.add(`type-${ts}`);

    setAutoAdvance(isAutoAdvanceEnabled());
    setClipWatch(isClipWatchEnabled());
  }, []);

  const toggleTheme = () => {
    document.documentElement.style.transition = 'background-color 0.4s ease, color 0.4s ease';
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    setTimeout(() => { document.documentElement.style.transition = ''; }, 400);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'id' ? 'en' : 'id');
  };

  const toggleHaptics = (next: boolean) => {
    setHapticsOn(next);
    setHapticsEnabled(next);
    if (next) haptic(15); // confirm with a tap when enabling
  };

  const toggleOneHand = (next: boolean) => {
    setOneHand(next);
    document.documentElement.classList.toggle('one-hand-mode', next);
    localStorage.setItem('ri-one-hand', next ? '1' : '0');
    if (next) haptic(15);
  };

  const toggleReduceMotion = (next: boolean) => {
    setReduceMotion(next);
    document.documentElement.classList.toggle('reduce-motion', next);
    localStorage.setItem('ri-reduce-motion', next ? '1' : '0');
  };

  const changeTypeScale = (next: 'sm' | 'md' | 'lg') => {
    setTypeScale(next);
    document.documentElement.classList.remove('type-sm', 'type-md', 'type-lg');
    document.documentElement.classList.add(`type-${next}`);
    localStorage.setItem('ri-type-scale', next);
    haptic(10);
  };

  const toggleAutoAdvance = (next: boolean) => {
    setAutoAdvance(next);
    setAutoAdvanceEnabled(next);
    if (next) haptic(10);
  };

  const toggleClipWatch = (next: boolean) => {
    setClipWatch(next);
    setClipWatchEnabled(next);
    if (next) haptic(10);
  };

  const modeOptions: { value: DisplayMode; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      value: 'wizard',
      label: language === 'id' ? 'Step-by-Step' : 'Step-by-Step',
      icon: <Zap className="w-4 h-4 mr-2 text-amber-500" />,
      desc: language === 'id' ? 'Pandu satu per satu' : 'Guided one by one',
    },
    {
      value: 'simple',
      label: language === 'id' ? 'Semua Field — Simple' : 'All Fields — Simple',
      icon: <Sparkles className="w-4 h-4 mr-2 text-primary" />,
      desc: language === 'id' ? 'Field dasar saja' : 'Basic fields only',
    },
    {
      value: 'pro',
      label: language === 'id' ? 'Semua Field — Pro' : 'All Fields — Pro',
      icon: <Settings2 className="w-4 h-4 mr-2 text-primary" />,
      desc: language === 'id' ? 'Termasuk waran & cum-date' : 'Includes warrants & cum-date',
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="p-1.5 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        {displayMode && onDisplayModeChange && (
          <>
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
              {language === 'id' ? 'Mode Tampilan' : 'Display Mode'}
            </DropdownMenuLabel>
            {modeOptions.map((opt) => {
              const active = displayMode === opt.value;
              return (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => onDisplayModeChange(opt.value)}
                  className="cursor-pointer flex items-start"
                >
                  {opt.icon}
                  <span className="flex-1 flex flex-col">
                    <span className="text-xs font-medium">{opt.label}</span>
                    <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
                  </span>
                  {active && <Check className="w-3.5 h-3.5 ml-2 text-primary flex-shrink-0 mt-0.5" />}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
          {isDark ? <Sun className="w-4 h-4 mr-2 text-amber-500" /> : <Moon className="w-4 h-4 mr-2 text-blue-500" />}
          {isDark
            ? (language === 'id' ? 'Mode Terang' : 'Light Mode')
            : (language === 'id' ? 'Mode Gelap' : 'Dark Mode')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleLanguage} className="cursor-pointer">
          <Globe className="w-4 h-4 mr-2" />
          {language === 'id' ? 'English' : 'Bahasa Indonesia'}
        </DropdownMenuItem>
        {hasVibrateApi && (
          <DropdownMenuItem
            onSelect={(e) => { e.preventDefault(); toggleHaptics(!hapticsOn); }}
            className="cursor-pointer flex items-center justify-between gap-2"
          >
            <span className="flex items-center">
              <Vibrate className="w-4 h-4 mr-2 text-primary" />
              {language === 'id' ? 'Getaran' : 'Haptics'}
            </span>
            <Switch
              checked={hapticsOn}
              onCheckedChange={toggleHaptics}
              onClick={(e) => e.stopPropagation()}
              aria-label={language === 'id' ? 'Aktifkan getaran' : 'Enable haptics'}
            />
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
          {language === 'id' ? 'Kenyamanan' : 'Comfort'}
        </DropdownMenuLabel>
        <DropdownMenuItem
          onSelect={(e) => { e.preventDefault(); toggleOneHand(!oneHand); }}
          className="cursor-pointer flex items-center justify-between gap-2"
        >
          <span className="flex items-center">
            <Hand className="w-4 h-4 mr-2 text-primary" />
            {language === 'id' ? 'Mode satu tangan' : 'One-hand mode'}
          </span>
          <Switch
            checked={oneHand}
            onCheckedChange={toggleOneHand}
            onClick={(e) => e.stopPropagation()}
            aria-label={language === 'id' ? 'Mode satu tangan' : 'One-hand mode'}
          />
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => { e.preventDefault(); toggleReduceMotion(!reduceMotion); }}
          className="cursor-pointer flex items-center justify-between gap-2"
        >
          <span className="flex items-center">
            <Activity className="w-4 h-4 mr-2 text-primary" />
            {language === 'id' ? 'Kurangi animasi' : 'Reduce motion'}
          </span>
          <Switch
            checked={reduceMotion}
            onCheckedChange={toggleReduceMotion}
            onClick={(e) => e.stopPropagation()}
            aria-label={language === 'id' ? 'Kurangi animasi' : 'Reduce motion'}
          />
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="cursor-default flex items-center justify-between gap-2"
        >
          <span className="flex items-center">
            <Type className="w-4 h-4 mr-2 text-primary" />
            {language === 'id' ? 'Ukuran teks' : 'Text size'}
          </span>
          <span className="flex items-center gap-1">
            {(['sm', 'md', 'lg'] as const).map((s) => (
              <button
                key={s}
                onClick={(e) => { e.stopPropagation(); changeTypeScale(s); }}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border min-h-7 ${
                  typeScale === s
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-transparent text-muted-foreground border-border hover:bg-muted'
                }`}
                aria-label={`Text size ${s.toUpperCase()}`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => { e.preventDefault(); toggleAutoAdvance(!autoAdvance); }}
          className="cursor-pointer flex items-center justify-between gap-2"
        >
          <span className="flex items-center">
            <ArrowRight className="w-4 h-4 mr-2 text-primary" />
            {language === 'id' ? 'Auto-advance fokus' : 'Auto-advance focus'}
          </span>
          <Switch
            checked={autoAdvance}
            onCheckedChange={toggleAutoAdvance}
            onClick={(e) => e.stopPropagation()}
            aria-label="Auto-advance"
          />
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => { e.preventDefault(); toggleClipWatch(!clipWatch); }}
          className="cursor-pointer flex items-center justify-between gap-2"
        >
          <span className="flex items-center">
            <Clipboard className="w-4 h-4 mr-2 text-primary" />
            {language === 'id' ? 'Deteksi clipboard' : 'Clipboard detector'}
          </span>
          <Switch
            checked={clipWatch}
            onCheckedChange={toggleClipWatch}
            onClick={(e) => e.stopPropagation()}
            aria-label="Clipboard watcher"
          />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onOpenKeyboardHelp} className="cursor-pointer">
          <Keyboard className="w-4 h-4 mr-2" />
          {t('shortcuts.title')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onOpenEmbed} className="cursor-pointer">
          <Code className="w-4 h-4 mr-2" />
          {language === 'id' ? 'Embed Widget' : 'Embed Widget'}
        </DropdownMenuItem>
        {onReplayTour && (
          <DropdownMenuItem onClick={onReplayTour} className="cursor-pointer">
            <HelpCircle className="w-4 h-4 mr-2" />
            {language === 'id' ? 'Tampilkan Tur Lagi' : 'Replay Tour'}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

SettingsDropdown.displayName = 'SettingsDropdown';

export default SettingsDropdown;
