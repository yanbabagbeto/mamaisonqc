import Link from "next/link";

import { NewsletterForm } from "@/components/layout/newsletter-form";
import { Wordmark } from "@/components/layout/logo";
import { localePath } from "@/i18n/config";
import { getLocale, getMessages } from "@/i18n/server";

export async function SiteFooter() {
  const locale = await getLocale();
  const t = await getMessages();
  const path = (href: string) => localePath(href, locale);

  const columns = [
    {
      title: t.footer.owners,
      links: [
        { href: "/proprietaire", label: t.footer.ownerLinks.hub },
        { href: "/proprietaire/equite", label: t.footer.ownerLinks.equity },
        {
          href: "/proprietaire/hypotheque/renouvellement-hypothecaire",
          label: t.footer.ownerLinks.renewal,
        },
        { href: "/proprietaire/subventions-renovation", label: t.footer.ownerLinks.subsidies },
      ],
    },
    {
      title: t.footer.market,
      links: [
        { href: "/marche-immobilier", label: t.footer.marketLinks.regions },
        { href: "/pre-marche", label: t.footer.marketLinks.premarket },
        { href: "/explorer", label: t.footer.marketLinks.explorer },
        { href: "/mon-financement", label: t.footer.marketLinks.financing },
        { href: "/mes-interets", label: t.footer.marketLinks.interests },
        { href: "/parametres", label: t.footer.marketLinks.settings },
        { href: "/tester-le-marche", label: t.footer.marketLinks.testMarket },
        { href: "/reclamer-ma-page", label: t.footer.marketLinks.claim },
      ],
    },
    {
      title: t.footer.resources,
      links: [
        { href: "/le-brief", label: t.footer.resourceLinks.brief },
        { href: "/nouvelles", label: t.footer.resourceLinks.news },
        { href: "/conseils", label: t.footer.resourceLinks.advice },
        { href: "/donnees", label: t.footer.resourceLinks.data },
      ],
    },
    {
      title: t.footer.about,
      links: [
        { href: "/faq", label: t.footer.aboutLinks.faq },
        { href: "/contact", label: t.footer.aboutLinks.contact },
        { href: "/conditions", label: t.footer.aboutLinks.terms },
        { href: "/confidentialite", label: t.footer.aboutLinks.privacy },
      ],
    },
  ];

  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="container-page py-14">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Wordmark />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">{t.footer.description}</p>
            <div className="mt-6 max-w-sm">
              <NewsletterForm source="footer" labels={t.newsletter} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {columns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h2 className="font-display text-sm font-bold text-ink">{column.title}</h2>
                <ul className="mt-3 space-y-2">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={path(link.href)}
                        className="text-sm text-ink-soft underline-offset-2 hover:text-primary hover:underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <p className="text-xs leading-relaxed text-muted-fg">{t.footer.attribution}</p>
          <p className="mt-3 text-xs text-muted-fg">
            © {new Date().getFullYear()} MaMaisonQC. {t.footer.copyright}{" "}
            <Link href={path("/conditions")} className="underline underline-offset-2 hover:text-primary">
              {t.footer.terms}
            </Link>{" "}
            ·{" "}
            <Link href={path("/confidentialite")} className="underline underline-offset-2 hover:text-primary">
              {t.footer.privacy}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
