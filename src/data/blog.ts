// The blog's posts as the site shows them: which are live, in what order,
// and which one the home page points at.
//
// A post with `base` waits for the published image. manifest.json is written
// by the nightly's publish (see build.ts), so a post about moving to Fedora
// 45 appears in the same commit that ships the first Fedora 45 image, and a
// night whose build failed leaves it unpublished. A post with `release` waits
// the same way for the image that carries that Pulsar release.
import { getCollection, type CollectionEntry } from 'astro:content';
import { manifest } from './build';

export type Post = CollectionEntry<'blog'>;

/** How long a post's banner stays on the home page. The site rebuilds with
    every nightly publish, so it comes down within a day of this. */
export const BANNER_DAYS = 30;

/** The blog in one line: the index's lede and meta description and the RSS
    channel read this; the share card says the first half of it. */
export const BLOG_DESCRIPTION =
  'Posts by Nick Duncan about Pulsar releases and about moving Pulsar to new Fedora and GNOME versions, such as Fedora 45 with GNOME 51.';

// "fedora-silverblue:45" -> 45. NaN when the manifest says nothing usable,
// which holds every gated post back rather than guessing.
const shippedBase = Number(manifest.base.split(':')[1]);

// "26.11.1" -> [26, 11, 1]. A manifest with no release (or an unreadable
// one) gives NaNs, which hold every release-gated post back.
const parts = (r: string) => r.split('.').map(Number);
const shippedRelease = parts(manifest.release ?? '');

/** Whether the published release is `want` or later, part by part:
    26.11.1 is past 26.9.1, though it sorts before it as text. */
function shipped(want: string): boolean {
  const w = parts(want);
  for (let i = 0; i < w.length; i++) {
    const have = shippedRelease[i];
    if (!(have >= w[i])) return false; // false for NaN too
    if (have > w[i]) return true;
  }
  return true;
}

const live = (p: Post) =>
  (p.data.base === undefined || shippedBase >= p.data.base) &&
  (p.data.release === undefined || shipped(p.data.release));

/** Every live post, newest first. */
export async function posts(): Promise<Post[]> {
  return (await getCollection('blog', live)).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** The newest live post with a banner still inside its window, if any. */
export async function bannerPost(now = new Date()): Promise<Post | undefined> {
  const until = (p: Post) => p.data.date.getTime() + BANNER_DAYS * 86_400_000;
  return (await posts()).find((p) => p.data.banner && now.getTime() < until(p));
}

export const postHref = (p: Post) => `/blog/${p.id}`;

// "2026-11-03" -> "November 3, 2026", in UTC: a post's date is a day, not a
// moment, and must read the same wherever the build runs.
export const longDate = (d: Date) =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
export const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/** Minutes to read, at a steady 220 words a minute, never under one. Counted
    from the Markdown source, so code and link targets count a little. */
export const readingMinutes = (p: Post) => Math.max(1, Math.round((p.body ?? '').split(/\s+/).filter(Boolean).length / 220));

/** The newer and older neighbors of a post, for the foot of its page. */
export async function neighbors(p: Post): Promise<{ newer?: Post; older?: Post }> {
  const all = await posts();
  const i = all.findIndex((x) => x.id === p.id);
  return { newer: all[i - 1], older: all[i + 1] };
}

// The Markdown renderer's code blocks are Shiki's, colored with a fixed
// GitHub theme that no site theme reaches. A post's code instead becomes the
// same arc-code-block the docs use -- themed, labelled with its language,
// with a copy button -- by rewriting the rendered HTML. Shiki's spans are
// dropped and the text kept exactly, so what is copied is what was written.
const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'" };
const decode = (s: string) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e: string) =>
    e[0] === '#'
      ? String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : Number(e.slice(1)))
      : (ENTITIES[e] ?? m),
  );
const attr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
export function codeBlocks(html: string): string {
  return html.replace(/<pre class="astro-code[^"]*"[^>]*?(?:data-language="([\w-]+)")?[^>]*><code>([\s\S]*?)<\/code><\/pre>/g, (_, lang: string | undefined, inner: string) => {
    const code = decode(inner.replace(/<[^>]+>/g, '')).replace(/\n$/, '');
    const language = lang && lang !== 'plaintext' && lang !== 'text' ? ` language="${attr(lang)}"` : '';
    return `<arc-code-block class="theme-fixed-dark"${language} code="${attr(code)}"></arc-code-block>`;
  });
}
