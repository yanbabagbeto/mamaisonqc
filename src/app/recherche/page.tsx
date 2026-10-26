import type { Metadata } from "next";
import Link from "next/link";

import { Button, ButtonLink } from "@/components/ui/button";
import { Alert, Badge, EmptyState } from "@/components/ui/content";
import { Field, Input } from "@/components/ui/field";
import { Provenance } from "@/components/ui/provenance";
import { localePath, type Locale } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import {
  addressQuerySchema,
  GEOCODER_PROVENANCE,
  MAX_ADDRESS_QUERY_LENGTH,
  MIN_ADDRESS_QUERY_LENGTH,
  searchAddresses,
  type AddressCandidate,
} from "@/modules/geo";
import { messagesFor, type SearchMessages } from "@/modules/geo/messages";
import { AppError } from "@/shared/errors";

type RecherchePageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const messages = messagesFor(locale);

  return {
    title: messages.meta.title,
    description: messages.meta.description,
    alternates: {
      canonical: localePath("/recherche", locale),
      languages: { "fr-CA": "/recherche", "en-CA": "/en/recherche" },
    },
  };
}

function CandidateRow({
  candidate,
  messages,
  locale,
}: {
  candidate: AddressCandidate;
  messages: SearchMessages;
  locale: Locale;
}) {
  return (
    <li className="rounded-card border border-border bg-surface px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {candidate.matricule ? (
            <Link
              href={localePath(
                `/evaluation/${encodeURIComponent(candidate.matricule)}`,
                locale,
              )}
              className="font-display text-lg font-bold text-ink underline decoration-dotted underline-offset-2 hover:text-primary"
            >
              {candidate.label}
            </Link>
          ) : (
            <p className="font-display text-lg font-bold text-ink">{candidate.label}</p>
          )}
          <p className="mt-1 text-sm text-ink-soft">
            {[candidate.city, candidate.postal].filter(Boolean).join(" · ")}
          </p>
        </div>
        {candidate.matricule ? (
          <Badge tone="success">{messages.results.available}</Badge>
        ) : (
          <Badge tone="neutral">{messages.results.unavailable}</Badge>
        )}
      </div>
      {candidate.matricule ? (
        <p className="mt-3">
          <Link
            href={localePath(`/evaluation/${encodeURIComponent(candidate.matricule)}`, locale)}
            className="text-sm font-semibold text-primary"
          >
            {messages.results.availableLink}
          </Link>
        </p>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-muted-fg">
          {messages.results.unavailableNote}
        </p>
      )}
    </li>
  );
}

/**
 * Server-rendered search page. `?q=` is validated with the same Zod schema as the API, the
 * geocoder is called server-side (cache included), and every candidate states whether its roll
 * fiche exists — we never link to a page that would 404. `/en/recherche` is rewritten to this
 * route by `src/proxy.ts`; only the copy and links change with the locale.
 */
export default async function RecherchePage({ searchParams }: RecherchePageProps) {
  const [locale, params] = await Promise.all([getLocale(), searchParams]);
  const messages = messagesFor(locale);
  const rawQuery = params.q;
  const query = (Array.isArray(rawQuery) ? rawQuery[0] : rawQuery ?? "").trim();
  const parsed = addressQuerySchema.safeParse({ q: query });

  let candidates: AddressCandidate[] | null = null;
  let searchError: string | null = null;

  if (parsed.success) {
    try {
      candidates = await searchAddresses(parsed.data.q);
    } catch (error) {
      if (!(error instanceof AppError)) {
        console.error("[recherche] search failed", error);
      }
      searchError = messages.results.unavailableError;
    }
  }

  const validationMessage = query.length > 0 && !parsed.success ? messages.form.invalid : null;

  return (
    <>
      <section className="border-b border-border bg-surface">
        <div className="container-page py-10 md:py-14">
          <p className="text-xs font-bold tracking-[0.14em] text-accent uppercase">
            {messages.eyebrow}
          </p>
          <h1 className="mt-3 font-display text-3xl leading-tight font-extrabold tracking-tight text-ink sm:text-4xl">
            {messages.title}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-soft">{messages.intro}</p>

          <form
            action={localePath("/recherche", locale)}
            method="get"
            role="search"
            className="mt-8 max-w-xl"
          >
            <Field
              label={messages.form.label}
              htmlFor="q"
              hint={messages.form.hint(MIN_ADDRESS_QUERY_LENGTH, MAX_ADDRESS_QUERY_LENGTH)}
              error={validationMessage}
            >
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="q"
                  name="q"
                  type="search"
                  defaultValue={query}
                  placeholder={messages.form.placeholder}
                  autoComplete="street-address"
                  enterKeyHint="search"
                  required
                  minLength={MIN_ADDRESS_QUERY_LENGTH}
                  maxLength={MAX_ADDRESS_QUERY_LENGTH}
                  aria-describedby="q-hint"
                />
                <Button type="submit" className="sm:w-auto">
                  {messages.form.submit}
                </Button>
              </div>
            </Field>
          </form>
        </div>
      </section>

      <div className="container-page py-10 md:py-14">
        <div className="max-w-3xl space-y-6">
          {searchError ? (
            <Alert tone="danger" title={messages.results.errorTitle}>
              {searchError}
            </Alert>
          ) : null}

          {parsed.success && candidates ? (
            <>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 className="font-display text-2xl font-bold text-ink">
                  {candidates.length === 0
                    ? messages.results.noneTitle
                    : messages.results.count(candidates.length)}
                </h2>
                <Provenance
                  items={[{ ...GEOCODER_PROVENANCE, name: messages.provenance.geocoderName }]}
                  compact
                />
              </div>

              {candidates.length > 0 ? (
                <ul className="space-y-3">
                  {candidates.map((candidate, index) => (
                    <CandidateRow
                      key={`${candidate.label}-${index}`}
                      candidate={candidate}
                      messages={messages}
                      locale={locale}
                    />
                  ))}
                </ul>
              ) : (
                <EmptyState
                  title={messages.empty.title}
                  description={messages.empty.description}
                  action={
                    <div className="flex flex-wrap justify-center gap-3">
                      <ButtonLink
                        href={localePath("/marche-immobilier", locale)}
                        variant="secondary"
                      >
                        {messages.empty.marketCta}
                      </ButtonLink>
                      <ButtonLink href={localePath("/recherche", locale)}>
                        {messages.empty.retryCta}
                      </ButtonLink>
                    </div>
                  }
                />
              )}
            </>
          ) : null}

          {!parsed.success && !validationMessage ? (
            <Alert tone="info" title={messages.form.promptTitle}>
              {messages.form.promptBody(MIN_ADDRESS_QUERY_LENGTH)}
            </Alert>
          ) : null}
        </div>
      </div>
    </>
  );
}
