import { createHash, randomBytes } from "node:crypto";

import bcrypt from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";

import { db } from "@/db/client";
import { session, user } from "@/db/schema";
import { AppError } from "@/shared/errors";

/**
 * Owned opaque-session auth (docs/adr/ADR-003-session-auth.md).
 * The token lives only in an HttpOnly cookie; the database stores its SHA-256 hash,
 * so a database read cannot reconstruct a usable cookie.
 */

const COOKIE_NAME = "maqc_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "owner" | "admin";
};

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export async function createUser(input: {
  email: string;
  password: string;
  name: string;
  role?: "owner" | "admin";
}): Promise<SessionUser> {
  const email = input.email.trim().toLowerCase();
  const existing = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1);
  if (existing.length > 0) {
    throw new AppError("CONFLICT", "Un compte existe déjà avec ce courriel.");
  }
  const passwordHash = await hashPassword(input.password);
  const [row] = await db
    .insert(user)
    .values({
      id: crypto.randomUUID(),
      email,
      passwordHash,
      name: input.name.trim(),
      role: input.role ?? "owner",
      createdAt: new Date().toISOString(),
    })
    .returning({ id: user.id, email: user.email, name: user.name, role: user.role });
  if (!row) {
    throw new AppError("INTERNAL", "Création du compte impossible.");
  }
  return { ...row, role: row.role as "owner" | "admin" };
}

/** A real bcrypt hash used only to burn the same CPU time when the email is unknown. */
let dummyHashPromise: Promise<string> | null = null;
function dummyHash(): Promise<string> {
  dummyHashPromise ??= bcrypt.hash("maisonqc-timing-equaliser", 12);
  return dummyHashPromise;
}

export async function authenticate(email: string, password: string): Promise<SessionUser> {
  const [row] = await db
    .select()
    .from(user)
    .where(eq(user.email, email.trim().toLowerCase()))
    .limit(1);
  if (!row) {
    // Same message AND the same bcrypt cost whether the email exists or not: no enumeration,
    // no timing oracle (reported by the owner teammate and fixed here).
    await verifyPassword(password, await dummyHash());
    throw new AppError("UNAUTHORIZED", "Courriel ou mot de passe invalide.");
  }
  const valid = await verifyPassword(password, row.passwordHash);
  if (!valid) {
    throw new AppError("UNAUTHORIZED", "Courriel ou mot de passe invalide.");
  }
  return { id: row.id, email: row.email, name: row.name, role: row.role as "owner" | "admin" };
}

/** Sets the session cookie. Only callable from a Route Handler or a Server Action. */
export async function startSession(userId: string, userAgent?: string | null): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const now = Date.now();
  const expiresAt = new Date(now + SESSION_TTL_MS);
  await db.insert(session).values({
    idHash: hashToken(token),
    userId,
    expiresAt: expiresAt.toISOString(),
    createdAt: new Date(now).toISOString(),
    userAgent: userAgent ?? null,
  });
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) {
    await db.delete(session).where(eq(session.idHash, hashToken(token)));
  }
  store.delete(COOKIE_NAME);
}

/** Returns the signed-in user, or null. Never throws for a missing/invalid session. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const [row] = await db
    .select({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })
    .from(session)
    .innerJoin(user, eq(user.id, session.userId))
    .where(and(eq(session.idHash, hashToken(token)), gt(session.expiresAt, new Date().toISOString())))
    .limit(1);

  if (!row) return null;
  return { ...row, role: row.role as "owner" | "admin" };
}

export async function requireUser(): Promise<SessionUser> {
  const current = await getCurrentUser();
  if (!current) {
    throw new AppError("UNAUTHORIZED", "Connexion requise.");
  }
  return current;
}

export async function requireAdmin(): Promise<SessionUser> {
  const current = await requireUser();
  if (current.role !== "admin") {
    // 404 at the page level for non-admins to avoid disclosing the route (PRD AC-11).
    throw new AppError("FORBIDDEN", "Accès refusé.");
  }
  return current;
}
