import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthAside } from "@/components/owner/auth-aside";
import { SignInForm } from "@/components/owner/sign-in-form";
import { Card, CardBody } from "@/components/ui/card";
import { Alert } from "@/components/ui/content";
import { localePath, stripLocale, type Locale } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { safeNextPath } from "@/modules/owner/auth-schema";
import { initialSignInState } from "@/modules/owner/auth-state";
import { messagesFor } from "@/modules/owner/messages";

function localizedNext(raw: string | undefined, locale: Locale): string | undefined {
  if (!raw) return undefined;
  const { path } = stripLocale(raw);
  return localePath(path, locale);
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const m = messagesFor(locale);
  return {
    title: m.meta.signIn.title,
    description: m.meta.signIn.description,
    alternates: {
      canonical: localePath("/connexion", locale),
      languages: { "fr-CA": "/connexion", "en-CA": "/en/connexion" },
    },
    robots: { index: false, follow: true },
  };
}

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[]; deconnexion?: string | string[] }>;
}) {
  const locale = await getLocale();
  const m = messagesFor(locale);
  const params = await searchParams;
  const rawNext = safeNextPath(typeof params.next === "string" ? params.next : undefined);
  const next = localizedNext(rawNext, locale);
  const justSignedOut = params.deconnexion === "1";
  const path = (href: string) => localePath(href, locale);

  const user = await getCurrentUser();
  if (user) {
    redirect(next ?? path("/proprietaire/tableau-de-bord"));
  }

  return (
    <div className="container-page max-w-6xl py-10 md:py-16">
      <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
        <div className="mx-auto w-full max-w-xl lg:mx-0">
          <p className="text-xs font-bold tracking-[0.14em] text-accent uppercase">
            {m.auth.signIn.eyebrow}
          </p>
          <h1 className="mt-3 font-display text-3xl leading-tight font-extrabold tracking-tight text-ink md:text-4xl">
            {m.auth.signIn.title}
          </h1>
          <p className="mt-3 text-ink-soft">{m.auth.signIn.intro}</p>

          <Card className="mt-8 shadow-[var(--shadow-card)]">
            <CardBody className="space-y-5 p-6 md:p-7">
              {justSignedOut ? (
                <Alert tone="success" title={m.auth.signIn.signedOutTitle}>
                  {m.auth.signIn.signedOutBody}
                </Alert>
              ) : null}

              <SignInForm
                initialState={initialSignInState()}
                labels={m.auth.signIn}
                signUpHref={path("/inscription")}
                next={next}
              />

              <p className="border-t border-border pt-4 text-xs leading-relaxed text-muted-fg">
                {m.auth.signIn.footerNote}{" "}
                <Link
                  href={path("/inscription")}
                  className="underline underline-offset-2 hover:text-primary"
                >
                  {m.auth.signIn.footerLink}
                </Link>{" "}
                {m.auth.signIn.footerAfter}
              </p>
            </CardBody>
          </Card>
        </div>

        <AuthAside
          variant="signin"
          title={m.auth.signIn.asideTitle}
          body={m.auth.signIn.asideBody}
          bullets={m.auth.signIn.asideBullets}
          note={m.auth.signIn.asideNote}
        />
      </div>
    </div>
  );
}
