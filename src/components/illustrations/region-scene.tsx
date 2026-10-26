import type { ReactNode } from "react";

import { PALETTE, type Terrain } from "./palette";
import type { IllustrationProps } from "./types";
import { illustrationA11y } from "./types";

/**
 * Region scenes for the 17 administrative regions of Québec.
 *
 * One scene per region, deterministic from the region code: the same code always produces
 * exactly the same composition (no Math.random, no hydration drift). The terrain family comes
 * from the official region, and the rank of the region inside its terrain family selects a
 * distinct motif — so the four « fleuve » regions are clearly four different places, not one
 * tinted drawing four times.
 *
 * Region codes follow the MAMH/ISQ numbering (01 Bas-Saint-Laurent … 17 Centre-du-Québec).
 * The artwork is decorative by default: pass `title` (e.g. the region name) when the scene is
 * the only content of its slot.
 *
 * Usage:
 *   <RegionScene code="06" className="h-auto w-full" />
 *   <RegionScene code="11" title="Gaspésie–Îles-de-la-Madeleine" className="rounded-xl" />
 */

export type Region = {
  code: string;
  slug: string;
  name: string;
  terrain: Terrain;
};

export const REGIONS: readonly Region[] = [
  { code: "01", slug: "bas-saint-laurent", name: "Bas-Saint-Laurent", terrain: "fleuve" },
  { code: "02", slug: "saguenay-lac-saint-jean", name: "Saguenay–Lac-Saint-Jean", terrain: "lac" },
  { code: "03", slug: "capitale-nationale", name: "Capitale-Nationale", terrain: "fleuve" },
  { code: "04", slug: "mauricie", name: "Mauricie", terrain: "foret" },
  { code: "05", slug: "estrie", name: "Estrie", terrain: "montagne" },
  { code: "06", slug: "montreal", name: "Montréal", terrain: "urbain" },
  { code: "07", slug: "outaouais", name: "Outaouais", terrain: "foret" },
  { code: "08", slug: "abitibi-temiscamingue", name: "Abitibi-Témiscamingue", terrain: "foret" },
  { code: "09", slug: "cote-nord", name: "Côte-Nord", terrain: "cote" },
  { code: "10", slug: "nord-du-quebec", name: "Nord-du-Québec", terrain: "nord" },
  {
    code: "11",
    slug: "gaspesie-iles-de-la-madeleine",
    name: "Gaspésie–Îles-de-la-Madeleine",
    terrain: "cote",
  },
  { code: "12", slug: "chaudiere-appalaches", name: "Chaudière-Appalaches", terrain: "montagne" },
  { code: "13", slug: "laval", name: "Laval", terrain: "urbain" },
  { code: "14", slug: "lanaudiere", name: "Lanaudière", terrain: "lac" },
  { code: "15", slug: "laurentides", name: "Laurentides", terrain: "montagne" },
  { code: "16", slug: "monteregie", name: "Montérégie", terrain: "fleuve" },
  { code: "17", slug: "centre-du-quebec", name: "Centre-du-Québec", terrain: "fleuve" },
];

const REGION_BY_CODE = new Map(REGIONS.map((region) => [region.code, region]));

/** Accepts "06", "6" or " 06 " and returns the matching region, or undefined. */
export function getRegion(code: string): Region | undefined {
  return REGION_BY_CODE.get(code.trim().padStart(2, "0"));
}

/** Rank of a region inside its terrain family — the deterministic motif selector. */
export function regionVariant(code: string): number {
  const region = getRegion(code);
  if (!region) return 0;
  const siblings = REGIONS.filter((candidate) => candidate.terrain === region.terrain);
  const index = siblings.findIndex((candidate) => candidate.code === region.code);
  return index < 0 ? 0 : index;
}

