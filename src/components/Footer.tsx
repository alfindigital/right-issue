import { useEffect, useState } from "react";

type Social = {
  href: string;
  label: string;
  path: string;
};

const SOCIALS: Social[] = [
  {
    href: "https://t.me/lotmetrik",
    label: "Telegram",
    path: "M9.8 18.7l.3-4.2 7.7-6.9c.3-.3-.1-.5-.5-.2L7.7 13.3 3.6 12c-.9-.3-.9-.9.2-1.3L19.8 4.5c.7-.3 1.4.2 1.1 1.3l-2.7 12.8c-.2.9-.7 1.1-1.5.7L12.6 16.3l-2 1.9c-.2.2-.4.4-.8.4z",
  },
  {
    href: "https://instagram.com/lotmetrik",
    label: "Instagram",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    href: "https://www.tiktok.com/@lotmetrik",
    label: "TikTok",
    path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  },
  {
    href: "https://x.com/lotmetrik",
    label: "X",
    path: "M18.2 2.2h3.3l-7.2 8.3 8.5 11.3h-6.7l-5.2-6.8-6 6.8H1.7l7.7-8.8L1.2 2.2H8l4.7 6.2zM17 19.8h1.8L7.1 4.1H5.1z",
  },
];

const TAGLINES = [
  "hitung right issue tanpa drama",
  "presisi lot, tanpa odd lot",
  "TERP · dilusi · skenario",
  "dibangun buat investor ritel",
];

export default function Footer() {
  const [tag, setTag] = useState(0);
  const year = new Date().getFullYear();

  useEffect(() => {
    const id = setInterval(() => setTag((i) => (i + 1) % TAGLINES.length), 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="lm-foot" role="contentinfo">
      <style>{`
        .lm-foot {
          position: relative; overflow: hidden;
          font-family: inherit;
          background:
            radial-gradient(1200px 200px at 10% -50%, hsl(var(--primary) / .18), transparent 60%),
            radial-gradient(900px 180px at 100% 120%, hsl(var(--primary) / .12), transparent 60%),
            hsl(var(--card));
          border-top: 1px solid hsl(var(--border));
          padding: 28px 22px 20px;
          color: hsl(var(--foreground));
        }
        .lm-foot::before {
          content: "";
          position: absolute; inset: 0 0 auto 0; height: 1px;
          background: linear-gradient(90deg,
            transparent, hsl(var(--primary) / .55), transparent);
        }
        .lm-wrap {
          max-width: 960px; margin: 0 auto;
          display: grid; gap: 20px;
          grid-template-columns: 1fr auto;
          align-items: center;
        }
        @media (max-width: 640px) {
          .lm-wrap { grid-template-columns: 1fr; text-align: center; justify-items: center }
        }
        .lm-brand-row {
          display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
        }
        .lm-mark {
          width: 34px; height: 34px; border-radius: 10px;
          display: inline-flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / .65));
          color: hsl(var(--primary-foreground, var(--card)));
          font-weight: 800; font-size: 15px; letter-spacing: -.02em;
          box-shadow: 0 8px 24px -8px hsl(var(--primary) / .55);
        }
        .lm-brand {
          font-weight: 700; font-size: 15px; letter-spacing: -.01em;
          color: hsl(var(--foreground)); text-decoration: none;
        }
        .lm-brand span { color: hsl(var(--primary)) }
        .lm-dot {
          width: 4px; height: 4px; border-radius: 50%;
          background: hsl(var(--muted-foreground) / .5);
        }
        .lm-tag {
          position: relative; height: 20px; min-width: 180px;
          overflow: hidden; font-size: 13px;
          color: hsl(var(--muted-foreground));
        }
        .lm-tag span {
          position: absolute; inset: 0;
          display: flex; align-items: center;
          opacity: 0; transform: translateY(8px);
          transition: opacity .5s ease, transform .5s ease;
        }
        .lm-tag span.on { opacity: 1; transform: translateY(0) }
        .lm-social { display: inline-flex; gap: 8px }
        .lm-btn {
          width: 36px; height: 36px; border-radius: 10px;
          display: inline-flex; align-items: center; justify-content: center;
          color: hsl(var(--muted-foreground));
          background: hsl(var(--muted) / .4);
          border: 1px solid hsl(var(--border));
          transition: transform .2s ease, color .2s ease, background .2s ease, border-color .2s ease;
        }
        .lm-btn svg { width: 16px; height: 16px }
        .lm-btn:hover {
          color: hsl(var(--primary));
          border-color: hsl(var(--primary) / .5);
          background: hsl(var(--primary) / .1);
          transform: translateY(-2px);
        }
        .lm-meta {
          margin-top: 18px; padding-top: 14px;
          border-top: 1px dashed hsl(var(--border));
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px; flex-wrap: wrap;
          font-size: 12px; color: hsl(var(--muted-foreground));
          max-width: 960px; margin-left: auto; margin-right: auto;
        }
        .lm-meta a { color: hsl(var(--foreground)); text-decoration: none }
        .lm-meta a:hover { color: hsl(var(--primary)) }
        .lm-pulse {
          display: inline-flex; align-items: center; gap: 6px;
        }
        .lm-pulse i {
          width: 6px; height: 6px; border-radius: 50%;
          background: hsl(var(--primary));
          box-shadow: 0 0 0 0 hsl(var(--primary) / .6);
          animation: lm-pulse 1.8s ease-out infinite;
        }
        @keyframes lm-pulse {
          70% { box-shadow: 0 0 0 8px hsl(var(--primary) / 0) }
          100% { box-shadow: 0 0 0 0 hsl(var(--primary) / 0) }
        }
      `}</style>

      <div className="lm-wrap">
        <div className="lm-brand-row">
          <span className="lm-mark" aria-hidden="true">L</span>
          <a
            href="https://lotmetrik.my.id"
            target="_blank"
            rel="noopener noreferrer"
            className="lm-brand"
          >
            lot<span>metrik</span>
          </a>
          <span className="lm-dot" aria-hidden="true" />
          <div className="lm-tag" aria-live="polite">
            {TAGLINES.map((t, i) => (
              <span key={t} className={i === tag ? "on" : ""}>{t}</span>
            ))}
          </div>
        </div>

        <div className="lm-social" aria-label="Social links">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              className="lm-btn"
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d={s.path} />
              </svg>
            </a>
          ))}
        </div>
      </div>

      <div className="lm-meta">
        <span>© {year} lotmetrik · alat bantu, bukan nasihat investasi.</span>
        <span className="lm-pulse"><i />live · v1</span>
      </div>
    </footer>
  );
}
