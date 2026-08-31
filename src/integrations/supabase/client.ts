// Supabase client — optional integration.
//
// To enable Supabase-powered features (stock search autocomplete, active rights feed):
//   cp .env.example .env
//   # Fill in VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
//
// Without Supabase configured, all features degrade gracefully:
//   - Stock code input: manual entry only (no autocomplete)
//   - Active rights feed: empty list (enter values manually)
//   - Admin page: disabled
// The core RI / TERP calculator works fully without Supabase.

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { brokeredPreviewStorage } from './previewAuthStorage';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

/** True when Supabase env vars are present. Use to conditionally show backend features. */
export const supabaseEnabled = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

// Shared real client (only instantiated when configured)
const _realClient = supabaseEnabled
  ? createClient<Database>(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!, {
      auth: {
        storage: brokeredPreviewStorage(),
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Stub that always returns an empty success so callers don't need null-checks
const _stub = {
  functions: {
    invoke: (_name: string, _opts?: unknown) =>
      Promise.resolve({ data: null, error: new Error('Supabase not configured — set VITE_SUPABASE_URL in .env') }),
  },
} as unknown as ReturnType<typeof createClient<Database>>;

export const supabase = _realClient ?? _stub;