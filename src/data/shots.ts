// Every desktop screenshot is published twice: the page size
// (desktop-dark.webp, 1600x1000) and the full render (desktop-dark@2x.webp,
// 3200x2000) for high-density screens and the zoom. The theme harness lays
// the desktop out at 2560x1600 and draws it at 1.25x, so the full render is
// what the Shell actually drew, not an upscale.
export const hiRes = (src: string) => src.replace(/\.webp$/, '@2x.webp');
export const shotSrcset = (src: string) => `${src} 1600w, ${hiRes(src)} 3200w`;
