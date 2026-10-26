/**
 * Creates or refreshes the admin account from ADMIN_EMAIL / ADMIN_PASSWORD.
 * Usage: ADMIN_EMAIL=you@example.ca ADMIN_PASSWORD='a long dev password' npm run create-admin
 */
import { db } from "@/db/client";
import { user } from "@/db/schema";
import { hashPassword } from "@/lib/auth";

async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
    process.exit(1);
  }
  if (password.length < 12) {
    console.error("ADMIN_PASSWORD must be at least 12 characters.");
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  await db
    .insert(user)
    .values({
      id: crypto.randomUUID(),
      email,
      passwordHash,
      name: "Administration",
      role: "admin",
      createdAt: new Date().toISOString(),
    })
    .onConflictDoUpdate({ target: user.email, set: { passwordHash, role: "admin" } });

  console.log(`Admin account ready: ${email}`);
}

main().catch((error) => {
  console.error("create-admin failed", error);
  process.exit(1);
});
