import Link from "next/link";

import { signOutAction } from "@/app/deconnexion/actions";
import { getCurrentUser } from "@/lib/auth";

import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { Wordmark } from "@/components/layout/logo";
import { ButtonLink } from "@/components/ui/button";
import { getLocale, getMessages } from "@/i18n/server";
import { localePath } from "@/i18n/config";

export async function SiteHeader() {
  const [locale, t, user] = await Promise.all([getLocale(), getMessages(), getCurrentUser()]);
  const path = (href: string) => localePath(href, locale);

  const nav = [
    { href: "/proprietaire", label: t.nav.owners },
    { href: "/pre-marche", label: t.nav.buyers },
    { href: "/explorer", label: t.nav.explore },
    { href: "/marche-immobilier", label: t.nav.market },
    { href: "/le-brief", label: t.nav.brief },
    { href: "/faq", label: t.nav.faq },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-paper/95 backdrop-blur-sm">
      <a
        href="#contenu"
        className="sr-only sr-only-focusable absolute top-3 left-4 z-50 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white"
      >
        {t.nav.skip}
      </a>
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Wordmark />

        <nav aria-label={t.nav.label} className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={path(item.href)}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-primary-soft hover:text-primary-strong"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 xl:flex">
          <LocaleSwitcher locale={locale} label={t.localeSwitcher.label} />
          {user ? (
            <>
              <Link
                href={path("/proprietaire/tableau-de-bord")}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft hover:text-primary"
              >
                {t.nav.account}
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft hover:text-primary"
                >
                  {t.nav.logout}
                </button>
              </form>
            </>
          ) : (
            <Link
              href={path("/connexion")}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft hover:text-primary"
            >
              {t.nav.login}
            </Link>
          )}
          <ButtonLink href={path("/recherche")} size="sm">
            {t.nav.cta}
          </ButtonLink>
        </div>

        {/* No-JS mobile navigation: <details> keeps the header a server component. */}
        <details className="group relative xl:hidden">
          <summary
            className="flex size-10 cursor-pointer list-none items-center justify-center rounded-lg border border-border bg-surface text-ink [&::-webkit-details-marker]:hidden"
            aria-label={t.nav.menu}
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </summary>
          <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-surface p-2 shadow-[var(--shadow-lift)]">
            <ul className="space-y-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={path(item.href)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-soft hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="border-t border-border pt-1">
                {user ? (
                  <>
                    <Link
                      href={path("/proprietaire/tableau-de-bord")}
                      className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-soft hover:bg-muted"
                    >
                      {t.nav.account}
                    </Link>
                    <form action={signOutAction}>
                      <button
                        type="submit"
                        className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-ink-soft hover:bg-muted"
                      >
                        {t.nav.logout}
                      </button>
                    </form>
                  </>
                ) : (
                  <Link
                    href={path("/connexion")}
                    className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-soft hover:bg-muted"
                  >
                    {t.nav.login}
                  </Link>
                )}
              </li>
              <li>
                <Link
                  href={path("/recherche")}
                  className="block rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-white"
                >
                  {t.nav.cta}
                </Link>
              </li>
              <li className="flex items-center justify-between px-3 py-2">
                <span className="text-xs font-semibold text-muted-fg">{t.localeSwitcher.label}</span>
                <LocaleSwitcher locale={locale} label={t.localeSwitcher.label} />
              </li>
            </ul>
          </div>
        </details>
      </div>
    </header>
  );
}
