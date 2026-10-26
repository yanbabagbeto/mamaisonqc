import type { Metadata } from "next";
import Link from "next/link";

import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { fill, messagesFor } from "@/modules/owner/messages";

import { signOutAction } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: messagesFor(locale).meta.signOut.title,
    description: messagesFor(locale).meta.signOut.description,
    alternates: {
      canonical: localePath("/deconnexion", locale),
      languages: { "fr-CA": "/deconnexion", "en-CA": "/en/deconnexion" },
    },
    robots: { index: false, follow: false },
  };
}

export default async function DeconnexionPage() {
  const locale = await getLocale();
  const m = messagesFor(locale);
  const labels = m.auth.signOut;
  const path = (href: string) => localePath(href, locale);
  const user = await getCurrentUser();

  return (
    <div className="container-page max-w-xl py-14 md:py-20">
      <h1 className="font-display text-3xl font-extrabold text-ink">{labels.title}</h1>

      {user ? (
        <>
          <p className="mt-3 text-ink-soft">{fill(labels.intro, { email: user.email })}</p>
          <Card className="mt-8">
            <CardBody className="space-y-4">
              <form action={signOutAction}>
                <Button type="submit" className="w-full">
                  {labels.submit}
                </Button>
              </form>
              <p className="text-sm text-ink-soft">
                {labels.stayBefore}{" "}
                <Link
                  href={path("/proprietaire/tableau-de-bord")}
                  className="font-semibold text-primary underline underline-offset-2"
                >
                  {labels.stayLink}
                </Link>
                {labels.stayAfter}
              </p>
            </CardBody>
          </Card>
        </>
      ) : (
        <>
          <p className="mt-3 text-ink-soft">{labels.notSignedIn}</p>
          <div className="mt-8">
            <ButtonLink href={path("/connexion")}>{labels.loginLink}</ButtonLink>
          </div>
        </>
      )}
    </div>
  );
}
