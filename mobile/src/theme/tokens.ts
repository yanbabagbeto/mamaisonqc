/**
 * MaMaisonQC design tokens — the native mirror of the web tokens
 * (`src/app/globals.css`: primary #1D5B4F, paper #FBFAF7, ink #12181F).
 *
 * The app is deliberately light-only for v1: the web tokens ship light and dark, the native
 * surface starts with light. Adding a dark scheme later means adding a second palette object and
 * reading it from a provider — no component hardcodes a colour.
 *
 * Touch targets: every interactive element must be at least `layout.touch` (44 pt) tall
 * (Apple HIG) — the primitives in `src/components/ui.tsx` enforce it.
 */

export const colors = {
  /** Brand green: headers, primary buttons, active tabs. */
  primary: "#1D5B4F",
  primaryDeep: "#143F37",
  primarySoft: "#E7F0EC",
  /** Warm paper background. */
  paper: "#FBFAF7",
  /** Card / sheet surface. */
  surface: "#FFFFFF",
  /** Body ink. */
  ink: "#12181F",
  inkMuted: "#5A6472",
  inkSubtle: "#7C8592",
  /** Hairlines and dividers. */
  line: "#E5E1D8",
  lineStrong: "#D3CEC2",
  /** Warm accent used for highlights, never as the only status signal. */
  accent: "#A84E1C",
  accentSoft: "#F7E9E1",
  success: "#1D6B4F",
  successSoft: "#E5F2EC",
  warning: "#8A5A00",
  warningSoft: "#FBF1DC",
  danger: "#9B2C2C",
  dangerSoft: "#F9E7E7",
  white: "#FFFFFF",
  overlay: "rgba(18, 24, 31, 0.05)",
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
  huge: 56,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const fontSize = {
  hero: 32,
  display: 26,
  title: 21,
  section: 17,
  body: 16,
  bodySmall: 15,
  caption: 13,
  tiny: 11,
} as const;

export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

export const lineHeight = {
  tight: 1.2,
  normal: 1.45,
  relaxed: 1.6,
} as const;

export const layout = {
  /** Minimum tappable size in points (44 pt / 48 dp). */
  touch: 44,
  /** Screen gutter. */
  gutter: 20,
  /** Content stops growing at this width and centres on tablets. */
  maxContentWidth: 680,
  /** Small phones (375 px) must never scroll horizontally. */
  minPhoneWidth: 375,
} as const;

export const radiiCard = radii.lg;

export const shadow = {
  card: {
    shadowColor: colors.ink,
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  floating: {
    shadowColor: colors.ink,
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
} as const;

export const theme = {
  colors,
  spacing,
  radii,
  fontSize,
  fontWeight,
  lineHeight,
  layout,
  shadow,
} as const;

export type Theme = typeof theme;
