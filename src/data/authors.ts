// The people who write the blog. A post names one by key in its front matter
// (`author: nick`); the key is also the about page's address,
// /blog/authors/nick.
//
// The portraits are in color on disk (assets-static/authors) and washed with
// the worn theme in CSS, see src/components/Portrait.astro. The share card
// tints the large one in the site's own cyan (src/og/render.ts).
import { ORG_ID, REPO, SITE } from './site';

export interface Author {
  name: string;
  /** one line under the name on the about page */
  role: string;
  /** the about page's search snippet: 110 to 165 characters (npm run seo) */
  description: string;
  /** the about page, a paragraph per entry, in the author's voice; trusted
      HTML, for the links */
  bio: string[];
  /** served paths, both square: 640px for the about page, 160px for bylines */
  photo: { large: string; small: string };
  /** the author's own site first, then other profiles, for the page and JSON-LD */
  links: { label: string; href: string }[];
}

export const AUTHORS = {
  nick: {
    name: 'Nick Duncan',
    role: 'Founder and engineer, Arclight Digital',
    description:
      'Nick Duncan builds Pulsar: more than fifteen years of software, five of them in AI and computer vision, and a start in design that still shows in the desktop.',
    bio: [
      'I build Pulsar. I’ve written software for more than fifteen years, five of them in AI and computer vision, and I started out in design, so I care whether a desktop is beautiful as much as whether it boots. I founded <a href="https://arclight.build">Arclight</a>, a small studio in Colorado Springs, to skip the layers and spend my time on hard problems and code that ships.',
      `Pulsar is the Linux I wanted for myself: good-looking from the first boot, rebuilt every night, and rolled back on its own when an update goes wrong. It’s MIT-licensed and built in the open, like the rest of Arclight’s work, including ARC UI, the design system this site runs on. Found a bug, or want something? <a href="${REPO}/issues">Open an issue.</a>`,
    ],
    photo: { large: '/assets/authors/nick-640.webp', small: '/assets/authors/nick-160.webp' },
    links: [
      { label: 'nickduncan.dev', href: 'https://nickduncan.dev' },
      { label: 'Arclight', href: 'https://arclight.build' },
      { label: 'GitHub', href: 'https://github.com/nickduncan7' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/nickduncan7' },
    ],
  },
} satisfies Record<string, Author>;

export type AuthorKey = keyof typeof AUTHORS;
export const AUTHOR_KEYS = Object.keys(AUTHORS) as [AuthorKey, ...AuthorKey[]];

export const authorHref = (key: AuthorKey) => `/blog/authors/${key}`;
export const authorId = (key: AuthorKey) => `${SITE}${authorHref(key)}#person`;

/** The author as a schema.org Person, the node every post's `author` points at. */
export function personLd(key: AuthorKey): Record<string, unknown> {
  const a: Author = AUTHORS[key];
  return {
    '@type': 'Person',
    '@id': authorId(key),
    name: a.name,
    jobTitle: 'Founder and engineer',
    worksFor: { '@id': ORG_ID },
    url: a.links[0].href,
    image: new URL(a.photo.large, SITE).href,
    sameAs: a.links.slice(1).map((l) => l.href),
  };
}
