import { useEffect, useCallback } from 'react';

interface ShortcutActions {
  onCalculate: () => void;
  onReset: () => void;
  onShare?: () => void;
  onToggleHelp?: () => void;
  isCalculateEnabled: boolean;
}

export const useKeyboardShortcuts = (actions: ShortcutActions) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();
    const isInputField = tagName === 'input' || tagName === 'textarea' || target.isContentEditable;

    // Enter = Calculate (when not in textarea and form is valid)
    if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      if (tagName !== 'textarea' && actions.isCalculateEnabled) {
        e.preventDefault();
        actions.onCalculate();
      }
    }

    // Ctrl/Cmd + R = Reset (prevent browser refresh)
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      e.preventDefault();
      actions.onReset();
    }

    // Ctrl/Cmd + S = Share (prevent browser save)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      actions.onShare?.();
    }

    // Escape = Blur active input
    if (e.key === 'Escape') {
      if (isInputField) {
        (document.activeElement as HTMLElement)?.blur();
      }
    }

    // ? = Toggle help (when not in input field)
    if (e.key === '?' && !isInputField) {
      e.preventDefault();
      actions.onToggleHelp?.();
    }
  }, [actions]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

export default useKeyboardShortcuts;
