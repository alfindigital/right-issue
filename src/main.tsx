import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import { LanguageProvider } from "./contexts/LanguageContext";
import { watchThemeColor } from "./lib/themeColor";
import "./index.css";

// Preview safety: never let a service worker (or its Cache Storage) serve
// stale HTML/asset chunks inside Lovable preview/dev contexts. Published
// production hosts are untouched. This is the sanctioned preview guard —
// no version polling or reload loops.
const disableServiceWorkersInPreview = () => {
  if (typeof window === "undefined") return;

  const { hostname, search } = window.location;
  const isLovablePreview =
    hostname.startsWith("id-preview--") ||
    hostname.startsWith("preview--") ||
    hostname.endsWith(".lovableproject.com") ||
    hostname.endsWith(".lovableproject-dev.com") ||
    hostname === "beta.lovable.dev" ||
    hostname.endsWith(".beta.lovable.dev") ||
    window.self !== window.top ||
    search.includes("__lovable_sha=") ||
    search.includes("sw=off");
  if (!isLovablePreview) return;

  if ("caches" in window) {
    window.caches.keys().then((keys) => {
      keys.forEach((key) => window.caches.delete(key));
    }).catch(() => undefined);
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());

      if (navigator.serviceWorker.controller && !sessionStorage.getItem("ri-preview-sw-refresh")) {
        sessionStorage.setItem("ri-preview-sw-refresh", "1");
        window.location.reload();
      }
    }).catch(() => undefined);
  }
};

disableServiceWorkersInPreview();

// Browser chrome (address bar / status bar / task switcher) follows the
// in-app theme, not just the OS preference.
watchThemeColor();

// LanguageProvider is mounted at the root entry so every subtree — including
// lazy routes and error boundaries that remount — always has the context.
createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </HelmetProvider>
);
