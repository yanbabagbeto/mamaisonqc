import { sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

/**
 * All money is stored as integer cents (never floats).
 * All timestamps are ISO-8601 UTC strings.
 * Every public dataset is registered in `dataset` and joined into rendered figures
 * for provenance (see docs/adr/ADR-005-provenance-first.md).
 */

export const dataset = sqliteTable("dataset", {
  id: text("id").primaryKey(), // e.g. "role-evaluation-2026"
  name: text("name").notNull(),
  publisher: text("publisher").notNull(),
  license: text("license").notNull(), // e.g. "CC-BY 4.0"
  licenseUrl: text("license_url"),
  sourceUrl: text("source_url").notNull(),
  fetchedAt: text("fetched_at").notNull(),
  referenceDate: text("reference_date"),
  rowCount: integer("row_count").notNull().default(0),
  checksum: text("checksum"),
  notes: text("notes"),
});

export const territory = sqliteTable(
  "territory",
  {
    codeGeo: text("code_geo").primaryKey(), // code géographique MAMH
    name: text("name").notNull(),
    level: text("level").notNull(), // province | region | mrc | municipalite
    parentCode: text("parent_code"),
    slug: text("slug").notNull(),
    population: integer("population"),
  },
  (t) => [
    index("territory_level_name_idx").on(t.level, t.name),
    index("territory_parent_idx").on(t.parentCode),
    uniqueIndex("territory_slug_idx").on(t.slug),
  ],
);

export const propertyUnit = sqliteTable(
  "property_unit",
  {
    id: text("id").primaryKey(), // `${municipalityCode}-${matricule}`
    municipalityCode: text("municipality_code").notNull(),
    matricule: text("matricule").notNull(), // RL0103Ax
    umv: text("umv"), // RL0107A — assessor neighbourhood unit
    cubf: text("cubf"), // RL0105A — dominant use code
    cubfLabel: text("cubf_label"),
    propertyType: text("property_type").notNull().default("autre"), // unifamiliale | copropriete | plex | terrain | autre
    addrNo: text("addr_no"), // RL0101Ax
    addrStreet: text("addr_street"), // RL0101Gx
    addrStreetNorm: text("addr_street_norm"), // lowercased, accent-stripped, for search matching
    addrSuite: text("addr_suite"), // RL0101Ix
    landAreaM2: real("land_area_m2"), // RL0302A
    frontageM: real("frontage_m"), // RL0301A
    yearBuilt: integer("year_built"), // RL0307A
    floors: real("floors"), // RL0306A
    valueLandCents: integer("value_land_cents").notNull().default(0), // RL0402A
    valueBuildingCents: integer("value_building_cents").notNull().default(0), // RL0403A
    valueTotalCents: integer("value_total_cents").notNull().default(0), // RL0404A
    valuePriorCents: integer("value_prior_cents"), // RL0405A
    lat: real("lat"), // centroid from the georeferenced roll, when available
    lon: real("lon"),
    marketRefDate: text("market_ref_date"), // RL0401A
    rollYear: integer("roll_year").notNull(),
    sourceUrl: text("source_url").notNull(),
    datasetId: text("dataset_id").notNull(),
  },
  (t) => [
    uniqueIndex("property_unit_matricule_idx").on(t.municipalityCode, t.matricule),
    index("property_unit_comps_idx").on(t.municipalityCode, t.umv, t.cubf),
    index("property_unit_street_idx").on(t.addrStreetNorm, t.addrNo),
    index("property_unit_umv_idx").on(t.umv),
  ],
);

export const marketStat = sqliteTable(
  "market_stat",
  {
    id: text("id").primaryKey(),
    period: text("period").notNull(), // YYYY-MM
    regionCode: text("region_code").notNull(),
    municipalityCode: text("municipality_code"),
    kind: text("kind").notNull(), // ventes | transferts | hypotheques | difficultes
    priceBand: text("price_band"), // band label from source, null for counts
    count: integer("count").notNull().default(0),
    datasetId: text("dataset_id").notNull(),
  },
  (t) => [
    index("market_stat_region_period_idx").on(t.regionCode, t.period, t.kind),
    index("market_stat_muni_idx").on(t.municipalityCode, t.period, t.kind),
  ],
);

export const valuationSnapshot = sqliteTable(
  "valuation_snapshot",
  {
    id: text("id").primaryKey(),
    propertyUnitId: text("property_unit_id").notNull(),
    estimateCents: integer("estimate_cents").notNull(),
    lowCents: integer("low_cents").notNull(),
    highCents: integer("high_cents").notNull(),
    confidence: text("confidence").notNull(), // faible | moyenne | elevee
    comparablesCount: integer("comparables_count").notNull(),
    modelVersion: text("model_version").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (t) => [index("valuation_unit_idx").on(t.propertyUnitId, t.createdAt)],
);

export const user = sqliteTable(
  "user",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    role: text("role").notNull().default("owner"), // owner | admin
    createdAt: text("created_at").notNull(),
  },
  (t) => [uniqueIndex("user_email_idx").on(t.email)],
);

export const session = sqliteTable(
  "session",
  {
    idHash: text("id_hash").primaryKey(), // sha256 of the opaque token
    userId: text("user_id").notNull(),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at").notNull(),
    userAgent: text("user_agent"),
  },
  (t) => [index("session_user_idx").on(t.userId), index("session_exp_idx").on(t.expiresAt)],
);

export const claim = sqliteTable(
  "claim",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    propertyUnitId: text("property_unit_id").notNull(),
    status: text("status").notNull().default("pending"), // pending | approved | rejected
    evidence: text("evidence"),
    createdAt: text("created_at").notNull(),
    decidedAt: text("decided_at"),
  },
  (t) => [
    uniqueIndex("claim_user_unit_idx").on(t.userId, t.propertyUnitId),
    index("claim_status_idx").on(t.status),
    index("claim_user_idx").on(t.userId),
  ],
);

