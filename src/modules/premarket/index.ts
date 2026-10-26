import { and, count, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/client";
import {
  auditEvent,
  outbox,
  premarketInterest,
  premarketListing,
  propertyUnit,
  territory,
} from "@/db/schema";
import { hasApprovedClaim } from "@/modules/claims";
import { AppError } from "@/shared/errors";

export const HORIZONS = ["0-3", "3-6", "6-12", "12+"] as const;
export const VISIBILITIES = ["acheteurs_verifies", "prive"] as const;

export const publishSchema = z.object({
  matricule: z.string().trim().min(1).max(64),
  askingPrice: z.coerce.number().min(1_000).max(50_000_000),
  horizon: z.enum(HORIZONS),
  description: z.string().trim().min(20, "Décrivez la propriété en quelques mots.").max(600),
  visibility: z.enum(VISIBILITIES).default("acheteurs_verifies"),
});

export const interestSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email("Adresse courriel invalide."),
  message: z.string().trim().max(600).optional().default(""),
});

export type PublicListing = {
  id: string;
  street: string;
  city: string;
  propertyType: string;
  landAreaM2: number | null;
  askingPriceCents: number;
  horizon: string;
  description: string;
  createdAt: string;
  interestCount: number;
};

/** Public view is masked: street name + city only, never the civic number (PRD AC-12). */
function toPublicListing(row: {
  id: string;
  addrStreet: string | null;
  city: string | null;
  propertyType: string;
  landAreaM2: number | null;
  askingPriceCents: number;
  horizon: string;
  description: string;
  createdAt: string;
  interestCount: number;
}): PublicListing {
  return {
    id: row.id,
    street: row.addrStreet ?? "Adresse non publiée",
    city: row.city ?? "Québec",
    propertyType: row.propertyType,
    landAreaM2: row.landAreaM2,
    askingPriceCents: row.askingPriceCents,
    horizon: row.horizon,
    description: row.description,
    createdAt: row.createdAt,
    interestCount: row.interestCount,
  };
}

export async function publishListing(userId: string, raw: unknown): Promise<{ id: string }> {
  const parsed = publishSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError("INVALID_INPUT", "Formulaire invalide.", parsed.error.flatten().fieldErrors);
  }

  const [unit] = await db
    .select({ id: propertyUnit.id })
    .from(propertyUnit)
    .where(eq(propertyUnit.matricule, parsed.data.matricule))
    .limit(1);
  if (!unit) {
    throw new AppError("NOT_FOUND", "Cette propriété n'est pas dans notre couverture actuelle.");
  }

  const owned = await hasApprovedClaim(userId, unit.id);
  if (!owned) {
    // AC: publishing for a unit you do not own is a 403, and nothing is written.
    throw new AppError("FORBIDDEN", "Vous devez d'abord faire approuver votre réclamation de page.");
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  await db.insert(premarketListing).values({
    id,
    userId,
    propertyUnitId: unit.id,
    askingPriceCents: Math.round(parsed.data.askingPrice * 100),
    horizon: parsed.data.horizon,
    description: parsed.data.description,
    visibility: parsed.data.visibility,
    status: "actif",
    createdAt: now,
  });

  await db.insert(auditEvent).values({
    id: crypto.randomUUID(),
    actorId: userId,
    action: "premarket.published",
    entity: "premarket_listing",
    entityId: id,
    payloadJson: JSON.stringify({ propertyUnitId: unit.id, horizon: parsed.data.horizon }),
    createdAt: now,
  });

  return { id };
}

export async function listPublicListings(limit = 24): Promise<PublicListing[]> {
  const rows = await db
    .select({
      id: premarketListing.id,
      addrStreet: propertyUnit.addrStreet,
      city: territory.name,
      propertyType: propertyUnit.propertyType,
      landAreaM2: propertyUnit.landAreaM2,
      askingPriceCents: premarketListing.askingPriceCents,
      horizon: premarketListing.horizon,
      description: premarketListing.description,
      createdAt: premarketListing.createdAt,
      interestCount: count(premarketInterest.id),
    })
    .from(premarketListing)
    .innerJoin(propertyUnit, eq(propertyUnit.id, premarketListing.propertyUnitId))
    .leftJoin(territory, eq(territory.codeGeo, propertyUnit.municipalityCode))
    .leftJoin(premarketInterest, eq(premarketInterest.listingId, premarketListing.id))
    .where(eq(premarketListing.status, "actif"))
    .groupBy(premarketListing.id)
    .orderBy(desc(premarketListing.createdAt))
    .limit(limit);

  return rows.map((row) => toPublicListing({ ...row, interestCount: Number(row.interestCount) }));
}

