import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/client";
import { auditEvent, claim, propertyUnit, user } from "@/db/schema";
import { AppError } from "@/shared/errors";

export const claimSchema = z.object({
  matricule: z.string().trim().min(1).max(64),
  evidence: z.string().trim().max(600).optional().default(""),
});

export type ClaimSummary = {
  id: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  propertyUnitId: string;
  matricule: string;
  address: string | null;
  municipalityCode: string;
};

async function findUnitByMatricule(matricule: string) {
  const [unit] = await db
    .select({
      id: propertyUnit.id,
      matricule: propertyUnit.matricule,
      municipalityCode: propertyUnit.municipalityCode,
      addrNo: propertyUnit.addrNo,
      addrStreet: propertyUnit.addrStreet,
    })
    .from(propertyUnit)
    .where(eq(propertyUnit.matricule, matricule))
    // Deterministic when a matricule exists in two municipalities (rare but possible):
    // always the lowest municipality code, matching what the claim page displays.
    .orderBy(asc(propertyUnit.municipalityCode), asc(propertyUnit.id))
    .limit(1);
  return unit ?? null;
}

/**
 * A claim is a *request* for ownership, never an ownership grant: it stays `pending` until an
 * administrator approves it. Unique (user, unit) so retries are idempotent (PRD F2.fail).
 */
export async function requestClaim(
  userId: string,
  raw: unknown,
): Promise<{ claimId: string; status: string; created: boolean }> {
  const parsed = claimSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError("INVALID_INPUT", "Demande invalide.");
  }
  const unit = await findUnitByMatricule(parsed.data.matricule);
  if (!unit) {
    throw new AppError("NOT_FOUND", "Cette propriété n'est pas dans notre couverture actuelle.");
  }

  const [existing] = await db
    .select({ id: claim.id, status: claim.status })
    .from(claim)
    .where(and(eq(claim.userId, userId), eq(claim.propertyUnitId, unit.id)))
    .limit(1);

  if (existing) {
    return { claimId: existing.id, status: existing.status, created: false };
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  try {
    await db.insert(claim).values({
      id,
      userId,
      propertyUnitId: unit.id,
      status: "pending",
      evidence: parsed.data.evidence ?? "",
      createdAt: now,
      decidedAt: null,
    });
  } catch (error) {
    // Unique index race: another request won, return the existing one instead of a 500.
    const [racer] = await db
      .select({ id: claim.id, status: claim.status })
      .from(claim)
      .where(and(eq(claim.userId, userId), eq(claim.propertyUnitId, unit.id)))
      .limit(1);
    if (racer) return { claimId: racer.id, status: racer.status, created: false };
    throw error;
  }

  await db.insert(auditEvent).values({
    id: crypto.randomUUID(),
    actorId: userId,
    action: "claim.requested",
    entity: "claim",
    entityId: id,
    payloadJson: JSON.stringify({ propertyUnitId: unit.id }),
    createdAt: now,
  });

  return { claimId: id, status: "pending", created: true };
}

export async function listClaimsFor(userId: string): Promise<ClaimSummary[]> {
  const rows = await db
    .select({
      id: claim.id,
      status: claim.status,
      createdAt: claim.createdAt,
      propertyUnitId: claim.propertyUnitId,
      matricule: propertyUnit.matricule,
      addrNo: propertyUnit.addrNo,
      addrStreet: propertyUnit.addrStreet,
      municipalityCode: propertyUnit.municipalityCode,
    })
    .from(claim)
    .innerJoin(propertyUnit, eq(propertyUnit.id, claim.propertyUnitId))
    .where(eq(claim.userId, userId))
    .orderBy(desc(claim.createdAt));

  return rows.map((row) => ({
    id: row.id,
    status: row.status as ClaimSummary["status"],
    createdAt: row.createdAt,
    propertyUnitId: row.propertyUnitId,
    matricule: row.matricule,
    address: [row.addrNo, row.addrStreet].filter(Boolean).join(" ") || null,
    municipalityCode: row.municipalityCode,
  }));
}

/** True only when an approved claim exists for this user and this unit (ownership check). */
export async function hasApprovedClaim(userId: string, propertyUnitId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: claim.id })
    .from(claim)
    .where(
      and(
        eq(claim.userId, userId),
        eq(claim.propertyUnitId, propertyUnitId),
        eq(claim.status, "approved"),
      ),
    )
    .limit(1);
  return Boolean(row);
}

export async function decideClaim(
  adminId: string,
  claimId: string,
  decision: "approved" | "rejected",
): Promise<void> {
  const [row] = await db.select({ id: claim.id }).from(claim).where(eq(claim.id, claimId)).limit(1);
  if (!row) throw new AppError("NOT_FOUND", "Demande introuvable.");
  const now = new Date().toISOString();
  await db.update(claim).set({ status: decision, decidedAt: now }).where(eq(claim.id, claimId));
  await db.insert(auditEvent).values({
    id: crypto.randomUUID(),
    actorId: adminId,
    action: decision === "approved" ? "claim.approved" : "claim.rejected",
    entity: "claim",
    entityId: claimId,
    payloadJson: JSON.stringify({ decision }),
    createdAt: now,
  });
}

export type PendingClaim = {
  id: string;
  status: string;
  createdAt: string;
  evidence: string | null;
  userEmail: string;
  userName: string;
  matricule: string;
  address: string | null;
};

export async function listPendingClaims(limit = 50): Promise<PendingClaim[]> {
  const rows = await db
    .select({
      id: claim.id,
      status: claim.status,
      createdAt: claim.createdAt,
      evidence: claim.evidence,
      userEmail: user.email,
      userName: user.name,
      matricule: propertyUnit.matricule,
      addrNo: propertyUnit.addrNo,
      addrStreet: propertyUnit.addrStreet,
    })
    .from(claim)
    .innerJoin(user, eq(user.id, claim.userId))
    .innerJoin(propertyUnit, eq(propertyUnit.id, claim.propertyUnitId))
    .where(eq(claim.status, "pending"))
    .orderBy(desc(claim.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    status: row.status,
    createdAt: row.createdAt,
    evidence: row.evidence,
    userEmail: row.userEmail,
    userName: row.userName,
    matricule: row.matricule,
    address: [row.addrNo, row.addrStreet].filter(Boolean).join(" ") || null,
  }));
}
