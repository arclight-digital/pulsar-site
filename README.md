# getpulsar.dev

The site for [Pulsar](https://github.com/arclight-digital/pulsar): an Astro
project built on ARC UI, deployed by Cloudflare's git integration on every
push to `main`.

```
npm ci
npm run dev      # stages the brand assets, then serves on localhost
npm run build    # the same, into dist/
```

## What comes from the OS repo

The page and the OS must not drift apart. So the marks, fonts, wallpaper
shader and docs the site uses are the OS repo's own files, not copies someone
maintains here. They live in `upstream/`, and the OS repo's
`scripts/publish.sh` replaces them after each nightly it publishes, in the
same commit as that night's `src/data/changelog.json` and
`src/data/manifest.json`. That also means the site never documents a feature
a night before the image that has it.

- `upstream.list` names every file the site takes. Edit it here.
- `upstream/` is overwritten by the next nightly. Never edit it by hand: fix
  the file in the OS repo instead, and it arrives with the next published image.
- `src/data/changelog.json` and `src/data/manifest.json` belong to the
  nightly the same way.
