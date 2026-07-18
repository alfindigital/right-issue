import React, { useState, useEffect, useRef } from 'react';
import { Settings, Sun, Moon, Keyboard, Code, Globe, HelpCircle, Vibrate, Type, Download, Upload } from 'lucide-react';
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
import { toast } from 'sonner';
import { readRaw, writeRaw } from '@/lib/safeStorage';

// Keys eligible for export/import. Settings are intentionally excluded — only user-generated data.
const EXPORT_KEYS = [
  'ri-calculator-history',
  'ri-budget-planner-history',
  'ri-calculator-autosave',
] as const;

interface SettingsDropdownProps {
  onOpenKeyboardHelp: () => void;
  onOpenEmbed: () => void;
  onReplayTour?: () => void;
}

const SettingsDropdown = React.forwardRef<HTMLDivElement, SettingsDropdownProps>(({ onOpenKeyboardHelp, onOpenEmbed, onReplayTour }, ref) => {
  const { language, setLanguage, t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [hapticsOn, setHapticsOn] = useState(true);
  const [typeScale, setTypeScale] = useState<'sm' | 'md' | 'lg'>('md');
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

    // Type scale
    const ts = (localStorage.getItem('ri-type-scale') as 'sm' | 'md' | 'lg') || 'md';
    setTypeScale(ts);
    document.documentElement.classList.remove('type-sm', 'type-md', 'type-lg');
    document.documentElement.classList.add(`type-${ts}`);
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

  const changeTypeScale = (next: 'sm' | 'md' | 'lg') => {
    setTypeScale(next);
    document.documentElement.classList.remove('type-sm', 'type-md', 'type-lg');
    document.documentElement.classList.add(`type-${next}`);
    localStorage.setItem('ri-type-scale', next);
    haptic(10);
  };

  const handleExportData = () => {
    try {
      const payload: Record<string, unknown> = {
        app: 'ri-calculator',
        exportedAt: new Date().toISOString(),
        version: 1,
        data: {} as Record<string, unknown>,
      };
      const data = payload.data as Record<string, unknown>;
      for (const key of EXPORT_KEYS) {
        const raw = readRaw(key);
        if (raw) {
          try { data[key] = JSON.parse(raw); } catch { data[key] = raw; }
        }
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ri-calculator-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(language === 'id' ? 'Data berhasil diekspor' : 'Data exported');
    } catch {
      toast.error(language === 'id' ? 'Gagal mengekspor data' : 'Export failed');
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || parsed.app !== 'ri-calculator' || !parsed.data || typeof parsed.data !== 'object') {
        throw new Error('invalid');
      }
      const confirmMsg = language === 'id'
        ? 'Impor akan menimpa riwayat & autosave saat ini. Lanjutkan?'
        : 'Import will overwrite current history & autosave. Continue?';
      if (!window.confirm(confirmMsg)) return;
      let count = 0;
      for (const key of EXPORT_KEYS) {
        const val = (parsed.data as Record<string, unknown>)[key];
        if (val !== undefined && val !== null) {
          const ok = writeRaw(key, typeof val === 'string' ? val : JSON.stringify(val));
          if (ok) count++;
        }
      }
      toast.success(
        language === 'id'
          ? `Impor selesai (${count} bagian). Reload halaman…`
          : `Imported (${count} sections). Reloading…`,
      );
      setTimeout(() => window.location.reload(), 700);
    } catch {
      toast.error(language === 'id' ? 'File backup tidak valid' : 'Invalid backup file');
    }
  };

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
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
          {language === 'id' ? 'Data' : 'Data'}
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={handleExportData} className="cursor-pointer">
          <Download className="w-4 h-4 mr-2 text-primary" />
          {language === 'id' ? 'Ekspor data (backup)' : 'Export data (backup)'}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleImportClick(); }} className="cursor-pointer">
          <Upload className="w-4 h-4 mr-2 text-primary" />
          {language === 'id' ? 'Impor data (restore)' : 'Import data (restore)'}
        </DropdownMenuItem>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleImportFile}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

SettingsDropdown.displayName = 'SettingsDropdown';

export default SettingsDropdown;
