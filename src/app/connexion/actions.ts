"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { authenticate, startSession } from "@/lib/auth";
import { rateLimit } from "@/lib/request-guards";
import type { AuthErrors, SignInState } from "@/modules/owner/auth-state";
import { fieldErrorsFromZod, safeNextPath, signInSchema } from "@/modules/owner/auth-schema";
import { messagesFor } from "@/modules/owner/messages";
import { AppError } from "@/shared/errors";

/**
 * Sign-in Server Action.
 *
 * Security notes:
 * - failure messages are identical whether the email exists or not (no account enumeration);
 * - a process-local throttle slows repeated attempts against the same email;
 * - `next` is re-validated here, not trusted from the rendered hidden field (open-redirect guard);
 * - `redirect` runs outside the try/catch, as required when catching errors around it.
 */
export async function signInAction(_previous: SignInState, formData: FormData): Promise<SignInState> {
  const locale = await getLocale();
  const t = messagesFor(locale).auth.errors;
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));
  const values = { email };
  const errors: AuthErrors = {};

  const parsed = signInSchema(locale).safeParse({ email, password });
  if (!parsed.success) {
    const fieldErrors = fieldErrorsFromZod(parsed.error.issues);
    return {
      values,
      errors: {
        email: fieldErrors.email,
        password: fieldErrors.password,
      },
    };
  }

  try {
    rateLimit(`signin:${parsed.data.email}`, 8, 60_000);
  } catch (error) {
    if (error instanceof AppError) {
      return { values, errors: { form: t.throttledSignIn } };
    }
    throw error;
  }

  let user;
  try {
    user = await authenticate(parsed.data.email, parsed.data.password);
  } catch (error) {
    if (error instanceof AppError && error.code === "UNAUTHORIZED") {
      errors.form = t.invalidCredentials;
    } else {
      console.error("[connexion] authentication failed", error);
      errors.form = t.genericSignIn;
    }
    return { values, errors };
  }

  const headerStore = await headers();
  await startSession(user.id, headerStore.get("user-agent"));

  redirect(next ?? localePath("/proprietaire/tableau-de-bord", locale));
}
