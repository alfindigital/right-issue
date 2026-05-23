import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

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

    const yfUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&lang=en-US&region=ID&quotesCount=10&newsCount=0`
    const resp = await fetch(yfUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        Accept: 'application/json',
      },
    })

    if (!resp.ok) {
      return new Response(JSON.stringify({ error: `Yahoo Finance error ${resp.status}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const json = await resp.json()
    const quotes: any[] = Array.isArray(json?.quotes) ? json.quotes : []

    const results: Suggestion[] = quotes
      .filter((it) => {
        const sym: string = it?.symbol ?? ''
        const exch: string = it?.exchange ?? ''
        return sym.endsWith('.JK') || exch === 'JKT'
      })
      .map((it) => {
        const sym: string = it.symbol ?? ''
        const code = sym.replace(/\.JK$/, '')
        const name: string = it.longname || it.shortname || code
        return { code, name, exchange: 'IDX' }
      })
      .filter((it) => /^[A-Z]{1,5}$/.test(it.code))
      .slice(0, 8)

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