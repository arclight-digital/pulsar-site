// The docs sidebar, grouped by what you came to do. A `slug` is a repo doc
// (docs/*.md) rendered at /docs/<slug>; an `href` is a page written for the
// site, under src/pages/docs/.
export type DocLink = { label: string; slug?: string; href?: string; icon: string };
export type DocGroup = { heading: string; links: DocLink[] };

export const DOCS_NAV: DocGroup[] = [
  {
    heading: 'Start',
    links: [
      { label: 'Overview', href: '/docs', icon: 'book-open' },
      { label: 'Install', href: '/docs/install', icon: 'download-simple' },
      { label: 'From Windows or macOS', href: '/docs/coming-from', icon: 'airplane-landing' },
      { label: 'Where things go', href: '/docs/where-things-go', icon: 'stack' },
    ],
  },
  {
    heading: 'Use',
    links: [
      { label: 'Themes', href: '/docs/themes', icon: 'palette' },
      { label: 'How theming works', slug: 'theming', icon: 'swatches' },
      { label: 'Gaming', href: '/docs/gaming', icon: 'game-controller' },
      { label: 'gamescale', href: '/docs/gamescale', icon: 'arrows-out' },
      { label: 'GPU containers', href: '/docs/gpu-containers', icon: 'graphics-card' },
    ],
  },
  {
    heading: 'Agents',
    links: [
      { label: 'Coding agents', href: '/docs/agents', icon: 'robot' },
      { label: 'Agents and safety', slug: 'agents-safety', icon: 'shield-check' },
    ],
  },
  {
    heading: 'Maintain',
    links: [
      { label: 'Updates and rollback', href: '/docs/updates', icon: 'arrows-clockwise' },
      { label: 'Troubleshooting', href: '/docs/troubleshooting', icon: 'first-aid' },
      { label: 'The pulsar command', href: '/docs/cli', icon: 'terminal-window' },
    ],
  },
  {
    heading: 'Trust',
    links: [
      { label: 'Signing', slug: 'signing', icon: 'seal-check' },
      { label: 'Provenance', href: '/docs/provenance', icon: 'git-commit' },
      { label: 'Releases', slug: 'releases', icon: 'rocket-launch' },
      { label: 'Nightly builds', href: '/docs/changelog', icon: 'clock-counter-clockwise' },
    ],
  },
];

export const hrefOf = (l: DocLink) => l.href ?? `/docs/${l.slug}`;
