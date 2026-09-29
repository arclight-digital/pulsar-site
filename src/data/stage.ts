// The Get Pulsar stage over each theme's picture: how far the picture is
// dimmed (dark: brightness; light: brightness after a 0.82 contrast) and how
// strongly the theme's panel color is laid over it. Pulsar's own and any
// theme not listed use the stage's defaults (GetPulsar.astro: dark 0.85 /
// light 1.1, tint 0.48). The rest are set from a WCAG sweep of every theme
// and mode: the stage's text holds 4.5:1 (3:1 for the headings) against the
// picture behind every line, measured on the rendered page.
export type Stage = { dim?: number; tint?: number };

export const STAGE: Record<string, { dark?: Stage; light?: Stage }> = {
  // Satin's bright orange folds sat behind the file line: 4.26:1 and the
  // links 3.98:1 at the defaults
  gruvbox: { dark: { dim: 0.75, tint: 0.5 } },
};

export const stageVars = (slug: string, mode: 'dark' | 'light'): string[] => {
  const s = STAGE[slug]?.[mode];
  return [
    ...(s?.dim !== undefined ? [`--stage-dim: ${s.dim}`] : []),
    ...(s?.tint !== undefined ? [`--stage-tint: ${s.tint}`] : []),
  ];
};
