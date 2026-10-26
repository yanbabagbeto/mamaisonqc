import { and, asc, desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import {
  auditEvent,
  buyerWaitlist,
  notificationPref,
  outbox,
  premarketInterest,
  premarketListing,
  propertyUnit,
  savedListing,
  territory,
} from "@/db/schema";
import { AppError } from "@/shared/errors";

import { buildRegionIndex } from "./regions";
import {
  defaultNotificationPrefs,
  NOTIFICATION_KEYS,
  type BuyerInterest,
  type BuyerSavedListing,
  type ExplorerListing,
  type NotificationKey,
  type NotificationPrefs,
  type RegionOption,
} from "./types";

/**
 * Buyer read/write adapter.
 *
 * Ownership rule (PRD AC-6): every user-owned row is read or written with
 * `user_id = session.userId` inside the query itself. No function accepts a user id from a query
 * parameter. Public listings are masked upstream (street + city, never the civic number).
 */

const EXPLORER_LIMIT = 200;

export async function listExplorerListings(): Promise<ExplorerListing[]> {
  const rows = await db
    .select({
      id: premarketListing.id,
      street: propertyUnit.addrStreet,
      city: territory.name,
      municipalityCode: propertyUnit.municipalityCode,
      propertyType: propertyUnit.propertyType,
      horizon: premarketListing.horizon,
      askingPriceCents: premarketListing.askingPriceCents,
      lat: propertyUnit.lat,
      lon: propertyUnit.lon,
      createdAt: premarketListing.createdAt,
    })
    .from(premarketListing)
    .innerJoin(propertyUnit, eq(propertyUnit.id, premarketListing.propertyUnitId))
    .leftJoin(territory, eq(territory.codeGeo, propertyUnit.municipalityCode))
    .where(eq(premarketListing.status, "actif"))
    .orderBy(desc(premarketListing.createdAt), desc(premarketListing.id))
    .limit(EXPLORER_LIMIT);

  return rows.map((row) => ({
    id: row.id,
    street: row.street?.trim() ?? "",
    city: row.city?.trim() ?? "",
    municipalityCode: row.municipalityCode,
    propertyType: row.propertyType,
    horizon: row.horizon,
    askingPriceCents: row.askingPriceCents,
    lat: row.lat ?? null,
    lon: row.lon ?? null,
    createdAt: row.createdAt,
  }));
}

export async function listRegionOptions(): Promise<RegionOption[]> {
  return db
    .select({ code: territory.codeGeo, name: territory.name, slug: territory.slug })
    .from(territory)
    .where(eq(territory.level, "region"))
    .orderBy(asc(territory.name));
}

export async function loadRegionByMunicipality(): Promise<Record<string, string | null>> {
  const rows = await db
    .select({
      codeGeo: territory.codeGeo,
      level: territory.level,
      parentCode: territory.parentCode,
    })
    .from(territory);
  return buildRegionIndex(rows);
}

export async function listSavedListingIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ listingId: savedListing.listingId })
    .from(savedListing)
    .where(eq(savedListing.userId, userId))
    .orderBy(desc(savedListing.createdAt));
  return rows.map((row) => row.listingId);
}

export async function listSavedListings(userId: string): Promise<BuyerSavedListing[]> {
  const rows = await db
    .select({
      savedId: savedListing.id,
      savedAt: savedListing.createdAt,
      listingId: premarketListing.id,
      street: propertyUnit.addrStreet,
      city: territory.name,
      propertyType: propertyUnit.propertyType,
      horizon: premarketListing.horizon,
      askingPriceCents: premarketListing.askingPriceCents,
    })
    .from(savedListing)
    .innerJoin(premarketListing, eq(premarketListing.id, savedListing.listingId))
    .innerJoin(propertyUnit, eq(propertyUnit.id, premarketListing.propertyUnitId))
    .leftJoin(territory, eq(territory.codeGeo, propertyUnit.municipalityCode))
    .where(and(eq(savedListing.userId, userId), eq(premarketListing.status, "actif")))
    .orderBy(desc(savedListing.createdAt), desc(savedListing.id));

  return rows.map((row) => ({
    savedId: row.savedId,
    listingId: row.listingId,
    street: row.street?.trim() ?? "",
    city: row.city?.trim() ?? "",
    propertyType: row.propertyType,
    horizon: row.horizon,
    askingPriceCents: row.askingPriceCents,
    savedAt: row.savedAt,
  }));
}

