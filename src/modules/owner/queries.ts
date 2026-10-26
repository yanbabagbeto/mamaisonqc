import { and, count, desc, eq, inArray } from "drizzle-orm";

import { db } from "@/db/client";
import {
  claim,
  dataset,
  premarketInterest,
  premarketListing,
  propertyUnit,
  territory,
} from "@/db/schema";
import type { ProvenanceInfo } from "@/shared/provenance";

/**
 * Read models for the owner area.
 *
 * Ownership rule (PRD §4, AC-6): every user-owned row is read with `user_id = session.userId`
 * inside the query itself. No function in this file accepts a user id from a query parameter,
 * and no caller can widen the scope by passing a different id: the id always comes from the
 * validated session in the page.
 */

export type UnitLookup = {
  id: string;
  matricule: string;
  municipalityCode: string;
  city: string | null;
  address: string | null;
  valueTotalCents: number;
  rollYear: number;
  marketRefDate: string | null;
  datasetId: string;
};

function toAddress(addrNo: string | null, addrStreet: string | null): string | null {
  const parts = [addrNo, addrStreet].filter((part): part is string => Boolean(part && part.trim()));
  return parts.length > 0 ? parts.join(" ") : null;
}

/**
 * Resolve a roll matricule to its unit. Matricules are unique per municipality, not province-wide,
 * so when the same value exists in more than one municipality we take the lowest municipality code:
 * deterministic, and displayed to the user before any claim is filed.
 */
export async function findUnitByMatricule(matricule: string): Promise<UnitLookup | null> {
  const trimmed = matricule.trim();
  if (trimmed.length === 0) return null;

  const [row] = await db
    .select({
      id: propertyUnit.id,
      matricule: propertyUnit.matricule,
      municipalityCode: propertyUnit.municipalityCode,
      addrNo: propertyUnit.addrNo,
      addrStreet: propertyUnit.addrStreet,
      valueTotalCents: propertyUnit.valueTotalCents,
      rollYear: propertyUnit.rollYear,
      marketRefDate: propertyUnit.marketRefDate,
      datasetId: propertyUnit.datasetId,
      city: territory.name,
    })
    .from(propertyUnit)
    .leftJoin(territory, eq(territory.codeGeo, propertyUnit.municipalityCode))
    .where(eq(propertyUnit.matricule, trimmed))
    .orderBy(propertyUnit.municipalityCode)
    .limit(1);

  if (!row) return null;
  return {
    id: row.id,
    matricule: row.matricule,
    municipalityCode: row.municipalityCode,
    city: row.city ?? null,
    address: toAddress(row.addrNo, row.addrStreet),
    valueTotalCents: row.valueTotalCents,
    rollYear: row.rollYear,
    marketRefDate: row.marketRefDate,
    datasetId: row.datasetId,
  };
}

/** Provenance block for a roll value, read from the `dataset` row the unit points at. */
export async function getRollProvenance(datasetId: string): Promise<ProvenanceInfo | null> {
  const [row] = await db
    .select({
      id: dataset.id,
      name: dataset.name,
      publisher: dataset.publisher,
      license: dataset.license,
      licenseUrl: dataset.licenseUrl,
      sourceUrl: dataset.sourceUrl,
      referenceDate: dataset.referenceDate,
      fetchedAt: dataset.fetchedAt,
    })
    .from(dataset)
    .where(eq(dataset.id, datasetId))
    .limit(1);

  if (!row) return null;
  return {
    datasetId: row.id,
    name: row.name,
    publisher: row.publisher,
    license: row.license,
    licenseUrl: row.licenseUrl,
    sourceUrl: row.sourceUrl,
    referenceDate: row.referenceDate,
    fetchedAt: row.fetchedAt,
  };
}

export type OwnerClaimRow = {
  id: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  decidedAt: string | null;
  unitId: string;
  matricule: string;
  address: string | null;
  city: string | null;
};

