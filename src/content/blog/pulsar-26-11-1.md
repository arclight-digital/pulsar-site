---
title: "Pulsar 26.11.1: agents you can leave running"
description: Pulsar 26.11.1 keeps coding agents running after you close the terminal, adds a command menu on Super+Space, and copies text straight off the screen.
date: 2026-11-06
release: 26.11.1
banner: Pulsar 26.11.1 is out, with agents you can leave running and a command menu.
card: pulsar agent run claude --tmux work
author: nick
---

Pulsar 26.11.1 is here. Coding agents can now keep working after you close
their terminal, and they tell you when they need you. Super+Space opens a
command menu that also does sums and conversions, and Super+Print copies the
text out of any part of the screen.

Unfortunately, this release wasn't in lockstep with Fedora 45 and GNOME 51.
Those arrived with the November 3 build
([more on that here](/blog/upgrade-to-fedora-45)), while Pulsar's own
release number stayed at 26.10.1. So 26.11.1 is the first Pulsar release on
them, a few days late.

It arrives the way every Pulsar update does: it downloads in the background
and is ready the next time you restart.

## Agents you can leave running

Start an agent in a named session:

```bash
pulsar agent run claude --tmux work
```

Close the window and the agent keeps going. Run the same command again, from
any terminal, to get back to it. With Claude Code, you're back in the same
conversation. These sessions run on a tmux server of their own, set up for
agents and kept apart from any tmux you use yourself. tmux is part of the
image now.

- When an agent in a session you aren't looking at finishes or needs an
  answer, you get a notification. Its Open button takes you straight to that
  session.
- Add `--worktree` and the session gets its own git worktree and branch, so
  several agents can work in one project without touching each other's
  files. This works in the sandbox too.
- `pulsar agent undo work` puts a project's files back the way they were
  when the session started, as long as the project is a git repository.
  `pulsar agent undo work --redo` takes the undo back. Undo never touches
  files git ignores, and never moves a branch.
- `pulsar agent sessions` lists your sessions and what each one is doing.
  `pulsar agent usage work` shows how many tokens a Claude Code session has
  used.
- Pulsar Settings has a new Agents page with every session, its folder and
  its usage, and buttons to open, undo or end it.

## A command menu

If you've used Spotlight on a Mac, or Raycast, you'll recognize this one,
because I borrowed the idea wholesale. Super+Space opens a search over what
Pulsar does: copying text off the screen, themes, updates, agent sessions, a
health check, a checkpoint before a risky change, and asking your agent.

If you use one keyboard layout, Super+Space switches layouts with nothing
to switch to, so the menu takes it. Add a second layout later
and Shift+Super+Space still switches between them. If you already use
several layouts, the menu goes on Super+/ instead.

The menu also answers questions. Type any of these and press Enter to copy
the answer:

- a sum: `2^10`, `15% of 80`
- a conversion: `5 mi in km`, `100 f in c`, `2 GiB in MB`, `255 in hex`
- money: `100 usd in eur`
- a date: `in 90 days`, `days until dec 25`

Exchange rates are the European Central Bank's. The menu fetches them from
frankfurter.dev only when you type a currency conversion, and keeps them for
12 hours.

## Copy text and QR codes off the screen

Press Super+Print, pick an area, and the text in it is on your clipboard.
Text recognition is English only for now. `pulsar screen qr` reads a QR code
the same way, and if the code holds a link, you can open it from the
notification.

Pulsar offers both shortcuts once. If your account already uses those keys
for something else, they're left alone, and you can change either one in
Settings > Keyboard.

## Gaming

- When a game hits a GPU fault on NVIDIA, a notification now names the game
  and what to try. Before, the game just froze or disappeared. If it keeps
  happening, turning off DLSS or frame generation usually fixes it.
  `pulsar doctor gpu-faults` lists the faults since you last started your
  computer.
- Faugus games now use Pulsar's own `gamescale`, the same as Steam games. A
  game with `gamescale` in its launch arguments no longer hangs on its
  splash screen.
- On NVIDIA, Steam's window comes back if it stops redrawing after your
  computer wakes from sleep. 26.10.1 was supposed to fix this, but the fix
  never actually ran. Now it does, and Steam running in the background is
  no longer mistaken for stuck.
- When the NVIDIA driver for Flatpak apps updates, Pulsar now waits until no
  app is using it, instead of replacing it under a running Steam or Discord.

## Desktop

- Glass now stays closer to your theme's own color. A bright wallpaper or
  page behind a menu, the top bar or a window still shows through as shape
  and color, but no longer makes the glass much lighter than the theme.
- Pulsar uses the Linux kernel's own scheduler by default again. The one
  Pulsar shipped before kept GNOME Shell on the efficiency cores of hybrid
  Intel CPUs, which made animations stutter. You can still turn it on with
  `scx.service`.
- Opening a file in a Flatpak app no longer hangs when the document portal,
  the service that hands files to Flatpak apps, locks up. Pulsar restarts it
  within a minute and offers to reopen the apps that lost their connection
  to it.
- The welcome app opens on a new account's first login again. On Fedora 45
  it never did. And after an update to a new Pulsar release, a notification
  now offers to show you what's new in it, in the Welcome to Pulsar app.

## Installer

- Erasing a disk is now impossible to miss: a warning, the disk and what's on
  it shown in red, and a red Erase and Install button.
- The disk step shows what it's doing while it works, and every install
  keeps a log at `~/pulsar-install.log`. If an install fails, the failure
  page tells you where it is.
- The installer's boot menu is now Pulsar's own.

## Updating

Don't want to wait for the background download? Run this and restart:

```bash
sudo pulsar update
```

If something isn't right, this takes you back to your previous build at the
next restart:

```bash
sudo pulsar rollback
```

---

The full release notes are on the [releases page](/docs/releases). If
anything breaks or looks off,
[open an issue](https://github.com/arclight-digital/pulsar/issues) and let
me know.
