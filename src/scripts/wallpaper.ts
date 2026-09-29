// There is no wallpaper choice apart from the theme any more: the hero is the
// live sky in one of four looks, recolored by the site theme the way the OS
// recolors it (src/scripts/sky.ts). A theme's rendered still never stands in
// for it. This only retires what an earlier build remembered -- a visitor who
// picked a theme's still then gets the live sky now.
const KEY = 'pulsar-site-wall';

export function initWallpaper(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing stored, or no storage */
  }
}
