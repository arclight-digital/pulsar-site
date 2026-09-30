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

The site and the OS must not drift apart, so the site never keeps its own
copies of the OS's files. The marks, fonts, wallpaper shaders and docs it
uses live in `upstream/`. After each nightly it publishes, the OS repo's
`scripts/publish.sh` replaces them. The same commit updates
`src/data/changelog.json` and `src/data/manifest.json` with that night's
build. The site therefore never documents a feature before the image that
has it.

- `upstream.list` names every file the site takes. Edit it here.
- Never edit `upstream/` by hand. Fix the file in the OS repo, and it
  arrives with the next published image.
- `src/data/changelog.json` and `src/data/manifest.json` belong to the
  nightly the same way.
- The docs under `/docs` are the OS repo's `docs/*.md` plus the pages in
  `src/pages/docs/`. A repo doc appears in the sidebar once a nightly has
  shipped it.

## How a page is built

- **Components.** Pages use ARC UI's web components. After the build,
  `integrations/arc-dsd.mjs` renders each one into declarative shadow DOM,
  so a page reads correctly before any JavaScript runs. `npm run dev` skips
  that step, so dev pages flash as they load; `npm run build` is what ships.
- **Brand lines.** The tagline and the subline live once, in
  `src/data/site.ts`. The hero, the footer, the share cards and the home
  page's title and description all read them from there.
- **Share cards.** `src/og/` draws one 1200×630 card per page at build time
  with satori, from the same lockup, fonts and screenshots as the site.
  Nothing is committed.
- **Search.** The palette's index is built with the site
  (`src/data/search.ts`) and ships as JSON on each page. The browser turns it
  into results on first use. No service is involved.
- **Themes.** The theme picker recolors the site with the same palettes the
  OS ships (`src/data/themes.json`), fitted for contrast in
  `src/data/sitetheme.ts`.

## Checks the build runs

- `integrations/security-headers.mjs` writes `dist/_headers`, including a
  Content-Security-Policy that names the hash of every inline script.
- `integrations/no-notes.mjs` fails the build if an HTML comment longer
  than a few words would reach visitors. Keep notes in `{/* */}` or `//`
  comments, which Astro drops.
- The share-card renderer fails the build if a card's text is too small to
  read or doesn't fit.
- `npm run seo` checks every page's title length, description length, `h1`
  and structured data.

## Deploying

Cloudflare's git integration builds `main` and serves `dist/` as static
assets (`wrangler.jsonc`). Pages are cached with revalidation, so a deploy is
live at once. There is nothing to run by hand.
