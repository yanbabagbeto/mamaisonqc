import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/content";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { messagesFor } from "@/modules/valuation/messages";

export default async function EvaluationNotFound() {
  const locale = await getLocale();
  const messages = messagesFor(locale);

  return (
    <div className="container-page py-20 md:py-28">
      <div className="mx-auto max-w-2xl">
        <EmptyState
          title={messages.notFound.title}
          description={messages.notFound.description}
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <ButtonLink href={localePath("/recherche", locale)}>
                {messages.notFound.searchCta}
              </ButtonLink>
              <ButtonLink href={localePath("/marche-immobilier", locale)} variant="secondary">
                {messages.notFound.marketCta}
              </ButtonLink>
            </div>
          }
        />
      </div>
    </div>
  );
}
