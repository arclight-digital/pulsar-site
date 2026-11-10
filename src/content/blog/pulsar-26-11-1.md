---
title: "Pulsar 26.11.1: agents you can leave running"
description: Pulsar 26.11.1 keeps coding agents running after you close the terminal, adds a command menu on Super+Space, and copies text straight off the screen.
date: 2026-11-06
release: 26.11.1
banner: Pulsar 26.11.1 is out, with agents you can leave running and a command menu.
card: pulsar agent run claude --tmux work
author: nick
---

Pulsar 26.11.1 is here, and with it comes better coding agent session management and notifications when they need your intervention, a new Spotlight-inspired command menu at Super+Space, and much more consistent theming tweaks to GNOME and GTK apps, as well as glass that better adheres to theme colors.

Unfortunately, this release couldn't make it in time for the release of Fedora 45 and GNOME 51, which carry most of the improvements to Pulsar this month (those arrived with the [November 3 build](/blog/upgrade-to-fedora-45)) - but that doesn't stop us from shipping a few more of our own.

## Agents you can leave running

tmux is now part of Pulsar's base image, and as a result, now you can add a `--tmux` flag to a `pulsar agent run` call which will handle all the intricacies of tmux session registration for you. They can still be named like a normal tmux session, and if an agent needs your intervention, it will notify you via system notifications.

An example command to run a session with the name of `work`:

```bash
pulsar agent run claude --tmux work
```

It opens a new tmux session named `work`. You can detach from it as normal, but since agent sessions run on their own tmux server apart from yours, use `pulsar agent attach` to attach to the last session. Of course `pulsar agent attach work` can be used for named sessions. You can also pass `--worktree` to have it use its own git worktree for its work.

It also supports being able to undo the work in a session, provided the agent's working folder is a git repository. Just run `pulsar agent undo <name>` to put a project’s files back the way they were when the session started. And you can go back to the modified state in one command by "redoing" it with `pulsar agent undo <name> --redo`.

Finally, you can view your sessions in the terminal with `pulsar agent sessions`, and see a Claude Code session's usage with `pulsar agent usage <name>`. If you're more inclined to see this visually, a new "Agents" section has been added to the Pulsar Settings app.

## A quick command menu

To facilitate quicker operation of Pulsar settings, as well as opening apps and searching local files, a new command menu is available with Super+Space. It's similar in spirit to launchers like Spotlight or Raycast. Use it to:

* Change themes, open Pulsar's updates, or open the Agents section in Pulsar Settings quickly
* Search for and launch installed apps by filtering them by name
* Search local files by filename
* Do quick math and copy it to the clipboard, or any of these number operations:
    * a sum: 2^10, 15% of 80
    * a conversion: 5 mi in km, 100 f in c, 2 GiB in MB, 255 in hex
    * money: 100 usd in eur
    * a date: in 90 days, days until dec 25

If you use more than one keyboard layout, Super+Space keeps switching between them, and the command menu goes on Super+/ instead.

## Copy text and QR codes off the screen

Super+Print lets you pick any part of the screen and copies the text in it straight to your clipboard. It's English only for now. If you need to read a QR code instead, just run `pulsar screen qr` and pick the code the same way, and if it holds a link, you can open it right from the notification.

Both shortcuts are only offered once, so if your account already uses those keys for something else, they're left alone. Of course you can change either of them in Settings > Keyboard.

## Gaming

* If a game hits a GPU fault on NVIDIA, a notification now tells you which game it was and what to try, where before the game would just freeze or vanish. If it keeps happening, turning off DLSS or frame generation is usually the fix, and `pulsar doctor gpu-faults` lists the faults since you last booted.
* Faugus games now use Pulsar's own `gamescale`, just like Steam games do, so a game with `gamescale` in its launch arguments no longer hangs on its splash screen.
* On NVIDIA, Steam's window now comes back when it stops redrawing after waking from sleep. This was supposed to be fixed in 26.10.1, but the fix never actually ran - now it does.
* When the NVIDIA driver for Flatpak apps updates, Pulsar waits until nothing is using it instead of swapping it out from under a running Steam or Discord.
* Super+F makes any window fullscreen, and pressing it again puts it back. This is handy for Windows games whose borderless fullscreen sits under the top bar.
* Discord can now show the game you're playing, as it does on Windows. The Discord Flatpak's sandbox hides other programs from it, so Pulsar spots the game itself and tells Discord. Your Activity Privacy settings in Discord still decide who sees it.

## Desktop

Most of the theming work this month went into glass. Menus, Quick Settings, notifications and the on-screen displays have new glass, which redraws what's behind them in the theme's own colors, so a menu keeps its theme over any page or wallpaper. Windows and the top bar stay closer to the theme's color too, and the lock screen is now glass as well, toned so the clock and login text stay readable on any wallpaper. The Glass tint slider now sets how much of the color behind the glass comes through.

A few other fixes:

* The kernel's own scheduler is the default again. The one Pulsar shipped before kept GNOME Shell on the efficiency cores of hybrid Intel CPUs, which made animations stutter. If you want it back, it's still there as `scx.service`.
* If the document portal locks up, opening a file in a Flatpak app no longer hangs. Pulsar restarts it within a minute and offers to reopen the apps it cut off.
* AppImages run now. Most of them still need FUSE 2, which Fedora no longer installs, so they used to stop at "AppImages require FUSE to run".
* The welcome app opens on a new account's first login again, which it never did on Fedora 45. And after updating to a new release, a notification offers to show you what's new.

## Installer

* Erasing a disk is now impossible to miss: there's a warning, the disk and everything on it are shown in red, and so is the Erase and Install button.
* The disk step shows what it's doing while it works. The install log is at `~/pulsar-install.log` while the installer runs, the failure page tells you where it is, and a finished install keeps it at `/var/log/pulsar-install.log`.
* The ISO's boot menu is now Pulsar's own.

## Updating

26.11.1 arrives like any other Pulsar update: it downloads in the background and is ready the next time you restart. If you don't want to wait, just run `sudo pulsar update` and restart. If something isn't right, `sudo pulsar rollback` takes you back to your previous build at the next restart.

The full list of changes is on the [releases page](/docs/releases), and if anything breaks, please [open an issue](https://github.com/arclight-digital/pulsar/issues).
