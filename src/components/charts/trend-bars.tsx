import type { Locale } from "@/i18n/config";
import { slugify } from "@/shared/slug";

import { formatMonth, formatNumber } from "@/shared/format";

/**
 * Vertical bars for a short monthly series (sales per period), pure SVG (no chart library).
 *
 * A period the source did not publish stays empty and its table cell shows "—": an absent month
 * is never drawn as a zero bar. Accessibility mirrors `BarDistribution`: one labelled SVG image
 * plus a captioned table with `scope`-marked headers.
 */
export type TrendPoint = { period: string; value: number | null };

export type TrendLabels = {
  viewValues: string;
  period: string;
};

export function TrendBars({
  title,
  description,
  caption,
  points,
  locale,
  labels,
  heading,
}: {
  title: string;
  description: string;
  caption: string;
  points: TrendPoint[];
  locale: Locale;
  labels: TrendLabels;
  heading: string;
}) {
  if (points.length === 0) return null;

  const id = slugify(title) || "tendance";
  const values = points.map((point) => point.value ?? 0);
  const max = Math.max(...values, 1);
  const plotLeft = 6;
  const plotRight = 354;
  const plotTop = 12;
  const plotBottom = 150;
  const plotHeight = plotBottom - plotTop;
  const slot = (plotRight - plotLeft) / points.length;
  const barWidth = Math.max(4, slot * 0.62);

  const labelIndexes = [...new Set([0, Math.floor(points.length / 2), points.length - 1])].filter(
    (index) => index >= 0 && index < points.length,
  );

  return (
    <figure className="min-w-0">
      <svg
        viewBox="0 0 360 176"
        className="h-auto w-full max-w-md"
        role="img"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-desc`}
      >
        <title id={`${id}-title`}>{title}</title>
        <desc id={`${id}-desc`}>{description}</desc>
        <line
          x1={plotLeft}
          x2={plotRight}
          y1={plotBottom}
          y2={plotBottom}
          className="stroke-border"
          strokeWidth={1}
        />
        {points.map((point, index) => {
          if (point.value === null) return null;
          const height = Math.max(1, Math.round((point.value / max) * plotHeight));
          const x = plotLeft + slot * index + (slot - barWidth) / 2;
          return (
            <rect
              key={point.period}
              x={x}
              y={plotBottom - height}
              width={barWidth}
              height={height}
              rx={2}
              className="fill-primary"
            />
          );
        })}
        {labelIndexes.map((index) => {
          const point = points[index];
          if (!point) return null;
          const x = plotLeft + slot * index + slot / 2;
          return (
            <text
              key={point.period}
              x={x}
              y={plotBottom + 15}
              textAnchor={index === 0 ? "start" : index === points.length - 1 ? "end" : "middle"}
              className="fill-muted-fg text-[10px]"
            >
              {formatMonth(point.period, locale)}
            </text>
          );
        })}
      </svg>

      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-semibold text-primary">
          {labels.viewValues}
        </summary>
        <table className="mt-2 w-full text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-border text-left">
              <th scope="col" className="py-1.5 pr-3 font-semibold text-ink-soft">
                {labels.period}
              </th>
              <th scope="col" className="py-1.5 text-right font-semibold text-ink-soft">
                {heading}
              </th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.period} className="border-b border-border/60 last:border-0">
                <th scope="row" className="py-1.5 pr-3 text-left font-medium text-ink">
                  {formatMonth(point.period, locale)}
                </th>
                <td className="tabular py-1.5 text-right text-ink-soft">
                  {point.value === null ? "—" : formatNumber(point.value, locale)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
