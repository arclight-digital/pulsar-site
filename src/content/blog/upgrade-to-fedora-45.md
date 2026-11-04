---
title: Pulsar is on Fedora 45 now, with GNOME 51
description: Fedora 45 is out, and Pulsar is right there with it. GNOME 51 and Linux 7.2 arrive as a normal update, and your themes, glass, apps and files come along.
date: 2026-11-03
base: 45
banner: Pulsar is on Fedora 45 now, with GNOME 51.
card: sudo pulsar update
author: nick
---

In lockstep with the release of Fedora 45, Pulsar's baseline is also now
Fedora Silverblue 45! The first build on it is `45.20261103.1`, and it brings
GNOME 51 and Linux 7.2 along for the ride. It shows up the way every Pulsar
update does: it downloads in the background, and it's ready the next time you
restart.

## Do I need to do anything?

Nope. Your themes, glass, gamescale, apps and files all come with you.
Pulsar's own release stays 26.10.1. The only number that moves is the build
number, which starts with 45 now instead of 44.

Don't feel like waiting for the background download? Run this and restart:

```bash
sudo pulsar update
```

And if something feels off on Fedora 45, this takes you back to your last
Fedora 44 build at the next restart:

```bash
sudo pulsar rollback
```

One catch: that only works until a second Fedora 45 update replaces the old
build. If you want to hang on to Fedora 44 for longer, run
`sudo pulsar pin on` while you're still on it.

## What's new in GNOME 51

The highlights:

- Animations stay smooth when your computer is busy, thanks to reworked frame
  timing.
- Your screen brightness survives a restart.
- Settings can switch the touchpad off while a mouse is plugged in, and
  rotate the screen on laptops and tablets with a tilt sensor.
- Files stays responsive during slow operations, and tells you how many
  items you're dragging.
- Software warns you before you install an app that's no longer maintained,
  and shows which of your files a Flatpak app can reach before you install
  it.
- You can frame screenshots from the keyboard: the arrow keys resize the
  area, and Alt plus the arrows moves it.
- Reduced Motion now covers more of the desktop.
- Maps can save areas for offline use, and Image Viewer shows the camera,
  lens and color profile a photo was taken with.

The full list is in GNOME's [release notes](https://release.gnome.org/51/).

## Other changes

- **Linux 7.2.**
- **Passwords and keys** your apps save now live in oo7, GNOME's new keyring
  service, instead of GNOME Keyring.
- **The text consoles** (Ctrl+Alt+F3 and up) run kmscon now, so they get
  real fonts and all of Unicode.
- **Toolboxes** you already have stay on Fedora 44 and keep working. New ones
  start from Fedora 45.

## One known issue

- **AMD graphics** decode video on the CPU for now. RPM Fusion hasn't built
  its hardware video driver for Fedora 45's Mesa yet. Once it does, Pulsar
  picks it up in the very next nightly.

## Behind the scenes

GNOME 51 dropped the Shell effect Pulsar's glass was built on, so the glass
got rewritten for GNOME 51. The headless test that checks every theme's glass
before an image ships runs on GNOME 51 now too, and it picked up a new check
for stacked notifications, which is exactly what the first rewrite got wrong.

---

That's the lot! Grab the update whenever it suits you, poke around GNOME 51,
and if anything looks off, [open an issue](https://github.com/arclight-digital/pulsar/issues)
and let me know. Happy updating, and see you in the next nightly.
