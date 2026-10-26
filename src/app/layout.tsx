import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";

import { ConsentBanner } from "@/components/layout/consent-banner";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { env } from "@/lib/env";

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

export const metadata: Metadata = {
  metadataBase: new URL(env.SITE_URL),
  title: {
    default: "MaMaisonQC — la valeur des propriétés du Québec, données officielles",
    template: "%s | MaMaisonQC",
  },
  description:
    "Estimation de la valeur d'une propriété au Québec à partir du rôle d'évaluation foncière et des statistiques du Registre foncier. Comparables, fourchette et provenance de chaque chiffre.",
  applicationName: "MaMaisonQC",
  openGraph: {
    type: "website",
    locale: "fr_CA",
    siteName: "MaMaisonQC",
    title: "MaMaisonQC — la valeur des propriétés du Québec",
    description:
      "Des chiffres sourcés : rôle d'évaluation foncière du Québec, Registre foncier et Adresses Québec.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1d5b4f",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr-CA" className={`${manrope.variable} ${inter.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <SiteHeader />
        <main id="contenu" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <ConsentBanner />
      </body>
    </html>
  );
}
