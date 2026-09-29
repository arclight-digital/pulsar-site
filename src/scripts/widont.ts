// Widont: the last three words of a paragraph, list item or caption are joined
// by no-break spaces, so a last line never carries one or two words alone.
// CSS's text-wrap: pretty does something like this in Chromium, but Firefox
// and Safari ignore it, and there the lede that wraps to "date." on a line of
// its own is the common case. Runs once over the rendered page; text inside
// code is left alone. When three words would make too long an unbreakable
// run, it joins two, and when even two would, it leaves the line free.
const TARGETS = 'main p, main li, main dd, main figcaption, footer p';
const MAX_TAIL = 32; // characters a joined tail may run to
const NBSP = ' ';

export function initWidont(): void {
  for (const el of document.querySelectorAll<HTMLElement>(TARGETS)) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let last: Text | null = null;
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if ((n.textContent ?? '').trim() && !n.parentElement?.closest('code, pre, kbd')) last = n as Text;
    }
    if (!last) continue;
    const text = last.textContent ?? '';
    // HTML collapses whitespace anyway, so newlines and indentation from the
    // source become single spaces here without changing what renders
    const words = text.trimEnd().split(/\s+/);
    const trailing = text.slice(text.trimEnd().length);
    for (const count of [3, 2]) {
      if (words.length < count) continue;
      const tail = words.slice(-count).join(NBSP);
      if (tail.length > MAX_TAIL) continue;
      last.textContent = [...words.slice(0, -count), tail].join(' ') + trailing;
      break;
    }
  }
}
