---
title: Pulsar is on Fedora 45 now, with GNOME 51
description: Fedora 45 is out, and Pulsar is right there with it. GNOME 51 and Linux 7.2 arrive as a normal update, and your themes, glass, apps and files come along.
date: 2026-11-03
base: 45
banner: Pulsar is on Fedora 45 now, with GNOME 51.
card: sudo pulsar update
author: nick
---

Pulsar's Fedora 45 build is officially out in lockstep with Fedora 45; Pulsar is now based on Fedora Silverblue 45. The first official version based on 45 is `45.20261103.1`, which is available now. Thanks to the magic of atomic Linux, GNOME 51, Linux 7.2, and so much more are just a reboot away for existing Pulsar users.

## Do I need to do anything?

Nothing at all. The update downloads in the background like any other, and your themes, glass, gamescale, apps and files all come along with it. Pulsar's own release number stays 26.10.1; the only number that changes is the build number, which now starts with 45 instead of 44.

If you don't feel like waiting for the background download, just run this and restart:

```bash
sudo pulsar update
```

And if something feels off on Fedora 45, `sudo pulsar rollback` takes you back to your last Fedora 44 build at the next restart. Unfortunately that only works until a second Fedora 45 update replaces the old build, so if you want to hang on to Fedora 44 for longer, run `sudo pulsar pin on` while you're still on it.

## What's new?

GNOME 51 brings a litany of desktop improvements, namely reworked frame timing which should make animations run more smoothly, especially under load. Display brightness no longer resets on reboot, a new option turns the touchpad off when a mouse is plugged in, and devices with an accelerometer get a new Auto Rotate option. GNOME Software is also improved with clear warnings about unmaintained apps, and more clearly shows a Flatpak's desired file access before installation.

Smaller UI improvements include improvements to screenshots such as resizing the boundary with arrow keys and repositioning it with Alt+arrow keys; Reduced Motion covers more desktop elements, and more.

For the full list of improvements, please see the [official GNOME 51 release notes](https://release.gnome.org/51/) instead of our lackluster summarization.

### Updated glass shader

GNOME 51 removed `Shell.GLSLEffect`, the effect the old glass relied on, so the glass was ported to `Clutter.ShaderEffect`, the same way GNOME ported its own effects. Without the port, the glass extension crashed as soon as it loaded and every theme lost its top bar. The headless test that checks every theme's glass before an image ships was ported to GNOME 51 as well, and picked up a new check for stacked notifications, which caught exactly what the first port got wrong.

Additional WCAG accessibility testing and more thorough testing of GNOME desktop elements help improve the clarity and usability of the desktop, as well as consistency and quality of Pulsar's theming elements.

## Other changes

* Passwords and keys your apps save are now handled by oo7, GNOME's new keyring service, instead of GNOME Keyring.
* The text consoles (Ctrl+Alt+F3 and up) run kmscon now, so they get real fonts and full Unicode.
* Toolboxes you already have stay on Fedora 44 and keep working, while new ones start from Fedora 45.

## Known issue: AMD video

Unfortunately, AMD graphics decode video on the CPU for now. RPM Fusion's hardware video driver has to match Mesa's version exactly, and the Silverblue 45 base image is one Mesa update behind the one RPM Fusion built its driver against.

If anything else looks off, please [open an issue](https://github.com/arclight-digital/pulsar/issues).
