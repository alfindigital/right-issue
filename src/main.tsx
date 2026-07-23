import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import { LanguageProvider } from "./contexts/LanguageContext";
import "./index.css";

const keepPreviewFresh = () => {
  if (typeof window === "undefined") return;

  const { hostname, search } = window.location;
  const isLovablePreview =
    hostname.startsWith("id-preview--") ||
    hostname.startsWith("preview--") ||
    hostname.endsWith(".lovableproject.com") ||
    hostname.endsWith(".lovableproject-dev.com") ||
    search.includes("__lovable_sha=");
  if (!isLovablePreview) return;

  // Nuke all Cache Storage buckets on every preview load.
  if ("caches" in window) {
    window.caches.keys().then((keys) => {
      keys.forEach((key) => window.caches.delete(key));
    }).catch(() => undefined);
  }

  // Unregister any lingering service workers in preview.
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());

      if (navigator.serviceWorker.controller && !sessionStorage.getItem("ri-preview-sw-refresh")) {
        sessionStorage.setItem("ri-preview-sw-refresh", "1");
        window.location.reload();
      }
    }).catch(() => undefined);
  }

  // Detect new build by fetching index.html with cache-busting and comparing
  // the current script src hash. If it differs from what's loaded, hard reload.
  const detectNewBuild = async () => {
    try {
      const res = await fetch(`/?__nocache=${Date.now()}`, {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (!res.ok) return;
      const html = await res.text();
      const match = html.match(/src="(\/assets\/[^"]+\.js)"/);
      const remote = match?.[1];
      const loaded = Array.from(document.scripts)
        .map((s) => s.getAttribute("src") || "")
        .find((src) => src.includes("/assets/") && src.endsWith(".js"));
      if (remote && loaded && !loaded.includes(remote) && !remote.includes(loaded)) {
        if (!sessionStorage.getItem("ri-preview-build-refresh")) {
          sessionStorage.setItem("ri-preview-build-refresh", "1");
          window.location.reload();
        }
      } else {
        sessionStorage.removeItem("ri-preview-build-refresh");
      }
    } catch {
      /* ignore */
    }
  };

  // Check immediately, on focus, and every 30s while the tab is open.
  detectNewBuild();
  window.addEventListener("focus", detectNewBuild);
  window.setInterval(detectNewBuild, 30_000);
};

keepPreviewFresh();

// LanguageProvider is mounted at the root entry so every subtree — including
// lazy routes and error boundaries that remount — always has the context.
createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </HelmetProvider>
);
