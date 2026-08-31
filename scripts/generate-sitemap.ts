import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://rightissue.alfindigital.com";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

interface ActiveRight { code: string }

async function fetchActiveRights(): Promise<ActiveRight[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/active-rights`);
    if (!res.ok) return [];
    const json = (await res.json()) as { items?: ActiveRight[] };
    return json.items ?? [];
  } catch {
    return [];
  }
}

// No <lastmod>: the project has no authoritative per-page modification
// timestamp, and a build-time date would be a misleading signal.
const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/edukasi", changefreq: "monthly", priority: "0.7" },
];

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

async function main() {
  const rights = await fetchActiveRights();
  const dynamicEntries: SitemapEntry[] = rights.map((r) => ({
    path: `/ri/${r.code.toUpperCase()}`,
    changefreq: "daily",
    priority: "0.8",
  }));
  const entries = [...staticEntries, ...dynamicEntries];
  writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
  console.log(`sitemap.xml written (${entries.length} entries, ${dynamicEntries.length} RI)`);

  // Ping search engines so freshly-added RI pages get discovered faster.
  // Skipped locally unless PING_SEARCH_ENGINES=1 (avoid noisy pings in dev).
  if (process.env.PING_SEARCH_ENGINES === "1" || process.env.CI) {
    const sitemapUrl = encodeURIComponent(`${BASE_URL}/sitemap.xml`);
    const pings = [
      `https://www.google.com/ping?sitemap=${sitemapUrl}`,
      `https://www.bing.com/ping?sitemap=${sitemapUrl}`,
    ];
    await Promise.all(
      pings.map(async (url) => {
        try {
          const res = await fetch(url);
          console.log(`ping ${url.split("?")[0]} → ${res.status}`);
        } catch (e) {
          console.warn(`ping failed: ${url}`, e);
        }
      }),
    );
  }
}

main();
