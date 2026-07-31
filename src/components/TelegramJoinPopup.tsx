import { useEffect, useRef, useState } from "react";
import { X, Send } from "lucide-react";
import { track } from "@/lib/analytics";

const STORAGE_KEY = "lotmetrik_tg_popup_v1";
const DURATION = 10_000;

export default function TelegramJoinPopup() {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(100);
  const raf = useRef<number>();

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch { /* noop */ }
    const t = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const close = (reason: "dismissed" | "joined" = "dismissed") => {
    setOpen(false);
    track(reason === "joined" ? "telegram_popup_joined" : "telegram_popup_dismissed");
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* noop */ }
  };

  useEffect(() => {
    if (!open) return;
    track("telegram_popup_shown");
    const start = performance.now();
    const tick = (now: number) => {
      const pct = Math.max(0, 100 - ((now - start) / DURATION) * 100);
      setProgress(pct);
      if (pct <= 0) { close(); return; }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 backdrop-blur-sm p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tg-popup-title"
      onClick={() => close()}
    >
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => close()}
          aria-label="Tutup"
          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-6 pb-5 pt-7 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/12 text-primary">
            <Send className="h-6 w-6" />
          </div>
          <h2 id="tg-popup-title" className="text-base font-semibold text-foreground">
            Jangan ketinggalan right issue berikutnya
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Info RI, jadwal cum/ex-date, dan hitungan TERP langsung ke Telegram kamu. Gratis.
          </p>

          <a
            href="https://t.me/lotmetrik"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => close("joined")}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Send className="h-4 w-4" />
            Gabung Channel Telegram
          </a>
          <button
            onClick={() => close()}
            className="mt-2 w-full text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            Nanti saja
          </button>
        </div>

        <div className="h-1 w-full bg-muted" aria-hidden="true">
          <div
            className="h-full bg-primary"
            style={{ width: `${progress}%`, transition: "width 80ms linear" }}
          />
        </div>
      </div>
    </div>
  );
}
