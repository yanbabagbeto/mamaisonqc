import { desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { premarketListing, propertyUnit, user } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/content";
import { formatCad, formatDateFr } from "@/shared/format";
import { setListingStatusAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminListingsPage() {
  const rows = await db
    .select({
      id: premarketListing.id,
      status: premarketListing.status,
      askingPriceCents: premarketListing.askingPriceCents,
      horizon: premarketListing.horizon,
      createdAt: premarketListing.createdAt,
      addrNo: propertyUnit.addrNo,
      addrStreet: propertyUnit.addrStreet,
      municipalityCode: propertyUnit.municipalityCode,
      ownerEmail: user.email,
    })
    .from(premarketListing)
    .innerJoin(propertyUnit, eq(propertyUnit.id, premarketListing.propertyUnitId))
    .innerJoin(user, eq(user.id, premarketListing.userId))
    .orderBy(desc(premarketListing.createdAt))
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-ink">Annonces de pré-marché</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Les annonces publiques masquent déjà le numéro civique. Ici, l&apos;équipe voit l&apos;adresse
          complète pour vérifier la cohérence et modérer.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-card border border-dashed border-border-strong bg-surface px-4 py-8 text-center text-sm text-muted-fg">
          Aucune annonce pour l&apos;instant.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Annonces de pré-marché et modération</caption>
            <thead className="border-b border-border bg-muted text-xs uppercase">
              <tr>
                <th scope="col" className="px-4 py-3">Propriété</th>
                <th scope="col" className="px-4 py-3">Propriétaire</th>
                <th scope="col" className="px-4 py-3">Prix</th>
                <th scope="col" className="px-4 py-3">État</th>
                <th scope="col" className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink">
                      {[row.addrNo, row.addrStreet].filter(Boolean).join(" ")}
                    </p>
                    <p className="text-xs text-muted-fg">
                      {row.municipalityCode} · {formatDateFr(row.createdAt)}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{row.ownerEmail}</td>
                  <td className="tabular px-4 py-3 text-ink">{formatCad(row.askingPriceCents)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={row.status === "actif" ? "success" : "neutral"}>{row.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {(["actif", "pause", "retire"] as const)
                        .filter((status) => status !== row.status)
                        .map((status) => (
                          <form key={status} action={setListingStatusAction}>
                            <input type="hidden" name="listingId" value={row.id} />
                            <input type="hidden" name="status" value={status} />
                            <Button type="submit" size="sm" variant="ghost">
                              {status === "actif" ? "Réactiver" : status === "pause" ? "Mettre en pause" : "Retirer"}
                            </Button>
                          </form>
                        ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
