import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// Google Search Console verification: add your own
// <meta name="google-site-verification" content="YOUR_TOKEN" /> to index.html
// and optionally re-add a build-time guard here.


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      filename: "sw.js",
      // Registrasi hanya lewat src/lib/registerServiceWorker.ts (guarded wrapper).
      injectRegister: null,
      devOptions: { enabled: false },
      includeAssets: ["favicon.ico", "icon-16.png", "icon-32.png", "icon-180.png"],
      manifest: {
        name: "Kalkulator Right Issue",
        short_name: "RI Calc",
        description: "Kalkulator Right Issue untuk saham Indonesia (IDX)",
        lang: "id-ID",
        dir: "ltr",
        categories: ["finance", "productivity", "utilities"],
        theme_color: "#0B64F3",
        background_color: "#0B64F3",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        shortcuts: [
          {
            name: "Hitung Right Issue",
            short_name: "Hitung",
            description: "Buka kalkulator Right Issue",
            url: "/",
            icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
          },
          {
            name: "Budget Planner",
            short_name: "Budget",
            description: "Rencanakan alokasi pembelian saham",
            url: "/",
            icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
          },
          {
            name: "Panduan Edukasi",
            short_name: "Edukasi",
            description: "Pelajari mekanisme Right Issue IDX",
            url: "/",
            icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
          },
        ],
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-384.png", sizes: "384x384", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/icon-192-maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/api/, /^\/~oauth/, /^\/embed/],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // Navigasi HTML: selalu coba jaringan dulu, cache hanya untuk fallback offline.
            urlPattern: ({ request, url, sameOrigin }: { request: Request; url: URL; sameOrigin: boolean }) =>
              request.mode === "navigate" &&
              sameOrigin &&
              !url.pathname.startsWith("/~oauth") &&
              !url.pathname.startsWith("/api"),
            handler: "NetworkFirst",
            options: {
              cacheName: "html-navigations",
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            // Aset build ber-hash (immutable) → aman cache-first agar app shell jalan offline.
            urlPattern: ({ url, sameOrigin }: { url: URL; sameOrigin: boolean }) =>
              sameOrigin && url.pathname.startsWith("/assets/"),
            handler: "CacheFirst",
            options: {
              cacheName: "static-assets",
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-supabase": ["@supabase/supabase-js"],
        },
      },
    },
  },
}));
