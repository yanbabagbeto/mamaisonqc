import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { Wordmark } from "@/components/layout/logo";

const NAV = [
  { href: "/proprietaire", label: "Propriétaires" },
  { href: "/pre-marche", label: "Acheteurs" },
  { href: "/marche-immobilier", label: "Marché immobilier" },
  { href: "/le-brief", label: "Le Brief" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-paper/95 backdrop-blur-sm">
      <a
        href="#contenu"
        className="sr-only sr-only-focusable absolute left-4 top-3 z-50 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white"
      >
        Aller au contenu
      </a>
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Wordmark />

        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-primary-soft hover:text-primary-strong"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/connexion"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft hover:text-primary"
          >
            Se connecter
          </Link>
          <ButtonLink href="/recherche" size="sm">
            Valeur de ma maison
          </ButtonLink>
        </div>

        {/* No-JS mobile navigation: <details> keeps the header a server component. */}
        <details className="group relative md:hidden">
          <summary
            className="flex size-10 cursor-pointer list-none items-center justify-center rounded-lg border border-border bg-surface text-ink [&::-webkit-details-marker]:hidden"
            aria-label="Ouvrir le menu"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </summary>
          <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-surface p-2 shadow-[var(--shadow-lift)]">
            <ul className="space-y-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-soft hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="border-t border-border pt-1">
                <Link href="/connexion" className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-soft hover:bg-muted">
                  Se connecter
                </Link>
              </li>
              <li>
                <Link
                  href="/recherche"
                  className="block rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-white"
                >
                  Valeur de ma maison
                </Link>
              </li>
            </ul>
          </div>
        </details>
      </div>
    </header>
  );
}
