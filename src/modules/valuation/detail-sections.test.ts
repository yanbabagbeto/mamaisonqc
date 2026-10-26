import { describe, expect, it } from "vitest";

import { buildRollDetailSections, type RollDetailUnit } from "./detail-sections";
import { messagesFor } from "./messages";

const baseUnit: RollDetailUnit = {
  addrNo: "2380",
  addrStreet: "Belair",
  addrSuite: null,
  matricule: "258977954710000000",
  umv: "9810",
  cubf: "1000",
  cubfLabel: "Logement",
  propertyType: "unifamiliale",
  landAreaM2: 540.5,
  frontageM: 18.2,
  yearBuilt: 1962,
  floors: 2,
  valueLandCents: 13_700_000,
  valueBuildingCents: 35_900_000,
  valueTotalCents: 49_600_000,
  valuePriorCents: 39_600_000,
  marketRefDate: "2023-07-01",
  rollYear: 2025,
};

const fr = messagesFor("fr");
const en = messagesFor("en");

describe("buildRollDetailSections", () => {
  it("returns the three roll sections in order", () => {
    const sections = buildRollDetailSections(baseUnit, "Québec", fr, "fr");
    expect(sections.map((section) => section.title)).toEqual([
      fr.detail.sections.identification,
      fr.detail.sections.characteristics,
      fr.detail.sections.values,
    ]);
  });

  it("carries the administrative identifiers and the formatted values", () => {
    const [identification, , values] = buildRollDetailSections(baseUnit, "Québec", fr, "fr");
    const idRows = Object.fromEntries(identification!.rows.map((row) => [row.label, row.value]));
    expect(idRows[fr.detail.rows.matricule]).toBe("258977954710000000");
    expect(idRows[fr.detail.rows.municipality]).toBe("Québec");
    expect(idRows[fr.detail.rows.umv]).toBe("9810");
    expect(idRows[fr.detail.rows.use]).toContain("Logement");

    const valueRows = Object.fromEntries(values!.rows.map((row) => [row.label, row.value]));
    expect(valueRows[fr.detail.rows.totalValue]).toContain("496");
    expect(valueRows[fr.detail.rows.priorValue]).toContain("396");
    // 49 600 000 / 39 600 000 - 1 = +25,3 %
    expect(valueRows[fr.detail.rows.change]).toMatch(/\+?25[,.]3\s?%/);
  });

  it("uses the locale for formatting and the English labels for en", () => {
    const [, , valuesEn] = buildRollDetailSections(baseUnit, "Québec", en, "en");
    const rowsEn = Object.fromEntries(valuesEn!.rows.map((row) => [row.label, row.value]));
    expect(rowsEn[en.detail.rows.totalValue]).toMatch(/^\$496,000$/);
    expect(rowsEn[en.detail.rows.change]).toMatch(/\+25\.3%/);
  });

  it("never shows a dataset, publisher, licence or source URL", () => {
    const flat = JSON.stringify(buildRollDetailSections(baseUnit, "Québec", fr, "fr"));
    expect(flat).not.toMatch(/CC-BY|MAMH|Registre foncier|http/i);
  });

  it("marks every unknown field explicitly instead of inventing a value", () => {
    const sparse: RollDetailUnit = {
      ...baseUnit,
      umv: null,
      cubf: null,
      cubfLabel: null,
      landAreaM2: null,
      frontageM: null,
      yearBuilt: null,
      floors: null,
      valuePriorCents: null,
      marketRefDate: null,
    };
    const sections = buildRollDetailSections(sparse, null, fr, "fr");
    const all = sections.flatMap((section) => section.rows);
    const rowLabels = new Set(all.map((row) => row.label));
    expect(rowLabels.has(fr.detail.rows.umv)).toBe(true);
    const values = all.map((row) => row.value);
    expect(values.filter((value) => value === fr.detail.notAvailable).length).toBeGreaterThanOrEqual(6);
    // The total value always exists (it is the roll's core field) and is never replaced by a dash.
    expect(all.find((row) => row.label === fr.detail.rows.totalValue)?.value).not.toBe(
      fr.detail.notAvailable,
    );
  });
});
