/**
 * Illustration palette — a documented, deliberately small extension of the design tokens.
 *
 * The brand tokens live in `src/app/globals.css` and are never redefined here:
 * primary #1D5B4F · primary-strong #14453C · primary-soft #E7F0ED · accent #A84E1C
 * accent-soft #FBEEE6 · ink #12181F · paper #FBFAF7 · white #FFFFFF.
 *
 * Six secondary hues maximum (audited in docs/IMAGES.md), all near-neighbours of the brand:
 * mist, sage, clay, sand, slate, ochre. The extra constants below are *tints* of those six
 * hues (lighter mixes with paper), not new hues. They give layered depth without gradients.
 *
 * These values are literal on purpose: an illustration must stay self-contained in a
 * plain `.svg` export (no CSS variables, no external references).
 */
export const PALETTE = {
  /* Tokens */
  ink: "#12181F",
  inkSoft: "#3D4650",
  paper: "#FBFAF7",
  white: "#FFFFFF",
  primary: "#1D5B4F",
  primaryStrong: "#14453C",
  primarySoft: "#E7F0ED",
  accent: "#A84E1C",
  accentSoft: "#FBEEE6",

  /* Secondary hues (6) */
  mist: "#E6EEEA",
  sage: "#A9C2B6",
  clay: "#C97B4E",
  sand: "#F1E6D6",
  slate: "#4B5A64",
  ochre: "#D9A441",

  /* Tints of the six secondary hues — depth only, no new hues */
  mistPale: "#F1F5F2",
  mistDeep: "#D5E3DC",
  sagePale: "#C4D6CB",
  sageDeep: "#7F9E8D",
  clayPale: "#E8CEB6",
  clayDeep: "#A9613B",
  sandPale: "#F7F1E7",
  sandDeep: "#E2D3BE",
  slatePale: "#93A3AC",
  ochrePale: "#F0DDB8",
} as const;

/** A terrain family drives the region-scene geometry; the palette stays inside PALETTE. */
export type Terrain = "urbain" | "fleuve" | "lac" | "foret" | "montagne" | "cote" | "nord";
