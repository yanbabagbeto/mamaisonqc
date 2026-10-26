import { describe, expect, it } from "vitest";

import { buildRegionIndex, regionCodeForMunicipality } from "./regions";
import type { TerritoryRow } from "./types";

const rows: TerritoryRow[] = [
  { codeGeo: "06", level: "region", parentCode: null },
  { codeGeo: "13", level: "region", parentCode: null },
  { codeGeo: "660", level: "mrc", parentCode: "06" },
  { codeGeo: "66023", level: "municipalite", parentCode: "660" },
  { codeGeo: "65005", level: "municipalite", parentCode: "13" },
  { codeGeo: "99999", level: "municipalite", parentCode: null },
  { codeGeo: "88888", level: "municipalite", parentCode: "777" },
];

describe("buildRegionIndex", () => {
  it("resolves municipality → MRC → region", () => {
    const index = buildRegionIndex(rows);
    expect(index["66023"]).toBe("06");
  });

  it("resolves a municipality whose parent is the region itself (Montréal, Laval)", () => {
    const index = buildRegionIndex(rows);
    expect(index["65005"]).toBe("13");
  });

  it("returns null when the territory chain is incomplete", () => {
    const index = buildRegionIndex(rows);
    expect(index["99999"]).toBeNull();
    expect(index["88888"]).toBeNull();
  });

  it("indexes only municipalities, never regions or MRCs", () => {
    const index = buildRegionIndex(rows);
    expect(index["06"]).toBeUndefined();
    expect(index["660"]).toBeUndefined();
  });

  it("exposes a safe lookup for unknown municipalities", () => {
    const index = buildRegionIndex(rows);
    expect(regionCodeForMunicipality(index, "66023")).toBe("06");
    expect(regionCodeForMunicipality(index, "unknown")).toBeNull();
  });
});
