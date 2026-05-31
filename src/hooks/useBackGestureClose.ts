import { useEffect } from 'react';

/**
 * Push a transient history entry while `open` is true so that the system
 * back gesture / back button closes the modal/sheet first instead of
 * leaving the app.
 */
export function useBackGestureClose(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    if (typeof window === 'undefined') return;

    // Push a sentinel state so the next "back" pops back to here.
    const sentinel = { __ri_modal: Date.now() };
    window.history.pushState(sentinel, '');

    const onPop = () => {
      onClose();
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      // If we are still on the sentinel state when modal closes
      // (programmatic close), pop it so history stays clean.
      if (window.history.state && (window.history.state as { __ri_modal?: number }).__ri_modal === sentinel.__ri_modal) {
        window.history.back();
      }
    };
  }, [open, onClose]);
}