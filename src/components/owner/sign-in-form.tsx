"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { signInAction } from "@/app/connexion/actions";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/content";
import { Field, Input } from "@/components/ui/field";
import type { SignInState } from "@/modules/owner/auth-state";
import type { OwnerMessages } from "@/modules/owner/messages";

/** Field-level errors are tied to the input with `aria-describedby` (AC-16 keyboard path). */
export function SignInForm({
  initialState,
  labels,
  signUpHref,
  next,
}: {
  initialState: SignInState;
  labels: OwnerMessages["auth"]["signIn"];
  signUpHref: string;
  next?: string;
}) {
  const [state, formAction, pending] = useActionState(signInAction, initialState);
  const [email, setEmail] = useState(initialState.values.email);

  return (
    <form action={formAction} noValidate className="space-y-5">
      {next ? <input type="hidden" name="next" value={next} readOnly /> : null}

      {state.errors.form ? (
        <Alert tone="danger" title={labels.formErrorTitle}>
          {state.errors.form}
        </Alert>
      ) : null}

      <Field label={labels.emailLabel} htmlFor="signin-email" error={state.errors.email}>
        <Input
          id="signin-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={pending}
          aria-invalid={state.errors.email ? true : undefined}
          aria-describedby={state.errors.email ? "signin-email-error" : undefined}
        />
      </Field>

      <Field
        label={labels.passwordLabel}
        htmlFor="signin-password"
        hint={labels.passwordHint}
        error={state.errors.password}
      >
        <Input
          id="signin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
          aria-invalid={state.errors.password ? true : undefined}
          aria-describedby={
            state.errors.password ? "signin-password-error" : "signin-password-hint"
          }
        />
      </Field>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? labels.submitting : labels.submit}
      </Button>

      <p className="text-sm text-ink-soft">
        {labels.noAccount}{" "}
        <Link href={signUpHref} className="font-semibold text-primary underline underline-offset-2">
          {labels.signUpLink}
        </Link>
        .
      </p>
    </form>
  );
}
