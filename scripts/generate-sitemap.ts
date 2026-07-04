import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://rightissue.lovable.app";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://ybfgzwoblgcnkkyubkms.supabase.co";

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

const today = new Date().toISOString().split("T")[0];

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0", lastmod: new Date().toISOString().split("T")[0] },
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
    lastmod: today,
  }));
  const entries = [...staticEntries, ...dynamicEntries];
  writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
  console.log(`sitemap.xml written (${entries.length} entries, ${dynamicEntries.length} RI)`);
}

main();
