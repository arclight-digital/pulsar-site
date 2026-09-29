// A theme picture's URL with its content version: /assets/themes/x.webp?v=<hash>.
// stage-assets.mjs hashes every file under public/assets/themes into
// asset-versions.json; the headers let browsers keep those URLs for a year,
// so a picture replaced in place must arrive under a new one. A path with no
// version is returned as it is (the build fails first, in themes.ts).
import VERSIONS from './asset-versions.json';

const V = VERSIONS as Record<string, string>;

export const unversioned = (url: string) => url.split('?')[0];

export const hasVersion = (path: string) => unversioned(path) in V;

export const versioned = (path: string) => {
  const p = unversioned(path);
  return V[p] ? `${p}?v=${V[p]}` : p;
};
