import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { IDX_TICKERS } from './idx-tickers.ts'

interface Suggestion {
  code: string
  name: string
  exchange: string
}

const cache = new Map<string, { at: number; data: Suggestion[] }>()
const TTL_MS = 5 * 60 * 1000

function sanitize(q: unknown): string | null {
  if (typeof q !== 'string') return null
  const s = q.trim()
  if (!/^[A-Za-z0-9.\-]{1,10}$/.test(s)) return null
  return s
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    let q: string | null = null
    if (req.method === 'GET') {
      const url = new URL(req.url)
      q = sanitize(url.searchParams.get('q'))
    } else {
      const body = await req.json().catch(() => ({}))
      q = sanitize(body?.q)
    }

    if (!q) {
      return new Response(JSON.stringify({ error: 'Invalid query' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const key = q.toUpperCase()
    const cached = cache.get(key)
    if (cached && Date.now() - cached.at < TTL_MS) {
      return new Response(JSON.stringify({ results: cached.data, cached: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const upper = key
    const merged = new Map<string, Suggestion>()

    // 1) Curated IDX prefix match (fast & reliable for short queries)
    for (const [code, name] of IDX_TICKERS) {
      if (code.startsWith(upper)) {
        merged.set(code, { code, name, exchange: 'IDX' })
        if (merged.size >= 8) break
      }
    }

    // 2) Yahoo Finance lookup — fills the long tail
    try {
      const yfUrl = `https://query2.finance.yahoo.com/v1/finance/lookup?query=${encodeURIComponent(upper)}&type=equity&lang=en-US&region=ID&start=0&count=25`
      const resp = await fetch(yfUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
          Accept: 'application/json',
        },
      })
      if (resp.ok) {
        const json = await resp.json()
        const docs: any[] = json?.finance?.result?.[0]?.documents ?? []
        for (const it of docs) {
          const sym: string = it?.symbol ?? ''
          if (!sym.endsWith('.JK')) continue
          const code = sym.replace(/\.JK$/, '')
          if (!/^[A-Z]{1,5}$/.test(code)) continue
          if (merged.has(code)) continue
          const name: string = it.shortName || it.longName || code
          merged.set(code, { code, name, exchange: 'IDX' })
          if (merged.size >= 12) break
        }
      }
    } catch (_) {
      // Yahoo failure is non-fatal — curated list still serves results
    }

    const results: Suggestion[] = Array.from(merged.values()).slice(0, 10)

    cache.set(key, { at: Date.now(), data: results })

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})