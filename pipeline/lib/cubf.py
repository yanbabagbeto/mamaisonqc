"""CUBF (codes d'utilisation des biens-fonds) reference and classification.

Source: MAMH, `CUBF_MEFQ.xlsx` (LISTE NUMÉRIQUE sheet), the official list linked from
the MAMH "Codes d'utilisation des biens-fonds" page. The mapping below only uses the
official category of each code plus two real source fields (see docs/DATA.md):
  * RL0104F non-empty  -> divided co-ownership (the guide defines this field as the
    "numéro de local" used only for a private portion in divided co-ownership);
  * RL0311A >= 2       -> the unit contains several dwellings (plex).
Nothing is inferred from value, area or address.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

from .util import XlsxWorkbook

# CUBF codes whose official description is land / vacant land.
LAND_CODES = {"1701", "1702", "9100", "9211", "9212", "9219", "9220", "9900"}
# Residential auxiliary codes that are not dwellings.
NON_DWELLING_RESIDENTIAL = {"1921", "1922", "1923"}
# Codes that describe one dwelling (single-family, chalet, mobile home, social housing).
SINGLE_DWELLING_CODES = {"1000", "1010", "1100", "1211", "1212"}


@dataclass
class CubfReference:
    labels: dict[str, str] = field(default_factory=dict)
    remarks: dict[str, str] = field(default_factory=dict)
    source_url: str = ""

    def label(self, code: str) -> str:
        return self.labels.get(code, "")

    def property_type(self, code: str, *, has_local: bool, dwellings: int | None) -> str:
        """Map a 4-digit CUBF code to the contract's property_type.

        Precedence (documented in docs/DATA.md):
          1. non-residential CUBF groups (2xxx–8xxx) -> non-residentiel
          2. CUBF land codes -> terrain
          3. residential auxiliaries that are not dwellings -> non-residentiel
          4. group 1 + RL0104F -> copropriete
          5. group 1 single-dwelling codes: RL0311A >= 2 -> plex, else unifamiliale
          6. group 9 leftovers: vacant non-residential floor space -> non-residentiel,
             water/construction/temporary/unknown -> autre
          7. anything unmapped -> autre
        """
        code = (code or "").strip()
        if not code:
            return "autre"
        group = code[0]

        if group in "2345678":
            return "non-residentiel"
        if code in LAND_CODES:
            return "terrain"
        if code in NON_DWELLING_RESIDENTIAL:
            return "non-residentiel"
        if group == "1":
            if has_local:
                return "copropriete"
            if code in SINGLE_DWELLING_CODES:
                if dwellings is not None and dwellings >= 2:
                    return "plex"
                return "unifamiliale"
            return "autre"
        if group == "9":
            if code.startswith("94") and code != "9410":
                return "non-residentiel"
            if code == "9520":
                return "non-residentiel"
            return "autre"
        return "autre"


def load_cubf(path: Path) -> CubfReference:
    """Read the 'LISTE NUMÉRIQUE' sheet: code (col A), description (col C), remark (D)."""
    reference = CubfReference()
    with XlsxWorkbook(path) as workbook:
        grid = workbook.sheet("LISTE NUMÉRIQUE")
    max_row = max((row for row, _ in grid), default=0)
    for row in range(1, max_row + 1):
        code = (grid.get((row, 1)) or "").strip()
        if not code.isdigit() or len(code) > 4:
            continue
        description = (grid.get((row, 3)) or "").strip()
        remark = (grid.get((row, 4)) or "").strip()
        if description:
            reference.labels[code] = description
            if remark:
                reference.remarks[code] = remark
    if not reference.labels:
        raise ValueError(f"no CUBF codes parsed from {path}")
    return reference


def load_price_bands(path: Path) -> dict[str, str]:
    """Read the market workbook's 'Codes' sheet block 'Code prix' / 'Nom prix'.

    The resource CSVs store only the numeric band code (CD_PLAGE_PRIX); the workbook
    is the publisher's own dictionary for that code. Labels are returned verbatim
    except for NBSP -> space and outer whitespace, both normalisation only.
    """
    with XlsxWorkbook(path) as workbook:
        grid = workbook.sheet("Codes")
    header_cell = next(((r, c) for (r, c), value in grid.items() if value.strip() == "Code prix"), None)
    if header_cell is None:
        raise ValueError("'Code prix' header not found in the market workbook")
    row, col = header_cell
    bands: dict[str, str] = {}
    for offset in range(1, 200):
        code = (grid.get((row + offset, col)) or "").strip()
        if not code or not code.replace(".0", "").isdigit():
            break
        label = (grid.get((row + offset, col + 1)) or "").replace("\u00a0", " ").strip()
        bands[code] = label
    if not bands:
        raise ValueError("no price bands parsed from the market workbook")
    return bands
