// The blog as an RSS 2.0 feed, built with the site from the same live posts
// the index lists. Titles and descriptions only: a feed reader follows the
// link for the post.
import type { APIRoute } from 'astro';
import { postHref, posts } from '../../data/blog';

export const prerender = true;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async ({ site }) => {
  const all = await posts();
  const abs = (path: string) => new URL(path, site).href;
  const items = all
    .map(
      (p) => `    <item>
      <title>${esc(p.data.title)}</title>
      <link>${abs(postHref(p))}</link>
      <guid isPermaLink="true">${abs(postHref(p))}</guid>
      <pubDate>${p.data.date.toUTCString()}</pubDate>
      <description>${esc(p.data.description)}</description>
    </item>`,
    )
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Pulsar blog</title>
    <link>${abs('/blog')}</link>
    <atom:link href="${abs('/blog/rss.xml')}" rel="self" type="application/rss+xml"/>
    <description>News about Pulsar and the images it ships.</description>
    <language>en-us</language>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { 'content-type': 'application/rss+xml; charset=utf-8' } });
};
