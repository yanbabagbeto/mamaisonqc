import { PALETTE } from "./palette";
import type { IllustrationProps } from "./types";
import { illustrationA11y } from "./types";

/**
 * Pre-market phone mockup — a flat UI sketch, never a screenshot.
 *
 * The screen only contains shapes and bars: no words, no invented prices, no fake listings.
 * That keeps the asset honest (nothing on it can be mistaken for real data) and lets the
 * page supply its own copy around it.
 *
 * Usage:
 *   <PreMarketPhone className="mx-auto h-auto w-full max-w-[17rem]" />
 */
export function PreMarketPhone({
  className,
  width = 320,
  height = 600,
  title,
  ...rest
}: IllustrationProps) {
  const {
    white,
    paper,
    ink,
    primary,
    primaryStrong,
    primarySoft,
    accent,
    accentSoft,
    mistDeep,
    sage,
    sagePale,
    sandDeep,
    ochre,
    ochrePale,
  } = PALETTE;

  return (
    <svg
      viewBox="0 0 320 600"
      width={width}
      height={height}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...illustrationA11y(title)}
      {...rest}
    >
      {title ? <title>{title}</title> : null}

      {/* Soft atmosphere behind the device — flat discs, no blur, no shadow soup */}
      <circle cx="46" cy="88" r="52" fill={primarySoft} opacity="0.75" />
      <circle cx="286" cy="512" r="38" fill={accentSoft} opacity="0.9" />
      <circle cx="292" cy="76" r="10" fill={ochrePale} />
      <path d="M282 40l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill={ochre} opacity="0.7" />

      <g transform="rotate(-3 160 300)">
        {/* Device */}
        <rect x="62" y="26" width="196" height="520" rx="40" fill={primaryStrong} />
        <rect x="72" y="36" width="176" height="500" rx="31" fill={paper} />
        <rect x="138" y="44" width="44" height="8" rx="4" fill={primaryStrong} />

        {/* Search field */}
        <rect x="86" y="78" width="148" height="28" rx="14" fill={white} stroke={mistDeep} strokeWidth="2" />
        <circle cx="104" cy="92" r="6" stroke={primary} strokeWidth="2.5" />
        <path d="M109 97l5 5" stroke={primary} strokeWidth="2.5" strokeLinecap="round" />
        <rect x="124" y="89" width="62" height="6" rx="3" fill={sandDeep} />

        {/* The listing card: a mini house, then two neutral data bars */}
        <rect x="86" y="118" width="148" height="138" rx="16" fill={primarySoft} />
        <circle cx="208" cy="140" r="10" fill={white} opacity="0.85" />
        <path d="M208 135c-3.4-2.4-5.6-4.2-5.6-6.4a2.8 2.8 0 0 1 5.6-1 2.8 2.8 0 0 1 5.6 1c0 2.2-2.2 4-5.6 6.4Z" fill={accent} />
        <circle cx="112" cy="210" r="16" fill={sage} />
        <circle cx="106" cy="204" r="8" fill={sagePale} />
        <path d="M138 196l34-24 34 24Z" fill={primary} />
        <rect x="146" y="196" width="52" height="24" fill={white} />
        <rect x="164" y="204" width="14" height="16" fill={accent} />
        <rect x="150" y="202" width="10" height="9" rx="1" fill={mistDeep} />
        <rect x="184" y="202" width="10" height="9" rx="1" fill={mistDeep} />
        <path d="M86 220h148" stroke={sagePale} strokeWidth="4" />
        <rect x="100" y="228" width="58" height="8" rx="4" fill={primary} opacity="0.55" />
        <rect x="100" y="240" width="34" height="6" rx="3" fill={sagePale} />

        {/* Title and neutral meta bars */}
        <rect x="86" y="272" width="108" height="10" rx="5" fill={ink} opacity="0.72" />
        <rect x="86" y="289" width="66" height="7" rx="3.5" fill={sandDeep} />

        {/* Feature chips */}
        {[86, 132, 178].map((x) => (
          <g key={x}>
            <rect x={x} y="308" width="42" height="24" rx="12" fill={white} stroke={mistDeep} strokeWidth="2" />
            <rect x={x + 10} y="318" width="22" height="5" rx="2.5" fill={sandDeep} />
          </g>
        ))}

        {/* Two quiet list rows */}
        {[344, 392].map((y) => (
          <g key={y}>
            <rect x="86" y={y} width="32" height="32" rx="8" fill={sagePale} />
            <rect x="128" y={y + 6} width="72" height="7" rx="3.5" fill={ink} opacity="0.35" />
            <rect x="128" y={y + 20} width="48" height="6" rx="3" fill={sandDeep} />
            <path d={`M216 ${y + 12}l5 5-5 5`} stroke={primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ))}

        {/* Primary action, wordless */}
        <rect x="86" y="444" width="148" height="42" rx="21" fill={accent} />
        <path d="M164 468c-5.6-3.8-9-6.6-9-10a4.5 4.5 0 0 1 9-1.6 4.5 4.5 0 0 1 9 1.6c0 3.4-3.4 6.2-9 10Z" fill={white} />

        {/* Tab bar */}
        <rect x="86" y="500" width="148" height="26" rx="13" fill={white} />
        {[110, 136, 162, 188, 210].map((x, index) => (
          <circle key={x} cx={x} cy="513" r={index === 1 ? 6 : 4.5} fill={index === 1 ? primary : mistDeep} />
        ))}
        <rect x="140" y="528" width="40" height="4" rx="2" fill={primaryStrong} opacity="0.3" />
      </g>

      {/* Floating badge: an interest signal, outside the device */}
      <circle cx="272" cy="424" r="27" fill={accent} />
      <path d="M272 438c-8-5.4-13-9.4-13-14.2a6.4 6.4 0 0 1 13-2.2 6.4 6.4 0 0 1 13 2.2c0 4.8-5 8.8-13 14.2Z" fill={white} />
      <circle cx="42" cy="352" r="16" fill={white} stroke={mistDeep} strokeWidth="3" />
      <path d="M36 352h12M42 346v12" stroke={primary} strokeWidth="3" strokeLinecap="round" />
      <circle cx="58" cy="470" r="7" fill={ochre} opacity="0.8" />
    </svg>
  );
}
