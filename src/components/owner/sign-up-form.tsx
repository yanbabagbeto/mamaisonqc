"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { signUpAction } from "@/app/inscription/actions";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/content";
import { Field, Input } from "@/components/ui/field";
import type { SignUpState } from "@/modules/owner/auth-state";
import type { OwnerMessages } from "@/modules/owner/messages";

/**
 * Account creation. The password is never echoed back by the Server Action; the form keeps what the
 * visitor typed in local state so a validation error does not force retyping every field.
 */
export function SignUpForm({
  initialState,
  labels,
  termsHref,
  privacyHref,
  signInHref,
}: {
  initialState: SignUpState;
  labels: OwnerMessages["auth"]["signUp"];
  termsHref: string;
  privacyHref: string;
  signInHref: string;
}) {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);
  const [name, setName] = useState(initialState.values.name);
  const [email, setEmail] = useState(initialState.values.email);

  return (
    <form action={formAction} noValidate className="space-y-5">
      {initialState.values.claim ? (
        <input type="hidden" name="claim" value={initialState.values.claim} readOnly />
      ) : null}

      {state.errors.form ? (
        <Alert tone="danger" title={labels.formErrorTitle}>
          {state.errors.form}{" "}
          <Link href={signInHref} className="font-semibold underline underline-offset-2">
            {labels.signInLink}
          </Link>
        </Alert>
      ) : null}

      <Field label={labels.nameLabel} htmlFor="signup-name" error={state.errors.name}>
        <Input
          id="signup-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={pending}
          aria-invalid={state.errors.name ? true : undefined}
          aria-describedby={state.errors.name ? "signup-name-error" : undefined}
        />
      </Field>

      <Field label={labels.emailLabel} htmlFor="signup-email" error={state.errors.email}>
        <Input
          id="signup-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={pending}
          aria-invalid={state.errors.email ? true : undefined}
          aria-describedby={state.errors.email ? "signup-email-error" : undefined}
        />
      </Field>

      <Field
        label={labels.passwordLabel}
        htmlFor="signup-password"
        hint={labels.passwordHint}
        error={state.errors.password}
      >
        <Input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          disabled={pending}
          aria-invalid={state.errors.password ? true : undefined}
          aria-describedby={state.errors.password ? "signup-password-error" : "signup-password-hint"}
        />
      </Field>

      <Field label={labels.confirmLabel} htmlFor="signup-confirm" error={state.errors.confirm}>
        <Input
          id="signup-confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          disabled={pending}
          aria-invalid={state.errors.confirm ? true : undefined}
          aria-describedby={state.errors.confirm ? "signup-confirm-error" : undefined}
        />
      </Field>

      <p className="text-xs leading-relaxed text-muted-fg">
        {labels.termsPrefix}{" "}
        <Link href={termsHref} className="underline underline-offset-2 hover:text-primary">
          {labels.termsLink}
        </Link>{" "}
        {labels.termsMiddle}{" "}
        <Link href={privacyHref} className="underline underline-offset-2 hover:text-primary">
          {labels.privacyLink}
        </Link>
        {labels.termsSuffix}
      </p>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? labels.submitting : labels.submit}
      </Button>

      <p className="text-sm text-ink-soft">
        {labels.haveAccount}{" "}
        <Link href={signInHref} className="font-semibold text-primary underline underline-offset-2">
          {labels.signInLink}
        </Link>
        .
      </p>
    </form>
  );
}