export async function listBuyerInterests(email: string): Promise<BuyerInterest[]> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return [];

  const rows = await db
    .select({
      id: premarketInterest.id,
      listingId: premarketInterest.listingId,
      message: premarketInterest.message,
      status: premarketInterest.status,
      createdAt: premarketInterest.createdAt,
      street: propertyUnit.addrStreet,
      city: territory.name,
    })
    .from(premarketInterest)
    .innerJoin(premarketListing, eq(premarketListing.id, premarketInterest.listingId))
    .innerJoin(propertyUnit, eq(propertyUnit.id, premarketListing.propertyUnitId))
    .leftJoin(territory, eq(territory.codeGeo, propertyUnit.municipalityCode))
    .where(eq(premarketInterest.email, normalized))
    .orderBy(desc(premarketInterest.createdAt), desc(premarketInterest.id))
    .limit(100);

  return rows.map((row) => ({
    id: row.id,
    listingId: row.listingId,
    street: row.street?.trim() ?? "",
    city: row.city?.trim() ?? "",
    message: row.message,
    status: row.status,
    createdAt: row.createdAt,
  }));
}

export async function getNotificationPrefs(userId: string): Promise<NotificationPrefs> {
  const prefs = defaultNotificationPrefs();
  const rows = await db
    .select({ key: notificationPref.key, enabled: notificationPref.enabled })
    .from(notificationPref)
    .where(eq(notificationPref.userId, userId));
  for (const row of rows) {
    if ((NOTIFICATION_KEYS as readonly string[]).includes(row.key)) {
      prefs[row.key as NotificationKey] = row.enabled === 1;
    }
  }
  return prefs;
}

export async function saveNotificationPrefs(
  userId: string,
  prefs: NotificationPrefs,
): Promise<void> {
  for (const key of NOTIFICATION_KEYS) {
    const enabled = prefs[key] ? 1 : 0;
    await db
      .insert(notificationPref)
      .values({ id: crypto.randomUUID(), userId, key, enabled })
      .onConflictDoUpdate({
        target: [notificationPref.userId, notificationPref.key],
        set: { enabled },
      });
  }
}

export async function isListingActive(listingId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: premarketListing.id })
    .from(premarketListing)
    .where(and(eq(premarketListing.id, listingId), eq(premarketListing.status, "actif")))
    .limit(1);
  return Boolean(row);
}

/** Idempotent save: the unique index on (user_id, listing_id) makes a repeated save a no-op. */
export async function saveListing(userId: string, listingId: string): Promise<{ saved: true }> {
  if (!(await isListingActive(listingId))) {
    throw new AppError("NOT_FOUND", "Cette propriété n'est plus disponible en pré-marché.");
  }
  await db
    .insert(savedListing)
    .values({
      id: crypto.randomUUID(),
      userId,
      listingId,
      createdAt: new Date().toISOString(),
    })
    .onConflictDoNothing({ target: [savedListing.userId, savedListing.listingId] });
  return { saved: true };
}

/** Ownership is enforced by the WHERE clause: a wrong user id deletes nothing. */
export async function unsaveListing(
  userId: string,
  listingId: string,
): Promise<{ saved: false }> {
  await db
    .delete(savedListing)
    .where(and(eq(savedListing.userId, userId), eq(savedListing.listingId, listingId)));
  return { saved: false };
}

export async function hasWaitlistRequest(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;
  const [row] = await db
    .select({ id: buyerWaitlist.id })
    .from(buyerWaitlist)
    .where(eq(buyerWaitlist.email, normalized))
    .limit(1);
  return Boolean(row);
}

export async function createWaitlistRequest(input: {
  userId: string | null;
  email: string;
  note: string | null;
  policyVersion: string;
}): Promise<{ id: string }> {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  await db.insert(buyerWaitlist).values({
    id,
    userId: input.userId,
    email: input.email.trim().toLowerCase(),
    note: input.note,
    status: "pending",
    createdAt: now,
  });
  // Explicit Loi 25 consent trail: which policy version, when, and from which account.
  await db.insert(auditEvent).values({
    id: crypto.randomUUID(),
    actorId: input.userId,
    action: "buyer.waitlist.consent",
    entity: "buyer_waitlist",
    entityId: id,
    payloadJson: JSON.stringify({
      email: input.email.trim().toLowerCase(),
      policyVersion: input.policyVersion,
      consentAt: now,
    }),
    createdAt: now,
  });
  return { id };
}

export async function recordAccountDeletionRequest(input: {
  userId: string;
  email: string;
  subject: string;
  body: string;
}): Promise<void> {
  const now = new Date().toISOString();
  await db.insert(auditEvent).values({
    id: crypto.randomUUID(),
    actorId: input.userId,
    action: "account.deletion_requested",
    entity: "user",
    entityId: input.userId,
    payloadJson: JSON.stringify({ email: input.email, requestedAt: now, path: "30-days" }),
    createdAt: now,
  });
  await db.insert(outbox).values({
    id: crypto.randomUUID(),
    kind: "mail",
    toEmail: input.email,
    subject: input.subject,
    body: input.body,
    status: "pending",
    createdAt: now,
  });
}
