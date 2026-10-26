import type { ProvenanceInfo } from "@/shared/provenance";

/**
 * Missing figures stay `null` and missing datasets stay out of the block — the mobile UI renders
 * the "statistiques non publiées" / "rôle non ingéré" states instead of zeros (PRD AC-8).
 */
export function dedupeProvenance(items: ReadonlyArray<ProvenanceInfo>): ProvenanceInfo[] {
  const byId = new Map<string, ProvenanceInfo>();
  for (const item of items) {
    if (!byId.has(item.datasetId)) byId.set(item.datasetId, item);
  }
  return [...byId.values()].sort((a, b) => a.datasetId.localeCompare(b.datasetId));
}
