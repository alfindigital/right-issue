// Supabase integration removed.
// The active-rights feed (list of currently traded RI) was served via
// a Supabase Edge Function. Without it, the feed section simply stays
// empty — all calculator inputs can still be filled in manually.
//
// To restore this feature, self-hosters can implement their own API
// endpoint and update this hook to fetch from it.

import { useState } from 'react';

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

export function useActiveRights(): State {
  // Active-rights feed removed (was Supabase Edge Function).
  // Return empty list — calculator still works with manual input.
  const [state] = useState<State>({ items: [], loading: false, error: null });
  return state;
}