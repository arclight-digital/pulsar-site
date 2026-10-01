// The themes the image ships, as the site shows them. themes.json is built
// from the theme definitions in the image (palettes read from each
// theme.toml) and every picture it names is shader output: the wallpaper
// stills are the same fragment shader that draws the hero, rendered in each
// palette, and the desktop shots are the theme harness's own screenshots.
// So the showcase bends the "shader and its still only" rule without breaking
// it -- every image here is one the OS itself produces.
//
// Dracula and Alucard are two themes, not one: Dracula is dark only and
// Alucard light only, so neither follows the Dark Style toggle and choosing
// either is a full switch. A single-variant theme shows the variant it has
// whichever mode the page is in.
import raw from './themes.json';
import UNIFORMS from '../../upstream/theme-uniforms.json';
import { hasVersion, versioned } from './versioned';

export type Variant = {
  swatch: string[];
  accent: string;
  bg: string;
  deep: string;
  raised: string;
  fg: string;
  wall?: string;
  desktop?: string;
};

export type Theme = {
  slug: string;
  name: string;
  author: string;
  prefer: string;
  /** A theme listed before its pictures exist: shows placeholder tiles. */
  placeholder?: boolean;
  variants: { dark?: Variant; light?: Variant };
};

// Every picture URL carries its content version (src/data/versioned.ts). A
// picture themes.json names but the build does not have fails the build: it
// would be a broken tile, and an unversioned URL under a year-long cache.
const pictures = (v: Variant): Variant => {
  for (const url of [v.wall, v.desktop]) {
    if (url && !hasVersion(url) && import.meta.env.SSR) throw new Error(`themes: no staged file for ${url} -- run npm run stage (npm run dev stages only when it starts)`);
  }
  return { ...v, wall: v.wall && versioned(v.wall), desktop: v.desktop && versioned(v.desktop) };
};
// The hero only ever draws the live shader, recolored to a theme's own
// wallpaper (src/scripts/sky.ts): never a still, never another theme's sky.
// A theme the uniforms do not carry would fall back to Pulsar's sky, so it
// fails the build instead. Pulsar's own themes wear pulsar.frag and need none.
const SKY = UNIFORMS as Record<string, { shader: string; variants: Record<string, { looks?: object }> }>;
const live = (t: Theme): Theme => {
  const e = SKY[t.slug];
  if (!e) throw new Error(`themes: ${t.slug} has no live sky in upstream/theme-uniforms.json -- export it with the OS repo's scripts/render-theme-wallpapers.py --uniforms`);
  if (e.shader !== 'pulsar') {
    for (const m of Object.keys(t.variants)) {
      if (!e.variants[m]?.looks) throw new Error(`themes: ${t.slug} ${m} has no recolored looks in upstream/theme-uniforms.json`);
    }
  }
  return t;
};
export const THEMES = (raw as Theme[]).map(live).map((t) => ({
  ...t,
  variants: Object.fromEntries(Object.entries(t.variants).map(([m, v]) => [m, pictures(v)])),
}));

// Display names that differ from the definition's, for the pairs whose
// variants carry their own names upstream.
const LABEL: Record<string, string> = {
  catppuccin: 'Catppuccin',
};
export const label = (t: Theme) => LABEL[t.slug] ?? t.name;

export const variant = (t: Theme, v: 'dark' | 'light'): Variant =>
  (t.variants[v] ?? t.variants.dark ?? t.variants.light) as Variant;

export const setCommand = (t: Theme) => `pulsar theme set ${t.slug}`;

// The attributes src/scripts/themes.ts reads off anything that picks a theme,
// so the showcase tiles and both hero options carry exactly the same data.
export const tileAttrs = (t: Theme) => ({
  'data-theme-tile': t.slug,
  'data-name': label(t),
  'data-dark': JSON.stringify(variant(t, 'dark')),
  'data-light': JSON.stringify(variant(t, 'light')),
});

// "#3ecbff" -> "62, 203, 255", the -rgb twin ARC's contract asks for.
export const rgb = (hex: string) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
};
