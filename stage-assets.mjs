// Stage the shared brand assets into public/assets before Astro builds.
//
// The page and the OS must not be able to drift apart, so every mark, font and
// still the page serves is copied at build time from upstream/ -- the OS
// repo's own files, which its publish.sh copies in with each published
// nightly (see upstream.list) -- rather than kept as a second copy here.
// public/assets is gitignored for the same reason: if it is in git, someone
// will edit it there.
//
// These land in public/ rather than being imported through Vite on purpose --
// their URLs have to be stable. og:image is an absolute URL in a share card
// that outlives the deploy, and a content hash would change it on every build.
//
// The wallpaper shader is NOT staged: src/scripts/sky.ts imports
// upstream/assets/shaders/pulsar.frag directly with ?raw, so it is compiled
// into the bundle from the same file the OS wallpapers are rendered from.
//
// Runs from `npm run stage`, which `npm run dev` and `npm run build` both
// depend on. Node only -- Cloudflare's builder has node and nothing else.
import { createHash } from 'node:crypto';
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compress as woff2 } from 'wawoff2';

const SITE = dirname(fileURLToPath(import.meta.url));
// the OS repo's files, as its last published nightly shipped them
const REPO = join(SITE, 'upstream');
const OUT = join(SITE, 'public', 'assets');

// [source relative to the OS repo's root (under upstream/), name it is served as]
const FILES = [
  // brand: the v2 package's own files, by its "which file where" table. The
  // mark is a responsive family -- the large drawing above 56px, the heavier
  // -small drawing from 20 to 56px -- so each slot gets the drawing drawn for
  // its size: the 28px top bar the small animated cut, the 44px footer the
  // small static mark, the hero the large animated cut.
  //
  // The package has no animated -light cut, so light theme gets the static
  // -light marks (see theme.ts); the light hero mark is not in this list
  // because it is re-boxed below rather than copied.
  ['assets/brand/svg/pulsar-animated.svg', 'pulsar-animated.svg'],
  ['assets/brand/svg/pulsar-animated-large.svg', 'pulsar-animated-large.svg'],
  ['assets/brand/svg/pulsar-mark-small.svg', 'pulsar-mark-small.svg'],
  ['assets/brand/svg/pulsar-mark-small-light.svg', 'pulsar-mark-small-light.svg'],
  ['assets/brand/svg/favicon.svg', 'favicon.svg'],
  // PNG fallbacks for the favicon, each drawn at its size (the 16 drops the
  // glow and thickens the trail). Base.astro offers them beside the SVG.
  ['assets/brand/png/favicon-16.png', 'favicon-16.png'],
  ['assets/brand/png/favicon-32.png', 'favicon-32.png'],
  ['assets/brand/png/favicon-48.png', 'favicon-48.png'],

  // both licenses travel with their fonts -- the OFL requires it, and the two
  // files have the same name at the source, so they are renamed apart here
  ['assets/fonts/Host_Grotesk/OFL.txt', 'OFL-host-grotesk.txt'],
  ['assets/fonts/JetBrains_Mono/OFL.txt', 'OFL-jetbrains-mono.txt'],

  // Committed stills: the no-WebGL and still-loading hero ground, plus the
  // gamescale icon. The one place rendered output lives in git -- nebula is
  // locked, the pair is ~180KB, and re-rendering is documented beside the
  // files. src/og/render.ts also reads nebula-still-dark as the share cards ground.
  //
  // The share card is NOT here any more: it is rendered at build time.
  ['./assets-static/nebula-still-dark.jpg', 'nebula-still-dark.jpg'],
  ['./assets-static/nebula-still-light.jpg', 'nebula-still-light.jpg'],
  ['./assets-static/gamescale.svg', 'gamescale.svg'],
  // 64px tile of +-2-step triangular noise at a tiny alpha: dithers the
  // hero's CSS readability wash, which browsers (Firefox) draw undithered.
  ['./assets-static/dither.png', 'dither.png'],
];

// Clear first: a file dropped from the list above must leave the deploy too,
// or a stale asset outlives the markup that referenced it.
await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

await Promise.all(
  FILES.map(([from, name]) =>
    // "./" is this repo's own (assets-static); anything else is the OS repo's
    cp(from.startsWith('./') ? join(SITE, from) : join(REPO, from), join(OUT, name)).catch((cause) => {
      // A missing source is fatal. The page would otherwise deploy with a
      // broken mark or an unstyled face and nothing would say so.
      throw new Error(`cannot stage ${from}: ${cause.message}`, { cause });
    }),
  ),
);

