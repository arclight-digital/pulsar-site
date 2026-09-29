// The wallpaper looks, in u_look order, as the OS repo lists them
// (upstream/assets/shaders/looks/looks.json): the picker's look cards and
// the sky all read this one list, so a look added there is a
// look here.
import LOOKS_JSON from '../../upstream/assets/shaders/looks/looks.json';

export const LOOK_NAMES: readonly string[] = LOOKS_JSON.looks;
export const LOOK_LABELS = LOOK_NAMES.map((n) => n[0].toUpperCase() + n.slice(1));
/** the files each shader is assembled from, after its entry file */
export const LOOK_FILES: readonly string[] = LOOKS_JSON.files;
