export const FONT_SANS = 'IBM Plex Sans, sans-serif';
export const FONT_MONO = 'IBM Plex Mono, monospace';

const FONTS_LINK_ID = 'cu-ibm-plex-fonts';
const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono&family=IBM+Plex+Sans:wght@300;400&display=swap';

/**
 * Injects a Google Fonts `<link>` for IBM Plex Sans (300, 400) and IBM Plex Mono (400).
 * Safe to call multiple times — the link is only injected once.
 *
 * Skip this call if your app already loads IBM Plex (e.g. via Carbon's own stylesheet).
 */
export function loadFonts() {
  if (document.getElementById(FONTS_LINK_ID)) return;

  const preconnect = document.createElement('link');
  preconnect.rel = 'preconnect';
  preconnect.href = 'https://fonts.googleapis.com';

  const link = document.createElement('link');
  link.id = FONTS_LINK_ID;
  link.rel = 'stylesheet';
  link.href = FONTS_HREF;

  document.head.appendChild(preconnect);
  document.head.appendChild(link);
}
