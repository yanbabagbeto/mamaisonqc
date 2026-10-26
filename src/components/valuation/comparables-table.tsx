import Link from "next/link";

import { localePath, type Locale } from "@/i18n/config";
import { formatAddress } from "@/modules/valuation/labels";
import { propertyTypeLabel, type EvaluationMessages } from "@/modules/valuation/messages";
import type { Comparable } from "@/modules/valuation/types";
import { formatArea, formatCad } from "@/shared/format";

/**
 * Comparables table. Every row links to its own `/evaluation/[matricule]` page (localised), so a
 * visitor can audit the comparable instead of trusting the range (PRD JTBD-1). Values are roll
 * values, not sale prices — the caption says so.
 */
export function ComparablesTable({
  comparables,
  messages,
  locale,
}: {
  comparables: Comparable[];
  messages: EvaluationMessages;
  locale: Locale;
}) {
  if (comparables.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[36rem] border-collapse text-sm">
        <caption className="sr-only">{messages.comparables.table.caption}</caption>
        <thead>
          <tr className="border-b border-border text-left text-xs font-semibold tracking-wide text-muted-fg uppercase">
            <th scope="col" className="py-2 pr-4">
              {messages.comparables.table.address}
            </th>
            <th scope="col" className="py-2 pr-4">
              {messages.comparables.table.type}
            </th>
            <th scope="col" className="py-2 pr-4 text-right">
              {messages.comparables.table.land}
            </th>
            <th scope="col" className="py-2 text-right">
              {messages.comparables.table.value}
            </th>
          </tr>
        </thead>
        <tbody>
          {comparables.map((comparable) => (
            <tr key={comparable.id} className="border-b border-border/70 last:border-0">
              <th scope="row" className="py-3 pr-4 text-left font-medium text-ink">
                <Link
                  href={localePath(
                    `/evaluation/${encodeURIComponent(comparable.matricule)}`,
                    locale,
                  )}
                  className="underline decoration-dotted underline-offset-2 hover:text-primary"
                >
                  {formatAddress(comparable, messages.addressFallback)}
                </Link>
              </th>
              <td className="py-3 pr-4 text-ink-soft">
                {propertyTypeLabel(messages, comparable.propertyType)}
              </td>
              <td className="tabular py-3 pr-4 text-right text-ink-soft">
                {formatArea(comparable.landAreaM2, locale)}
              </td>
              <td className="tabular py-3 text-right font-semibold text-ink">
                {formatCad(comparable.valueTotalCents, locale)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
