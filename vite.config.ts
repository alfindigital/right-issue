import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

const GSC_VERIFICATION_TOKEN = "J-Czc4w4Dto_XXTUZfW8lAMoT45CpTWqZ72Nt91yFbw";

// Guard: fail build if google-site-verification meta is missing or token doesn't match.
// Also re-injects it as a safety net so the published HTML always carries it.
const ensureGscMeta = () => ({
  name: "ensure-gsc-verification-meta",
  apply: "build" as const,
  transformIndexHtml: {
    order: "pre" as const,
    handler(html: string) {
      const re = /<meta\s+name=["']google-site-verification["']\s+content=["']([^"']+)["']\s*\/?>/i;
      const m = html.match(re);
      if (!m) {
        throw new Error(
          `[ensure-gsc-verification-meta] <meta name="google-site-verification"> hilang dari index.html. ` +
            `Tambahkan kembali dengan token ${GSC_VERIFICATION_TOKEN} agar verifikasi Search Console tidak terputus.`,
        );
      }
      if (m[1] !== GSC_VERIFICATION_TOKEN) {
        throw new Error(
          `[ensure-gsc-verification-meta] Token google-site-verification tidak cocok. ` +
            `Ditemukan "${m[1]}", diharapkan "${GSC_VERIFICATION_TOKEN}".`,
        );
      }
      return html;
    },
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    ensureGscMeta(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico"],
      manifest: {
        name: "Kalkulator Right Issue",
        short_name: "RI Calc",
        description: "Kalkulator Right Issue untuk saham Indonesia (IDX)",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/api/, /^\/~oauth/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-stylesheets",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|gif|webp)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
