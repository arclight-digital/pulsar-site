# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People choosing a Linux desktop, ranked by Nick on 2026-11-20 for the front page:

1. Desktop users who want a GNOME desktop that looks finished out of the box and can't break or rot.
2. Developers who run coding agents (Claude Code, Codex, Antigravity CLI, opencode) and want an OS that gives those agents a guide, a sandbox, sessions they can undo, and an app to run them in.
3. Gamers, many coming from Windows, who want Steam and an NVIDIA driver that work on the first boot.

People already on Fedora Silverblue or Kinoite are a smaller audience. The download section serves them with a rebase path.

## Product Purpose

getpulsar.dev is the website for Pulsar, an image-based Linux OS from Arclight (arclight-digital/pulsar). The site explains what Pulsar is, shows it, and gets the visitor to a download (ISO or rebase). Its docs and blog explain how Pulsar works.

## Positioning

Tagline: "Your lighthouse in the sky." Subline: "Linux that's beautiful out of the box and rolls back when something breaks." Both live in `src/data/site.ts` and stay as they are (confirmed 2026-11-20).

What a neighboring distro can't truthfully copy:
- One theme engine recolors GNOME, GTK apps, the terminal, the editor, the top bar and the wallpaper together. There are 24 themes, and the wallpaper is the live nebula shader.
- The whole OS is one signed image, built nightly. Every update stages a new deployment, and greenboot rolls back on its own after three failed boots.
- Coding agents are first-class: `pulsar agent add`, the guide at `/usr/share/pulsar/AGENTS.md`, the `pulsar mcp` server, the sandbox, session undo, the Agents app, and handing work to your other Pulsar machines (`pulsar machine`).

Fedora Silverblue is the base, but it is never the lead.

## Operating Context

- Pulsar is built nightly on Fedora Silverblue 45 (bootc / rpm-ostree), with a vanilla and an NVIDIA image (`ghcr.io/arclight-digital/pulsar`, `pulsar-nvidia`). There is a weekly ISO. Releases are named like 26.11.2.
- The site is Astro with ARC UI web components, rendered to static HTML and served by Cloudflare. Marks, fonts, shaders, docs, the changelog and the manifest come from the OS repo through `upstream/` and the nightly publish. Pushing to `main` deploys.
- A visitor usually judges the OS from the desktop screenshots and the hero sky before they read any copy.

## Capabilities and Constraints

- Gaming: Steam, Heroic and Bottles; gamescope and MangoHud; gamescale for X11 games under fractional scaling; an NVIDIA image.
- Signed builds, Secure Boot on, cosign-verifiable images, and an SBOM.
- Pulsar Settings, a Super+Space command menu, and the Agents app.
- Never edit `upstream/`, `src/data/changelog.json` or `src/data/manifest.json` by hand.
- Copy follows `.claude/rules/prose.md` and `docs/voice.md`. Nick's own wording beats rewording, and Claude-written prose fails his Pangram check, so new copy goes to him as an outline plus facts.
- Undecided: whether 26.11.2 gets a blog post.

## Brand Commitments

- Name: Pulsar, by Arclight.
- The Pulsar mark and its animated cuts, Host Grotesk and JetBrains Mono, and the nebula wallpaper shader (`pulsar.frag`, `theme.frag`, and the looks) are brand assets kept through the redesign (confirmed 2026-11-20). The page's layout and the rest of its visual world are open.
- Voice: Nick's. Plain, specific, first-hand, with no marketing superlatives.

## Evidence on Hand

- Desktop screenshots for every theme in both modes: `assets-static/themes/<theme>/desktop-{dark,light}.webp`, plus @2x.
- The Agents app screenshot: `assets-static/agents-app.webp` (1800x1133).
- Nebula stills (`assets-static/nebula-still-{dark,light}.jpg`) and the live shader.
- The nightly changelog and manifest data (`src/data/`), and the public build status at beacon.getpulsar.dev.
- Docs under `/docs` and the blog under `/blog`.
- There are no user counts, testimonials, press quotes or benchmarks. Don't invent any.

## Product Principles

- Show the thing. The desktop, the themes and the apps carry the argument, and the words stay short and specific.
- Every claim is backed by the repo, a command, or a screenshot.
- Say what Pulsar doesn't do, and what a default leaves open (the guard and the sandbox are off by default).
- Fedora is the foundation, not the headline.
