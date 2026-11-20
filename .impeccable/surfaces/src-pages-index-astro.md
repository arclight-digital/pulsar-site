---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: ["src/components/Home.astro","src/components/Hero.astro"]
---

## Scope

The getpulsar.dev home page (`src/pages/index.astro` → `src/components/Home.astro`, Hero, ThemeShowcase, Agents, GetPulsar). Mode: Persuade. Visitors ranked: desktop users, then agent developers, then gamers.

## Constraints from Nick (2026-11-20)

- Professional but playful, in ARC UI's register. No metaphor worlds, no hardware/spec-sheet framing, no HTML/CSS copies of Pulsar's UI chrome: Pulsar appears only through pipeline assets (theme desktop captures, the live sky shader, real app screenshots).
- Keep the gamescale figure as it is.
- Tagline and subline unchanged. Copy is Nick's; restructure, don't rewrite claims.
- Drop the CSS-drawn crash notification unless a real screenshot exists.

## Direction contract

THESIS: You try Pulsar on the page before you install it. The category default is a centered logo hero over a long run of equal-weight feature blocks; this page refuses that by putting the theme engine in the visitor's hand in the first viewport and letting real captures carry every section.

OWN-WORLD: The live nebula sky and the Pulsar mark on ARC UI's tokens; all color comes from the active theme's two-color contract, so the page re-dyes with each pick. Real desktop and app captures, large, with a 1px subtle border and an offset soft shadow. Host Grotesk for display, JetBrains Mono only for commands and build ids.

STORY: The visitor sees the desktop, plays with themes and watches the whole page follow; learns the setup is done and rolls back; sees the Agents app at work and what agents can't do; sees gamescale's arithmetic; leaves with Download.

FIRST VIEWPORT: Desktop 1440×900: the sky fills the frame; mark (smaller than today), tagline as the h1-scale line, subline, Download Pulsar (primary) on the left-center column; a row of theme swatches under the button labelled with the current theme's name and the `pulsar theme set` command; the current theme's desktop capture rising from the bottom edge, its top third visible above the fold and overlapping into the next section. Mobile: stacked, swatches as a horizontal scroll row, capture peeking below the button.

FORM: Code-led, straight execution in ARC UI after two re-rolls and Nick's steer ("too conceptual", "too clean", "professional but playful"); grounded candidate "theme picker page" from the safer hand, seed key 1663d65b. Signature interaction: picking a hero swatch re-dyes the page, sky and capture together.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
