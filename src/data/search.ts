// What the header's search finds, gathered at build time from what the site
// already knows: every docs page and its sections, the 20 themes, and each
// `pulsar` command. No index service and no runtime fetch: ARC's command
// palette ranks these on the page itself.
import { getCollection, render } from 'astro:content';
import { USAGE } from './cli';
import { DOCS_NAV, hrefOf } from './docs';
import { THEMES, label, setCommand } from './themes';

export type SearchItem = { label: string; href: string; description?: string; keywords?: string; icon?: string };
export type SearchGroup = { heading: string; items: SearchItem[] };

// The sections of the site-written pages: each keeps its table of contents as
// a TOC array of { id, label }, read straight off the page's source.
const PAGE_SOURCES = import.meta.glob('../pages/docs/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const TOC_ENTRY = /\{\s*id:\s*'([^']+)',\s*label:\s*'([^']+)'/g;

export async function searchIndex(): Promise<SearchGroup[]> {
  const docs = await getCollection('docs');
  const shipped = new Set(docs.map((d) => d.id));

  const pages: SearchItem[] = [];
  const sections: SearchItem[] = [];
  for (const group of DOCS_NAV) {
    for (const l of group.links) {
      if (l.slug && !shipped.has(l.slug)) continue;
      const href = hrefOf(l);
      pages.push({ label: l.label, href, description: group.heading, icon: l.icon });
      if (l.slug) {
        const doc = docs.find((d) => d.id === l.slug)!;
        const { headings } = await render(doc);
        for (const h of headings.filter((h) => h.depth === 2 || h.depth === 3))
          sections.push({ label: h.text, href: `${href}#${h.slug}`, description: l.label });
      } else {
        const name = href === '/docs' ? 'index' : href.replace('/docs/', '');
        const src = PAGE_SOURCES[`../pages/docs/${name}.astro`] ?? '';
        for (const [, id, text] of src.matchAll(TOC_ENTRY))
          sections.push({ label: text, href: `${href}#${id}`, description: l.label });
      }
    }
  }

  // theme:<slug> is not a page: choosing one recolors the site, as the theme
  // picker does (the bar's script hands it to scripts/themes.ts)
  const themes: SearchItem[] = THEMES.filter((t) => !t.placeholder).map((t) => ({
    label: label(t),
    href: `theme:${t.slug}`,
    description: `Try it on this page · ${setCommand(t)}`,
    keywords: `theme ${t.slug} ${Object.keys(t.variants).join(' ')}`,
    icon: 'palette',
  }));

  // "  pulsar doctor [check]    health checks; ..." -> the command and its gloss
  const commands: SearchItem[] = [];
  for (const line of USAGE) {
    const m = line.match(/^ {2}(pulsar [^ ].*?)\s{2,}(.+)$/);
    if (m) commands.push({ label: m[1], href: '/docs/cli', description: m[2], keywords: 'command cli terminal', icon: 'terminal-window' });
  }

  return [
    { heading: 'Pages', items: pages },
    { heading: 'Sections', items: sections },
    { heading: 'Themes', items: themes },
    { heading: 'Commands', items: commands },
  ].filter((g) => g.items.length);
}
