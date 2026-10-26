/** cn: minimal class merge (no runtime deps). Later classes win on conflicts only by order. */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}
