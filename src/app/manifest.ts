import type { MetadataRoute } from "next";

/**
 * PWA manifest. Colours come straight from the design tokens:
 * theme #1D5B4F (primary), background #FBFAF7 (paper).
 *
 * Icons are real PNG files in `public/icons/`, rendered from the two original SVG masters
 * (`icon-master.svg`, `icon-maskable-master.svg`) — see docs/IMAGES.md for the render commands.
 * `lang` stays "fr": the product is French-first (the document itself declares fr-CA).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MaMaisonQC — la valeur des propriétés du Québec",
    short_name: "MaMaisonQC",
    description:
      "Estimez la valeur d'une propriété au Québec à partir du rôle d'évaluation foncière et du Registre foncier. Comparables, fourchette et provenance de chaque chiffre.",
    lang: "fr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FBFAF7",
    theme_color: "#1D5B4F",
    categories: ["business", "finance", "utilities"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
