import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

// Curated list of active Indonesian right issues (HMETD).
// Update this array as new RIs are announced. Structure is stable so the
// frontend contract stays the same when the source is later swapped for a
// live scrape of KSEI/IDX announcements.
interface ActiveRight {
  code: string          // ticker, e.g. "BBRI"
  name: string          // issuer full name
  ratioOld: string      // old-share side of the ratio
  ratioNew: string      // new-share side of the ratio
  rightPrice: number    // exercise price in IDR
  cumDatePrice?: number // reference cum-date price (optional, best-effort)
  cumDate?: string      // ISO date, informational
  tradingStart?: string // ISO date, informational
  tradingEnd?: string   // ISO date, informational
  hasWarrant?: boolean
  warrantRatioOld?: string
  warrantRatioNew?: string
  note?: string
}

const ACTIVE_RIGHTS: ActiveRight[] = [
  {
    code: 'BRIS',
    name: 'Bank Syariah Indonesia',
    ratioOld: '2',
    ratioNew: '1',
    rightPrice: 1500,
    cumDatePrice: 2000,
    note: 'Contoh referensi. Perbarui saat ada aksi korporasi baru.',
  },
]

Deno.serve((req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  return new Response(
    JSON.stringify({
      updatedAt: new Date().toISOString(),
      count: ACTIVE_RIGHTS.length,
      items: ACTIVE_RIGHTS,
    }),
    {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=600, s-maxage=1800',
      },
    },
  )
})