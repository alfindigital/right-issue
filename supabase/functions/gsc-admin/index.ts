import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const SITE = 'https://rightissue.lovable.app/';
const SITE_ENC = encodeURIComponent(SITE);
const SITEMAP_URL = 'https://rightissue.lovable.app/sitemap.xml';
const SITEMAP_ENC = encodeURIComponent(SITEMAP_URL);
const GW = 'https://connector-gateway.lovable.dev/google_search_console';

function gwHeaders() {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  const GSC = Deno.env.get('GOOGLE_SEARCH_CONSOLE_API_KEY');
  if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY missing');
  if (!GSC) throw new Error('GOOGLE_SEARCH_CONSOLE_API_KEY missing — connect Google Search Console');
  return {
    'Authorization': `Bearer ${LOVABLE_API_KEY}`,
    'X-Connection-Api-Key': GSC,
    'Content-Type': 'application/json',
  };
}

async function gw(path: string, init: RequestInit = {}) {
  const r = await fetch(`${GW}${path}`, { ...init, headers: { ...gwHeaders(), ...(init.headers || {}) } });
  const text = await r.text();
  let body: unknown = text;
  try { body = JSON.parse(text); } catch { /* ignore */ }
  return { status: r.status, ok: r.ok, body };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const ADMIN_PASSWORD = Deno.env.get('ADMIN_PASSWORD');
    if (!ADMIN_PASSWORD) throw new Error('ADMIN_PASSWORD not configured');
    const pwd = req.headers.get('x-admin-password') || '';
    if (pwd !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || (req.method === 'POST' ? 'submit-sitemap' : 'status');

    if (action === 'status') {
      const [verification, sites, sitemap, inspect] = await Promise.all([
        gw(`/siteVerification/v1/webResource/${SITE_ENC}`),
        gw(`/webmasters/v3/sites`),
        gw(`/webmasters/v3/sites/${SITE_ENC}/sitemaps/${SITEMAP_ENC}`),
        gw(`/webmasters/v3/searchanalytics/query`, {
          method: 'POST',
          body: JSON.stringify({
            startDate: new Date(Date.now() - 28 * 86400000).toISOString().slice(0, 10),
            endDate: new Date().toISOString().slice(0, 10),
            dimensions: ['date'],
            rowLimit: 10,
          }),
        }),
      ]);
      return new Response(JSON.stringify({ site: SITE, verification, sites, sitemap, analytics: inspect }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'submit-sitemap') {
      const res = await gw(`/webmasters/v3/sites/${SITE_ENC}/sitemaps/${SITEMAP_ENC}`, { method: 'PUT' });
      return new Response(JSON.stringify({ submitted: res.ok, status: res.status, body: res.body }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'unknown action' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});