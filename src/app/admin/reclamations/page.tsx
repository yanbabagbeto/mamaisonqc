import { Badge } from "@/components/ui/content";
import { Button } from "@/components/ui/button";
import { listPendingClaims } from "@/modules/claims";
import { formatDateFr } from "@/shared/format";
import { approveClaimAction, rejectClaimAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminClaimsPage() {
  const claims = await listPendingClaims();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-ink">Réclamations en attente</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Approuver une réclamation autorise son auteur à publier cette propriété en pré-marché et à
          voir ses intérêts. Chaque décision écrit un événement d&apos;audit.
        </p>
      </div>

      {claims.length === 0 ? (
        <p className="rounded-card border border-dashed border-border-strong bg-surface px-4 py-8 text-center text-sm text-muted-fg">
          Aucune réclamation en attente.
        </p>
      ) : (
        <ul className="space-y-3">
          {claims.map((claim) => (
            <li key={claim.id} className="rounded-card border border-border bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-base font-bold text-ink">
                    {claim.address ?? claim.matricule}
                  </p>
                  <p className="text-xs text-muted-fg">
                    {claim.matricule} · demandé le {formatDateFr(claim.createdAt)}
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">
                    {claim.userName} — {claim.userEmail}
                  </p>
                  {claim.evidence ? (
                    <p className="mt-2 rounded-lg bg-muted px-3 py-2 text-sm text-ink-soft">
                      « {claim.evidence} »
                    </p>
                  ) : null}
                </div>
                <Badge tone="warning">{claim.status}</Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <form action={approveClaimAction}>
                  <input type="hidden" name="claimId" value={claim.id} />
                  <Button type="submit" size="sm">
                    Approuver
                  </Button>
                </form>
                <form action={rejectClaimAction}>
                  <input type="hidden" name="claimId" value={claim.id} />
                  <Button type="submit" size="sm" variant="secondary">
                    Refuser
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
