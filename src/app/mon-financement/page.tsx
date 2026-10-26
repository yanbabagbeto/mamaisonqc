import type { Metadata } from "next";

import { BudgetCalculator } from "@/components/buyer/budget-calculator";
import { DocumentChecklist } from "@/components/buyer/document-checklist";
import { WaitlistForm } from "@/components/buyer/waitlist-form";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { messagesFor } from "@/modules/buyer/messages";
import { hasWaitlistRequest } from "@/modules/buyer/queries";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const messages = messagesFor(locale);
  return {
    title: messages.meta.financing.title,
    description: messages.meta.financing.description,
    alternates: {
      canonical: localePath("/mon-financement", locale),
      languages: { "fr-CA": "/mon-financement", "en-CA": "/en/mon-financement" },
    },
  };
}

/**
 * Buyer financing page: local-only calculator, browser-only checklist, and a public waitlist form
 * (account optional). The capacity is labelled as an estimate everywhere; no lender rule is faked.
 */
export default async function MonFinancementPage() {
  const locale = await getLocale();
  const messages = messagesFor(locale);
  const user = await getCurrentUser();
  const alreadyOnList = user ? await hasWaitlistRequest(user.email) : false;

  return (
    <div className="container-page py-10 md:py-14">
      <header className="max-w-3xl">
        <p className="text-xs font-bold tracking-[0.14em] text-accent uppercase">
          {messages.financing.eyebrow}
        </p>
        <h1 className="mt-3 font-display text-3xl leading-tight font-extrabold tracking-tight text-ink md:text-4xl">
          {messages.financing.title}
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-ink-soft">{messages.financing.intro}</p>
      </header>

      <div className="mt-10">
        <BudgetCalculator messages={messages} locale={locale} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <DocumentChecklist messages={messages} />
        <WaitlistForm
          messages={messages}
          defaultEmail={user?.email ?? ""}
          alreadyOnList={alreadyOnList}
        />
      </div>
    </div>
  );
}
