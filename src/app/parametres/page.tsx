import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { DeleteAccountForm } from "@/components/buyer/delete-account-form";
import { PrefsForm } from "@/components/buyer/prefs-form";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { interpolate } from "@/modules/buyer/format-message";
import { messagesFor } from "@/modules/buyer/messages";
import { getNotificationPrefs } from "@/modules/buyer/queries";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const messages = messagesFor(locale);
  return {
    title: messages.meta.settings.title,
    description: messages.meta.settings.description,
    alternates: {
      canonical: localePath("/parametres", locale),
      languages: { "fr-CA": "/parametres", "en-CA": "/en/parametres" },
    },
    robots: { index: false, follow: true },
  };
}

/**
 * Buyer settings: read-only profile, notification preferences, language explanation and the
 * account-deletion request (audit + outbox, 30-day path, no immediate deletion).
 */
export default async function ParametresPage() {
  const locale = await getLocale();
  const messages = messagesFor(locale);
  const path = (href: string) => localePath(href, locale);
  const user = await getCurrentUser();

  if (!user) {
    // Same contract as the owner pages: a protected page never renders for an anonymous
    // visitor, it redirects with a safe `next` so the login can come back here.
    redirect(`${path("/parametres")}?next=${encodeURIComponent(path("/parametres"))}`);
  }

  const prefs = await getNotificationPrefs(user.id);
  const roleLabel =
    user.role === "admin" ? messages.settings.roleAdmin : messages.settings.roleOwner;

  return (
    <div className="container-page max-w-3xl py-10 md:py-14">
      <header>
        <p className="text-xs font-bold tracking-[0.14em] text-accent uppercase">
          {messages.settings.eyebrow}
        </p>
        <h1 className="mt-3 font-display text-3xl leading-tight font-extrabold tracking-tight text-ink md:text-4xl">
          {messages.settings.title}
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-ink-soft">{messages.settings.intro}</p>
      </header>

      <div className="mt-10 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{messages.settings.profileTitle}</CardTitle>
          </CardHeader>
          <CardBody>
            <dl className="grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-semibold tracking-wide text-muted-fg uppercase">
                  {messages.settings.profileName}
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink">{user.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-wide text-muted-fg uppercase">
                  {messages.settings.profileEmail}
                </dt>
                <dd className="mt-1 break-all text-sm font-medium text-ink">{user.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-wide text-muted-fg uppercase">
                  {messages.settings.profileRole}
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink">{roleLabel}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs leading-relaxed text-muted-fg">
              {messages.settings.profileNote}
            </p>
          </CardBody>
        </Card>

        <PrefsForm messages={messages} initial={prefs} />

        <Card>
          <CardHeader>
            <CardTitle>{messages.settings.languageTitle}</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <p className="text-sm leading-relaxed text-ink-soft">{messages.settings.languageBody}</p>
            <p className="text-sm font-medium text-ink">
              {interpolate(messages.settings.languageCurrent, {
                language:
                  locale === "en" ? messages.settings.languageEn : messages.settings.languageFr,
              })}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <LocaleSwitcher locale={locale} label={messages.settings.languageSwitch} />
              <Link
                href={path("/")}
                className="text-sm font-semibold text-primary underline decoration-dotted underline-offset-2"
              >
                {messages.common.home}
              </Link>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{messages.settings.deletionTitle}</CardTitle>
          </CardHeader>
          <CardBody>
            <DeleteAccountForm messages={messages} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
