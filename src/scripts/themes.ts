// Picking a theme -- from the floating picker, the showcase tiles or a hero
// control -- recolors the WHOLE site (scripts/sitetheme.ts), swaps the
// showcase preview to that theme's desktop, and follows it with the command.
//
// One source of truth for "which theme is showing": a pulsar:theme event on
// document. Everything that picks dispatches it and everything that shows
// listens, so the picker, the tiles and the hero cannot drift. The choice is
// remembered per visitor (sitetheme.ts); a reset is Pulsar again.
import { shotSrcset } from '../data/shots';
import { applySiteTheme, storedTheme } from './sitetheme';

type Variant = { accent: string; desktop?: string; wall?: string };
export type ThemeDetail = { slug: string; name: string; dark: Variant; light: Variant };

// Mirrors the page's own theme resolution: an explicit data-theme wins,
// `auto` follows the OS.
export const mode = (): 'dark' | 'light' => {
  const t = document.documentElement.dataset.theme;
  if (t === 'light' || t === 'dark') return t;
  return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

let current: ThemeDetail | null = null;

// A picture is fetched and decoded off screen before it replaces the one
// showing: the old one stays until the new one can be drawn whole, so a swap
// never flashes blank or paints half a frame. A later swap wins over an
// earlier one still decoding (turn). The same load warms the cache when a
// tile is only hovered or focused (prefetch), so the click is usually instant.
let turn = 0;
function load(src: string, srcset: string | undefined, sizes: string): Promise<void> {
  const img = new Image();
  if (srcset) {
    img.sizes = sizes;
    img.srcset = srcset;
  }
  img.src = src;
  return img.decode().catch(() => undefined);
}
const pictureOf = (detail: ThemeDetail) => {
  const v = detail[mode()] ?? detail.dark ?? detail.light;
  const src = v.desktop ?? v.wall;
  return { v, src, srcset: v.desktop ? shotSrcset(v.desktop) : undefined };
};
export function prefetch(detail: ThemeDetail) {
  const { src, srcset } = pictureOf(detail);
  const img = document.querySelector<HTMLImageElement>('[data-preview]');
  if (src && img) void load(src, srcset, img.sizes);
}

function show(detail: ThemeDetail) {
  current = detail;
  applySiteTheme(detail.slug);
  preview(detail);
}

// The parts that depend on the page's mode as well as the theme. Kept apart
// from show() so the light/dark observer can refresh them without
// re-applying the theme -- which, for a single-mode theme, sets the mode, and
// would feed the observer forever.
function preview(detail: ThemeDetail) {
  const { v, src, srcset } = pictureOf(detail);
  const alt = v.desktop
    ? `The Pulsar desktop in the ${detail.name} theme`
    : `The ${detail.name} wallpaper`;
  const mine = ++turn;
  document.querySelectorAll<HTMLImageElement>('[data-preview]').forEach((img) => {
    if (!src || img.getAttribute('src') === src) return;
    void load(src, srcset, img.sizes).then(() => {
      if (mine !== turn) return;
      // the 2x copy exists for desktop shots only; a wallpaper stand-in has none
      if (srcset) img.srcset = srcset;
      else img.removeAttribute('srcset');
      img.src = src;
      img.alt = alt;
    });
  });
  document.querySelectorAll('[data-preview-name]').forEach((el) => (el.textContent = detail.name));
  const cmd = `pulsar theme set ${detail.slug}`;
  document.querySelectorAll('[data-preview-cmd]').forEach((el) => {
    // an ARC code block takes the command as its attribute; a caption is text
    if (el.tagName === 'ARC-CODE-BLOCK') el.setAttribute('code', cmd);
    else el.textContent = cmd;
  });
  document.querySelectorAll<HTMLElement>('[data-theme-tile]').forEach((b) => {
    const on = b.dataset.themeTile === detail.slug;
    // the picker's cards are a radio group, with one tab stop on the checked
    // card; the showcase tiles and hero controls are toggle buttons
    if (b.getAttribute('role') === 'radio') {
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
    } else {
      b.setAttribute('aria-pressed', String(on));
    }
  });
}

// Arrow keys in the picker's radio group, as a radio group should: they move
// the checked card, and checking one wears it. Left/right walk the order;
// up/down go to the nearest card in the row above or below, measured, so the
// two sets and a phone's narrower grid need no column arithmetic.
function radioKeys(group: HTMLElement) {
  group.addEventListener('keydown', (e) => {
    const radios = [...group.querySelectorAll<HTMLElement>('[role="radio"]')];
    const at = radios.indexOf(e.target as HTMLElement);
    if (at < 0) return;
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      next = (at + (e.key === 'ArrowRight' ? 1 : -1) + radios.length) % radios.length;
    } else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = radios.length - 1;
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const down = e.key === 'ArrowDown';
      const from = radios[at].getBoundingClientRect();
      const cx = from.left + from.width / 2;
      let best = Infinity;
      radios.forEach((r, i) => {
        const b = r.getBoundingClientRect();
        const dy = down ? b.top - from.bottom : from.top - b.bottom;
        if (dy < -1) return;
        const score = dy * 1000 + Math.abs(b.left + b.width / 2 - cx);
        if (i !== at && score < best) {
          best = score;
          next = i;
        }
      });
    } else return;
    e.preventDefault();
    if (next < 0 || next === at) return;
    radios[next].focus();
    pick(detailOf(radios[next]));
  });
}