/** Stable 32-bit seed derived from the region code (FNV-1a). */
export function regionSeed(code: string): number {
  let hash = 2166136261;
  for (let i = 0; i < code.length; i += 1) {
    hash ^= code.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(random: () => number, values: readonly T[]): T {
  return values[Math.floor(random() * values.length) % values.length];
}

const {
  white,
  primary,
  primaryStrong,
  primarySoft,
  accent,
  mist,
  mistPale,
  mistDeep,
  sage,
  sagePale,
  sageDeep,
  clay,
  clayDeep,
  clayPale,
  sand,
  sandPale,
  sandDeep,
  slate,
  slatePale,
  ochre,
  ochrePale,
} = PALETTE;

/** A conifer with its base at (x, y). */
function Fir({ x, y, s = 1, fill }: { x: number; y: number; s?: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0-44l11 22h-6l10 22h-30l10-22h-6Z" fill={fill} />
      <rect x="-2" y="0" width="4" height="7" fill={clayDeep} />
    </g>
  );
}

/** A round deciduous tree with its base at (x, y). */
function LeafTree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-3" y="-18" width="6" height="20" rx="2" fill={clay} />
      <circle cx="0" cy="-30" r="15" fill={sage} />
      <circle cx="-8" cy="-36" r="9" fill={sagePale} />
    </g>
  );
}

function Wave({ x, y, w = 34, tone = white }: { x: number; y: number; w?: number; tone?: string }) {
  return (
    <path
      d={`M${x} ${y}q${w / 4} -5 ${w / 2} 0t${w / 2} 0`}
      stroke={tone}
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
      opacity="0.85"
    />
  );
}

function Gull({ x, y, flip = false }: { x: number; y: number; flip?: boolean }) {
  return (
    <path
      d={`M${x} ${y}q5-6 10 0M${x + 10} ${y}q5-6 10 0`}
      stroke={flip ? slate : slatePale}
      strokeWidth="2.2"
      strokeLinecap="round"
      fill="none"
    />
  );
}

function Sky({ fill }: { fill: string }) {
  return <rect width="320" height="200" fill={fill} />;
}

function Sun({ x, y, r = 14 }: { x: number; y: number; r?: number }) {
  return (
    <>
      <circle cx={x} cy={y} r={r + 12} fill={ochrePale} />
      <circle cx={x} cy={y} r={r} fill={ochre} />
    </>
  );
}

/** A white lift-tower (Gaspésie wind farm) with three slow blades. */
function WindTurbine({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-2 0 1-46h3L6 0Z" fill={primaryStrong} />
      <circle cx="2.5" cy="-48" r="3.4" fill={accent} />
      <path
        d="M2.5-48 2.5-72M2.5-48 23-40M2.5-48-18-40"
        stroke={primaryStrong}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </g>
  );
}

/** A stubby grain silo with a pale dome. */
function Silo({ x, y, h = 36 }: { x: number; y: number; h?: number }) {
  return (
    <g>
      <rect x={x} y={y - h} width="16" height={h} fill={clay} />
      <ellipse cx={x + 8} cy={y - h} rx="8" ry="6" fill={white} />
      <path d={`M${x + 2} ${y - h + 10}h12M${x + 2} ${y - h + 20}h12`} stroke={clayPale} strokeWidth="2" />
    </g>
  );
}