export async function getPublicListing(id: string): Promise<PublicListing | null> {
  const [row] = await db
    .select({
      id: premarketListing.id,
      addrStreet: propertyUnit.addrStreet,
      city: territory.name,
      propertyType: propertyUnit.propertyType,
      landAreaM2: propertyUnit.landAreaM2,
      askingPriceCents: premarketListing.askingPriceCents,
      horizon: premarketListing.horizon,
      description: premarketListing.description,
      createdAt: premarketListing.createdAt,
      interestCount: count(premarketInterest.id),
    })
    .from(premarketListing)
    .innerJoin(propertyUnit, eq(propertyUnit.id, premarketListing.propertyUnitId))
    .leftJoin(territory, eq(territory.codeGeo, propertyUnit.municipalityCode))
    .leftJoin(premarketInterest, eq(premarketInterest.listingId, premarketListing.id))
    .where(and(eq(premarketListing.id, id), eq(premarketListing.status, "actif")))
    .groupBy(premarketListing.id)
    .limit(1);

  return row ? toPublicListing({ ...row, interestCount: Number(row.interestCount) }) : null;
}

export async function recordInterest(listingId: string, raw: unknown): Promise<{ id: string }> {
  const parsed = interestSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError("INVALID_INPUT", "Formulaire invalide.", parsed.error.flatten().fieldErrors);
  }

  const [listing] = await db
    .select({ id: premarketListing.id, status: premarketListing.status, ownerId: premarketListing.userId })
    .from(premarketListing)
    .where(eq(premarketListing.id, listingId))
    .limit(1);
  if (!listing || listing.status !== "actif") {
    throw new AppError("NOT_FOUND", "Cette propriété n'est plus disponible en pré-marché.");
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  await db.insert(premarketInterest).values({
    id,
    listingId,
    name: parsed.data.name,
    email: parsed.data.email,
    message: parsed.data.message ?? "",
    status: "nouveau",
    createdAt: now,
  });

  // v1 has no mail provider: the notice lands in the outbox that the admin console shows.
  await db.insert(outbox).values({
    id: crypto.randomUUID(),
    kind: "lead",
    toEmail: parsed.data.email,
    subject: "Nouvel intérêt pour votre propriété en pré-marché",
    body: `${parsed.data.name} (${parsed.data.email}) est intéressé. Message : ${
      parsed.data.message || "(aucun message)"
    }`,
    status: "pending",
    createdAt: now,
  });

  return { id };
}

export type OwnedListing = {
  id: string;
  status: string;
  askingPriceCents: number;
  horizon: string;
  municipalityCode: string;
  street: string | null;
  matricule: string;
  interestCount: number;
  createdAt: string;
};

export async function listOwnedListings(userId: string): Promise<OwnedListing[]> {
  const rows = await db
    .select({
      id: premarketListing.id,
      status: premarketListing.status,
      askingPriceCents: premarketListing.askingPriceCents,
      horizon: premarketListing.horizon,
      municipalityCode: propertyUnit.municipalityCode,
      street: propertyUnit.addrStreet,
      matricule: propertyUnit.matricule,
      createdAt: premarketListing.createdAt,
      interestCount: count(premarketInterest.id),
    })
    .from(premarketListing)
    .innerJoin(propertyUnit, eq(propertyUnit.id, premarketListing.propertyUnitId))
    .leftJoin(premarketInterest, eq(premarketInterest.listingId, premarketListing.id))
    .where(eq(premarketListing.userId, userId))
    .groupBy(premarketListing.id)
    .orderBy(desc(premarketListing.createdAt));

  return rows.map((row) => ({ ...row, interestCount: Number(row.interestCount) }));
}

export type OwnerInterest = {
  id: string;
  listingId: string;
  name: string;
  email: string;
  message: string | null;
  status: string;
  createdAt: string;
  listingAddress: string | null;
};

/** Interests are read through the session user's own listings — never through a query param. */
export async function listInterestsForOwner(userId: string): Promise<OwnerInterest[]> {
  const listings = await db
    .select({ id: premarketListing.id })
    .from(premarketListing)
    .where(eq(premarketListing.userId, userId));
  if (listings.length === 0) return [];

  const ids = listings.map((row) => row.id);
  const rows = await db
    .select({
      id: premarketInterest.id,
      listingId: premarketInterest.listingId,
      name: premarketInterest.name,
      email: premarketInterest.email,
      message: premarketInterest.message,
      status: premarketInterest.status,
      createdAt: premarketInterest.createdAt,
      addrNo: propertyUnit.addrNo,
      addrStreet: propertyUnit.addrStreet,
    })
    .from(premarketInterest)
    .innerJoin(premarketListing, eq(premarketListing.id, premarketInterest.listingId))
    .innerJoin(propertyUnit, eq(propertyUnit.id, premarketListing.propertyUnitId))
    .where(inArray(premarketInterest.listingId, ids))
    .orderBy(desc(premarketInterest.createdAt));

  return rows.map((row) => ({
    id: row.id,
    listingId: row.listingId,
    name: row.name,
    email: row.email,
    message: row.message,
    status: row.status,
    createdAt: row.createdAt,
    listingAddress: [row.addrNo, row.addrStreet].filter(Boolean).join(" ") || null,
  }));
}

export async function setListingStatus(
  listingId: string,
  status: "actif" | "pause" | "retire",
): Promise<void> {
  const [row] = await db
    .select({ id: premarketListing.id })
    .from(premarketListing)
    .where(eq(premarketListing.id, listingId))
    .limit(1);
  if (!row) throw new AppError("NOT_FOUND", "Annonce introuvable.");
  await db.update(premarketListing).set({ status }).where(eq(premarketListing.id, listingId));
}