// The light hero mark, re-boxed onto the dark hero mark's canvas.
//
// v2's files are each cropped to their own art plus 3%, so pulsar-mark-light
// (no glow) has a tighter box than pulsar-animated-large (glow), and neither
// box is centered on the core. theme.ts swaps one for the other in the same
// 180px <img>, which as supplied would draw the light mark 15% larger and
// shift its core by ~13px -- the mark would visibly jump on every theme flip,
// and the flywheel's transform-origin (Hero.astro) could only be right for
// one of them. Both files share the 256-unit drawing grid, so giving the
// light one the dark one's viewBox is a lossless fix: the art is untouched,
// only its transparent canvas grows. Read from the files rather than copied
// here as numbers, so the next drop cannot silently disagree with them.
//
// Done here, not by editing assets/brand: that directory stays the designer's
// package byte for byte, so a re-drop is a copy.
const ROOT_BOX = /<svg\b[^>]*>/;
function viewBox(svg, from) {
  const box = svg.match(ROOT_BOX)?.[0].match(/viewBox="([^"]+)"/)?.[1];
  if (!box) throw new Error(`no root viewBox in ${from}`);
  return box.split(/[\s,]+/).map(Number);
}
const HERO = 'assets/brand/svg/pulsar-animated-large.svg';
const LIGHT = 'assets/brand/svg/pulsar-mark-light.svg';
const hero = viewBox(await readFile(join(REPO, HERO), 'utf8'), HERO);
const lightSvg = await readFile(join(REPO, LIGHT), 'utf8');
const light = viewBox(lightSvg, LIGHT);
// The bigger canvas must contain the smaller one, or the re-box would crop
// the light art. Fail the build rather than ship a clipped mark.
if (
  light[0] < hero[0] ||
  light[1] < hero[1] ||
  light[0] + light[2] > hero[0] + hero[2] ||
  light[1] + light[3] > hero[1] + hero[3]
) {
  throw new Error(`${LIGHT}'s box does not fit inside ${HERO}'s; re-box by hand`);
}
const rebox = lightSvg.replace(ROOT_BOX, (tag) =>
  tag
    .replace(/viewBox="[^"]*"/, `viewBox="${hero.join(' ')}"`)
    .replace(/width="[^"]*"/, `width="${hero[2]}"`)
    .replace(/height="[^"]*"/, `height="${hero[3]}"`),
);
await writeFile(join(OUT, 'pulsar-mark-light.svg'), rebox);


// The theme showcase: a wallpaper still and a desktop screenshot per theme
// variant, as WebP (~2.7MB for all thirteen). Every one is output the OS
// itself produces -- the stills are the wallpaper shader rendered in each
// palette, the desktops are the theme harness's screenshots -- so the
// showcase stays inside the "shader and its stills" rule. Regenerated from
// the theme sources, not hand-edited; src/data/themes.json names them.
await cp(join(SITE, 'assets-static', 'themes'), join(OUT, 'themes'), { recursive: true }).catch((cause) => {
  throw new Error(`cannot stage assets-static/themes: ${cause.message}`, { cause });
});

// The two faces the page sets itself in, as WOFF2: the OS ships TrueType,
// which is ~2.7x the bytes over the wire, and every page preloads all three.
// (src/og/render.ts reads the TrueType files straight from upstream/: Satori
// cannot read WOFF2.)
const FONTS = [
  ['assets/fonts/Host_Grotesk/static/HostGrotesk-Regular.ttf', 'HostGrotesk-Regular.woff2'],
  ['assets/fonts/Host_Grotesk/static/HostGrotesk-Bold.ttf', 'HostGrotesk-Bold.woff2'],
  ['assets/fonts/JetBrains_Mono/static/JetBrainsMono-Regular.ttf', 'JetBrainsMono-Regular.woff2'],
];
for (const [from, name] of FONTS) {
  await writeFile(join(OUT, name), await woff2(await readFile(join(REPO, from))));
}

// /favicon.ico: browsers and crawlers ask for it whatever the <link>s say, and
// a 404 there is a 404 page. An ICO may hold PNGs as they are, so this is the
// three drawn sizes in one file, no re-encoding.
const ICONS = [16, 32, 48];
const pngs = await Promise.all(ICONS.map((n) => readFile(join(OUT, `favicon-${n}.png`))));
const head = Buffer.alloc(6 + 16 * pngs.length);
head.writeUInt16LE(0, 0);
head.writeUInt16LE(1, 2); // icon
head.writeUInt16LE(pngs.length, 4);
let offset = head.length;
pngs.forEach((png, i) => {
  const at = 6 + 16 * i;
  head.writeUInt8(ICONS[i], at); // width (256 would be 0)
  head.writeUInt8(ICONS[i], at + 1); // height
  head.writeUInt16LE(1, at + 4); // planes
  head.writeUInt16LE(32, at + 6); // bits per pixel
  head.writeUInt32LE(png.length, at + 8);
  head.writeUInt32LE(offset, at + 12);
  offset += png.length;
});
await writeFile(join(SITE, 'public', 'favicon.ico'), Buffer.concat([head, ...pngs]));

// A version for every theme picture, from its bytes. The showcase's 34
// wallpapers and desktops (both sizes) are most of the site's weight, and are
// replaced in place when a theme changes; src/data/themes.ts adds ?v=<this>
// to each URL, so the headers can let browsers keep them for a year
// (integrations/security-headers.mjs) and a changed picture is a new URL.
async function files(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    out.push(...(e.isDirectory() ? await files(p) : [p]));
  }
  return out;
}
const versions = {};
for (const f of (await files(join(OUT, 'themes'))).sort()) {
  versions[`/${relative(join(SITE, 'public'), f)}`] = createHash('sha256').update(await readFile(f)).digest('hex').slice(0, 10);
}
await writeFile(join(SITE, 'src', 'data', 'asset-versions.json'), JSON.stringify(versions, null, 1) + '\n');

console.log(`staged ${FILES.length + FONTS.length + 1} assets, favicon.ico and the theme showcase (${Object.keys(versions).length} versioned) into public/assets`);
