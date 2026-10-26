import { count, desc, eq } from "drizzle-orm";
import Link from "next/link";

import { db } from "@/db/client";
import {
  auditEvent,
  claim,
  dataset,
  marketStat,
  newsletterSubscriber,
  outbox,
  premarketListing,
  propertyUnit,
  territory,
} from "@/db/schema";
import { Badge } from "@/components/ui/content";
import { formatDateFr } from "@/shared/format";

export const dynamic = "force-dynamic";

async function scalar(promise: Promise<Array<{ value: number | string }>>): Promise<number> {
  const rows = await promise;
  return Number(rows[0]?.value ?? 0);
}

export default async function AdminOverviewPage() {
  const [
    units,
    municipalities,
    stats,
    datasets,
    pendingClaims,
    listings,
    subscribers,
    pendingOutbox,
  ] = await Promise.all([
    scalar(db.select({ value: count() }).from(propertyUnit)),
    scalar(db.select({ value: count() }).from(territory).where(eq(territory.level, "municipalite"))),
    scalar(db.select({ value: count() }).from(marketStat)),
    scalar(db.select({ value: count() }).from(dataset)),
    scalar(db.select({ value: count() }).from(claim).where(eq(claim.status, "pending"))),
    scalar(db.select({ value: count() }).from(premarketListing)),
    scalar(db.select({ value: count() }).from(newsletterSubscriber)),
    scalar(db.select({ value: count() }).from(outbox).where(eq(outbox.status, "pending"))),
  ]);

  const recentAudit = await db
    .select({
      id: auditEvent.id,
      action: auditEvent.action,
      entity: auditEvent.entity,
      createdAt: auditEvent.createdAt,
    })
    .from(auditEvent)
    .orderBy(desc(auditEvent.createdAt))
    .limit(10);

  const cards = [
    { label: "Unités d'évaluation", value: units, href: "/admin/donnees" },
    { label: "Municipalités ingérées", value: municipalities, href: "/admin/donnees" },
    { label: "Statistiques de marché", value: stats, href: "/admin/donnees" },
    { label: "Jeux de données", value: datasets, href: "/admin/donnees" },
    { label: "Réclamations en attente", value: pendingClaims, href: "/admin/reclamations" },
    { label: "Annonces pré-marché", value: listings, href: "/admin/annonces" },
    { label: "Abonnés au Brief", value: subscribers, href: "/admin/outbox" },
    { label: "Messages en attente", value: pendingOutbox, href: "/admin/outbox" },
  ];

  return (
    <div className="space-y-10">
      <section aria-labelledby="couverture">
        <h2 id="couverture" className="font-display text-xl font-bold text-ink">
          Couverture des données
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <li key={card.label}>
              <Link
                href={card.href}
                className="block rounded-card border border-border bg-surface p-4 hover:border-primary/40"
              >
                <span className="text-xs font-semibold tracking-wide text-muted-fg uppercase">
                  {card.label}
                </span>
                <span className="tabular mt-1 block font-display text-[1.5rem] font-semibold tracking-tight text-ink">
                  {card.value}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {units === 0 ? (
          <p className="mt-4 rounded-xl border border-[#fdf3e4] bg-[#fdf3e4] px-4 py-3 text-sm text-warning">
            Aucune unité d&apos;évaluation chargée. Lancez <code>python3 pipeline/run.py</code> puis{" "}
            <code>npm run db:seed</code>.
          </p>
        ) : null}
      </section>

      <section aria-labelledby="journal">
        <h2 id="journal" className="font-display text-xl font-bold text-ink">
          Journal d&apos;audit (10 dernières actions)
        </h2>
        {recentAudit.length === 0 ? (
          <p className="mt-3 text-sm text-muted-fg">Aucune action enregistrée.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border rounded-card border border-border bg-surface">
            {recentAudit.map((event) => (
              <li key={event.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{event.action}</p>
                  <p className="text-xs text-muted-fg">
                    {event.entity} · {event.id.slice(0, 8)}
                  </p>
                </div>
                <Badge tone="neutral">{formatDateFr(event.createdAt)}</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
