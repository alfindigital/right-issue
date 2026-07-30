/**
 * Lightweight analytics wrapper.
 *
 * Fires events to Plausible (`window.plausible`) if the script is loaded,
 * otherwise no-ops in production and logs in development. Add Plausible to
 * `index.html` when ready:
 *
 *   <script defer data-domain="lotmetrik.my.id"
 *     src="https://plausible.io/js/script.js"></script>
 *
 * No PII or raw input values are ever sent — only categorical labels.
 */

type PlausibleFn = (event: string, options?: { props?: Record<string, string | number | boolean> }) => void;

declare global {
  interface Window {
    plausible?: PlausibleFn;
  }
}

export type AnalyticsEvent =
  | 'calculate_clicked'
  | 'scenario_viewed'
  | 'pdf_exported'
  | 'share_link_copied'
  | 'active_ri_picked'
  | 'demo_loaded';

export function track(event: AnalyticsEvent, props?: Record<string, string | number | boolean>) {
  try {
    if (typeof window === 'undefined') return;
    if (typeof window.plausible === 'function') {
      window.plausible(event, props ? { props } : undefined);
      return;
    }
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug('[analytics]', event, props ?? {});
    }
  } catch {
    /* never throw from analytics */
  }
}