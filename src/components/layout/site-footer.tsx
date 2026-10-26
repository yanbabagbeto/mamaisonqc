import Link from "next/link";

import { Wordmark } from "@/components/layout/logo";
import { NewsletterForm } from "@/components/layout/newsletter-form";

const COLUMNS = [
  {
    title: "Propriétaires",
    links: [
      { href: "/proprietaire", label: "Hub propriétaire" },
      { href: "/proprietaire/equite", label: "Calculer mon équité" },
      { href: "/proprietaire/hypotheque/renouvellement-hypothecaire", label: "Renouvellement hypothécaire" },
      { href: "/proprietaire/subventions-renovation", label: "Subventions rénovation" },
    ],
  },
  {
    title: "Marché",
    links: [
      { href: "/marche-immobilier", label: "Marché par région" },
      { href: "/pre-marche", label: "Pré-marché" },
      { href: "/tester-le-marche", label: "Tester le marché" },
      { href: "/reclamer-ma-page", label: "Réclamer ma page" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { href: "/le-brief", label: "Le Brief" },
      { href: "/nouvelles", label: "Nouvelles" },
      { href: "/conseils", label: "Conseils" },
      { href: "/donnees", label: "Données et sources" },
    ],
  },
  {
    title: "MaMaisonQC",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
      { href: "/conditions", label: "Conditions d'utilisation" },
      { href: "/confidentialite", label: "Confidentialité" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="container-page py-14">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Wordmark />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
              La valeur des propriétés du Québec, calculée à partir des données officielles
              d&apos;évaluation foncière et du Registre foncier — avec la provenance de chaque chiffre.
            </p>
            <div className="mt-6 max-w-sm">
              <NewsletterForm source="footer" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h2 className="font-display text-sm font-bold text-ink">{column.title}</h2>
                <ul className="mt-3 space-y-2">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
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
          <p className="text-xs leading-relaxed text-muted-fg">
            Données : <span className="font-semibold text-ink-soft">Rôle d&apos;évaluation foncière du Québec</span>{" "}
            (MAMH, CC-BY 4.0) ·{" "}
            <span className="font-semibold text-ink-soft">Statistiques du Registre foncier du Québec</span>{" "}
            (CC-BY 4.0) · <span className="font-semibold text-ink-soft">Adresses Québec</span> (MERN, CC-BY 4.0).
            Les estimations MaMaisonQC sont des valeurs indicatives, pas des évaluations agréées ni des
            avis d&apos;un évaluateur agréé.
          </p>
          <p className="mt-3 text-xs text-muted-fg">
            © {new Date().getFullYear()} MaMaisonQC.{" "}
            <Link href="/conditions" className="underline underline-offset-2 hover:text-primary">
              Conditions
            </Link>{" "}
            ·{" "}
            <Link href="/confidentialite" className="underline underline-offset-2 hover:text-primary">
              Confidentialité
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
