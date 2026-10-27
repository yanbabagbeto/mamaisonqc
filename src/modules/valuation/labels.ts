/**
 * Address formatter for roll units. Only punctuation/joining lives here: the "no address" label
 * is passed by the caller so the display language stays in `messages.ts`. `fallback` defaults to
 * an empty string for data consumers (APIs) that do not render UI copy.
 */
/** Roll street names are stored upper-case; display them in title case without touching acronyms. */
export function titleCaseStreet(street: string): string {
  const minor = new Set(["de", "du", "des", "la", "le", "les", "l", "d", "aux", "au", "et", "sur", "sous"]);
  return street
    .toLowerCase()
    .split(/([\s-]+)/)
    .map((part, index) => {
      if (/^[\s-]+$/.test(part) || part.length === 0) return part;
      if (index > 0 && minor.has(part)) return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join("");
}

export function formatAddress(
  unit: {
    addrNo: string | null;
    addrStreet: string | null;
    addrSuite: string | null;
  },
  fallback = "",
): string {
  const civic = unit.addrNo?.trim() ?? "";
  const street = unit.addrStreet ? titleCaseStreet(unit.addrStreet.trim()) : "";
  const suite = unit.addrSuite?.trim() ?? "";
  const line = [civic, street].filter(Boolean).join(" ");
  if (!line) return fallback;
  return suite ? `${line} (${suite})` : line;
}
