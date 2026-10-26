import { clientKey, rateLimit } from "@/lib/request-guards";
import { formatAddress } from "@/modules/valuation";
import { getEvaluationPageData } from "@/modules/valuation/data";
import { AppError, jsonError, jsonOk } from "@/shared/errors";

/**
 * GET /api/mobile/evaluation/[matricule]
 *
 * Read-only mobile projection of the web valuation page: the roll unit, the comparables-based
 * estimate, the retained comparables and the provenance block. All business rules stay in
 * `@/modules/valuation`; this handler only shapes the payload for the native client
 * (`mobile/src/api/types.ts` mirrors it field for field).
 *
 * `estimateAvailable` comes straight from the valuation module: it encodes every suppression rule
 * (too few comparables, dispersion, roll-relative implausibility), so the mobile client never
 * receives an estimate the web app would hide.
 */
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ matricule: string }> },
): Promise<Response> {
  try {
    rateLimit(clientKey(request, "mobile-evaluation"), 60, 60_000);

    const { matricule } = await context.params;
    const trimmed = matricule.trim();
    if (trimmed.length === 0 || trimmed.length > 64) {
      throw new AppError("INVALID_INPUT", "Matricule invalide.");
    }

    const data = await getEvaluationPageData(trimmed);
    if (!data) {
      throw new AppError("NOT_FOUND", "Cette propriété n'est pas dans notre couverture actuelle.");
    }

    const { unit, valuation, provenance } = data;

    return jsonOk(
      {
        unit: {
          matricule: unit.matricule,
          address: formatAddress(unit, ""),
          municipality: data.municipality?.name ?? null,
          propertyType: unit.propertyType,
          landAreaM2: unit.landAreaM2,
          yearBuilt: unit.yearBuilt,
          valueTotalCents: unit.valueTotalCents,
          valueLandCents: unit.valueLandCents,
          valueBuildingCents: unit.valueBuildingCents,
          valuePriorCents: unit.valuePriorCents,
          marketRefDate: unit.marketRefDate,
          rollYear: unit.rollYear,
          umv: unit.umv,
          cubf: unit.cubf,
        },
        estimate: {
          estimateCents: valuation.estimateCents,
          lowCents: valuation.lowCents,
          highCents: valuation.highCents,
          confidence: valuation.confidence,
          comparablesCount: valuation.comparablesCount,
          estimateAvailable: valuation.estimateAvailable,
          method: valuation.method,
        },
        comparables: valuation.comparables.map((comparable) => ({
          matricule: comparable.matricule,
          address: formatAddress(comparable, ""),
          propertyType: comparable.propertyType,
          landAreaM2: comparable.landAreaM2,
          yearBuilt: comparable.yearBuilt,
          valueTotalCents: comparable.valueTotalCents,
        })),
        provenance,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return jsonError(error);
  }
}
