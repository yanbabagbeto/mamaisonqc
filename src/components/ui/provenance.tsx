import { Fragment } from "react";

import { getLocale } from "@/i18n/server";
import { formatMonthFr } from "@/shared/format";
import type { ProvenanceInfo } from "@/shared/provenance";

import { cn } from "./cn";

/**
 * Renders the attribution required by the datasets' CC-BY 4.0 licences and BY the product's
 * trust promise: every number says where it comes from and how fresh it is.
 *
 * Server component: it reads the active locale itself so callers do not have to thread it through.
 */
export async function Provenance({
  items,
  className,
  compact = false,
}: {
  items: ProvenanceInfo[];
  className?: string;
  compact?: boolean;
}) {
  if (items.length === 0) {
    return null;
  }

  const locale = await getLocale();
  const isEn = locale === "en";

  const unique = items.filter(
    (item, index) => items.findIndex((candidate) => candidate.datasetId === item.datasetId) === index,
  );

  return (
    <div
      className={cn("text-xs leading-relaxed text-muted-fg", className)}
      data-provenance={unique.map((item) => item.datasetId).join(",")}
    >
      <span className="font-semibold text-ink-soft">
        {compact ? (isEn ? "Source" : "Source") : isEn ? "Data sources" : "Sources des données"} :
      </span>{" "}
      {unique.map((item, index) => (
        <Fragment key={item.datasetId}>
          {index > 0 ? <span aria-hidden="true"> · </span> : null}
          <a
            href={item.sourceUrl}
            className="underline decoration-dotted underline-offset-2 hover:text-primary"
            rel="noreferrer noopener"
            target="_blank"
          >
            {item.name}
          </a>
          <span className="text-muted-fg">
            {" "}
            ({item.publisher}, {item.license}
            {item.referenceDate
              ? isEn
                ? `, data as of ${formatMonthFr(item.referenceDate.slice(0, 7), "en")}`
                : `, données au ${formatMonthFr(item.referenceDate.slice(0, 7), "fr")}`
              : ""}
            )
          </span>
        </Fragment>
      ))}
    </div>
  );
}
