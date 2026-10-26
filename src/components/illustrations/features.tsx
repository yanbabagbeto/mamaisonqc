import type { ComponentType, ReactNode } from "react";

import { PALETTE } from "./palette";
import type { IllustrationProps } from "./types";
import { illustrationA11y } from "./types";

/**
 * Six feature illustrations, each a flat 160×160 medallion that reads at 48 px.
 *
 * Every one is original and text-free: the label comes from the page (bilingual product),
 * so the drawing only has to carry the metaphor. Alternate medallion tints (primary-soft /
 * accent-soft) keep a row of six cards from looking monotonous.
 *
 * Usage:
 *   <FeatureIllustration kind="vendre" className="size-14" />
 *   <FeatureVendre className="h-16 w-16" />
 */

export type FeatureKind =
  | "vendre"
  | "acheter"
  | "financement"
  | "hypotheque"
  | "assurance"
  | "renovation";

/** Suggested French alt text when a slot does need a labelled image. */
const FEATURE_TITLES: Record<FeatureKind, string> = {
  vendre: "Clés remises au nouveau propriétaire",
  acheter: "Une maison et un cœur",
  financement: "Certificat de financement",
  hypotheque: "Taux hypothécaire",
  assurance: "Bouclier d'assurance",
  renovation: "Rouleau de peinture",
};

const { white, paper, primary, primaryStrong, primarySoft, accent, accentSoft, inkSoft } = PALETTE;

function Frame({
  tint,
  title,
  width = 160,
  height = 160,
  className,
  children,
  ...rest
}: IllustrationProps & { tint: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 160 160"
      width={width}
      height={height}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...illustrationA11y(title)}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <circle cx="80" cy="80" r="76" fill={tint} />
      {children}
    </svg>
  );
}

/** vendre — a heavy ring key with a warm tag. */
export function FeatureVendre(props: IllustrationProps) {
  return (
    <Frame tint={accentSoft} {...props}>
      <g stroke={primary} strokeWidth="9" strokeLinecap="round" fill="none">
        <circle cx="63" cy="63" r="19" />
        <path d="M76 76l42 42" />
        <path d="M104 104l10-10" />
        <path d="M116 116l10-10" />
      </g>
      <circle cx="117" cy="43" r="12" fill={accent} />
      <circle cx="117" cy="43" r="4.5" fill={accentSoft} />
    </Frame>
  );
}

/** acheter — a house that holds a heart. */
export function FeatureAcheter(props: IllustrationProps) {
  return (
    <Frame tint={primarySoft} {...props}>
      <g stroke={primary} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M46 88l34-28 34 28" />
        <path d="M55 84v38h50V84" />
      </g>
      <path
        d="M80 111c-9-6-15-11-15-17a7.5 7.5 0 0 1 15-2.6A7.5 7.5 0 0 1 95 94c0 6-6 11-15 17Z"
        fill={accent}
      />
    </Frame>
  );
}

/** financement — a certificate with a wax seal, tilted a touch. */
export function FeatureFinancement(props: IllustrationProps) {
  return (
    <Frame tint={primarySoft} {...props}>
      <path d="M95 116l-4 16M109 116l4 16" stroke={accent} strokeWidth="6" strokeLinecap="round" />
      <g transform="rotate(-4 80 78)">
        <rect x="40" y="44" width="80" height="60" rx="7" fill={white} stroke={primary} strokeWidth="6" />
        <rect x="54" y="59" width="38" height="6" rx="3" fill={inkSoft} />
        <rect x="54" y="73" width="52" height="6" rx="3" fill={PALETTE.sage} />
        <rect x="54" y="87" width="30" height="6" rx="3" fill={PALETTE.sandDeep} />
      </g>
      <circle cx="102" cy="104" r="17" fill={accent} />
      <path d="M95 104l5 5 9-10" stroke={paper} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  );
}

/** hypothèque — the percent sign plus a falling-rate badge. */
export function FeatureHypotheque(props: IllustrationProps) {
  return (
    <Frame tint={accentSoft} {...props}>
      <g stroke={primary} strokeWidth="9" strokeLinecap="round" fill="none">
        <circle cx="63" cy="66" r="13" />
        <circle cx="97" cy="97" r="13" />
        <path d="M103 57L57 103" />
      </g>
      <circle cx="120" cy="42" r="13" fill={primary} />
      <path d="M120 35v11m0 0l-4.5-4.5M120 46l4.5-4.5" stroke={white} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  );
}

/** assurance — a shield protecting a small house. */
export function FeatureAssurance(props: IllustrationProps) {
  return (
    <Frame tint={primarySoft} {...props}>
      <path
        d="M80 38l38 14v28c0 25-16 40-38 48-22-8-38-23-38-48V52Z"
        fill={primary}
      />
      <g stroke={paper} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M62 88l18-15 18 15" />
        <path d="M66 86v18h28V86" />
      </g>
    </Frame>
  );
}

/** rénovation — a paint roller and one fresh warm stroke. */
export function FeatureRenovation(props: IllustrationProps) {
  return (
    <Frame tint={accentSoft} {...props}>
      <g transform="rotate(-14 80 74)">
        <rect x="44" y="42" width="62" height="28" rx="8" fill={primary} />
        <rect x="52" y="49" width="46" height="5" rx="2.5" fill={primarySoft} />
        <rect x="104" y="48" width="8" height="16" rx="4" fill={primaryStrong} />
        <path d="M79 70v14h18" stroke={primary} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="93" y="78" width="18" height="12" rx="6" fill={primary} />
      </g>
      <path
        d="M50 108c9-9 19-9 27 0s19 9 27 0"
        stroke={accent}
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
    </Frame>
  );
}

const FEATURES: Record<FeatureKind, ComponentType<IllustrationProps>> = {
  vendre: FeatureVendre,
  acheter: FeatureAcheter,
  financement: FeatureFinancement,
  hypotheque: FeatureHypotheque,
  assurance: FeatureAssurance,
  renovation: FeatureRenovation,
};

/**
 * One entry point for a card grid: `<FeatureIllustration kind="…" />`.
 * Decorative by default (the card heading beside it carries the meaning). Pass `title` only
 * when the illustration is the sole content of its slot; `FEATURE_TITLES` has suggested copy.
 */
export function FeatureIllustration({
  kind,
  ...props
}: IllustrationProps & { kind: FeatureKind }) {
  const Component = FEATURES[kind];
  return <Component {...props} />;
}

export { FEATURE_TITLES };