const SCENES: Record<Terrain, (random: () => number, variant: number) => ReactNode> = {
  /* ---------------------------------------------------------------- urbain */
  urbain: (random, variant) =>
    variant === 0 ? (
      /* Montréal — a compact downtown skyline, one dark tower and a lamppost. */
      <>
        <Sky fill={mistPale} />
        <Sun x={44} y={40} r={14} />
        <rect x="118" y="48" width="42" height="108" fill={slate} />
        {[58, 76, 94, 112, 130].map((y) => (
          <g key={y}>
            <rect x="126" y={y} width="9" height="9" rx="1" fill={white} opacity="0.85" />
            <rect x="143" y={y} width="9" height="9" rx="1" fill={white} opacity="0.85" />
          </g>
        ))}
        <rect x="10" y="86" width="50" height="70" fill={primarySoft} />
        <rect x="66" y="72" width="44" height="84" fill={mistDeep} />
        <rect x="168" y="82" width="54" height="74" fill={sagePale} />
        <rect x="228" y="66" width="42" height="90" fill={primarySoft} />
        <rect x="276" y="96" width="44" height="60" fill={mistDeep} />
        <rect x="20" y="96" width="8" height="8" fill={white} opacity="0.8" />
        <rect x="34" y="96" width="8" height="8" fill={white} opacity="0.8" />
        <rect x="20" y="112" width="8" height="8" fill={white} opacity="0.8" />
        <rect x="34" y="112" width="8" height="8" fill={white} opacity="0.8" />
        <rect x="238" y="76" width="8" height="8" fill={white} opacity="0.7" />
        <rect x="252" y="76" width="8" height="8" fill={white} opacity="0.7" />
        <rect x="238" y="92" width="8" height="8" fill={white} opacity="0.7" />
        <rect x="252" y="92" width="8" height="8" fill={white} opacity="0.7" />
        <rect y="152" width="320" height="48" fill={sandPale} />
        <path d="M0 152h320" stroke={sandDeep} strokeWidth="3" />
        <rect x="212" y="152" width="3" height="38" fill={primary} />
        <circle cx="213.5" cy="150" r="7" fill={ochre} />
        <LeafTree x={40} y={192} s={1.05} />
        <LeafTree x={292} y={194} s={0.8} />
        <path d="M0 190h320" stroke={sandDeep} strokeWidth="2" opacity="0.7" />
      </>
    ) : (
      /* Laval — low-rise suburbia: pitched roofs, a park, no tower. */
      <>
        <Sky fill={sandPale} />
        <Sun x={266} y={40} r={14} />
        <path d="M20 116l48-34 48 34Z" fill={primary} />
        <rect x="28" y="116" width="80" height="40" fill={white} />
        <rect x="42" y="128" width="20" height="18" fill={slate} />
        <rect x="74" y="128" width="20" height="18" fill={slate} />
        <rect x="122" y="102" width="82" height="54" fill={white} />
        <rect x="118" y="94" width="90" height="10" rx="2" fill={primaryStrong} />
        {[112, 128, 144].map((y) => (
          <g key={y}>
            <rect x="132" y={y} width="14" height="10" fill={slate} />
            <rect x="152" y={y} width="14" height="10" fill={slate} />
            <rect x="172" y={y} width="14" height="10" fill={slate} />
          </g>
        ))}
        <path d="M208 112l40-28 40 28Z" fill={sageDeep} />
        <rect x="216" y="112" width="64" height="44" fill={white} />
        <rect x="230" y="124" width="18" height="16" fill={slate} />
        <rect x="258" y="124" width="14" height="32" fill={accent} />
        <path d="M0 156c70-10 130 2 190-2 46-3 84 3 130 0v46H0Z" fill={sagePale} />
        <path d="M0 178c60-6 120 2 180-1 48-2 82 2 140 0v23H0Z" fill={sage} opacity="0.5" />
        <LeafTree x={52} y={184} s={1.15} />
        <LeafTree x={86} y={192} s={0.8} />
        <LeafTree x={278} y={188} s={1} />
        <rect x="204" y="176" width="34" height="5" rx="2" fill={sandDeep} />
        <rect x="206" y="181" width="4" height="7" fill={sandDeep} />
        <rect x="232" y="181" width="4" height="7" fill={sandDeep} />
      </>
    ),

  /* ---------------------------------------------------------------- fleuve */
  fleuve: (random, variant) => {
    const sky = pick(random, [mistPale, mist, sandPale]);
    const water = pick(random, [primarySoft, mistDeep, sagePale]);
    const sunX = 48 + Math.round(random() * 180);
    return (
      <>
        <Sky fill={sky} />
        <Sun x={variant === 0 ? sunX : variant === 1 ? 268 : variant === 2 ? 60 : 250} y={40} r={14} />

        {/* Far shore, one motif per region */}
        {variant === 0 ? (
          <>
            <path d="M0 118c44-8 84-2 128-6 52-5 100 6 192 0v14H0Z" fill={sagePale} />
            <Fir x={22} y={118} s={0.42} fill={sageDeep} />
            <Fir x={48} y={118} s={0.34} fill={sage} />
            <Fir x={272} y={118} s={0.4} fill={sageDeep} />
            <Gull x={sunX + 34} y={64} />
            <Gull x={sunX + 54} y={52} flip />
          </>
        ) : null}
        {variant === 1 ? (
          <>
            <path d="M0 118h320v14H0Z" fill={sagePale} />
            <rect x="196" y="84" width="22" height="34" fill={slate} />
            <rect x="222" y="92" width="16" height="26" fill={primarySoft} />
            <rect x="242" y="78" width="14" height="40" fill={slatePale} />
            <path d="M258 118V96h10v22Z" fill={primarySoft} />
            <path d="M270 118V88l11-14 11 14v30Z" fill={primaryStrong} />
            <rect x="186" y="106" width="10" height="12" fill={primarySoft} />
            <Gull x={66} y={62} />
            <Gull x={88} y={50} flip />
          </>
        ) : null}
        {variant === 2 ? (
          <>
            <path d="M0 118c50-10 96 0 144-4 58-5 112 6 176 0v14H0Z" fill={sagePale} />
            <Fir x={20} y={118} s={0.38} fill={sageDeep} />
            <Fir x={278} y={118} s={0.44} fill={sage} />
            <Fir x={298} y={118} s={0.3} fill={sageDeep} />
            <Gull x={sunX + 28} y={70} />
          </>
        ) : null}
        {variant === 3 ? (
          <>
            <path d="M0 120h320v12H0Z" fill={sagePale} />
            <Silo x={196} y={120} h={38} />
            <Silo x={218} y={120} h={44} />
            <rect x="150" y="98" width="34" height="22" fill={white} />
            <path d="M146 98l21-14 21 14Z" fill={primary} />
            <rect x="164" y="108" width="8" height="12" fill={accent} />
            <Fir x={286} y={120} s={0.4} fill={sageDeep} />
          </>
        ) : null}

        {/* Water */}
        <rect y="124" width="320" height="52" fill={water} />
        <Wave x={30} y={138} w={38} />
        <Wave x={112} y={150} w={32} />
        <Wave x={206} y={136} w={42} />
        <Wave x={248} y={156} w={28} />

        {/* Crossing: sailboat, ferry, distant sail, rowboat */}
        {variant === 0 ? (
          <g transform="translate(110 146)">
            <path d="M-22 0h44l-8 10h-28Z" fill={white} />
            <path d="M-10 0h20l-4 4h-12Z" fill={accent} />
            <path d="M1 0v-34" stroke={primaryStrong} strokeWidth="2.5" />
            <path d="M3-32l20 26H3Z" fill={primary} />
            <path d="M-1-28l-16 22H-1Z" fill={white} />
          </g>
        ) : null}
        {variant === 1 ? (
          <g transform="translate(104 148)">
            <path d="M-30 0h60l-7 12h-46Z" fill={white} />
            <rect x="-14" y="-12" width="28" height="12" rx="2" fill={primaryStrong} />
            <rect x="-24" y="0" width="48" height="4" fill={accent} />
            <path d="M-46 8h30M16 8h34" stroke={white} strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
          </g>
        ) : null}
        {variant === 2 ? (
          <g transform="translate(196 152)">
            <path d="M-16 0h32l-6 8h-20Z" fill={white} />
            <path d="M1 0v-24" stroke={primaryStrong} strokeWidth="2" />
            <path d="M3-22l13 18H3Z" fill={primary} />
          </g>
        ) : null}
        {variant === 3 ? (
          <g transform="translate(150 152)">
            <path d="M-18 0h36l-6 8h-24Z" fill={white} />
            <rect x="-10" y="0" width="20" height="3" fill={accent} />
            <path d="M-6-6h12l-3-5h-6Z" fill={sageDeep} />
          </g>
        ) : null}

        {/* Foreground: meadow, orchard, fields or quay depending on the region */}
        {variant === 0 ? (
          <>
            <path d="M0 172c60-6 120 2 180-2 50-3 90 4 140-1v31H0Z" fill={sand} />
            <g stroke={primary} strokeWidth="3" strokeLinecap="round" opacity="0.55">
              <path d="M34 194l-5-14M48 196l4-13M64 192l6-13" />
              <path d="M252 194l-4-12M266 196l4-12" />
            </g>
          </>
        ) : null}
        {variant === 1 ? (
          <>
            <path d="M0 170c70-6 130 2 190-1 46-2 84 2 130 0v31H0Z" fill={sandPale} />
            <rect y="184" width="320" height="16" fill={sandDeep} />
            <path d="M0 184h320" stroke={clayPale} strokeWidth="2" />
          </>
        ) : null}
        {variant === 2 ? (
          <>
            <path d="M0 168c64-8 132 2 196-2 44-3 80 2 124 0v34H0Z" fill={sand} />
            {[0, 1].map((row) =>
              [0, 1, 2, 3, 4].map((col) => (
                <g key={`${row}-${col}`}>
                  <circle cx={62 + col * 48} cy={178 + row * 14} r={7} fill={row === 0 ? sage : sageDeep} />
                  <rect x={61 + col * 48} y={184 + row * 14} width="3" height="6" fill={clay} />
                </g>
              )),
            )}
            <path d="M0 196h320" stroke={sandDeep} strokeWidth="2" />
          </>
        ) : null}
        {variant === 3 ? (
          <>
            <path d="M0 168c60-4 120 2 180 0 50-2 92 2 140 0v32H0Z" fill={sandPale} />
            {[176, 184, 192].map((y) => (
              <path key={y} d={`M0 ${y}h320`} stroke={sandDeep} strokeWidth="2" opacity="0.8" />
            ))}
            <path d="M210 196l-4-12M224 198l4-12" stroke={primary} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
          </>
        ) : null}
      </>
    );
  },

  /* ------------------------------------------------------------------- lac */
  lac: (random, variant) => {
    const sunX = 54 + Math.round(random() * 190);
    return (
      <>
        <Sky fill={mistPale} />
        <Sun x={variant === 0 ? sunX : 264} y={44} r={13} />
        <Gull x={sunX + 26} y={68} />
        <path d="M0 104c44-16 92 4 148-6 56-10 112 6 172-4v26H0Z" fill={sageDeep} opacity="0.55" />
        <path d="M0 118c56-10 104 2 168-4 60-6 104 4 152-2v12H0Z" fill={sagePale} />
        <rect y="124" width="320" height="44" fill={mistDeep} />
        <Wave x={40} y={140} w={40} />
        <Wave x={130} y={152} w={34} />
        <Wave x={232} y={138} w={42} />
        {variant === 0 ? (
          <>
            <g transform={`translate(${72 + Math.round(random() * 60)} 130)`}>
              <rect x="0" y="0" width="16" height="46" fill={clay} />
              {[6, 16, 26, 36].map((y) => (
                <path key={y} d={`M0 ${y}h16`} stroke={sandDeep} strokeWidth="2" />
              ))}
              <circle cx="3" cy="46" r="3" fill={primaryStrong} />
              <circle cx="13" cy="46" r="3" fill={primaryStrong} />
            </g>
            <path d="M0 168c52-8 106 2 164-4 58-6 106 4 156-2v38H0Z" fill={sandPale} />
            <Fir x={16} y={178} s={0.9} fill={primary} />
            <Fir x={38} y={186} s={0.62} fill={sageDeep} />
            <Fir x={296} y={182} s={0.86} fill={primary} />
            <LeafTree x={252} y={194} s={0.8} />
          </>
        ) : (
          <>
            {/* Lanaudière — an island of pines, a sail, reeds. */}
            <ellipse cx="208" cy="156" rx="52" ry="12" fill={sageDeep} />
            <Fir x={190} y={152} s={0.62} fill={primaryStrong} />
            <Fir x={208} y={154} s={0.8} fill={primary} />
            <Fir x={228} y={152} s={0.55} fill={primaryStrong} />
            <g transform="translate(108 144)">
              <path d="M-18 0h36l-7 8h-22Z" fill={white} />
              <path d="M1 0v-28" stroke={primaryStrong} strokeWidth="2.2" />
              <path d="M3-26l16 22H3Z" fill={primary} />
              <path d="M-1-22l-13 18H-1Z" fill={white} />
            </g>
            <path d="M0 168c56-8 110 2 168-3 56-5 100 3 152 0v35H0Z" fill={sandPale} />
            {[24, 44, 64, 84].map((x) => (
              <path key={x} d={`M${x} 196l-5-16M${x + 6} 196l3-13`} stroke={sageDeep} strokeWidth="3" strokeLinecap="round" />
            ))}
            <LeafTree x={286} y={192} s={0.9} />
          </>
        )}
      </>
    );
  },

  /* ----------------------------------------------------------------- foret */
  foret: (random, variant) => {
    const sunX = variant === 2 ? 250 : 40 + Math.round(random() * 60);
    return (
      <>
        <Sky fill={variant === 2 ? sandPale : mistPale} />
        <Sun x={sunX} y={variant === 2 ? 108 : 38} r={variant === 2 ? 18 : 13} />
        {variant !== 2 ? <Gull x={sunX + 56} y={62} /> : null}

        {variant === 0 ? (
          <>
            {/* Mauricie — boreal ridges with a river between them. */}
            <path d="M0 96c60-24 118 2 178-10 50-10 92 8 142-4v38H0Z" fill={mistDeep} />
            <path d="M0 124c58-14 112 8 176-4 50-9 96 6 144-2v30H0Z" fill={sagePale} />
            <path d="M0 148c48-18 104-4 160-14 56-10 112-2 160-12v54c-60 8-110-6-170-2-52 3-102 6-150 0Z" fill={mistDeep} />
            <path d="M0 150c60-14 118 4 180-6 46-8 94-2 140-8v22c-54 8-102-4-158 0-58 4-108 6-162-8Z" fill={primarySoft} />
            {[34, 76, 118, 160, 202, 244, 286].map((x, index) => (
              <Fir
                key={x}
                x={x}
                y={index % 2 === 0 ? 132 : 126}
                s={index % 2 === 0 ? 0.56 : 0.42}
                fill={index % 3 === 0 ? primary : sageDeep}
              />
            ))}
            <path d="M0 176c72-10 142 2 212-4 38-3 70 3 108 0v26H0Z" fill={sage} />
            <Fir x={40} y={190} s={0.72} fill={primaryStrong} />
            <Fir x={272} y={192} s={0.62} fill={primaryStrong} />
          </>
        ) : null}

        {variant === 1 ? (
          <>
            {/* Outaouais — forested hills, a rock cut, a canoe on the river. */}
            <path d="M0 104c64-22 124 4 186-8 50-10 88 8 134-2v40H0Z" fill={mistDeep} />
            <path d="M0 132c66-18 128 4 192-6 44-7 82 4 128-2v32H0Z" fill={sagePale} />
            <ellipse cx="74" cy="150" rx="34" ry="12" fill={slatePale} />
            <rect y="152" width="320" height="18" fill={mistDeep} />
            <Wave x={128} y={160} w={38} />
            <Wave x={214} y={164} w={30} />
            <g transform="translate(168 156)">
              <path d="M-16 0h32l-5 6h-22Z" fill={accent} />
              <path d="M2 0l8-6" stroke={primaryStrong} strokeWidth="2" />
            </g>
            {[26, 56, 92, 128, 252, 286].map((x, index) => (
              <Fir key={x} x={x} y={index < 4 ? 124 : 146} s={0.5 + (index % 2) * 0.16} fill={index % 2 === 0 ? primary : sageDeep} />
            ))}
            <path d="M0 174c60-6 120 2 180-1 48-2 92 2 140 0v27H0Z" fill={sand} />
            <LeafTree x={288} y={192} s={0.85} />
          </>
        ) : null}

        {variant === 2 ? (
          <>
            {/* Abitibi — flat boreal country, a clearing, a low warm sun. */}
            <path d="M0 116c70-14 140 4 210-4 40-4 76 2 110-2v30H0Z" fill={sagePale} />
            <path d="M0 140c72-10 144 2 216-2 34-2 68 2 104 0v28H0Z" fill={sage} />
            <path d="M0 168c80-6 160 4 240 0 28-1 56 1 80 0v32H0Z" fill={sand} />
            {[20, 58, 96, 134, 172].map((x, index) => (
              <Fir key={x} x={x} y={138} s={0.5 + (index % 2) * 0.2} fill={index % 2 === 0 ? primary : sageDeep} />
            ))}
            {[198, 232, 266, 300].map((x, index) => (
              <Fir key={x} x={x} y={130} s={0.42 + (index % 2) * 0.16} fill={primaryStrong} />
            ))}
            <ellipse cx="168" cy="168" rx="54" ry="10" fill={sandPale} />
            <LeafTree x={104} y={188} s={1} />
            <path d="M0 190h320" stroke={sandDeep} strokeWidth="2" opacity="0.7" />
            <Fir x={286} y={194} s={0.6} fill={primary} />
          </>
        ) : null}
      </>
    );
  },

  /* --------------------------------------------------------------- montagne */
  montagne: (random, variant) => {
    const sunX = variant === 1 ? 58 : 206 + Math.round(random() * 60);
    return (
      <>
        <Sky fill={variant === 1 ? sandPale : mistPale} />
        <Sun x={sunX} y={variant === 1 ? 40 : 42} r={14} />

        {variant === 0 ? (
          <>
            {/* Estrie — two sharp, snow-capped peaks. */}
            <path d="M18 152 96 58l78 94Z" fill={slate} />
            <path d="M96 58 118 84h-13l-9 10-9-10H74Z" fill={white} />
            <path d="M150 156 226 82l76 74Z" fill={sageDeep} />
            <path d="M226 82 246 104h-11l-9 10-9-10h-12Z" fill={white} />
            <path d="M236 156 300 104l20 20v32Z" fill={slatePale} />
            <path d="M0 156c42-14 92 2 148-6 66-10 116 8 172-2v52H0Z" fill={sagePale} />
            <path d="M0 176c58-10 118 4 180-2 54-5 92 4 140 0v26H0Z" fill={sage} />
            <Fir x={30} y={184} s={0.72} fill={primary} />
            <Fir x={52} y={192} s={0.5} fill={primaryStrong} />
            <Fir x={288} y={190} s={0.62} fill={primary} />
            <LeafTree x={136} y={198} s={0.9} />
            <path d="M104 200c10-8 22-8 34-2" stroke={sand} strokeWidth="6" strokeLinecap="round" opacity="0.8" />
          </>
        ) : null}

        {variant === 1 ? (
          <>
            {/* Chaudière-Appalaches — rounded Appalachian ridges and orchards. */}
            <path d="M0 128c50-26 104-18 156-4 54 14 106-6 164-10v44H0Z" fill={sagePale} />
            <path d="M0 148c62-22 122 2 184-10 46-9 90 2 136-6v46H0Z" fill={sageDeep} opacity="0.55" />
            <path d="M0 160c66-14 128 2 192-4 46-4 84 2 128 0v44H0Z" fill={sage} />
            <Fir x={24} y={158} s={0.5} fill={primaryStrong} />
            <Fir x={48} y={162} s={0.36} fill={primary} />
            <Fir x={286} y={158} s={0.46} fill={primaryStrong} />
            <path d="M0 180c66-8 132 2 198-2 40-2 80 2 122 0v22H0Z" fill={sand} />
            {[0, 1, 2, 3, 4, 5].map((col) => (
              <g key={col}>
                <circle cx={54 + col * 44} cy={182} r={7} fill={col % 2 === 0 ? sageDeep : sage} />
                <rect x={53 + col * 44} y={188} width="3" height="6" fill={clay} />
              </g>
            ))}
            <LeafTree x={286} y={198} s={0.7} />
          </>
        ) : null}

        {variant === 2 ? (
          <>
            {/* Laurentides — three peaks and a snow-filled ski run. */}
            <path d="M0 158 72 66l72 92Z" fill={slatePale} />
            <path d="M72 66 92 92H80l-8 9-8-9H52Z" fill={white} />
            <path d="M96 158 178 52l82 106Z" fill={slate} />
            <path d="M178 52 202 84h-14l-10 12-10-12h-14Z" fill={white} />
            <path d="M186 98l-8 60h16Z" fill={white} />
            <path d="M196 160 272 92l48 66Z" fill={sageDeep} />
            <path d="M272 92 290 114h-10l-8 9-8-9h-10Z" fill={white} />
            <path d="M0 160c56-12 120 2 180-4 60-6 100 4 140-4v48H0Z" fill={sage} />
            <Fir x={24} y={184} s={0.7} fill={primary} />
            <Fir x={46} y={192} s={0.5} fill={primaryStrong} />
            <Fir x={300} y={188} s={0.6} fill={primary} />
            <path d="M0 190c70-6 130 2 200-1 42-2 80 2 120 0v11H0Z" fill={sand} opacity="0.7" />
          </>
        ) : null}
      </>
    );
  },

  /* ------------------------------------------------------------------ côte */
  cote: (random, variant) => {
    const sunX = 42 + Math.round(random() * 60);
    return (
      <>
        <Sky fill={variant === 0 ? mistPale : sandPale} />
        <Sun x={sunX} y={42} r={14} />
        <Gull x={sunX + 40} y={66} />
        <Gull x={sunX + 62} y={54} flip />

        {variant === 0 ? (
          <>
            {/* Côte-Nord — a lighthouse on the rock, the gulf beyond. */}
            <rect y="112" width="320" height="68" fill={primarySoft} />
            <Wave x={40} y={132} w={44} />
            <Wave x={116} y={146} w={38} />
            <Wave x={188} y={160} w={40} />
            <Wave x={66} y={162} w={30} />
            <path d="M320 200c2-32-10-52-26-68-18-18-46-26-86-26v94Z" fill={clayPale} />
            <path d="M320 200c2-32-10-52-26-68-18-18-46-26-86-26v40c30 2 52 12 66 28 10 12 16 26 18 26Z" fill={clay} opacity="0.35" />
            <g transform="translate(266 108)">
              <path d="M-9 48h18l-3-58h-12Z" fill={white} />
              <path d="M-7 22h14l-1-10H-6Z" fill={accent} />
              <rect x="-11" y="-14" width="22" height="6" rx="2" fill={primaryStrong} />
              <rect x="-6" y="-24" width="12" height="12" rx="2" fill={ochre} />
              <path d="M-6-24 6-12" stroke={ochrePale} strokeWidth="4" opacity="0.7" />
            </g>
            <ellipse cx="292" cy="184" rx="22" ry="10" fill={slate} />
            <ellipse cx="274" cy="190" rx="14" ry="7" fill={slatePale} />
            <path d="M180 174c52-6 92 2 140 0v26H180Z" fill={sand} />
            <path d="M196 194l-4-11M208 196l4-11" stroke={primary} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
          </>
        ) : (
          <>
            {/* Gaspésie — red cliffs, the gulf, two wind turbines. */}
            <rect y="118" width="320" height="62" fill={mistDeep} />
            <Wave x={128} y={142} w={44} />
            <Wave x={204} y={156} w={38} />
            <Wave x={238} y={132} w={30} />
            <path d="M0 200c-2-30 8-48 24-64 18-18 46-24 84-24v88Z" fill={clay} />
            <path d="M0 200c2-24 10-40 24-52 16-14 38-20 68-20v34c-24 2-40 10-52 22-8 8-12 16-14 16Z" fill={clayDeep} opacity="0.5" />
            <WindTurbine x={52} y={132} s={1} />
            <WindTurbine x={86} y={120} s={0.78} />
            <path d="M0 176c44-8 90 2 136-2 42-4 80 2 118 0v26H0Z" fill={sand} />
            <Fir x={262} y={188} s={0.62} fill={primary} />
            <Fir x={284} y={194} s={0.44} fill={sageDeep} />
            <g stroke={primary} strokeWidth="3" strokeLinecap="round" opacity="0.5">
              <path d="M214 194l-4-11M226 196l4-11" />
            </g>
          </>
        )}
      </>
    );
  },

  /* ------------------------------------------------------------------ nord */
  nord: () => (
    <>
      <Sky fill={mist} />
      <path
        d="M-10 58C56 20 112 68 184 34c44-22 84-16 146-38"
        stroke={sage}
        strokeWidth="16"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />
      <path
        d="M-10 82C58 44 116 92 190 58c42-20 82-14 140-36"
        stroke={primarySoft}
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />
      <path
        d="M20 104c58-28 108 16 174-10 36-14 66-12 106-24"
        stroke={white}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />
      {[
        [42, 38],
        [86, 24],
        [120, 46],
        [172, 22],
        [206, 40],
        [254, 30],
        [290, 52],
        [66, 64],
      ].map(([x, y], index) => (
        <circle key={index} cx={x} cy={y} r={index % 3 === 0 ? 2 : 1.4} fill={white} />
      ))}
      <circle cx="246" cy="126" r="28" fill={ochrePale} />
      <path d="M246 98a28 28 0 0 1 0 56Z" fill={ochre} />
      <path d="M0 128c52-6 96 8 156 0 62-9 114 6 164 2v70H0Z" fill={white} />
      <path d="M0 156c56-8 106 2 166-2 58-4 98 4 154 0v46H0Z" fill={mistPale} />
      <path d="M0 180c58-6 108 2 168-1 56-3 94 3 152 0v21H0Z" fill={mistDeep} opacity="0.55" />
      <Fir x={40} y={166} s={0.86} fill={primaryStrong} />
      <Fir x={62} y={172} s={0.6} fill={primary} />
      <Fir x={282} y={170} s={0.76} fill={primaryStrong} />
      <Fir x={264} y={176} s={0.52} fill={primary} />
      <g stroke={slatePale} strokeWidth="2.5" strokeLinecap="round" opacity="0.7">
        <path d="M140 176l-4-10M152 178l4-10" />
      </g>
    </>
  ),
};

export type RegionSceneProps = IllustrationProps & {
  /** Administrative region code, e.g. "06". Unknown codes fall back to the St. Lawrence. */
  code: string;
};

export function RegionScene({
  code,
  title,
  width = 320,
  height = 200,
  className,
  ...rest
}: RegionSceneProps) {
  const region = getRegion(code);
  const normalized = region?.code ?? code;
  const terrain = region?.terrain ?? "fleuve";
  const random = mulberry32(regionSeed(normalized));
  const scene = SCENES[terrain](random, regionVariant(normalized));
  return (
    <svg
      viewBox="0 0 320 200"
      width={width}
      height={height}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...illustrationA11y(title)}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {scene}
    </svg>
  );
}
