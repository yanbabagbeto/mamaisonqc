import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SignUpForm } from "@/components/owner/sign-up-form";
import { Card, CardBody } from "@/components/ui/card";
import { Alert } from "@/components/ui/content";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { initialSignUpState } from "@/modules/owner/auth-state";
import { fill, messagesFor } from "@/modules/owner/messages";
import { findUnitByMatricule } from "@/modules/owner/queries";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const m = messagesFor(locale);
  return {
    title: m.meta.signUp.title,
    description: m.meta.signUp.description,
    alternates: {
      canonical: localePath("/inscription", locale),
      languages: { "fr-CA": "/inscription", "en-CA": "/en/inscription" },
    },
    robots: { index: false, follow: true },
  };
}

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ claim?: string | string[] }>;
}) {
  const locale = await getLocale();
  const m = messagesFor(locale);
  const labels = m.auth.signUp;
  const path = (href: string) => localePath(href, locale);

  const user = await getCurrentUser();
  if (user) {
    redirect(path("/proprietaire/tableau-de-bord"));
  }

  const params = await searchParams;
  const claimRaw = typeof params.claim === "string" ? params.claim.trim().slice(0, 64) : "";
  let unit: Awaited<ReturnType<typeof findUnitByMatricule>> = null;
  if (claimRaw) {
    try {
      unit = await findUnitByMatricule(claimRaw);
    } catch {
      // An unreadable database must not block account creation; the claim simply is not attached.
      unit = null;
    }
  }

  const claimMatricule = unit ? claimRaw : "";
  const claimAddress = unit ? [unit.address, unit.city].filter(Boolean).join(", ") : null;

  return (
    <div className="container-page max-w-xl py-14 md:py-20">
      <p className="text-xs font-bold tracking-[0.14em] text-accent uppercase">{labels.eyebrow}</p>
      <h1 className="mt-3 font-display text-3xl font-extrabold text-ink md:text-4xl">
        {labels.title}
      </h1>
      <p className="mt-3 text-ink-soft">{labels.intro}</p>

      <div className="mt-6 space-y-4">
        {unit ? (
          <Alert tone="primary" title={labels.claimTitle}>
            <p>
              {fill(labels.claimBody, {
                address: claimAddress ?? fill(labels.claimFallback, { id: unit.matricule }),
              })}
            </p>
            <p className="mt-1">{labels.claimPending}</p>
            <p className="mt-1">
              <Link
                href={path(`/evaluation/${encodeURIComponent(unit.matricule)}`)}
                className="underline underline-offset-2"
              >
                {m.common.viewSheet}
              </Link>
            </p>
          </Alert>
        ) : null}

        {claimRaw && !unit ? (
          <Alert tone="warning" title={labels.claimNotFoundTitle}>
            {labels.claimNotFoundBody}
          </Alert>
        ) : null}
      </div>

      <Card className="mt-6">
        <CardBody className="space-y-5">
          <SignUpForm
            initialState={initialSignUpState({ claim: claimMatricule })}
            labels={labels}
            termsHref={path("/conditions")}
            privacyHref={path("/confidentialite")}
            signInHref={path("/connexion")}
          />
        </CardBody>
      </Card>

      <p className="mt-6 text-xs leading-relaxed text-muted-fg">
        {labels.enumerationNote} {labels.faqBefore}{" "}
        <Link href={path("/faq")} className="underline underline-offset-2 hover:text-primary">
          {labels.faqLink}
        </Link>
        {labels.faqAfter}
      </p>
    </div>
  );
}
