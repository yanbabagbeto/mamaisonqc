/** Editorial metadata for the two sections. Copy lives here so index and detail pages agree. */
import type { ContentCategory } from "./types";

type CategoryMeta = {
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  intro: string;
};

export const CATEGORY_META: Record<ContentCategory, CategoryMeta> = {
  conseils: {
    label: "Conseils",
    eyebrow: "Comprendre",
    title: "Conseils pour propriétaires du Québec",
    description:
      "Le rôle d'évaluation, la valeur marchande, le bon moment pour vendre : des explications sourcées, sans promesse ni chiffre inventé.",
    intro:
      "Des textes courts et vérifiables pour comprendre ce que valent les chiffres immobiliers du Québec — et ce qu'ils ne disent pas. Chaque article nomme ses sources officielles.",
  },
  nouvelles: {
    label: "Nouvelles",
    eyebrow: "Analyser",
    title: "Nouvelles et analyses du marché",
    description:
      "Ce que les statistiques du Registre foncier du Québec mesurent vraiment, et comment les lire sans se tromper.",
    intro:
      "Les données publiques du Québec sont riches, mais faciles à mal lire. Ces analyses expliquent la mécanique des fichiers officiels, sans reprendre de chiffres de presse non vérifiés.",
  },
};

export function categoryLabel(category: ContentCategory): string {
  return CATEGORY_META[category].label;
}
