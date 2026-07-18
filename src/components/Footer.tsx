import { useEffect, useRef } from "react";

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

export default function Footer() {
  const glowRef = useRef<HTMLDivElement>(null);
  const year = new Date().getFullYear();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const move = () => {
      const el = glowRef.current;
      if (el) {
        el.style.left = `${Math.random() * 120 - 30}%`;
        el.style.top = `${Math.random() * 60 - 30}%`;
      }
      timer = setTimeout(move, 4000 + Math.random() * 4000);
    };
    move();
    return () => clearTimeout(timer);
  }, []);

  return (
    <footer className="afd-foot" role="contentinfo">
      <style>{`
        .afd-foot {
          position: relative; overflow: hidden;
          font-family: inherit;
          background: hsl(var(--card));
          border-top: 1px solid hsl(var(--border));
          padding: 3px 12px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 8px; flex-wrap: wrap;
          line-height: 1;
        }
        .afd-foot > * { position: relative; z-index: 1 }
        .afd-glow {
          position: absolute; top: -40%; bottom: -40%; width: 48%;
          border-radius: 50%; z-index: 0; pointer-events: none; left: -48%;
          background: radial-gradient(closest-side, hsl(var(--primary) / .22), transparent);
          filter: blur(8px);
          transition: left 6s ease-in-out, top 6s ease-in-out;
        }
        .afd-cr {
          font-size: 10px; color: hsl(var(--foreground) / 0.75);
          display: inline-flex; align-items: center;
          border-left: 2px solid hsl(var(--primary));
          padding-left: 6px;
          line-height: 1;
        }
        .dark .afd-cr { color: hsl(var(--foreground) / 0.85); }
        .afd-brand {
          color: hsl(var(--primary)); font-weight: 600;
          text-decoration: none; margin-left: 2px;
        }
        .dark .afd-brand { color: hsl(217 91% 70%); }
        .afd-brand:hover { text-decoration: underline }
        .afd-brand:focus-visible {
          outline: 2px solid hsl(var(--primary));
          outline-offset: 2px;
          border-radius: 2px;
        }
        .afd-caret {
          display: inline-block; width: 3px; height: 7px;
          background: hsl(var(--primary)); margin-left: 2px;
          vertical-align: middle;
          animation: afd-blink 1.1s step-end infinite;
        }
        @keyframes afd-blink { 50% { opacity: 0 } }
        .afd-socials {
          display: flex; align-items: center; gap: 0px;
          flex: 0 0 auto;
          line-height: 1;
        }
        .afd-social {
          min-width: 32px; min-height: 32px;
          display: inline-flex; align-items: center; justify-content: center;
          background: transparent;
          text-decoration: none;
          border-radius: 50%;
        }
        .afd-social:focus-visible {
          outline: 2px solid hsl(var(--primary));
          outline-offset: 2px;
        }
        .afd-social:focus-visible .afd-social__badge {
          box-shadow: 0 0 0 2px hsl(var(--card)), 0 0 0 4px hsl(var(--primary));
        }
        .afd-social__badge {
          position: relative;
          width: 18px; height: 18px; border-radius: 50%;
          display: inline-flex; align-items: center; justify-content: center;
          background: hsl(var(--primary) / .12); color: hsl(var(--primary));
          transition: all .25s;
          pointer-events: none;
        }
        .dark .afd-social__badge {
          background: hsl(var(--primary) / .18);
          color: hsl(217 91% 78%);
        }
        .afd-social__badge svg {
          width: 10px; height: 10px;
          flex-shrink: 0;
        }
        .afd-social:hover .afd-social__badge {
          background: hsl(var(--primary)); color: hsl(var(--card));
        }
        .dark .afd-social:hover .afd-social__badge {
          background: hsl(var(--primary));
          color: hsl(var(--background));
        }
        .afd-social:hover .afd-social__badge::after {
          content: ""; position: absolute; inset: 0; border-radius: 50%;
          animation: afd-ripple 1.3s ease-out infinite;
        }
        @keyframes afd-ripple {
          0% { box-shadow: 0 0 0 0 hsl(var(--primary) / .5) }
          100% { box-shadow: 0 0 0 6px hsl(var(--primary) / 0) }
        }

        @media (max-width: 480px) {
          .afd-foot {
            padding: 2px 8px;
            gap: 5px;
          }
          .afd-cr {
            font-size: 9px;
            border-left-width: 2px;
            padding-left: 5px;
          }
          .afd-caret {
            width: 2px; height: 6px;
          }
          .afd-socials { gap: 0px; }
          .afd-social { min-width: 30px; min-height: 30px; }
          .afd-social__badge { width: 16px; height: 16px; }
          .afd-social__badge svg { width: 9px; height: 9px; }
          .afd-brand { margin-left: 1px }
        }

        @media (max-width: 360px) {
          .afd-foot {
            padding: 2px 6px;
            gap: 4px;
          }
          .afd-cr { font-size: 9px; padding-left: 4px; }
          .afd-socials { gap: 0px; }
          .afd-social { min-width: 28px; min-height: 28px; }
          .afd-social__badge { width: 15px; height: 15px; }
          .afd-social__badge svg { width: 8px; height: 8px; }
        }
      `}</style>

      <div className="afd-glow" ref={glowRef} aria-hidden="true" />
      <span className="afd-cr">
        © {year}
        <a
          href="https://lotmetrik.my.id"
          target="_blank"
          rel="noopener noreferrer"
          className="afd-brand"
        >
          lotmetrik
        </a>
        <span className="afd-caret" aria-hidden="true" />
      </span>

      <nav className="afd-socials" aria-label="Social media">
        {SOCIALS.map((s) => (
          <a
            key={s.label}
            className="afd-social"
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
          >
            <span className="afd-social__badge">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d={s.path} />
              </svg>
            </span>
          </a>
        ))}
      </nav>
    </footer>
  );
}
