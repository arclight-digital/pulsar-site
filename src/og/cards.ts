// The share cards, one per page, as data.
//
// Base.astro looks a page's card up here by its route and emits the og:image
// tags from it; src/pages/og/[card].jpg.ts renders every entry at build time.
// Both read this one list, so a page cannot name a card that is never drawn,
// and a card cannot be drawn with copy that disagrees with its tags.
//
// Adding a page means adding a card: Base.astro throws on a route with no
// entry here, which fails the build rather than shipping a page that shares
// with the wrong picture.
//
// Copy rules for a card: the headline names the page plainly, the way the
// site's navigation would, and the sub says in one factual line what is there.
// No slogans, no set-up and pay-off. The visual is something the page actually
// shows (a real command, a real screenshot, the real build), never an
// illustration of a claim.
import { changelog, version } from '../data/build';
import { IMAGES } from '../data/site';

/** A card's command: after a prompt, with an optional comment beside it. */
export type Line = { cmd: string; note?: string };

export type Visual =
  /** One real desktop screenshot, from site/assets-static/themes. */
  | { kind: 'desktops'; themes: { slug: string; variant: 'dark' | 'light' }[] }
  /** One real command, as the poster's small print along the bottom. */
  | { kind: 'terminal'; line: Line; icon?: string }
  /** The latest build, from the build data the changelog page renders. */
  | { kind: 'build' };

export interface Card {
  /** file name under /og/, and the route it belongs to */
  slug: string;
  path: string;
  headline: string;
  /** a short second line under the headline; optional */
  sub?: string;
  /** og:image:alt, describing the picture rather than repeating the page */
  alt: string;
  visual: Visual;
}

// "2026-09-26T03:00:09Z" -> "September 26, 2026". UTC and spelled out, so the
// card reads the same wherever the build runs and whoever reads it.
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
function longDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) throw new Error(`og cards: unreadable build date ${iso}`);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export const buildDate = longDate(changelog.generated);
export { version };

