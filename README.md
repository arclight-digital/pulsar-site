<h1 align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/arclight-digital/pulsar/main/assets/brand/svg/pulsar-lockup-horizontal-light.svg">
    <img src="https://raw.githubusercontent.com/arclight-digital/pulsar/main/assets/brand/svg/pulsar-lockup-horizontal.svg" width="320" alt="Pulsar">
  </picture>
</h1>

<p align="center">
  Your lighthouse in the sky.<br>
  <sub>Linux that’s beautiful out of the box and rolls back when something breaks.</sub>
</p>

<p align="center">
  <a href="https://getpulsar.dev">getpulsar.dev</a> ·
  <a href="https://github.com/arclight-digital/pulsar">the OS</a>
</p>

This repo is the website for [Pulsar](https://github.com/arclight-digital/pulsar).
It is an Astro project built on [ARC UI](https://arcui.dev), rendered to
static HTML and served by Cloudflare. Every push to `main` deploys.

```bash
npm ci
npm run dev             # stages the brand assets, then serves on localhost:4321
npm run build           # the same, into dist/
npm run build:checked   # build, then check every page's title, description and headings
```

## What comes from the OS repo

The site keeps no copies of the OS's files. The marks, fonts, wallpaper
shaders and docs it uses are in `upstream/`, and the OS repo's
`scripts/publish.sh` replaces them after each nightly it publishes. The same
commit writes that night's `src/data/changelog.json` and
`src/data/manifest.json`. A feature shows up on the site in the same commit
as the image that has it, and never a night early.

`upstream.list` names every file the site takes. Edit it here. Don't edit `upstream/`, `changelog.json` or
`manifest.json` by hand: fix the file in the OS repo and it arrives with the
next published image.

The docs under `/docs` are the OS repo's `docs/*.md` plus the pages in
`src/pages/docs/`. A repo doc is in the sidebar once a nightly has shipped it.

## How a page is built

Pages use ARC UI's web components. After the build,
`integrations/arc-dsd.mjs` renders each one into declarative shadow DOM, so a
page reads correctly before any JavaScript runs. `npm run dev` skips that
step, which is why dev pages flash as they load.

`npm run build` deletes and re-stages `public/assets` first. A running
`astro dev` loses track of those files and every `/assets/` URL 404s until
it's restarted, so stop the dev server before you build.

The tagline and the subline are in `src/data/site.ts`. The hero, the footer,
the share cards and the home page's title and description all read them from
there.

### Blog

Posts are Markdown in `src/content/blog/`. The file name is the address
(`upgrade-to-fedora-45.md` is `/blog/upgrade-to-fedora-45`), and
`src/content.config.ts` describes the frontmatter. Two fields hold a post
back:

- `base: 45` keeps it unpublished until the nightly's manifest says the image
  is on Fedora 45.
- `release: 26.11.1` waits for an image that carries that release or a later
  one.

A `banner` line goes above the home page's mark for 30 days
(`BANNER_DAYS` in `src/data/blog.ts`). The index, `/blog/rss.xml`, the share
cards, search and the Blog links only ever list live posts.

`author` is a key in `src/data/authors.ts`, which has the name, bio and
portrait for the byline and the about page (`/blog/authors/nick`). Portraits
are committed in color in `assets-static/authors/`; CSS tints them to the
current theme.

A live post's slug is a URL people have shared. Renaming one needs a 301 in
`public/_redirects`, plus the old path in `redirects` and `MOVED` in
`astro.config.mjs`.

### The rest

- `src/og/` draws a 1200×630 share card for every page at build time with
  satori, from the site's own lockup, fonts and screenshots. None of the
  cards are committed.
- The search index is built with the site (`src/data/search.ts`) and ships
  as JSON on each page; the browser builds results from it on first use.
- The theme picker recolors the site with the OS's palettes
  (`src/data/themes.json`), adjusted for contrast in `src/data/sitetheme.ts`.

## Checks the build runs

- `integrations/security-headers.mjs` writes `dist/_headers`, with a
  Content-Security-Policy that lists the hash of every inline script.
- `integrations/no-notes.mjs` fails the build if an HTML comment longer than
  a few words would reach visitors. Put notes in `{/* */}` or `//` comments,
  which Astro drops.
- The share-card renderer fails the build if a card's text is too small to
  read or overflows.
- `npm run seo` checks each page's title and description length, its `h1` and
  its structured data. It also reports the `/install.html`-style redirect
  stubs, which have none of those, so a clean run isn't zero failures yet.

## Deploying

Cloudflare's git integration builds `main` and serves `dist/` as static
assets (`wrangler.jsonc`). Pages are cached with revalidation, so a deploy
goes live as soon as it finishes.
