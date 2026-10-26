import type { ReactElement, ReactNode } from "react";

import { PALETTE } from "./palette";
import type { IllustrationProps } from "./types";
import { illustrationA11y } from "./types";

/**
 * Five property-type thumbnails, 280×180, built for a card media slot (`aspect-[14/9]`).
 *
 * The backdrop is warm paper, not a photo: the thumbnail has to sit calmly inside a card and
 * stay identical at 120 px and 560 px. No text, no gradients, no drop shadows.
 *
 * Usage:
 *   <PropertyTypeThumb type="plex" className="h-auto w-full" />
 *   <PropertyTypePlex className="h-full w-full" />
 */

export type PropertyTypeKind = "unifamiliale" | "plex" | "copropriete" | "terrain" | "commercial";

/** Suggested French alt text when a thumbnail must be a labelled image. */
export const PROPERTY_TYPE_LABELS: Record<PropertyTypeKind, string> = {
  unifamiliale: "Maison unifamiliale avec cour",
  plex: "Immeuble à logements avec escalier extérieur",
  copropriete: "Tour de copropriétés avec balcons",
  terrain: "Terrain à bâtir avec bornes d'arpentage",
  commercial: "Local commercial avec auvent",
};

const {
  white,
  primary,
  primaryStrong,
  primarySoft,
  accent,
  accentSoft,
  mistPale,
  sage,
  sagePale,
  sageDeep,
  clay,
  clayDeep,
  sandPale,
  sandDeep,
  slate,
  ochre,
  ochrePale,
} = PALETTE;

function Backdrop({ children }: { children: ReactNode }) {
  return (
    <>
      <rect width="280" height="180" rx="16" fill={sandPale} />
      {children}
    </>
  );
}

function Ground({ y = 128 }: { y?: number }) {
  return (
    <path
      d={`M0 ${y + 4}c56-10 120-2 170-6 40-3 72 4 110-1v55H0Z`}
      fill={sagePale}
    />
  );
}

function Sun({ x, y, r = 15 }: { x: number; y: number; r?: number }) {
  return (
    <>
      <circle cx={x} cy={y} r={r + 7} fill={ochrePale} />
      <circle cx={x} cy={y} r={r} fill={ochre} />
    </>
  );
}

function Shrub({ x, y, r = 11 }: { x: number; y: number; r?: number }) {
  return (
    <>
      <circle cx={x} cy={y} r={r} fill={sage} />
      <circle cx={x - r * 0.3} cy={y - r * 0.35} r={r * 0.5} fill={sagePale} />
    </>
  );
}

function SmallTree({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x="-4" y="0" width="8" height="38" rx="3" fill={clay} />
      <circle cx="-8" cy="-14" r="20" fill={sage} />
      <circle cx="10" cy="-4" r="15" fill={sageDeep} />
      <circle cx="-12" cy="-24" r="11" fill={sagePale} />
    </g>
  );
}

function Svg({
  children,
  title,
  width = 280,
  height = 180,
  className,
  ...rest
}: IllustrationProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 280 180"
      width={width}
      height={height}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...illustrationA11y(title)}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <Backdrop>{children}</Backdrop>
    </svg>
  );
}

/** unifamiliale — one pitched house, one tree, one path. */
export function PropertyTypeUnifamiliale(props: IllustrationProps) {
  return (
    <Svg {...props}>
      <Sun x={242} y={40} />
      <Ground />
      <SmallTree x={54} y={104} scale={0.95} />
      <rect x="106" y="82" width="112" height="58" rx="3" fill={white} />
      <rect x="192" y="82" width="26" height="58" fill={mistPale} />
      <path d="M94 86l68-36 68 36Z" fill={primary} />
      <path d="M102 84l60-32 60 32" stroke={primaryStrong} strokeWidth="5" strokeLinecap="round" />
      <rect x="198" y="60" width="10" height="22" rx="2" fill={clayDeep} />
      <rect x="118" y="96" width="24" height="22" rx="2" fill={slate} />
      <path d="M130 96v22" stroke={white} strokeWidth="2.5" />
      <rect x="148" y="108" width="26" height="32" rx="2" fill={accent} />
      <circle cx="168" cy="126" r="1.8" fill={white} />
      <path d="M150 140h28l14 40h-56Z" fill={white} opacity="0.85" />
      <Shrub x={234} y={132} r={12} />
    </Svg>
  );
}

