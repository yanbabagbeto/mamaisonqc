import type { ReactElement, ReactNode } from "react";

import { PALETTE } from "./palette";
import type { IllustrationProps } from "./types";
import { illustrationA11y } from "./types";

/**
 * Four empty-state illustrations, 240×180, drawn in the same flat vocabulary as the rest.
 *
 * Empty states are designed, not left to a bare sentence: each one names the exact reason
 * (no match, nothing listed, data missing, no interest yet) without any baked-in copy.
 *
 * Usage:
 *   <EmptyStateIllustration kind="no-results" className="h-32 w-auto" />
 */
export type EmptyStateKind = "no-results" | "no-listings" | "no-data" | "no-interest";

/** Suggested French alt text when an empty state needs a labelled image. */
export const EMPTY_STATE_LABELS: Record<EmptyStateKind, string> = {
  "no-results": "Loupe sans résultat",
  "no-listings": "Terrain vide avec panneau",
  "no-data": "Graphique interrompu, données manquantes",
  "no-interest": "Boîte de réception vide",
};

const {
  white,
  primary,
  primarySoft,
  accent,
  accentSoft,
  mist,
  mistPale,
  mistDeep,
  sage,
  sagePale,
  clay,
  clayDeep,
  sandPale,
  sandDeep,
  ochre,
} = PALETTE;

function Frame({
  children,
  title,
  width = 240,
  height = 180,
  className,
  ...rest
}: IllustrationProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 240 180"
      width={width}
      height={height}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...illustrationA11y(title)}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <ellipse cx="120" cy="152" rx="82" ry="14" fill={mistPale} />
      {children}
    </svg>
  );
}

/** aucun résultat — a magnifier over an empty, dashed lens. */
export function EmptyNoResults(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <circle cx="120" cy="104" r="64" fill={white} />
      <circle cx="120" cy="104" r="64" fill={mist} opacity="0.55" />
      <circle cx="108" cy="88" r="36" fill={white} stroke={primary} strokeWidth="9" />
      <path d="M134 116l26 26" stroke={primary} strokeWidth="12" strokeLinecap="round" />
      <circle cx="108" cy="88" r="21" stroke={sage} strokeWidth="3" strokeDasharray="5 6" />
      {[
        [100, 88],
        [108, 88],
        [116, 88],
      ].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="2.6" fill={sage} />
      ))}
      <path d="M176 52l2.5 7 7 2.5-7 2.5-2.5 7-2.5-7-7-2.5 7-2.5Z" fill={PALETTE.ochre} opacity="0.8" />
      <circle cx="58" cy="56" r="5" fill={accentSoft} />
      <circle cx="188" cy="130" r="4" fill={primarySoft} />
    </Frame>
  );
}

/** aucune annonce — a surveyed vacant lot with a blank board. */
export function EmptyNoListings(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <path d="M0 128c48-8 92 2 140-3 38-4 70 3 100-1v56H0Z" fill={sandPale} />
      <ellipse
        cx="120"
        cy="138"
        rx="70"
        ry="17"
        stroke={clayDeep}
        strokeWidth="3"
        strokeDasharray="8 7"
        fill="none"
        opacity="0.7"
      />
      <rect x="119" y="58" width="6" height="72" rx="2" fill={clay} />
      <rect x="84" y="42" width="76" height="34" rx="5" fill={white} stroke={primary} strokeWidth="4" />
      <rect x="94" y="54" width="30" height="5" rx="2.5" fill={sandDeep} />
      <rect x="94" y="64" width="46" height="5" rx="2.5" fill={sandDeep} />
      <circle cx="190" cy="102" r="20" fill={sage} />
      <circle cx="182" cy="94" r="11" fill={sagePale} />
      <rect x="188" y="116" width="5" height="18" rx="2" fill={clay} />
      <circle cx="52" cy="138" r="9" fill={sagePale} />
      <path d="M58 146l6-14" stroke={primary} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <circle cx="206" cy="54" r="4" fill={accentSoft} />
    </Frame>
  );
}

/** données indisponibles — a chart that stops mid-line. */
export function EmptyNoData(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <rect x="48" y="34" width="144" height="104" rx="14" fill={white} stroke={mistDeep} strokeWidth="3" />
      <path d="M68 62v58h108" stroke={mist} strokeWidth="4" strokeLinecap="round" />
      <path d="M68 62v58h108" stroke={mistDeep} strokeWidth="2" strokeDasharray="3 7" />
      <path d="M80 106l18-14 14 6" stroke={primary} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M124 92l14-10" stroke={accent} strokeWidth="6" strokeDasharray="2 9" strokeLinecap="round" />
      <circle cx="150" cy="76" r="8" fill={accent} />
      <rect x="78" y="118" width="24" height="6" rx="3" fill={sandDeep} />
      <circle cx="178" cy="52" r="4" fill={ochre} />
      <circle cx="38" cy="120" r="5" fill={accentSoft} />
      <path d="M52 140l-6-12" stroke={primary} strokeWidth="3" strokeLinecap="round" opacity="0.45" />
    </Frame>
  );
}

/** aucun intérêt — an empty inbox and a heart that hasn't landed. */
export function EmptyNoInterest(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <path d="M120 74c-8-6-14-10-14-15a6.5 6.5 0 0 1 14-2.4A6.5 6.5 0 0 1 134 59c0 5-6 9-14 15Z" stroke={accent} strokeWidth="5" fill="none" opacity="0.75" />
      <path d="M96 52l-8-8M144 52l8-8" stroke={accent} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      <rect x="56" y="96" width="128" height="56" rx="12" fill={primarySoft} />
      <path d="M56 116l52 20a26 26 0 0 0 24 0l52-20" fill={white} stroke={primary} strokeWidth="4" strokeLinejoin="round" />
      <path d="M56 116v24a12 12 0 0 0 12 12h104a12 12 0 0 0 12-12v-24" fill={white} stroke={primary} strokeWidth="4" strokeLinejoin="round" />
      <rect x="76" y="120" width="88" height="6" rx="3" fill={primarySoft} />
      <rect x="94" y="132" width="52" height="5" rx="2.5" fill={sandDeep} />
      <circle cx="190" cy="72" r="4" fill={PALETTE.ochre} />
      <circle cx="46" cy="70" r="5" fill={accentSoft} />
      <path d="M198 96l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill={sage} />
    </Frame>
  );
}

const EMPTY_STATES: Record<EmptyStateKind, (props: IllustrationProps) => ReactElement> = {
  "no-results": EmptyNoResults,
  "no-listings": EmptyNoListings,
  "no-data": EmptyNoData,
  "no-interest": EmptyNoInterest,
};

/** One entry point: `<EmptyStateIllustration kind="…" />`, decorative by default. */
export function EmptyStateIllustration({
  kind,
  ...props
}: IllustrationProps & { kind: EmptyStateKind }) {
  const Component = EMPTY_STATES[kind];
  return <Component {...props} />;
}
