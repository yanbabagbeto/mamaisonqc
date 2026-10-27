import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";

import { ConsentBanner } from "@/components/layout/consent-banner";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getBaseUrl } from "@/lib/site-url";
import { htmlLang, localePath } from "@/i18n/config";
import { getLocale, getMessages } from "@/i18n/server";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1d5b4f",
};

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t, baseUrl] = await Promise.all([getLocale(), getMessages(), getBaseUrl()]);
  const isEn = locale === "en";
  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: isEn
        ? "MaMaisonQC — Quebec property values, official data"
        : "MaMaisonQC — la valeur des propriétés du Québec, données officielles",
      template: `%s | ${t.meta.siteName}`,
    },
    description: isEn
      ? "Estimate a Quebec property's value from the official assessment roll and Registre foncier statistics. Comparables, range and the source of every figure."
      : "Estimation de la valeur d'une propriété au Québec à partir du rôle d'évaluation foncière et des statistiques du Registre foncier. Comparables, fourchette et provenance de chaque chiffre.",
    applicationName: t.meta.siteName,
    alternates: {
      canonical: localePath("/", locale),
      languages: { "fr-CA": "/", "en-CA": "/en" },
    },
    openGraph: {
      type: "website",
      locale: isEn ? "en_CA" : "fr_CA",
      siteName: t.meta.siteName,
      title: t.meta.tagline,
      description: isEn
        ? "Official Quebec open data, a computed range and the source of every figure — free, no account."
        : "Données ouvertes officielles du Québec, une fourchette calculée et la source de chaque chiffre — gratuit, sans compte.",
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const t = await getMessages();

  return (
    <html lang={htmlLang[locale]} className={`${manrope.variable} ${inter.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <SiteHeader />
        <main id="contenu" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <ConsentBanner labels={t.consent} policyHref={localePath("/confidentialite", locale)} />
      </body>
    </html>
  );
}