export const premarketListing = sqliteTable(
  "premarket_listing",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    propertyUnitId: text("property_unit_id").notNull(),
    askingPriceCents: integer("asking_price_cents").notNull(),
    horizon: text("horizon").notNull(), // 0-3 | 3-6 | 6-12 | 12+
    description: text("description").notNull(),
    visibility: text("visibility").notNull().default("acheteurs_verifies"),
    status: text("status").notNull().default("actif"), // actif | pause | retire
    createdAt: text("created_at").notNull(),
  },
  (t) => [
    index("premarket_user_idx").on(t.userId),
    index("premarket_status_idx").on(t.status, t.createdAt),
  ],
);

export const premarketInterest = sqliteTable(
  "premarket_interest",
  {
    id: text("id").primaryKey(),
    listingId: text("listing_id").notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    message: text("message"),
    status: text("status").notNull().default("nouveau"), // nouveau | contacte | clos
    createdAt: text("created_at").notNull(),
  },
  (t) => [index("interest_listing_idx").on(t.listingId, t.createdAt)],
);

export const newsletterSubscriber = sqliteTable(
  "newsletter_subscriber",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    consentAt: text("consent_at").notNull(),
    source: text("source").notNull(),
    unsubscribeToken: text("unsubscribe_token").notNull(),
    unsubscribedAt: text("unsubscribed_at"),
  },
  (t) => [uniqueIndex("newsletter_email_idx").on(t.email)],
);

export const consentEvent = sqliteTable(
  "consent_event",
  {
    id: text("id").primaryKey(),
    sessionKey: text("session_key").notNull(),
    choice: text("choice").notNull(), // accepte | refuse
    policyVersion: text("policy_version").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (t) => [index("consent_created_idx").on(t.createdAt)],
);

export const pageView = sqliteTable(
  "page_view",
  {
    id: text("id").primaryKey(),
    path: text("path").notNull(),
    referrer: text("referrer"),
    createdAt: text("created_at").notNull(),
  },
  (t) => [index("page_view_created_idx").on(t.createdAt), index("page_view_path_idx").on(t.path)],
);

export const auditEvent = sqliteTable(
  "audit_event",
  {
    id: text("id").primaryKey(),
    actorId: text("actor_id"),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: text("entity_id").notNull(),
    payloadJson: text("payload_json"),
    createdAt: text("created_at").notNull(),
  },
  (t) => [index("audit_entity_idx").on(t.entity, t.entityId), index("audit_created_idx").on(t.createdAt)],
);

export const outbox = sqliteTable(
  "outbox",
  {
    id: text("id").primaryKey(),
    kind: text("kind").notNull(), // mail | lead
    toEmail: text("to_email").notNull(),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    status: text("status").notNull().default("pending"), // pending | sent | failed
    createdAt: text("created_at").notNull(),
  },
  (t) => [index("outbox_status_idx").on(t.status, t.createdAt)],
);


export const savedListing = sqliteTable(
  "saved_listing",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    listingId: text("listing_id").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (t) => [
    uniqueIndex("saved_listing_user_idx").on(t.userId, t.listingId),
    index("saved_listing_listing_idx").on(t.listingId),
  ],
);

export const buyerWaitlist = sqliteTable(
  "buyer_waitlist",
  {
    id: text("id").primaryKey(),
    userId: text("user_id"),
    email: text("email").notNull(),
    note: text("note"),
    status: text("status").notNull().default("pending"), // pending | contacted | closed
    createdAt: text("created_at").notNull(),
  },
  (t) => [index("buyer_waitlist_created_idx").on(t.createdAt), index("buyer_waitlist_email_idx").on(t.email)],
);

export const notificationPref = sqliteTable(
  "notification_pref",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    key: text("key").notNull(), // offres | annonce | marche | conseils
    enabled: integer("enabled").notNull().default(1),
  },
  (t) => [uniqueIndex("notification_pref_user_key_idx").on(t.userId, t.key)],
);

export const schemaTables = {
  dataset,
  territory,
  propertyUnit,
  marketStat,
  valuationSnapshot,
  user,
  session,
  claim,
  premarketListing,
  premarketInterest,
  newsletterSubscriber,
  consentEvent,
  pageView,
  auditEvent,
  outbox,
  savedListing,
  buyerWaitlist,
  notificationPref,
};

export const nowIso = () => sql`strftime('%Y-%m-%dT%H:%M:%fZ','now')`;
