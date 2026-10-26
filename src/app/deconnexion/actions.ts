"use server";

import { redirect } from "next/navigation";

import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { destroySession } from "@/lib/auth";

/**
 * Logout. `destroySession()` deletes the session row and the HttpOnly cookie, so it may only run
 * from a Server Action or Route Handler — never during a page render.
 */
export async function signOutAction(): Promise<void> {
  const locale = await getLocale();
  await destroySession();
  redirect(`${localePath("/connexion", locale)}?deconnexion=1`);
}
