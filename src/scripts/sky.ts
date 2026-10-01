// The hero background: the OS's own wallpaper shaders, running live in WebGL1.
//
// Pulsar (and Pulsar Holo) wear upstream/assets/shaders/pulsar.frag -- the
// shader that renders Pulsar's wallpapers -- in its brand colors. Every other
// theme wears upstream/assets/shaders/theme.frag, the shader that renders
// THAT theme's wallpapers, with exactly the uniforms the wallpaper pipeline
// hands it (upstream/theme-uniforms.json, exported by the OS repo's
// scripts/render-theme-wallpapers.py --uniforms in the same change that
// adds a theme here -- src/data/themes.ts fails the build on a theme the
// file lacks, so no theme waits on a nightly for its sky): the theme's own render
// table for a look where it has one, the pipeline's defaults where it does
// not. So each of the four looks is recolored by the site's theme the way the
// OS recolors it, and the hero at any frame is that wallpaper, moving.
//
// Both sources are compiled into this bundle from the repo's assets/ rather
// than fetched at runtime: the page and the OS cannot show different skies,
// and the hero never waits on a second request.
//
// Falls back to the page's CSS ground -- the CI-rendered nebula still -- when
// WebGL is missing. prefers-reduced-motion gets still frames that redraw only
// when a control is used.
import pulsarEntry from '../../upstream/assets/shaders/pulsar.frag?raw';
import themeEntry from '../../upstream/assets/shaders/theme.frag?raw';
import { LOOK_FILES, LOOK_NAMES } from '../data/looks';
import THEME_UNIFORMS from '../../upstream/theme-uniforms.json';
import { currentLook, effectiveTheme, handleLookSwitch, onStateChange, setLook, type Look } from './theme';
import { storedTheme } from './sitetheme';

type Value = number | number[];
type Uniforms = Record<string, Value>;
type Entry = {
  shader: 'pulsar' | 'theme';
  variants: Partial<Record<'dark' | 'light', { primary: string; looks?: Record<string, Uniforms> }>>;
};
const TABLE = THEME_UNIFORMS as unknown as Record<string, Entry>;
// Each shader is its entry file then every look file, in looks.json's order --
// exactly as the OS renderers assemble it (scripts/render-*wallpapers.py).
const LOOK_SOURCES = import.meta.glob('../../upstream/assets/shaders/looks/*.glsl', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;
const looksSource = LOOK_FILES.map((n) => {
  const src = LOOK_SOURCES[`../../upstream/assets/shaders/looks/${n}.glsl`];
  if (src === undefined) throw new Error(`no look file ${n}.glsl in upstream/`);
  return src;
}).join('\n');
const pulsarSource = `${pulsarEntry}\n${looksSource}`;
const themeSource = `${themeEntry}\n${looksSource}`;

// What the sky draws: Pulsar's shader at a look, or theme.frag with one of
// the pipeline's uniform sets. `key` changes exactly when the picture does
// (not with time), which is when the outgoing frame dissolves.
type Spec = { kind: 'pulsar'; key: string } | { kind: 'theme'; key: string; u: Uniforms };

// The picture for a theme, mode and look: its recolor of that look.
function resolve(slug: string, mode: 'dark' | 'light', look: number): Spec {
  const entry = TABLE[slug];
  if (!entry || entry.shader === 'pulsar') return { kind: 'pulsar', key: `pulsar/${look}` };
  const v = entry.variants[mode] ?? entry.variants.dark ?? entry.variants.light;
  if (!v?.looks) return { kind: 'pulsar', key: `pulsar/${look}` };
  const name = LOOK_NAMES[look] ?? v.primary;
  const u = v.looks[name] ?? v.looks[v.primary];
  return { kind: 'theme', key: `${slug}/${mode}/${name}`, u };
}

// The look a theme's own wallpaper uses (its first wallpaper for the mode, as
// the pipeline renders it): picking the theme switches the sky to it.
function preferredLook(slug: string, mode: 'dark' | 'light'): Look | null {
  const entry = TABLE[slug];
  const v = entry?.variants[mode] ?? entry?.variants.dark ?? entry?.variants.light;
  const at = v ? LOOK_NAMES.indexOf(v.primary) : -1;
  return at >= 0 ? at : null;
}

function compile(gl: WebGLRenderingContext, type: GLenum, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('could not create shader');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? 'shader compile failed');
  }
  return shader;
}

