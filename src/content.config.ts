// The docs are the OS repo's own docs/*.md, as its last published nightly
// shipped them: publish.sh copies them into upstream/ (see upstream.list).
// Nobody edits them here, so the docs and the OS cannot drift apart. A page's
// title is its first heading.
//
// The blog is the site's own, written here in src/content/blog/. A post's id
// is its file name, which is also its address: upgrade-to-fedora-45.md is
// /blog/upgrade-to-fedora-45.
// src/data/blog.ts decides when a post goes live and when the home page
// points at it.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { AUTHOR_KEYS } from './data/authors';

const docs = defineCollection({
  loader: glob({ pattern: '*.md', base: './upstream/docs', generateId: ({ entry }) => entry.replace(/\.md$/, '').toLowerCase() }),
});

const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/blog', generateId: ({ entry }) => entry.replace(/\.md$/, '').toLowerCase() }),
  schema: z.object({
    title: z.string(),
    // the search snippet and the share card's line: 110 to 165 characters,
    // which npm run seo checks
    description: z.string(),
    // the day it went out, as a date: YYYY-MM-DD
    date: z.coerce.date(),
    // For a post about a move to a new Fedora release: held back until the
    // published image is on that release, so it goes live in the same
    // nightly commit that ships it, and never on a night the build failed.
    base: z.number().int().optional(),
    // One line for the home page, shown for the first BANNER_DAYS after the
    // date. Most posts have none.
    banner: z.string().optional(),
    // The command along the bottom of the share card. The post must show
    // it too: a card only pictures what its page has.
    card: z.string(),
    // who wrote it: a key of AUTHORS in src/data/authors.ts, which owns the
    // name, the portrait and the about page at /blog/authors/<key>
    author: z.enum(AUTHOR_KEYS),
  }),
});

export const collections = { docs, blog };
