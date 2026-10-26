import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "./breadcrumbs";

/** Shared hero for the three market routes: breadcrumbs, eyebrow, h1, lead, then page-specific bits. */
export function MarketPageHeader({
  crumbs,
  breadcrumbsLabel,
  eyebrow,
  title,
  lead,
  children,
}: {
  crumbs: Crumb[];
  breadcrumbsLabel: string;
  eyebrow: string;
  title: string;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="container-page py-8 md:py-12">
        <Breadcrumbs label={breadcrumbsLabel} items={crumbs} />
        <p className="mt-6 flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-accent uppercase">
          <span aria-hidden="true" className="inline-block h-0.5 w-6 bg-accent" />
          {eyebrow}
        </p>
        <h1 className="mt-3 font-display text-3xl leading-tight font-extrabold text-ink sm:text-4xl md:text-[2.9rem]">
          {title}
        </h1>
        {lead ? <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-soft">{lead}</p> : null}
        {children ? <div className="mt-5">{children}</div> : null}
      </div>
    </header>
  );
}
