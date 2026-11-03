---
title: Pulsar moves to GNOME 51 and Fedora 45
description: Pulsar now ships GNOME 51 and Linux 7.2, built on Fedora 45. It arrives as a normal update, and your themes, glass, apps and files come with it.
date: 2026-11-03
base: 45
banner: Pulsar now ships GNOME 51, on Fedora 45.
card: sudo pulsar update
---

Pulsar's nightly builds now start from Fedora 45, released on November 3.
The first is `45.20261103.1`. It brings GNOME 51 and Linux 7.2, and it
arrives the way every update does: downloaded in the background, ready at
your next restart.

## What you need to do

Nothing. Your themes, glass, gamescale, apps and files carry over. Pulsar's
own release stays 26.10.1. Only the build number changes: it starts with 45
now instead of 44.

To get it now instead of waiting for the background download, run this and
restart:

```bash
sudo pulsar update
```

If something isn't right on Fedora 45, this puts you back on your last
Fedora 44 build at the next restart:

```bash
sudo pulsar rollback
```

That works until a second Fedora 45 update replaces the old build. To keep
it for longer, run `sudo pulsar pin on` while you're still on Fedora 44.

## New in GNOME 51

- Smoother animations when the computer is busy, from reworked frame
  timing.
- Screen brightness is remembered when you restart.
- Settings can turn the touchpad off while a mouse is plugged in, and
  rotate the screen on laptops and tablets with a tilt sensor.
- Files stays responsive during slow operations, and shows how many items
  you're dragging.
- Software warns before installing an app that's no longer maintained, and
  lists which of your files a Flatpak app can reach before you install it.
- Screenshots can be framed from the keyboard: the arrow keys resize the
  area, and Alt with the arrows moves it.
- The Reduced Motion setting now covers more of the desktop.
- Maps can save areas for offline use. Image Viewer shows the camera, lens
  and color profile a photo was taken with.

GNOME's [release notes](https://release.gnome.org/51/) list everything.

## Also changed

- **Linux 7.2.**
- **Passwords and keys** that apps save are now kept by oo7, GNOME's new
  keyring service, in place of GNOME Keyring.
- **The text consoles** (Ctrl+Alt+F3 and up) run kmscon, which draws text
  with real fonts and handles all of Unicode.
- **Toolboxes** you already have stay on Fedora 44 and keep working. A
  toolbox you create from now on starts from Fedora 45.

## Known issue

- **AMD graphics** decode video on the CPU for now. RPM Fusion hasn't yet
  built its hardware video driver for Fedora 45's Mesa; Pulsar picks it up
  in the first nightly after it appears.

## Behind the scenes

GNOME 51 removed the Shell effect Pulsar's glass was built on, so the glass
was rewritten for GNOME 51. The headless test that checks every theme's
glass before an image ships now runs on GNOME 51, and it gained a check
for stacked notifications, the case the first rewrite got wrong.
