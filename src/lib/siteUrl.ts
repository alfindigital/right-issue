/**
 * Single source of truth for absolute URLs used in SEO tags
 * (canonical, og:url, JSON-LD) and in the sitemap generator.
 *
 * Keep this in sync with `BASE_URL` in `scripts/generate-sitemap.ts`.
 */
export const SITE_URL = 'https://rightissue.lovable.app';

/** Builds an absolute URL from a root-relative path (e.g. `/edukasi`). */
export const absUrl = (path = '/') =>
  `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

export const OG_IMAGE = absUrl('/og-home.png');
