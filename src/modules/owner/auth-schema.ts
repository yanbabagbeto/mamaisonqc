import { z } from "zod";

import type { Locale } from "@/i18n/config";
import { messagesFor } from "./messages";

/**
 * Validation for the account forms. Factories take the active locale so the same schema produces
 * French or English field errors; messages are written for the field, not for the console.
 */

export function signInSchema(locale: Locale = "fr") {
  const t = messagesFor(locale).auth.errors;
  return z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, t.emailRequired)
      .max(254, t.emailTooLong)
      .email(t.emailInvalid),
    password: z.string().min(1, t.passwordRequired).max(200, t.passwordTooLong),
  });
}

export function signUpSchema(locale: Locale = "fr") {
  const t = messagesFor(locale).auth.errors;
  return z
    .object({
      name: z.string().trim().min(2, t.nameShort).max(80, t.nameLong),
      email: z
        .string()
        .trim()
        .toLowerCase()
        .min(1, t.emailRequired)
        .max(254, t.emailTooLong)
        .email(t.emailInvalid),
      password: z.string().min(10, t.passwordShort).max(200, t.passwordTooLong),
      confirm: z.string().min(1, t.confirmRequired),
      claim: z.string().trim().max(64).optional().default(""),
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirm) {
        ctx.addIssue({ code: "custom", path: ["confirm"], message: t.mismatch });
      }
    });
}

export type SignInInput = z.infer<ReturnType<typeof signInSchema>>;
export type SignUpInput = z.infer<ReturnType<typeof signUpSchema>>;

/**
 * Only same-site paths may be used as a post-login destination: `//evil.example` and
 * `/\evil.example` are protocol-relative or backslash tricks, so they are rejected here.
 * `/en/...` paths are same-site and pass.
 */
export function safeNextPath(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const value = raw.trim();
  if (value.length === 0 || value.length > 400) return undefined;
  if (!value.startsWith("/")) return undefined;
  if (value.startsWith("//") || value.startsWith("/\\")) return undefined;
  if (/[\u0000-\u001f\\]/.test(value)) return undefined;
  return value;
}

export function fieldErrorsFromZod(
  issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message: string }>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!(key in errors)) {
      errors[key] = issue.message;
    }
  }
  return errors;
}
