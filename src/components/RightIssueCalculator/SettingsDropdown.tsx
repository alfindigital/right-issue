import React, { useState, useEffect } from 'react';
import { Settings, Sun, Moon, Keyboard, Code, Globe, HelpCircle, Vibrate } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { Switch } from '@/components/ui/switch';
import { isHapticsEnabled, setHapticsEnabled, haptic } from '@/lib/haptics';

interface SettingsDropdownProps {
  onOpenKeyboardHelp: () => void;
  onOpenEmbed: () => void;
  onReplayTour?: () => void;
}

const SettingsDropdown = React.forwardRef<HTMLDivElement, SettingsDropdownProps>(({ onOpenKeyboardHelp, onOpenEmbed, onReplayTour }, ref) => {
  const { language, setLanguage, t } = useLanguage();
  const [isDark, setIsDark] = useState(false);
  const [hapticsOn, setHapticsOn] = useState(true);
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
      <DropdownMenuContent align="end" className="w-48">
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
