// The docs are the OS repo's own docs/*.md, as its last published nightly
// shipped them: publish.sh copies them into upstream/ (see upstream.list).
// Nobody edits them here, so the docs and the OS cannot drift apart. A page's
// title is its first heading.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const docs = defineCollection({
  loader: glob({ pattern: '*.md', base: './upstream/docs', generateId: ({ entry }) => entry.replace(/\.md$/, '').toLowerCase() }),
});

export const collections = { docs };
