/**
 * Keeps <meta name="theme-color"> (and friends) in sync with the theme the
 * app is actually showing, instead of only with the OS preference.
 *
 * The static index.html ships media-scoped theme-color tags so the very first
 * paint is on brand. Once the app runs, the user can override the theme
 * in-app, so we rewrite every theme-color meta to the active brand value and
 * drop the `media` attribute (a media-scoped tag would otherwise win whenever
 * the OS preference disagrees with the in-app choice).
 */
export const THEME_COLOR_LIGHT = "#0B64F3";
export const THEME_COLOR_DARK = "#0B60E9";

const isDark = () => document.documentElement.classList.contains("dark");

export function applyThemeColor(): void {
  if (typeof document === "undefined") return;

  const color = isDark() ? THEME_COLOR_DARK : THEME_COLOR_LIGHT;
  const metas = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');

  if (metas.length === 0) {
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = color;
    document.head.appendChild(meta);
  } else {
    metas.forEach((meta) => {
      meta.removeAttribute("media");
      meta.setAttribute("content", color);
    });
  }

  // Windows tiles / legacy Edge use their own colour hints.
  document
    .querySelectorAll<HTMLMetaElement>(
      'meta[name="msapplication-TileColor"], meta[name="msapplication-navbutton-color"]'
    )
    .forEach((meta) => meta.setAttribute("content", color));

  // iOS status bar: keep white text legible over the blue header in dark mode.
  const appleStatusBar = document.querySelector<HTMLMetaElement>(
    'meta[name="apple-mobile-web-app-status-bar-style"]'
  );
  appleStatusBar?.setAttribute("content", isDark() ? "black-translucent" : "default");
}

/**
 * Watches the `dark` class on <html> so any theme toggle in the app (header
 * toggle, settings dropdown, system-preference sync) updates the browser
 * chrome without each call site having to remember to do it.
 */
export function watchThemeColor(): () => void {
  if (typeof document === "undefined" || typeof MutationObserver === "undefined") {
    return () => undefined;
  }

  applyThemeColor();

  const observer = new MutationObserver(applyThemeColor);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  return () => observer.disconnect();
}
