/** Slug + text normalisation shared by routes, seed and search matching. Pure functions. */

const ACCENT_MAP: Record<string, string> = {
  à: "a",
  â: "a",
  ä: "a",
  á: "a",
  å: "a",
  ç: "c",
  é: "e",
  è: "e",
  ê: "e",
  ë: "e",
  î: "i",
  ï: "i",
  í: "i",
  ô: "o",
  ö: "o",
  ó: "o",
  ù: "u",
  û: "u",
  ü: "u",
  ú: "u",
  ÿ: "y",
  Ñ: "n",
  ñ: "n",
  œ: "oe",
  æ: "ae",
};

export function stripAccents(input: string): string {
  return input
    .split("")
    .map((char) => ACCENT_MAP[char] ?? char)
    .join("")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** "Montréal" → "montreal" ; "Les Îles-de-la-Madeleine" → "les-iles-de-la-madeleine" */
export function slugify(input: string): string {
  return stripAccents(input)
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

/**
 * Street names must match between the MERN geocoder ("rue Sainte-Catherine Ouest")
 * and the assessment roll ("Sainte-Catherine Ouest"). Same shape on both sides.
 */
export function normalizeStreet(input: string): string {
  return stripAccents(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s{2,}/g, " ");
}

/** Civic numbers: "1234-705" and "1234" must compare equal on the primary number. */
export function primaryCivicNumber(input: string): string {
  return (input.match(/\d+/)?.[0] ?? "").replace(/^0+/, "");
}
