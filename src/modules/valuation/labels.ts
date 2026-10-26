/**
 * Address formatter for roll units. Only punctuation/joining lives here: the "no address" label
 * is passed by the caller so the display language stays in `messages.ts`. `fallback` defaults to
 * an empty string for data consumers (APIs) that do not render UI copy.
 */
export function formatAddress(
  unit: {
    addrNo: string | null;
    addrStreet: string | null;
    addrSuite: string | null;
  },
  fallback = "",
): string {
  const civic = unit.addrNo?.trim() ?? "";
  const street = unit.addrStreet?.trim() ?? "";
  const suite = unit.addrSuite?.trim() ?? "";
  const line = [civic, street].filter(Boolean).join(" ");
  if (!line) return fallback;
  return suite ? `${line} (${suite})` : line;
}
