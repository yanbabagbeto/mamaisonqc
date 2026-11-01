/**
 * Bank of Canada open data (Valet API, no key). Two live series only — we never invent a posted
 * mortgage rate: the page presents them as market reference rates and says so.
 */
export type RatePoint = { label: string; valuePct: number; date: string; seriesId: string };

const SERIES = [
  { id: "V39079", labelFr: "Taux directeur de la Banque du Canada", labelEn: "Bank of Canada policy rate" },
  { id: "V80691311", labelFr: "Taux de base des prêts (prime)", labelEn: "Prime lending rate" },
] as const;

type ValetResponse = { observations?: Array<Record<string, { v?: string }>> };

async function fetchSeries(seriesId: string): Promise<{ valuePct: number; date: string } | null> {
  try {
    const response = await fetch(
      `https://www.bankofcanada.ca/valet/observations/${seriesId}/json?recent=1`,
      { next: { revalidate: 21_600 }, signal: AbortSignal.timeout(6_000) },
    );
    if (!response.ok) return null;
    const payload = (await response.json()) as ValetResponse;
    const last = payload.observations?.at(-1);
    if (!last) return null;
    const date = String(last.d ?? "");
    const raw = last[seriesId]?.v;
    const value = raw === undefined ? Number.NaN : Number.parseFloat(raw);
    if (!date || !Number.isFinite(value)) return null;
    return { valuePct: value, date };
  } catch {
    return null;
  }
}

export async function getReferenceRates(
  locale: "fr" | "en",
): Promise<{ points: RatePoint[]; failed: boolean }> {
  const results = await Promise.all(
    SERIES.map(async (series) => ({ series, point: await fetchSeries(series.id) })),
  );
  const points: RatePoint[] = [];
  for (const { series, point } of results) {
    if (!point) continue;
    points.push({
      label: locale === "en" ? series.labelEn : series.labelFr,
      valuePct: point.valuePct,
      date: point.date,
      seriesId: series.id,
    });
  }
  return { points, failed: points.length === 0 };
}
