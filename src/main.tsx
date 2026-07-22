import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import { LanguageProvider } from "./contexts/LanguageContext";
import "./index.css";

const keepPreviewFresh = () => {
  if (typeof window === "undefined") return;

  const { hostname, search } = window.location;
  const isLovablePreview = hostname.startsWith("id-preview--") || search.includes("__lovable_sha=");
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
