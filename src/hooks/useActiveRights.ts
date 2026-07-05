import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ActiveRight {
  code: string;
  name: string;
  ratioOld: string;
  ratioNew: string;
  rightPrice: number;
  cumDatePrice?: number;
  cumDate?: string;
  tradingStart?: string;
  tradingEnd?: string;
  hasWarrant?: boolean;
  warrantRatioOld?: string;
  warrantRatioNew?: string;
  note?: string;
}

interface State {
  items: ActiveRight[];
  loading: boolean;
  error: string | null;
}

const CACHE_KEY = 'ri-active-rights-cache-v1';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min — corporate actions can change quickly

function isExpired(item: ActiveRight): boolean {
  if (!item.tradingEnd) return false;
  const end = new Date(item.tradingEnd);
  if (Number.isNaN(end.getTime())) return false;
  // Compare on date-only to allow last-day exercise.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return end < today;
}

function filterActive(items: ActiveRight[]): ActiveRight[] {
  return items.filter((i) => !isExpired(i));
}

function readCache(): ActiveRight[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; items: ActiveRight[] };
    if (Date.now() - parsed.at > CACHE_TTL_MS) return null;
    return filterActive(parsed.items);
  } catch {
    return null;
  }
}

function writeCache(items: ActiveRight[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), items }));
  } catch {
    /* noop */
  }
}

export function useActiveRights(): State {
  const cached = readCache();
  const [state, setState] = useState<State>({
    items: cached ?? [],
    loading: !cached,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('active-rights');
        if (cancelled) return;
        if (error) throw error;
        const items = (data?.items ?? []) as ActiveRight[];
        const fresh = filterActive(items);
        writeCache(items);
        setState({ items: fresh, loading: false, error: null });
      } catch (e) {
        if (cancelled) return;
        setState((s) => ({
          items: s.items,
          loading: false,
          error: e instanceof Error ? e.message : 'Failed to load active rights',
        }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}