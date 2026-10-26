"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { createUser, startSession } from "@/lib/auth";
import { rateLimit } from "@/lib/request-guards";
import { requestClaim } from "@/modules/claims";
import type { AuthErrors, SignUpState } from "@/modules/owner/auth-state";
import { fieldErrorsFromZod, signUpSchema } from "@/modules/owner/auth-schema";
import { messagesFor } from "@/modules/owner/messages";
import { AppError } from "@/shared/errors";

/**
 * Sign-up Server Action, including the `/inscription?claim=<matricule>` deep link.
 *
 * - duplicate emails get the same generic message as any other creation failure
 *   (no account enumeration);
 * - after the account and session exist, the claim deep link becomes a `claim` row with status
 *   `pending` plus exactly one `claim.requested` audit event (delegated to the claims module, which
 *   owns that transition and its idempotency);
 * - a claim failure never discards the new account: the owner lands on the dashboard with a notice.
 */
export async function signUpAction(_previous: SignUpState, formData: FormData): Promise<SignUpState> {
  const locale = await getLocale();
  const t = messagesFor(locale).auth.errors;
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirm: String(formData.get("confirm") ?? ""),
    claim: String(formData.get("claim") ?? ""),
  };
  const values = { name: raw.name, email: raw.email, claim: raw.claim };
  const errors: AuthErrors = {};

  const parsed = signUpSchema(locale).safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = fieldErrorsFromZod(parsed.error.issues);
    return {
      values,
      errors: {
        name: fieldErrors.name,
        email: fieldErrors.email,
        password: fieldErrors.password,
        confirm: fieldErrors.confirm,
      },
    };
  }

  try {
    rateLimit(`signup:${parsed.data.email}`, 5, 10 * 60_000);
  } catch (error) {
    if (error instanceof AppError) {
      return { values, errors: { form: t.throttledSignUp } };
    }
    throw error;
  }

  let user;
  try {
    user = await createUser({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
    });
  } catch (error) {
    // Deliberately does not say whether the email is already taken, or why creation failed.
    if (!(error instanceof AppError && error.code === "CONFLICT")) {
      console.error("[inscription] account creation failed", error);
    }
    errors.form = t.genericSignUp;
    return { values, errors };
  }

  const headerStore = await headers();
  await startSession(user.id, headerStore.get("user-agent"));

  let claimOutcome: "demandee" | "introuvable" | null = null;
  const matricule = parsed.data.claim.trim();
  if (matricule.length > 0) {
    try {
      await requestClaim(user.id, { matricule, evidence: "" });
      claimOutcome = "demandee";
    } catch (error) {
      if (error instanceof AppError) {
        claimOutcome = "introuvable";
      } else {
        throw error;
      }
    }
  }

  const dashboard = localePath("/proprietaire/tableau-de-bord", locale);
  const query = claimOutcome ? `?reclamation=${claimOutcome}` : "?bienvenue=1";
  redirect(`${dashboard}${query}`);
}
