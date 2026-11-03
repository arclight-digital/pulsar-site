// The blog's posts as the site shows them: which are live, in what order,
// and which one the home page points at.
//
// A post with `base` waits for the published image. manifest.json is written
// by the nightly's publish (see build.ts), so a post about moving to Fedora
// 45 appears in the same commit that ships the first Fedora 45 image, and a
// night whose build failed leaves it unpublished.
import { getCollection, type CollectionEntry } from 'astro:content';
import { manifest } from './build';

export type Post = CollectionEntry<'blog'>;

/** How long a post's banner stays on the home page. The site rebuilds with
    every nightly publish, so it comes down within a day of this. */
export const BANNER_DAYS = 30;

// "fedora-silverblue:45" -> 45. NaN when the manifest says nothing usable,
// which holds every gated post back rather than guessing.
const shippedBase = Number(manifest.base.split(':')[1]);

const live = (p: Post) => p.data.base === undefined || shippedBase >= p.data.base;

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
