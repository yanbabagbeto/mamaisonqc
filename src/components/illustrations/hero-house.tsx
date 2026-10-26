import { PALETTE } from "./palette";
import type { IllustrationProps } from "./types";
import { illustrationA11y } from "./types";

/**
 * Hero scene: a contemporary Québec house on a soft ridge, drawn as flat vector layers.
 *
 * Deliberately airy (the sky is ~60 % of the canvas) with the house off-centre right and one
 * generous tree balancing it left. No text, no gradients, no external references — the whole
 * SVG is ~5 KB and stays crisp from 320 px to full-bleed.
 *
 * Usage:
 *   <HeroHouseScene className="h-auto w-full" />
 *   <HeroHouseScene width={640} height={448} title="Une maison québécoise contemporaine" />
 */
export function HeroHouseScene({
  className,
  width = 800,
  height = 560,
  title,
  ...rest
}: IllustrationProps) {
  const {
    white,
    paper,
    primary,
    primaryStrong,
    accent,
    inkSoft,
    mistPale,
    mistDeep,
    sage,
    sagePale,
    sageDeep,
    clay,
    clayDeep,
    clayPale,
    sand,
    sandDeep,
    slate,
    ochre,
    ochrePale,
  } = PALETTE;

  return (
    <svg
      viewBox="0 0 800 560"
      width={width}
      height={height}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...illustrationA11y(title)}
      {...rest}
    >
      {title ? <title>{title}</title> : null}

      {/* Sky: one warm sun, two clouds, two birds */}
      <circle cx="612" cy="126" r="100" fill={ochrePale} />
      <circle cx="612" cy="126" r="56" fill={ochre} />
      <g fill={white} opacity="0.92">
        <circle cx="122" cy="118" r="20" />
        <circle cx="150" cy="108" r="28" />
        <circle cx="182" cy="120" r="17" />
        <rect x="122" y="108" width="60" height="29" rx="14.5" />
      </g>
      <g fill={white} opacity="0.7">
        <circle cx="382" cy="80" r="13" />
        <circle cx="404" cy="73" r="18" />
        <circle cx="428" cy="82" r="11" />
        <rect x="382" y="73" width="46" height="19" rx="9.5" />
      </g>
      <g stroke={inkSoft} strokeWidth="3" strokeLinecap="round">
        <path d="M286 120c6-7 12-7 18 0" />
        <path d="M312 102c5-6 11-6 16 0" />
      </g>

      {/* Land: three strata, each one step warmer towards the viewer */}
      <path
        d="M0 360c120-22 240-4 360-12 140-8 300 12 440-4v216H0Z"
        fill={mistDeep}
      />
      <path
        d="M0 428c150-28 300-6 440-16 140-10 250 10 360-4v152H0Z"
        fill={sagePale}
      />
      <path
        d="M0 490c170-20 330-4 470-10 140-6 230 4 330-2v82H0Z"
        fill={sand}
      />

      {/* Path: one filled ribbon from the door to the lower-left, wider as it approaches */}
      <path
        d="M566 458C540 472 512 482 478 490 400 508 300 522 190 536 140 542 90 550 44 560H120C170 552 220 546 270 540 380 526 470 508 540 486 560 479 578 470 590 462L596 456Z"
        fill={white}
      />

      {/* Grounding tone: hardly visible, but it seats the walls on the ground */}
      <ellipse cx="590" cy="458" rx="172" ry="9" fill={slate} opacity="0.06" />

      {/* Garage wing, set back so the main volume reads first */}
      <rect x="648" y="344" width="118" height="112" rx="3" fill={white} />
      <rect x="742" y="344" width="24" height="112" fill={mistPale} />
      <path d="M638 352l69-42 69 42Z" fill={primaryStrong} />
      <rect x="636" y="346" width="142" height="8" rx="2" fill={primaryStrong} />
      <rect x="668" y="372" width="72" height="46" rx="3" fill={slate} />
      <path d="M704 372v46M668 395h72" stroke={paper} strokeWidth="3" />
      <rect x="644" y="456" width="130" height="10" fill={sandDeep} />

      {/* Chimney behind the main roof line */}
      <rect x="700" y="276" width="24" height="48" fill={clayDeep} />
      <rect x="695" y="270" width="34" height="8" rx="2" fill={accent} />

      {/* Main volume: white walls, deep green roof, timber gable */}
      <rect x="456" y="300" width="192" height="158" rx="3" fill={white} />
      <rect x="590" y="300" width="58" height="158" fill={mistPale} />
      <path d="M434 312l117-100 117 100Z" fill={primary} />
      <path d="M446 310l105-89 105 89" stroke={primaryStrong} strokeWidth="7" strokeLinecap="round" />
      <path d="M456 312l95-80 95 80Z" fill={clay} />
      <path d="M506 266h90M482 290h138" stroke={paper} strokeWidth="3" opacity="0.3" />
      <rect x="520" y="266" width="62" height="34" rx="3" fill={slate} />
      <path d="M551 266v34" stroke={paper} strokeWidth="3" />
      <rect x="474" y="334" width="72" height="70" rx="5" fill={white} />
      <rect x="479" y="339" width="62" height="60" rx="3" fill={slate} />
      <rect x="513" y="341" width="26" height="26" rx="2" fill={ochrePale} />
      <path d="M510 339v60M479 369h62" stroke={paper} strokeWidth="3" />
      <rect x="562" y="362" width="44" height="96" rx="3" fill={accent} />
      <rect x="569" y="368" width="12" height="64" rx="2" fill={ochrePale} />
      <circle cx="596" cy="408" r="2.8" fill={paper} />
      <rect x="558" y="456" width="52" height="7" rx="2" fill={sandDeep} />
      <rect x="452" y="458" width="196" height="12" fill={sandDeep} />

      {/* Terrace, hedge and a small shrub at the corner */}
      <rect x="460" y="466" width="178" height="9" rx="3" fill={clayPale} />
      <ellipse cx="754" cy="452" rx="44" ry="16" fill={sage} />
      <ellipse cx="462" cy="446" rx="26" ry="15" fill={sage} />
      <circle cx="452" cy="438" r="12" fill={sagePale} />

      {/* Tree: three flat blobs, one trunk and a single fork */}
      <rect x="182" y="354" width="18" height="106" rx="7" fill={clay} />
      <path d="M191 400l-26-24M191 424l24-22" stroke={clay} strokeWidth="8" strokeLinecap="round" />
      <circle cx="191" cy="288" r="84" fill={sage} />
      <circle cx="154" cy="260" r="40" fill={sagePale} />
      <circle cx="234" cy="310" r="44" fill={sageDeep} />
      <circle cx="212" cy="244" r="24" fill={sagePale} />

      {/* Foreground: three grass ticks, one warm speck — restraint over detail */}
      <g stroke={primary} strokeWidth="4" strokeLinecap="round" opacity="0.55">
        <path d="M92 536l-6-16M104 538l4-14M118 534l8-15" />
        <path d="M352 546l-5-14M364 548l5-13" />
        <path d="M690 538l-6-15M702 540l4-14M716 536l7-14" />
      </g>
      <circle cx="300" cy="536" r="4" fill={accent} />
      <circle cx="744" cy="514" r="3.5" fill={sandDeep} />
    </svg>
  );
}