export async function listOwnClaims(userId: string): Promise<OwnerClaimRow[]> {
  const rows = await db
    .select({
      id: claim.id,
      status: claim.status,
      createdAt: claim.createdAt,
      decidedAt: claim.decidedAt,
      unitId: claim.propertyUnitId,
      matricule: propertyUnit.matricule,
      addrNo: propertyUnit.addrNo,
      addrStreet: propertyUnit.addrStreet,
      city: territory.name,
    })
    .from(claim)
    .innerJoin(propertyUnit, eq(propertyUnit.id, claim.propertyUnitId))
    .leftJoin(territory, eq(territory.codeGeo, propertyUnit.municipalityCode))
    .where(eq(claim.userId, userId))
    .orderBy(desc(claim.createdAt));

  return rows.map((row) => ({
    id: row.id,
    status: row.status as OwnerClaimRow["status"],
    createdAt: row.createdAt,
    decidedAt: row.decidedAt,
    unitId: row.unitId,
    matricule: row.matricule,
    address: toAddress(row.addrNo, row.addrStreet),
    city: row.city ?? null,
  }));
}

export type OwnerListingRow = {
  id: string;
  unitId: string;
  matricule: string;
  address: string | null;
  city: string | null;
  askingPriceCents: number;
  horizon: string;
  visibility: string;
  status: string;
  createdAt: string;
  interestCount: number;
};

export async function listOwnListings(userId: string): Promise<OwnerListingRow[]> {
  const rows = await db
    .select({
      id: premarketListing.id,
      unitId: premarketListing.propertyUnitId,
      matricule: propertyUnit.matricule,
      addrNo: propertyUnit.addrNo,
      addrStreet: propertyUnit.addrStreet,
      city: territory.name,
      askingPriceCents: premarketListing.askingPriceCents,
      horizon: premarketListing.horizon,
      visibility: premarketListing.visibility,
      status: premarketListing.status,
      createdAt: premarketListing.createdAt,
    })
    .from(premarketListing)
    .innerJoin(propertyUnit, eq(propertyUnit.id, premarketListing.propertyUnitId))
    .leftJoin(territory, eq(territory.codeGeo, propertyUnit.municipalityCode))
    .where(eq(premarketListing.userId, userId))
    .orderBy(desc(premarketListing.createdAt));

  const ids = rows.map((row) => row.id);
  const counts =
    ids.length > 0
      ? await db
          .select({ listingId: premarketInterest.listingId, total: count() })
          .from(premarketInterest)
          .where(inArray(premarketInterest.listingId, ids))
          .groupBy(premarketInterest.listingId)
      : [];
  const countByListing = new Map(counts.map((row) => [row.listingId, Number(row.total)]));

  return rows.map((row) => ({
    id: row.id,
    unitId: row.unitId,
    matricule: row.matricule,
    address: toAddress(row.addrNo, row.addrStreet),
    city: row.city ?? null,
    askingPriceCents: row.askingPriceCents,
    horizon: row.horizon,
    visibility: row.visibility,
    status: row.status,
    createdAt: row.createdAt,
    interestCount: countByListing.get(row.id) ?? 0,
  }));
}

export type OwnerInterestRow = {
  id: string;
  listingId: string;
  name: string;
  email: string;
  message: string | null;
  status: string;
  createdAt: string;
  address: string | null;
  city: string | null;
  askingPriceCents: number;
  horizon: string;
};

/**
 * Interests visible to an owner: those attached to the owner's OWN listings.
 *
 * The ownership predicate is part of the JOIN (`premarket_listing.user_id = userId`), so a row can
 * only appear when both the session user owns the listing and the listing matches the interest.
 * There is no route/query parameter path to another user's data (AC-6).
 */
export async function listOwnInterests(userId: string): Promise<OwnerInterestRow[]> {
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
      city: territory.name,
      askingPriceCents: premarketListing.askingPriceCents,
      horizon: premarketListing.horizon,
    })
    .from(premarketInterest)
    .innerJoin(
      premarketListing,
      and(eq(premarketListing.id, premarketInterest.listingId), eq(premarketListing.userId, userId)),
    )
    .innerJoin(propertyUnit, eq(propertyUnit.id, premarketListing.propertyUnitId))
    .leftJoin(territory, eq(territory.codeGeo, propertyUnit.municipalityCode))
    .orderBy(desc(premarketInterest.createdAt));

  return rows.map((row) => ({
    id: row.id,
    listingId: row.listingId,
    name: row.name,
    email: row.email,
    message: row.message,
    status: row.status,
    createdAt: row.createdAt,
    address: toAddress(row.addrNo, row.addrStreet),
    city: row.city ?? null,
    askingPriceCents: row.askingPriceCents,
    horizon: row.horizon,
  }));
}
