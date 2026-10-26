import type { Locale } from "@/i18n/config";
import { slugify } from "@/shared/slug";

import { formatNumber, formatPercent } from "@/shared/format";

/**
 * Horizontal bar distribution, pure SVG (no chart library).
 *
 * Accessibility: the SVG is one labelled image (`role="img"`, `<title>`, `<desc>`), and the exact
 * values are also available as a table with a caption and `scope`-marked headers. The table is
 * collapsed behind a native `<details>` so the chart stays readable on mobile.
 */
export type DistributionItem = { label: string; value: number };

export type DistributionLabels = {
  viewValues: string;
  band: string;
  share: string;
};

export function BarDistribution({
  title,
  description,
  caption,
  items,
  locale,
  labels,
  valueHeading,
}: {
  title: string;
  description: string;
  caption: string;
  items: DistributionItem[];
  locale: Locale;
  labels: DistributionLabels;
  valueHeading: string;
}) {
  if (items.length === 0) return null;

  const id = slugify(title) || "distribution";
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const max = Math.max(...items.map((item) => item.value), 1);
  const rowHeight = 26;
  const topPad = 8;
  const labelWidth = 150;
  const barMax = 360 - labelWidth - 58;
  const height = items.length * rowHeight + topPad * 2;

  return (
    <figure className="min-w-0">
      <svg
        viewBox={`0 0 360 ${height}`}
        className="h-auto w-full max-w-md"
        role="img"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-desc`}
      >
        <title id={`${id}-title`}>{title}</title>
        <desc id={`${id}-desc`}>{description}</desc>
        {items.map((item, index) => {
          const y = topPad + index * rowHeight;
          const width = Math.max(2, Math.round((item.value / max) * barMax));
          return (
            <g key={item.label}>
              <text x={0} y={y + 18} className="fill-ink-soft text-[10px]">
                {item.label}
              </text>
              <rect
                x={labelWidth}
                y={y + 7}
                width={width}
                height={14}
                rx={3}
                className="fill-primary"
              />
              <text x={labelWidth + width + 6} y={y + 18} className="fill-muted-fg text-[10px]">
                {formatNumber(item.value, locale)}
              </text>
            </g>
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
                {labels.band}
              </th>
              <th scope="col" className="py-1.5 text-right font-semibold text-ink-soft">
                {valueHeading}
              </th>
              <th scope="col" className="py-1.5 text-right font-semibold text-ink-soft">
                {labels.share}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.label} className="border-b border-border/60 last:border-0">
                <th scope="row" className="py-1.5 pr-3 text-left font-medium text-ink">
                  {item.label}
                </th>
                <td className="tabular py-1.5 text-right text-ink-soft">
                  {formatNumber(item.value, locale)}
                </td>
                <td className="tabular py-1.5 text-right text-muted-fg">
                  {total > 0 ? formatPercent(item.value / total, 1, locale) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
