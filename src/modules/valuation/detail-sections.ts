import { formatArea, formatCad, formatDateFr, formatNumber, type FormatLocale } from "@/shared/format";

import { formatAddress } from "./labels";
import { propertyTypeLabel, type EvaluationMessages } from "./messages";

/**
 * Builds the sections rendered in the "see more details" dialog: the assessment-roll record as the
 * municipality files it. Pure function so the content is unit-testable without a browser.
 *
 * Deliberately contains NO dataset name, publisher, licence or source URL: the product owner asked
 * that the roll's provenance not be surfaced on this page (site-level attribution stays in the
 * footer, which the datasets' CC-BY 4.0 licence requires).
 */
export type DetailRow = { label: string; value: string };
export type DetailSection = { title: string; rows: DetailRow[] };

export type RollDetailUnit = {
  addrNo: string | null;
  addrStreet: string | null;
  addrSuite: string | null;
  matricule: string;
  umv: string | null;
  cubf: string | null;
  cubfLabel: string | null;
  propertyType: string;
  landAreaM2: number | null;
  frontageM: number | null;
  yearBuilt: number | null;
  floors: number | null;
  valueLandCents: number;
  valueBuildingCents: number;
  valueTotalCents: number;
  valuePriorCents: number | null;
  marketRefDate: string | null;
  rollYear: number;
};

const FALLBACK = "—";

export function buildRollDetailSections(
  unit: RollDetailUnit,
  municipalityName: string | null,
  messages: EvaluationMessages,
  locale: FormatLocale,
): DetailSection[] {
  const rows = messages.detail.rows;
  const missing = messages.detail.notAvailable;

  const address = formatAddress(unit, FALLBACK);
  const useLabel = [unit.cubfLabel?.trim(), unit.cubf ? `(${unit.cubf})` : null]
    .filter(Boolean)
    .join(" ");

  const priorCents = unit.valuePriorCents;
  const change =
    priorCents !== null && priorCents > 0
      ? new Intl.NumberFormat(locale === "en" ? "en-CA" : "fr-CA", {
          style: "percent",
          maximumFractionDigits: 1,
          signDisplay: "exceptZero",
        }).format(unit.valueTotalCents / priorCents - 1)
      : missing;

  return [
    {
      title: messages.detail.sections.identification,
      rows: [
        { label: rows.address, value: address },
        { label: rows.municipality, value: municipalityName ?? missing },
        { label: rows.matricule, value: unit.matricule },
        { label: rows.umv, value: unit.umv ?? missing },
        { label: rows.use, value: useLabel || missing },
        { label: rows.type, value: propertyTypeLabel(messages, unit.propertyType) },
      ],
    },
    {
      title: messages.detail.sections.characteristics,
      rows: [
        { label: rows.landArea, value: unit.landAreaM2 === null ? missing : formatArea(unit.landAreaM2, locale) },
        {
          label: rows.frontage,
          value: unit.frontageM === null ? missing : `${formatNumber(unit.frontageM, locale)} m`,
        },
        {
          label: rows.yearBuilt,
          value: unit.yearBuilt === null ? missing : formatNumber(unit.yearBuilt, locale),
        },
        {
          label: rows.floors,
          value: unit.floors === null ? missing : formatNumber(unit.floors, locale),
        },
      ],
    },
    {
      title: messages.detail.sections.values,
      rows: [
        { label: rows.landValue, value: formatCad(unit.valueLandCents, locale) },
        { label: rows.buildingValue, value: formatCad(unit.valueBuildingCents, locale) },
        { label: rows.totalValue, value: formatCad(unit.valueTotalCents, locale) },
        {
          label: rows.priorValue,
          value: priorCents === null ? missing : formatCad(priorCents, locale),
        },
        { label: rows.change, value: change },
        { label: rows.rollYear, value: formatNumber(unit.rollYear, locale) },
        {
          label: rows.refDate,
          value: unit.marketRefDate ? formatDateFr(unit.marketRefDate, locale) : missing,
        },
      ],
    },
  ];
}