// Everything the GPU holds for the sky: the program, the triangle and the
// A compiled shader and its uniform locations, looked up on first use. Built
// once, and again after a lost context comes back, since a restored context
// starts with none of it.
type Prog = { program: WebGLProgram; loc: (name: string) => WebGLUniformLocation | null };
type Sky = { pulsar: Prog; theme: Prog; buffer: WebGLBuffer; thumb: WebGLFramebuffer | null };

// the picker's look previews (ThemePicker.astro), rendered offscreen at this
// size: 2x a card, which is about 125 CSS pixels wide
const THUMB_W = 256;
const THUMB_H = 160;

function program(gl: WebGLRenderingContext, fragment: string): Prog {
  const p = gl.createProgram();
  if (!p) throw new Error('could not create program');
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, 'attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }'));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, `precision highp float;\n${fragment}`));
  gl.bindAttribLocation(p, 0, 'p');
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(p) ?? 'program link failed');
  }
  const cache = new Map<string, WebGLUniformLocation | null>();
  return {
    program: p,
    loc: (name) => {
      if (!cache.has(name)) cache.set(name, gl.getUniformLocation(p, name));
      return cache.get(name) ?? null;
    },
  };
}

function build(gl: WebGLRenderingContext): Sky {
  const pulsar = program(gl, pulsarSource);
  const theme = program(gl, themeSource);
  // one full-screen triangle; nothing here needs a quad
  const buffer = gl.createBuffer();
  if (!buffer) throw new Error('could not create buffer');
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  // an offscreen target for the previews, so they never touch the hero
  const tex = gl.createTexture();
  const thumb = gl.createFramebuffer();
  if (tex && thumb) {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, THUMB_W, THUMB_H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindFramebuffer(gl.FRAMEBUFFER, thumb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  return { pulsar, theme, buffer, thumb };
}

export function initSky(): void {
  const canvas = document.querySelector<HTMLCanvasElement>('#sky');
  const fade = document.querySelector<HTMLCanvasElement>('#skyfade');
  if (!canvas || !fade) return;

  // preserveDrawingBuffer so a look switch can snapshot the outgoing frame
  const gl = canvas.getContext('webgl', { antialias: false, preserveDrawingBuffer: true });
  if (!gl) return; // the CSS ground is the fallback; the picker still themes the page
  const fadeContext = fade.getContext('2d');

  let sky: Sky;
  try {
    sky = build(gl);
  } catch {
    // A driver that reports a context but cannot compile the shader keeps the
    // CSS ground, exactly like no context at all.
    return;
  }

  // What the sky wears: the site theme's recolor of the chosen look. A theme
  // picked just now (not one remembered from an earlier page, which keeps the
  // visitor's look) switches to the look its own wallpaper uses --
  // after the theme has applied, since a single-mode theme also sets the mode.
  let siteTheme: string = storedTheme() ?? 'pulsar';
  document.addEventListener('pulsar:theme', (e) => {
    siteTheme = (e as CustomEvent<{ slug: string }>).detail.slug;
    requestAnimationFrame(() => {
      const pref = preferredLook(siteTheme, effectiveTheme());
      if (pref !== null) setLook(pref);
    });
  });
  document.addEventListener('pulsar:reset', () => {
    siteTheme = 'pulsar';
  });

  const resize = (): void => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  resize();
  addEventListener('resize', resize);

  // shown values: Pulsar's light/dark crossfades inside its shader (u_theme
  // eases); everything else changes picture and dissolves instead
  let themeShown = effectiveTheme() === 'light' ? 1 : 0;
  let lookShown: number = currentLook();
  const target = (): Spec => resolve(siteTheme, effectiveTheme(), lookShown);
  let spec = target();
  let lastSeconds = 0;

  // one picture, into whatever framebuffer is bound, at w x h
  const paint = (sp: Spec, w: number, h: number, seconds: number, dawn: number, look: number): void => {
    if (sp.kind === 'pulsar') {
      const P = sky.pulsar;
      gl.useProgram(P.program);
      gl.uniform2f(P.loc('u_resolution'), w, h);
      gl.uniform1f(P.loc('u_time'), seconds);
      gl.uniform1f(P.loc('u_theme'), dawn);
      gl.uniform1f(P.loc('u_look'), look);
      // The live sky runs the luminescence at a hint of its wallpaper
      // strength: at full strength nebula's filaments made the hero text hard
      // to read.
      gl.uniform1f(P.loc('u_live'), 1);
      gl.uniform1f(P.loc('u_palette_on'), 0);
    } else {
      const T = sky.theme;
      gl.useProgram(T.program);
      gl.uniform2f(T.loc('u_resolution'), w, h);
      for (const [name, value] of Object.entries(sp.u)) {
        const l = T.loc(name);
        if (!l) continue;
        // the pipeline's own time for the still, plus the live clock
        if (name === 'u_time') gl.uniform1f(l, (value as number) + seconds);
        else if (Array.isArray(value)) (value.length === 2 ? gl.uniform2fv : gl.uniform3fv).call(gl, l, value);
        else gl.uniform1f(l, value);
      }
      // the looks since the first four move live (drift, sweep, twinkle)
      gl.uniform1f(T.loc('u_live'), 1);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const draw = (seconds: number): void => {
    lastSeconds = seconds;
    // Pulsar's light/dark eases only in the loop. With the loop paused (the
    // hero scrolled away, as it is when someone is looking at the install
    // stage) a redraw would show the ease wherever it stopped: picking Pulsar
    // after Alucard, a light-only theme, painted Pulsar light on a dark page.
    if (!running) themeShown = effectiveTheme() === 'light' ? 1 : 0;
    paint(spec, canvas.width, canvas.height, seconds, themeShown, lookShown);
  };

  // ---- the picker's look previews -------------------------------------------
  // Each look, rendered once per theme or mode (not per frame) into an
  // offscreen target, read back and handed to its card's <img>. Only while
  // the picker is open (nobody sees them otherwise), and one look per frame:
  // each is a GPU readback, and eight in one go stalled the page right after
  // a theme change.
  let thumbsFor = '';
  let thumbsJob = 0;
  const pickerOpen = (): boolean =>
    !!document.querySelector<HTMLElement & { open?: boolean }>('[data-picker]')?.open;
  const thumbs = (): void => {
    const cards = document.querySelectorAll<HTMLCanvasElement>('canvas[data-look-thumb]');
    const mode = effectiveTheme();
    const key = `${siteTheme}/${mode}`;
    if (lost || !sky.thumb || !cards.length || key === thumbsFor) return;
    thumbsFor = key;
    const job = ++thumbsJob;
    const pixels = new Uint8Array(THUMB_W * THUMB_H * 4);
    const image = new ImageData(THUMB_W, THUMB_H);
    const row = THUMB_W * 4;
    // straight into each card's canvas: no JPEG, no blob, no decode -- the
    // old image path took one to two seconds for the eight
    const one = (look: number): void => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, sky.thumb);
      gl.viewport(0, 0, THUMB_W, THUMB_H);
      paint(resolve(siteTheme, mode, look), THUMB_W, THUMB_H, lastSeconds, mode === 'light' ? 1 : 0, look);
      gl.readPixels(0, 0, THUMB_W, THUMB_H, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      // GL's rows run bottom-up
      for (let y = 0; y < THUMB_H; y++) image.data.set(pixels.subarray((THUMB_H - 1 - y) * row, (THUMB_H - y) * row), y * row);
      for (const c of document.querySelectorAll<HTMLCanvasElement>(`canvas[data-look-thumb="${look}"]`)) {
        c.getContext('2d')?.putImageData(image, 0, 0);
        c.hidden = false;
      }
    };
    // four a frame: the whole set in two frames, never a long stall
    const batch = (from: number): void => {
      if (job !== thumbsJob || lost) return;
      for (let look = from; look < Math.min(from + 4, LOOK_NAMES.length); look++) one(look);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (from + 4 < LOOK_NAMES.length) requestAnimationFrame(() => batch(from + 4));
    };
    batch(0);
  };

  // ---- the install section's stage wears this sky too ----------------------
  // Drawn straight into the stage's own canvas (preserveDrawingBuffer keeps
  // the last frame): a GPU copy, no image to encode or decode, so the stage
  // follows a change on the next frame: at once when the picture itself
  // changed (another look or theme), and frame by frame while Pulsar eases
  // between light and dark inside the shader. At most 1280 wide: the stage
  // never shows more.
  let stageFrame = 0;
  const stages = () => document.querySelectorAll<HTMLCanvasElement>('canvas[data-stage-sky]');
  const takeStage = (): void => {
    if (pickerOpen()) thumbs();
    if (lost || !stages().length) return;
    if (!running) draw(lastSeconds);
    const w = Math.min(1280, canvas.width);
    const h = Math.round((canvas.height * w) / canvas.width);
    for (const c of stages()) {
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
      }
      c.getContext('2d')?.drawImage(canvas, 0, 0, w, h);
      c.hidden = false;
    }
  };
  const snapshotStage = (now = false): void => {
    cancelAnimationFrame(stageFrame);
    if (now) {
      stageFrame = requestAnimationFrame(() => (stageFrame = requestAnimationFrame(takeStage)));
      return;
    }
    // Pulsar's own light/dark eases in the shader: the stage follows it frame
    // by frame (each copy is a GPU blit) until the ease is done
    const until = performance.now() + 950;
    const follow = (): void => {
      takeStage();
      if (performance.now() < until) stageFrame = requestAnimationFrame(follow);
    };
    stageFrame = requestAnimationFrame(follow);
  };

  // Freeze the outgoing frame on the overlay canvas and let it dissolve over
  // the new picture: for a switch the shader cannot ease (another look, or
  // another theme's uniforms). Pulsar's looks must not ease either: the
  // shader chain-mixes them, so a sweep from holo to nebula marches through
  // satin and leak on the way.
  const dissolve = (): void => {
    if (!fadeContext || !running) return;
    fade.width = canvas.width;
    fade.height = canvas.height;
    fadeContext.drawImage(canvas, 0, 0);
    fade.style.transition = 'none';
    fade.style.opacity = '1';
    requestAnimationFrame(() => {
      fade.style.transition = 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
      fade.style.opacity = '0';
    });
  };
  // a new picture: dissolve to it, redraw if the loop is not running, and
  // retake the stage's still
  let stageMode = effectiveTheme();
  const follow = (): void => {
    const next = target();
    const changed = next.key !== spec.key;
    if (changed) {
      dissolve();
      spec = next;
      if (!running && !lost) draw(lastSeconds);
    }
    const mode = effectiveTheme();
    const flipped = mode !== stageMode;
    stageMode = mode;
    // the picker's previews, at once if it is showing them
    if (pickerOpen()) requestAnimationFrame(thumbs);
    // A new picture is already on the canvas: one copy. Pulsar's own
    // light/dark ease is not yet: follow it. Neither (a second follow() for
    // the same change -- a theme pick runs one for the theme and one for its
    // look): nothing. That case once cancelled the copy and ran the per-frame
    // follow for a second, a full-canvas readback every frame in Firefox.
    // A new picture that also flips Pulsar's mode is both: follow the ease,
    // or the one copy lands two frames into it and the stage stays there.
    if (flipped && spec.kind === 'pulsar' && running) snapshotStage(false);
    else if (changed || flipped) snapshotStage(true);
  };

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // No animation: snap the uniforms and redraw only when something changes.
  // onStateChange covers both controls -- it runs after every reflect -- so
  // there is no crossfade to register.
  const snap = (): void => {
    if (lost) return;
    themeShown = effectiveTheme() === 'light' ? 1 : 0;
    lookShown = currentLook();
    spec = target();
    draw(0);
    snapshotStage(true);
  };

  // ---- the animated loop, and when it may run ------------------------------
  // It runs only while the hero is on screen and the tab is showing: scrolled
  // past, the sky was still drawing a full-screen shader sixty times a second
  // for nobody. Paused time is taken out of the clock, so the sky picks up
  // where it stopped instead of jumping ahead.
  let onScreen = true;
  let lost = false;
  let running = false;
  let frame = 0;
  let pausedAt = 0;
  let pausedFor = 0;

  const loop = (ms: number): void => {
    const goal = effectiveTheme() === 'light' ? 1 : 0;
    themeShown += (goal - themeShown) * 0.08;
    if (Math.abs(goal - themeShown) < 0.002) themeShown = goal;
    // theme.frag's light and dark are two uniform sets: a mode flip there is
    // a new picture, and dissolves
    if (target().key !== spec.key) follow();
    draw((ms - pausedFor) / 1000);
    if (running) frame = requestAnimationFrame(loop);
  };
  const sync = (): void => {
    if (reduced) return;
    const should = onScreen && !lost && document.visibilityState === 'visible';
    if (should && !running) {
      running = true;
      if (pausedAt) pausedFor += performance.now() - pausedAt;
      frame = requestAnimationFrame(loop);
    } else if (!should && running) {
      running = false;
      cancelAnimationFrame(frame);
      pausedAt = performance.now();
    }
  };
  new IntersectionObserver((entries) => {
    onScreen = entries.some((e) => e.isIntersecting);
    sync();
  }).observe(canvas);
  document.addEventListener('visibilitychange', sync);

  // ---- a lost GPU context ---------------------------------------------------
  // The browser can take the context away (a driver reset, too many contexts,
  // a backgrounded tab on a phone). preventDefault is what allows it to come
  // back; until it does, the canvas steps aside for the CSS ground under it
  // (the rendered still).
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    lost = true;
    sync();
    canvas.style.visibility = 'hidden';
  });
  canvas.addEventListener('webglcontextrestored', () => {
    try {
      sky = build(gl);
    } catch {
      return; // stays on the CSS ground
    }
    lost = false;
    thumbsFor = '';
    resize();
    canvas.style.visibility = '';
    if (reduced) snap();
    else sync();
  });

  // The previews draw when the picker opens. A theme change only redraws
  // them while they are showing, so until the first change after load the
  // eight cards stayed empty.
  document.querySelector('[data-picker]')?.addEventListener('arc-open', () => requestAnimationFrame(thumbs));

  if (reduced) {
    snap();
    onStateChange(snap);
    addEventListener('resize', snap);
    for (const ev of ['pulsar:theme', 'pulsar:reset'])
      document.addEventListener(ev, () => requestAnimationFrame(snap));
    return;
  }

  // Every change of picture dissolves from the outgoing frame (see dissolve).
  handleLookSwitch((next) => {
    lookShown = next;
    follow();
  });
  for (const ev of ['pulsar:theme', 'pulsar:reset'])
    document.addEventListener(ev, () => requestAnimationFrame(follow));
  // The bar's light/dark toggle picks no theme and no look: without this the
  // stage kept the mode it had, Pulsar's always (its picture does not change
  // with the mode) and any theme's while the hero was off screen.
  onStateChange(follow);

  sync();
  snapshotStage();
}