/** plex — Québec three-storey walk-up with the outdoor staircase. */
export function PropertyTypePlex(props: IllustrationProps) {
  return (
    <Svg {...props}>
      <Sun x={44} y={38} r={12} />
      <Ground y={132} />
      <rect x="72" y="42" width="136" height="92" fill={white} />
      <rect x="66" y="34" width="148" height="10" rx="2" fill={primary} />
      <rect x="186" y="44" width="22" height="88" fill={mistPale} />
      {[54, 82].map((y) =>
        [88, 132, 176].map((x) => (
          <g key={`${x}-${y}`}>
            <rect x={x} y={y} width="22" height="20" rx="2" fill={slate} />
            <path d={`M${x + 11} ${y}v20`} stroke={white} strokeWidth="2.5" />
          </g>
        )),
      )}
      <rect x="86" y="108" width="18" height="26" fill={accent} />
      <rect x="130" y="108" width="18" height="26" fill={primary} />
      <rect x="174" y="108" width="18" height="26" fill={accent} />
      <path d="M50 144 80 112h16l-30 32Z" fill={clay} />
      {[
        [76, 118, 16],
        [68, 126, 18],
        [60, 134, 18],
        [52, 142, 18],
      ].map(([x, y, w]) => (
        <rect key={y} x={x} y={y} width={w} height="4" rx="2" fill={sandDeep} />
      ))}
      <path d="M48 140 78 110" stroke={primary} strokeWidth="3" strokeLinecap="round" />
      <rect x="78" y="106" width="16" height="5" rx="2" fill={sandDeep} />
      <SmallTree x={240} y={104} scale={0.85} />
      <Shrub x={64} y={150} r={9} />
    </Svg>
  );
}

/** copropriété — a stacked tower, balconies, a single warm door. */
export function PropertyTypeCopropriete(props: IllustrationProps) {
  return (
    <Svg {...props}>
      <Sun x={36} y={40} r={12} />
      <Ground y={134} />
      <rect x="94" y="30" width="100" height="104" fill={white} />
      <rect x="88" y="22" width="112" height="10" rx="2" fill={primary} />
      <rect x="94" y="30" width="10" height="104" fill={primarySoft} />
      {[42, 66, 90, 114].map((y) => (
        <g key={y}>
          {[112, 140, 168].map((x) => (
            <rect key={x} x={x} y={y} width="20" height="16" rx="2" fill={y === 114 ? slate : sagePale} />
          ))}
          <rect x="106" y={y + 16} width="88" height="3" rx="1.5" fill={primary} opacity="0.35" />
        </g>
      ))}
      <rect x="134" y="114" width="18" height="20" fill={accent} />
      <path d="M94 134h100" stroke={sandDeep} strokeWidth="6" />
      <SmallTree x={236} y={104} scale={0.9} />
      <Shrub x={68} y={142} r={10} />
    </Svg>
  );
}

/** terrain — a surveyed lot, stakes and a blank for-sale board. */
export function PropertyTypeTerrain(props: IllustrationProps) {
  return (
    <Svg {...props}>
      <Sun x={244} y={38} r={12} />
      <Ground y={118} />
      <path
        d="M68 66h140l16 72H54Z"
        stroke={clayDeep}
        strokeWidth="3"
        strokeDasharray="9 8"
        strokeLinejoin="round"
        opacity="0.8"
      />
      {[
        [66, 60],
        [204, 60],
        [220, 132],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width="5" height="24" rx="2" fill={clay} />
          <rect x={x - 4} y={y} width="13" height="5" rx="2" fill={clayDeep} />
        </g>
      ))}
      <rect x="96" y="92" width="6" height="46" rx="2" fill={primary} />
      <rect x="82" y="76" width="46" height="24" rx="4" fill={white} stroke={primary} strokeWidth="3" />
      <SmallTree x={188} y={112} scale={1.05} />
      <g stroke={primary} strokeWidth="3" strokeLinecap="round" opacity="0.5">
        <path d="M126 146l-4-10M136 148l3-9M146 144l5-10" />
      </g>
      <Shrub x={66} y={132} r={8} />
    </Svg>
  );
}

/** commercial — a storefront with an awning and a blank sign board. */
export function PropertyTypeCommercial(props: IllustrationProps) {
  return (
    <Svg {...props}>
      <Sun x={244} y={36} r={12} />
      <Ground y={134} />
      <rect x="62" y="58" width="156" height="76" fill={white} />
      <rect x="56" y="48" width="168" height="12" rx="2" fill={primary} />
      <rect x="96" y="26" width="88" height="24" rx="4" fill={primaryStrong} />
      <rect x="62" y="74" width="156" height="20" fill={accent} />
      {[78, 104, 130, 156, 182, 208].map((x) => (
        <rect key={x} x={x} y="74" width="8" height="20" fill={accentSoft} />
      ))}
      <rect x="76" y="104" width="54" height="30" rx="2" fill={slate} />
      <rect x="150" y="104" width="54" height="30" rx="2" fill={slate} />
      <path d="M103 104v30M177 104v30" stroke={white} strokeWidth="2.5" />
      <rect x="132" y="104" width="18" height="30" rx="2" fill={accent} />
      <rect x="62" y="134" width="156" height="6" fill={sandDeep} />
      <Shrub x={246} y={146} r={9} />
      <Shrub x={44} y={144} r={8} />
    </Svg>
  );
}

const PROPERTY_TYPES: Record<PropertyTypeKind, (props: IllustrationProps) => ReactElement> = {
  unifamiliale: PropertyTypeUnifamiliale,
  plex: PropertyTypePlex,
  copropriete: PropertyTypeCopropriete,
  terrain: PropertyTypeTerrain,
  commercial: PropertyTypeCommercial,
};

/** One entry point: `<PropertyTypeThumb type="…" />`, decorative by default. */
export function PropertyTypeThumb({
  type,
  ...props
}: IllustrationProps & { type: PropertyTypeKind }) {
  const Component = PROPERTY_TYPES[type];
  return <Component {...props} />;
}
