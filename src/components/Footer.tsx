import { Globe } from "lucide-react";
import {
  SiFacebook,
  SiYoutube,
  SiTiktok,
  SiX,
  SiTelegram,
} from "react-icons/si";

const socialLinks = [
  {
    href: "https://alfindigital.com",
    icon: Globe,
    label: "Website",
    title: "Website alfindigital.com",
  },
  {
    href: "https://fb.com/alfindigital",
    icon: SiFacebook,
    label: "Facebook",
    title: "Facebook @alfindigital",
  },
  {
    href: "https://youtube.com/@alfindigital",
    icon: SiYoutube,
    label: "YouTube",
    title: "YouTube @alfindigital",
  },
  {
    href: "https://tiktok.com/@alfindigital",
    icon: SiTiktok,
    label: "TikTok",
    title: "TikTok @alfindigital",
  },
  {
    href: "https://x.com/alfindigital",
    icon: SiX,
    label: "X",
    title: "X @alfindigital",
  },
  {
    href: "https://t.me/alfidx",
    icon: SiTelegram,
    label: "Telegram",
    title: "Telegram @alfidx",
  },
];

const BRAND_COLOR = "#b91c1c";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-4 sm:flex-row">
        {/* Attribution */}
        <p className="text-sm text-muted-foreground">
          by{" "}
          <span style={{ color: BRAND_COLOR }} className="font-medium">
            @alfindigital
          </span>
        </p>

        {/* Divider */}
        <span className="hidden text-muted-foreground/40 sm:inline">|</span>

        {/* Social icons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {socialLinks.map(({ href, icon: Icon, label, title }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={title}
              className="inline-flex items-center justify-center text-muted-foreground transition-all duration-200 hover:scale-110"
              style={{ fontSize: "18px" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = BRAND_COLOR;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "";
              }}
            >
              <Icon size={18} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