export const CARDS: Card[] = [
  {
    slug: 'home',
    path: '/',
    headline: 'Stylish, atomic, modern Linux, rebuilt every night.',
    alt: 'The Pulsar logo above a screenshot of the Pulsar desktop in its own dark theme: GNOME with a code editor, btop and a GTK demo app open.',
    visual: { kind: 'desktops', themes: [{ slug: 'pulsar', variant: 'dark' }] },
  },
  {
    slug: 'install',
    path: '/docs/install',
    headline: 'Install Pulsar',
    sub: 'A free ISO, or one command from Silverblue or Kinoite.',
    alt: `The Pulsar logo, the heading "Install Pulsar", and the switch command: sudo bootc switch ${IMAGES.vanilla}:latest.`,
    visual: { kind: 'terminal', line: { cmd: `sudo bootc switch ${IMAGES.vanilla}:latest` } },
  },
  {
    slug: 'coming-from',
    path: '/docs/coming-from',
    headline: 'Coming from Windows or macOS',
    sub: 'Making the USB stick, moving your files, and finding your apps.',
    alt: 'The Pulsar logo, the heading "Coming from Windows or macOS", and the command that installs GIMP from Flathub.',
    visual: { kind: 'terminal', line: { cmd: 'flatpak install flathub org.gimp.GIMP' } },
  },
  {
    slug: 'cli',
    path: '/docs/cli',
    headline: 'The pulsar command',
    sub: 'Themes, updates, health checks and agents from one CLI.',
    alt: 'The Pulsar logo, the heading "The pulsar command", and the command pulsar theme set tokyo-night.',
    visual: { kind: 'terminal', line: { cmd: 'pulsar theme set tokyo-night' } },
  },
  {
    slug: 'gamescale',
    path: '/docs/gamescale',
    headline: 'gamescale',
    sub: 'Native resolution for games when fractional scaling is on.',
    alt: 'The Pulsar logo, the heading "gamescale", the gamescale icon, and the command that sets gamescale up for Steam.',
    visual: { kind: 'terminal', icon: 'gamescale', line: { cmd: 'pulsar setup gamescale --platform steam' } },
  },
  {
    slug: 'provenance',
    path: '/docs/provenance',
    headline: 'Provenance',
    sub: 'How each image is built, and the package list attached to it.',
    alt: `The Pulsar logo, the heading "Provenance", and the command that lists the package list attached to the image: oras discover ${IMAGES.vanilla}:latest.`,
    visual: { kind: 'terminal', line: { cmd: `oras discover ${IMAGES.vanilla}:latest` } },
  },
  {
    slug: 'changelog',
    path: '/docs/changelog',
    headline: 'Nightly builds',
    alt: `The Pulsar logo, the heading "Nightly builds", and the latest build, ${version}, built ${buildDate}, with its package counts.`,
    visual: { kind: 'build' },
  },
  {
    slug: 'agents',
    path: '/docs/agents-safety',
    headline: 'Agent safety',
    sub: 'What a coding agent can and can’t reach on Pulsar.',
    alt: 'The Pulsar logo, the heading "Agent safety", and the command pulsar agent sandbox on.',
    visual: { kind: 'terminal', line: { cmd: 'pulsar agent sandbox on' } },
  },
  {
    slug: 'themes',
    path: '/docs/themes',
    headline: '20 themes',
    sub: 'Each covers GNOME, GTK apps, the terminal, the editor and the wallpaper.',
    alt: 'The Pulsar logo, the heading "20 themes", and the command pulsar theme set catppuccin.',
    visual: { kind: 'terminal', line: { cmd: 'pulsar theme set catppuccin' } },
  },
  {
    slug: 'theming',
    path: '/docs/theming',
    headline: 'How themes work',
    sub: 'Every file a theme writes, and how revert restores it.',
    alt: 'The Pulsar logo, the heading "How themes work", and the command pulsar theme revert.',
    visual: { kind: 'terminal', line: { cmd: 'pulsar theme revert' } },
  },
  {
    slug: 'coding-agents',
    path: '/docs/agents',
    headline: 'Coding agents',
    sub: 'Claude Code, Codex, Gemini CLI, opencode or aider, each in a toolbox.',
    alt: 'The Pulsar logo, the heading "Coding agents", and the command pulsar agent add claude.',
    visual: { kind: 'terminal', line: { cmd: 'pulsar agent add claude' } },
  },
  {
    slug: 'updates',
    path: '/docs/updates',
    headline: 'Updates and rollback',
    sub: 'Nightly images, downloaded in the background, applied on reboot.',
    alt: 'The Pulsar logo, the heading "Updates and rollback", and the command sudo pulsar rollback.',
    visual: { kind: 'terminal', line: { cmd: 'sudo pulsar rollback' } },
  },
  {
    slug: 'troubleshooting',
    path: '/docs/troubleshooting',
    headline: 'Troubleshooting',
    sub: 'Health checks, a redacted system report, and crash reports.',
    alt: 'The Pulsar logo, the heading "Troubleshooting", and the command pulsar doctor.',
    visual: { kind: 'terminal', line: { cmd: 'pulsar doctor' } },
  },
  {
    slug: 'where-things-go',
    path: '/docs/where-things-go',
    headline: 'Where things go',
    sub: 'Flatpaks, toolboxes, quadlets, and layering as a last resort.',
    alt: 'The Pulsar logo, the heading "Where things go", and the command toolbox create.',
    visual: { kind: 'terminal', line: { cmd: 'toolbox create' } },
  },
  {
    slug: 'gaming',
    path: '/docs/gaming',
    headline: 'Gaming',
    sub: 'Steam, Heroic, Bottles, GameMode, ntsync and the NVIDIA driver.',
    alt: 'The Pulsar logo, the heading "Gaming", and the command pulsar doctor gamemode flatpak-gl.',
    visual: { kind: 'terminal', line: { cmd: 'pulsar doctor gamemode flatpak-gl' } },
  },
  {
    slug: 'gpu-containers',
    path: '/docs/gpu-containers',
    headline: 'GPU containers',
    sub: 'CUDA and local models in podman, with nothing layered on the host.',
    alt: 'The Pulsar logo, the heading "GPU containers", and a podman run command that passes the NVIDIA GPU to a container.',
    visual: { kind: 'terminal', line: { cmd: 'podman run --device nvidia.com/gpu=all …' } },
  },
  {
    slug: 'docs',
    path: '/docs',
    headline: 'Pulsar docs',
    sub: 'Install, themes, agents, updates, and how each image is built.',
    alt: 'The Pulsar logo, the heading "Pulsar docs", and the command pulsar agent guide.',
    visual: { kind: 'terminal', line: { cmd: 'pulsar agent guide' } },
  },
];

/** The card for a route. Throws, so a page without one fails the build. A
    page under /docs without a card of its own shares the docs card. */
export function cardFor(path: string): Card {
  const trimmed = path.length > 1 ? path.replace(/\/+$/, '') : path;
  const card =
    CARDS.find((c) => c.path === trimmed) ??
    (trimmed.startsWith('/docs/') ? CARDS.find((c) => c.path === '/docs') : undefined);
  if (!card) {
    throw new Error(
      `og: no share card for route "${path}". Add one to site/src/og/cards.ts.`,
    );
  }
  return card;
}

/** Where a card is served from, relative to the site root. */
export const cardUrl = (card: Card) => `/og/${card.slug}.jpg`;
