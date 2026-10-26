import type { ReactNode } from "react";

import { Badge } from "@/components/ui/content";
import { slugify } from "@/shared/slug";

/**
 * The designed "no data" state required by PRD AC-8 / F4.fail: a territory with no ingested roll
 * or no published statistics renders this notice instead of zeros.
 */
export function CoverageNotice({
  title,
  children,
  action,
  tone = "warning",
  warningLabel,
  infoLabel,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  tone?: "warning" | "info";
  warningLabel: string;
  infoLabel: string;
}) {
  const id = `couverture-${slugify(title)}`;
  return (
    <section
      aria-labelledby={id}
      className="rounded-card border border-dashed border-border-strong bg-surface/70 p-5 md:p-6"
    >
      <Badge tone={tone}>{tone === "warning" ? warningLabel : infoLabel}</Badge>
      <h2 id={id} className="mt-3 font-display text-lg font-bold text-ink">
        {title}
      </h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-ink-soft">{children}</div>
      {action ? <div className="mt-4">{action}</div> : null}
    </section>
  );
}
