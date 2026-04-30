import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    // Higher inline limit for tiny assets to reduce request count
    assetsInlineLimit: 4096,
    // Target modern browsers (smaller output, native ESM features)
    target: "es2020",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Split heavy vendor libs into stable, cache-friendly chunks
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;

          if (id.includes("recharts") || id.includes("d3-")) {
            return "vendor-charts";
          }
          if (id.includes("jspdf") || id.includes("html2canvas")) {
            return "vendor-pdf";
          }
          if (id.includes("@radix-ui")) {
            return "vendor-radix";
          }
          if (
            id.includes("react-router") ||
            id.includes("/react-dom/") ||
            id.includes("/react/") ||
            id.includes("scheduler")
          ) {
            return "vendor-react";
          }
          if (id.includes("lucide-react")) {
            return "vendor-icons";
          }
          if (id.includes("canvas-confetti")) {
            return "vendor-confetti";
          }
          return "vendor";
        },
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "lucide-react"],
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
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
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: false,
        runtimeCaching: [
          {
            // Lazy-loaded JS/CSS chunks: cache-first for instant repeat visits
            urlPattern: ({ request, url }) =>
              (request.destination === "script" || request.destination === "style") &&
              url.pathname.startsWith("/assets/"),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "app-chunks",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
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
}));
