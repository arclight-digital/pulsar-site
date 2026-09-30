// Fails the build when a page ships a note in an HTML comment. An Astro
// <!-- --> comment reaches the visitor as written, and the design notes that
// once sat in Base.astro went out to anyone who viewed the source. Notes go
// in {/* */} or // comments, which Astro drops.
//
// Lit's hydration markers and the one-word labels ARC templates carry
// (<!-- Sun -->) are allowed; anything longer is a note. Runs after arc-dsd,
// which writes the shadow DOM markup this reads.
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const COMMENT = /<!--([\s\S]*?)-->/g;
const LIT = /^\??(lit-part\b|\/lit-part\b|lit-node\b|$)/;
const isNote = (text) => !LIT.test(text) && (text.includes('\n') || text.trim().split(/\s+/).length > 3);

async function* pages(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* pages(path);
    else if (entry.name.endsWith('.html')) yield path;
  }
}

export default function noNotes() {
  return {
    name: 'no-notes',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const root = fileURLToPath(dir);
        const found = [];
        for await (const page of pages(root)) {
          for (const [, text] of (await readFile(page, 'utf8')).matchAll(COMMENT)) {
            if (isNote(text)) found.push(`${page.slice(root.length)}: ${text.trim().slice(0, 60)}`);
          }
        }
        if (found.length) throw new Error(`HTML comments would ship to visitors:\n${found.join('\n')}`);
      },
    },
  };
}
