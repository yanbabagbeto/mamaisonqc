import { Fragment } from "react";

import { formatMonthFr } from "@/shared/format";
import type { ProvenanceInfo } from "@/shared/provenance";

import { cn } from "./cn";

/**
 * Renders the attribution required by the datasets' CC-BY 4.0 licences and BY the product's
 * trust promise: every number says where it comes from and how fresh it is.
 */
export function Provenance({
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

  const unique = items.filter(
    (item, index) => items.findIndex((candidate) => candidate.datasetId === item.datasetId) === index,
  );

  return (
    <div
      className={cn("text-xs leading-relaxed text-muted-fg", className)}
      data-provenance={unique.map((item) => item.datasetId).join(",")}
    >
      <span className="font-semibold text-ink-soft">
        {compact ? "Source" : "Sources des données"} :
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
            {item.referenceDate ? `, données au ${formatMonthFr(item.referenceDate.slice(0, 7))}` : ""})
          </span>
        </Fragment>
      ))}
    </div>
  );
}
