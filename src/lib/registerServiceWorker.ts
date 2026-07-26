/**
 * Satu-satunya tempat service worker aplikasi diregistrasi.
 *
 * Service worker adalah state milik browser: kalau dia aktif di preview/dev,
 * dia bisa terus menyajikan HTML atau chunk lama walaupun kodenya sudah berubah.
 * Karena itu registrasi ditolak di semua konteks preview/dev, dan registrasi
 * lama di konteks tersebut ikut di-unregister.
 */

const SW_URL = "/sw.js";

type RegisterCallbacks = {
  onNeedRefresh?: () => void;
  onOfflineReady?: () => void;
};

const isRefusedContext = (): boolean => {
  if (typeof window === "undefined") return true;
  if (!import.meta.env.PROD) return true;

  const { hostname, search } = window.location;

  return (
    window.self !== window.top ||
    hostname.startsWith("id-preview--") ||
    hostname.startsWith("preview--") ||
    hostname === "lovableproject.com" ||
    hostname.endsWith(".lovableproject.com") ||
    hostname === "lovableproject-dev.com" ||
    hostname.endsWith(".lovableproject-dev.com") ||
    hostname === "beta.lovable.dev" ||
    hostname.endsWith(".beta.lovable.dev") ||
    new URLSearchParams(search).get("sw") === "off"
  );
};

const unregisterAppServiceWorkers = async () => {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.allSettled(
      registrations
        .filter((registration) => {
          const scriptURL =
            registration.active?.scriptURL ??
            registration.waiting?.scriptURL ??
            registration.installing?.scriptURL ??
            "";
          return scriptURL.endsWith(SW_URL);
        })
        .map((registration) => registration.unregister()),
    );
  } catch {
    /* noop */
  }
};

/**
 * Mendaftarkan service worker offline. Mengembalikan fungsi update (atau null
 * bila registrasi ditolak / tidak tersedia).
 */
export const registerAppServiceWorker = async (
  callbacks: RegisterCallbacks = {},
): Promise<(() => Promise<void>) | null> => {
  if (isRefusedContext()) {
    await unregisterAppServiceWorkers();
    return null;
  }

  try {
    const { registerSW } = await import("virtual:pwa-register");
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh: callbacks.onNeedRefresh,
      onOfflineReady: callbacks.onOfflineReady,
    });
    return async () => {
      await updateSW(true);
    };
  } catch {
    return null;
  }
};