export const detailOf = (el: HTMLElement): ThemeDetail => ({
  slug: el.dataset.themeTile ?? 'pulsar',
  name: el.dataset.name ?? '',
  dark: JSON.parse(el.dataset.dark ?? '{}'),
  light: JSON.parse(el.dataset.light ?? '{}'),
});

export function pick(detail: ThemeDetail) {
  document.dispatchEvent(new CustomEvent<ThemeDetail>('pulsar:theme', { detail }));
  if (detail.slug !== 'pulsar') tellOnce(detail.slug);
}

// Once a session, the first time someone picks a theme: where the same thing
// lives on a real Pulsar desktop. First login binds Super+T only when
// the key is free, so the line names the command too, which always works.
function tellOnce(slug: string) {
  try {
    if (sessionStorage.getItem('pulsar-theme-told')) return;
    sessionStorage.setItem('pulsar-theme-told', '1');
  } catch {
    /* no session storage: say it anyway, once per page */
  }
  const toast = document.querySelector<HTMLElement & { show?: (o: object) => void }>('[data-theme-toast]');
  const cmd = `pulsar theme set ${slug}`;
  toast?.show?.({
    message: `In Pulsar: Super+T, or ${cmd}`,
    duration: 9000,
    actionLabel: 'Copy command',
    action: () => {
      navigator.clipboard?.writeText(cmd).catch(() => {});
    },
  });
}

export function initThemes(): void {
  document.addEventListener('pulsar:theme', (e) => show((e as CustomEvent<ThemeDetail>).detail));
  // intent: a tile under the pointer or the keyboard starts its picture
  for (const ev of ['pointerover', 'focusin'] as const) {
    document.addEventListener(ev, (e) => {
      const tile = (e.target as HTMLElement | null)?.closest?.<HTMLElement>('[data-theme-tile]');
      if (tile && tile.dataset.prefetched === undefined) {
        tile.dataset.prefetched = '';
        prefetch(detailOf(tile));
      }
    });
  }
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const tile = target.closest<HTMLElement>('[data-theme-tile]');
    if (tile) return pick(detailOf(tile));
    // A ‹ theme › stepper walks the gallery's own order, so it and the
    // tiles can never disagree about what comes next.
    const step = target.closest<HTMLElement>('[data-stepper] [data-step]');
    if (!step) return;
    const tiles = [...document.querySelectorAll<HTMLElement>('#themes [data-theme-tile]')];
    if (!tiles.length) return;
    const at = Math.max(0, tiles.findIndex((t) => t.dataset.themeTile === (current?.slug ?? tiles[0].dataset.themeTile)));
    const next = (at + Number(step.dataset.step) + tiles.length) % tiles.length;
    pick(detailOf(tiles[next]));
  });
  // The page's own light/dark toggle changes which accent and which shot is
  // right for the theme on show; re-apply it rather than leave a dark accent
  // on a light page.
  new MutationObserver(() => current && preview(current)).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  // A theme remembered from an earlier page: the pre-paint script already put
  // its colors on; this re-applies (a new build may have refined them) and
  // brings the picker, tiles and preview into line. No toast -- nothing was
  // picked just now.
  const stored = storedTheme();
  const tile = stored && document.querySelector<HTMLElement>(`[data-theme-tile="${CSS.escape(stored)}"]`);
  if (tile) show(detailOf(tile));

  document.querySelectorAll<HTMLElement>('[data-theme-radios]').forEach(radioKeys);

  // the floating picker: open it, and "Back to Pulsar"
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-picker-open]')) {
      const sheet = document.querySelector<HTMLElement & { open: boolean }>('[data-picker]');
      if (sheet) sheet.open = true;
    }
    if (target.closest('[data-picker-reset]')) {
      const home = document.querySelector<HTMLElement>('[data-theme-tile="pulsar"]');
      if (home) show(detailOf(home));
      document.dispatchEvent(new Event('pulsar:reset'));
    }
  });

  // for the review screenshots and the audit: window.pulsarTheme('nord')
  (window as unknown as { pulsarTheme: (s: string) => void }).pulsarTheme = (s: string) => {
    const t = document.querySelector<HTMLElement>(`[data-theme-tile="${CSS.escape(s)}"]`);
    if (t) show(detailOf(t));
  };
}
