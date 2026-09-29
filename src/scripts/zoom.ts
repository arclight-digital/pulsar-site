// A desktop screenshot marked data-zoom opens ARC's lightbox (2x zoom,
// drag to pan, Escape to close) at its full 3200x2000, in a gallery of every
// theme's desktop in both modes -- read off the theme tiles every page
// carries, so the gallery is whatever the site ships. A picture that is not
// one of those opens on its own.
import { hiRes } from '../data/shots';
import { detailOf } from './themes';

type Shot = { src: string; alt: string; caption: string };

function gallery(): Shot[] {
  const seen = new Set<string>();
  const out: Shot[] = [];
  for (const tile of document.querySelectorAll<HTMLElement>('[data-theme-tile]')) {
    const d = detailOf(tile);
    for (const mode of ['dark', 'light'] as const) {
      const desk = d[mode]?.desktop;
      // a single-mode theme names the same picture for both
      if (!desk || seen.has(desk)) continue;
      seen.add(desk);
      out.push({
        src: hiRes(desk),
        alt: `The Pulsar desktop in the ${d.name} theme, ${mode}`,
        caption: `${d.name} · ${mode === 'dark' ? 'Dark' : 'Light'}`,
      });
    }
  }
  return out;
}

export function initZoom(): void {
  const shots = document.querySelectorAll<HTMLImageElement>('img[data-zoom]');
  if (!shots.length) return;
  const box = document.createElement('arc-lightbox') as HTMLElement & { images: Shot[]; index: number; open: boolean };
  document.body.append(box);
  const open = (img: HTMLImageElement) => {
    const src = hiRes(img.getAttribute('src') ?? '');
    const list = gallery();
    let at = list.findIndex((s) => s.src === src);
    if (at < 0) {
      list.unshift({ src, alt: img.alt, caption: '' });
      at = 0;
    }
    box.images = list;
    box.index = at;
    box.open = true;
  };
  for (const img of shots) {
    // a picture that opens something is a control: reachable and nameable
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-haspopup', 'dialog');
    img.title = 'Zoom';
    img.addEventListener('click', () => open(img));
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(img);
      }
    });
  }
}
