import type { Metadata } from "next";

import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, Badge, Stat } from "@/components/ui/content";
import { ButtonLink } from "@/components/ui/button";
import { Provenance } from "@/components/ui/provenance";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { mortgagePaymentCents } from "@/modules/owner/finance";
import { getReferenceRates } from "@/modules/rates";
import { formatCad, formatDateFr, formatNumber } from "@/shared/format";

export const dynamic = "force-dynamic";

const COPY = {
  fr: {
    metaTitle: "Taux hypothécaires de référence au Québec",
    metaDescription:
      "Taux directeur et taux de base de la Banque du Canada, avec la date exacte de la dernière observation. Aucun taux affiché n'est inventé.",
    eyebrow: "Taux",
    title: "Taux de référence, pas une promesse de taux",
    intro:
      "Les prêteurs fixent leurs taux hypothécaires à partir du taux directeur et du taux de base, plus leur marge commerciale. Voici les deux séries officielles, telles que publiées, avec leur date.",
    sourceNote:
      "Séries de la Banque du Canada (données ouvertes, Valet API). Les taux affichés ne sont pas des taux hypothécaires offerts : ils servent de repère.",
    exampleTitle: "Exemple de paiement",
    exampleBody:
      "Paiement mensuel d'un prêt de {amount} amorti sur 25 ans, calculé au taux de base affiché, composition semestrielle canadienne. Illustration seulement : ce n'est pas une offre de prêt.",
    unavailable: "Les séries de la Banque du Canada sont momentanément indisponibles. Aucune valeur n'est affichée plutôt qu'une estimation.",
    cta: "Calculer mon équité et mes paiements",
    date: "Données au {date}",
    exampleAmount: "400 000 $",
  },
  en: {
    metaTitle: "Quebec reference mortgage rates",
    metaDescription:
      "Bank of Canada policy rate and prime rate, with the exact date of the last observation. No rate shown is invented.",
    eyebrow: "Rates",
    title: "Reference rates, not a promised rate",
    intro:
      "Lenders set mortgage rates from the policy rate and the prime rate, plus their commercial margin. Here are the two official series as published, with their date.",
    sourceNote:
      "Bank of Canada series (open data, Valet API). The rates shown are not offered mortgage rates: they are reference points.",
    exampleTitle: "Payment example",
    exampleBody:
      "Monthly payment on a {amount} loan amortized over 25 years, computed at the prime rate shown, with Canadian semi-annual compounding. Illustration only: not a loan offer.",
    unavailable:
      "The Bank of Canada series are temporarily unavailable. Nothing is shown rather than an estimate.",
    cta: "Calculate my equity and payments",
    date: "Data as of {date}",
    exampleAmount: "$400,000",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = COPY[locale];
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: localePath("/taux-hypothecaires", locale),
      languages: { "fr-CA": "/taux-hypothecaires", "en-CA": "/en/taux-hypothecaires" },
    },
  };
}

export default async function RatesPage() {
  const locale = await getLocale();
  const t = COPY[locale];
  const path = (href: string) => localePath(href, locale);
  const { points, failed } = await getReferenceRates(locale);
  const prime = points.find((point) => point.seriesId === "V80691311");
  const examplePaymentCents = prime
    ? mortgagePaymentCents({
        principalCents: 40_000_000,
        annualRateBp: Math.round(prime.valuePct * 100),
        amortizationMonths: 300,
      })
    : null;

  return (
    <div className="container-page max-w-5xl py-12 md:py-16">
      <p className="text-xs font-bold tracking-[0.14em] text-accent uppercase">{t.eyebrow}</p>
      <h1 className="mt-3 font-display text-3xl leading-tight font-extrabold text-ink md:text-4xl">
        {t.title}
      </h1>
      <p className="mt-4 max-w-3xl text-lg text-ink-soft">{t.intro}</p>

      {failed ? (
        <div className="mt-8">
          <Alert tone="warning" title="Indisponible">{t.unavailable}</Alert>
        </div>
      ) : (
        <>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>{t.eyebrow}</CardTitle>
            </CardHeader>
            <CardBody>
              <dl className="grid gap-6 sm:grid-cols-2">
                {points.map((point) => (
                  <Stat
                    key={point.seriesId}
                    label={point.label}
                    value={`${formatNumber(point.valuePct, locale)} %`}
                    size="lg"
                    tone="accent"
                    hint={t.date.replace("{date}", formatDateFr(point.date, locale))}
                  />
                ))}
              </dl>
              <div className="mt-6 border-t border-border pt-4">
                <Provenance
                  compact
                  items={[
                    {
                      datasetId: "bank-of-canada-valet",
                      name: "Banque du Canada — taux (Valet)",
                      publisher: "Banque du Canada",
                      license: "Open Government Licence – Canada",
                      licenseUrl: "https://www.bankofcanada.ca/terms/",
                      sourceUrl: "https://www.bankofcanada.ca/valet/observations",
                      referenceDate: points[0]?.date ?? null,
                    },
                  ]}
                />
                <p className="mt-2 text-xs leading-relaxed text-muted-fg">{t.sourceNote}</p>
              </div>
            </CardBody>
          </Card>

          {examplePaymentCents !== null ? (
            <Card className="mt-6">
              <CardHeader className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>{t.exampleTitle}</CardTitle>
                <Badge tone="warning">Illustration</Badge>
              </CardHeader>
              <CardBody>
                <Stat
                  label={t.exampleTitle}
                  value={`${formatCad(examplePaymentCents, locale)} / ${locale === "en" ? "month" : "mois"}`}
                  tone="accent"
                  size="lg"
                />
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  {t.exampleBody.replace("{amount}", t.exampleAmount)}
                </p>
                <div className="mt-5">
                  <ButtonLink href={path("/proprietaire/equite")}>{t.cta}</ButtonLink>
                </div>
              </CardBody>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}
