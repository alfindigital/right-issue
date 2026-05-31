import React, { useRef, useState, useCallback } from 'react';
import { Calculator, Wallet, BookOpen } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { haptic } from '@/lib/haptics';

export type BottomNavShortcut = { label: string; onSelect: () => void };

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  /** Called when the user touches/hovers a tab — use to start prefetching. */
  onTabPrefetch?: (tab: string) => void;
  /** Per-tab quick actions revealed by long-press. */
  shortcutsFor?: (tab: string) => BottomNavShortcut[];
}

const LONG_PRESS_MS = 450;

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, onTabPrefetch, shortcutsFor }) => {
  const { t } = useLanguage();

  const tabs = [
    { key: 'calculator', icon: Calculator, label: t('tab.calculator') },
    { key: 'budget', icon: Wallet, label: t('tab.budgetPlanner') },
    { key: 'education', icon: BookOpen, label: t('tab.education') },
  ];

  const activeIndex = Math.max(0, tabs.findIndex((t) => t.key === activeTab));

  // Long-press state
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressedRef = useRef(false);
  const [openShortcuts, setOpenShortcuts] = useState<string | null>(null);
  const shortcuts = openShortcuts && shortcutsFor ? shortcutsFor(openShortcuts) : [];

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const startPress = useCallback(
    (key: string) => {
      longPressedRef.current = false;
      clearTimer();
      const items = shortcutsFor?.(key) ?? [];
      if (items.length === 0) return;
      timerRef.current = setTimeout(() => {
        longPressedRef.current = true;
        haptic(25);
        setOpenShortcuts(key);
      }, LONG_PRESS_MS);
    },
    [shortcutsFor],
  );

  const cancelPress = () => clearTimer();

  const handleClick = (key: string) => {
    if (longPressedRef.current) {
      longPressedRef.current = false;
      return;
    }
    onTabChange(key);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-card/95 backdrop-blur-lg safe-area-bottom">
        {/* Page-position dot indicator */}
        <div className="flex items-center justify-center gap-1.5 pt-1.5" aria-hidden>
          {tabs.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === activeIndex ? 'w-4 bg-primary' : 'w-1 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
        <div className="flex items-center justify-around px-2 py-1">
          {tabs.map(({ key, icon: Icon, label }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => handleClick(key)}
                onTouchStart={() => { onTabPrefetch?.(key); startPress(key); }}
                onTouchEnd={cancelPress}
                onTouchCancel={cancelPress}
                onTouchMove={cancelPress}
                onMouseDown={() => startPress(key)}
                onMouseUp={cancelPress}
                onMouseLeave={cancelPress}
                onMouseEnter={() => onTabPrefetch?.(key)}
                onContextMenu={(e) => {
                  if (shortcutsFor?.(key).length) {
                    e.preventDefault();
                    haptic(25);
                    setOpenShortcuts(key);
                  }
                }}
                aria-label={label}
                aria-haspopup={shortcutsFor?.(key).length ? 'menu' : undefined}
                className={`relative flex flex-col items-center justify-center gap-0.5 px-4 rounded-xl transition-all duration-300 min-h-11 min-w-11 select-none touch-manipulation ${
                  isActive
                    ? 'text-primary bg-primary/10 scale-105'
                    : 'text-muted-foreground hover:text-foreground active:scale-95'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
                <span className={`text-[10px] font-medium leading-none transition-all ${isActive ? 'font-bold' : ''}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Long-press shortcut sheet */}
      {openShortcuts && shortcuts.length > 0 && (
        <div
          className="fixed inset-0 z-[60] md:hidden bg-background/60 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpenShortcuts(null)}
        >
          <div
            className="absolute left-3 right-3 bottom-24 rounded-2xl border border-border bg-card shadow-xl overflow-hidden animate-scale-in safe-area-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold border-b border-border/60">
              {tabs.find((t) => t.key === openShortcuts)?.label}
            </div>
            <ul>
              {shortcuts.map((s, idx) => (
                <li key={idx}>
                  <button
                    className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-muted active:bg-muted transition-colors min-h-11"
                    onClick={() => {
                      setOpenShortcuts(null);
                      // run after close so any state updates aren't racing the menu
                      setTimeout(s.onSelect, 0);
                    }}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
            <button
              className="w-full text-center px-4 py-3 text-sm text-muted-foreground border-t border-border/60 hover:bg-muted min-h-11"
              onClick={() => setOpenShortcuts(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BottomNav;
