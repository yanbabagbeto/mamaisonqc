"""Reference data: territories (MAMH repertoire) and Registre foncier market counts."""

from __future__ import annotations

import csv
import re
from collections import Counter, defaultdict
from pathlib import Path

from . import config
from .util import read_csv, slugify

REGION_RE = re.compile(r"^(?P<name>.+?)\s*\((?P<code>\d{2})\)$")
MRC_RE = re.compile(r"^(?:MRC\s+)?(?P<name>.+?)\s*\((?P<code>\d{3})\)$")

TERRITORY_HEADER = ("code_geo", "name", "level", "parent_code", "slug", "population")
MARKET_HEADER = (
    "id",
    "period",
    "region_code",
    "municipality_code",
    "kind",
    "price_band",
    "count",
    "dataset_id",
)


def _population(value: str) -> str:
    text = (value or "").strip()
    if not text:
        return ""
    digits = re.sub(r"[^\d]", "", text)
    return str(int(digits)) if digits else ""


def load_territories(mun_csv: Path, mrc_csv: Path) -> tuple[list[list[str]], dict[str, str]]:
    """Province -> region -> MRC -> municipality reference rows.

    Returns (rows, code_to_slug) so callers can report on it.
    No province row is emitted: the MAMH repertoire files expose 2-digit region
    codes, 3-digit MRC codes and 5-digit municipal codes only; there is no
    province-level geographic code in this source, and inventing one is forbidden.
    """
    municipalities = list(csv.DictReader(mun_csv.open("r", encoding="utf-8-sig", newline="")))
    mrc_rows = list(csv.DictReader(mrc_csv.open("r", encoding="utf-8-sig", newline="")))

    regions: dict[str, str] = {}
    for row in municipalities:
        match = REGION_RE.match((row.get("regadm") or "").strip())
        if not match:
            raise ValueError(f"unparsed region label: {row.get('regadm')!r}")
        regions[match.group("code")] = match.group("name")

    mrcs: dict[str, dict[str, str]] = {}
    for row in mrc_rows:
        internal = (row.get("mrccod") or "").strip()
        if not internal.startswith("AR") or len(internal) < 5:
            # 'CM' rows are the two metropolitan communities, not MRCs.
            continue
        code = internal[2:5]
        region_match = REGION_RE.match((row.get("mrcregion") or "").strip())
        mrcs[code] = {
            "name": (row.get("mrcnom") or "").strip(),
            "region": region_match.group("code") if region_match else "",
            "population": _population(row.get("mrcpopul") or ""),
        }

    records: list[dict[str, str]] = []
    for code in sorted(regions):
        records.append(
            {
                "code_geo": code,
                "name": regions[code],
                "level": "region",
                "parent_code": "",
                "population": "",
            }
        )
    for code in sorted(mrcs):
        records.append(
            {
                "code_geo": code,
                "name": mrcs[code]["name"],
                "level": "mrc",
                "parent_code": mrcs[code]["region"],
                "population": mrcs[code]["population"],
            }
        )
    for row in municipalities:
        code = (row.get("mcode") or "").strip()
        region_match = REGION_RE.match((row.get("regadm") or "").strip())
        mrc_match = MRC_RE.match((row.get("mrc") or "").strip()) if (row.get("mrc") or "").strip() else None
        records.append(
            {
                "code_geo": code,
                "name": (row.get("munnom") or "").strip(),
                "level": "municipalite",
                "parent_code": mrc_match.group("code") if mrc_match else (region_match.group("code") if region_match else ""),
                "population": _population(row.get("mpopul") or ""),
            }
        )

    # Slug assignment: municipalities first (they are the public pages), then MRCs,
    # regions. Collisions (Laval, Montréal, Québec) get their code appended.
    priority = {"municipalite": 0, "mrc": 1, "region": 2}
    used: set[str] = set()
    slugs: dict[str, str] = {}
    for record in sorted(records, key=lambda item: (priority[item["level"]], item["code_geo"])):
        base = slugify(record["name"])
        if not base:
            base = f"territoire-{record['code_geo']}"
        slug = base
        if slug in used:
            slug = f"{base}-{record['code_geo']}"
        suffix = 2
        while slug in used:
            slug = f"{base}-{record['code_geo']}-{suffix}"
            suffix += 1
        used.add(slug)
        slugs[record["code_geo"]] = slug
        record["slug"] = slug

    level_order = {"province": 0, "region": 1, "mrc": 2, "municipalite": 3}
    records.sort(key=lambda item: (level_order[item["level"]], item["code_geo"]))
    rows = [
        [
            record["code_geo"],
            record["name"],
            record["level"],
            record["parent_code"],
            record["slug"],
            record["population"],
        ]
        for record in records
    ]
    return rows, slugs


def parse_market_csv(kind: str, path: Path) -> tuple[list[dict[str, str]], Counter]:
    """Read one Registre foncier count CSV. Returns rows and per-region totals."""
    header, rows = read_csv(path)
    required = {"DT_DEBUT_MOIS", "ID_REGN_ADMIN", "NB_REQST"}
    missing = required - set(header)
    if missing:
        raise ValueError(f"{path.name}: missing columns {sorted(missing)}")
    records: list[dict[str, str]] = []
    totals: Counter = Counter()
    for row in rows:
        period_raw = (row.get("DT_DEBUT_MOIS") or "").strip()
        if not re.match(r"^\d{4}-\d{2}(-\d{2})?$", period_raw):
            raise ValueError(f"{path.name}: bad period {period_raw!r}")
        period = period_raw[:7]
        region = (row.get("ID_REGN_ADMIN") or "").strip().zfill(2)
        count_text = (row.get("NB_REQST") or "").strip()
        try:
            count = int(count_text)
        except ValueError as exc:
            raise ValueError(f"{path.name}: bad count {count_text!r}") from exc
        totals[region] += count
        records.append(
            {
                "period": period,
                "region": region,
                "band": (row.get("CD_PLAGE_PRIX") or "").strip(),
                "count": str(count),
            }
        )
    return records, totals


def build_market_stats(
    kind: str,
    records: list[dict[str, str]],
    bands: dict[str, str],
    dataset_id: str = config.DATASET_REGISTRE,
) -> list[list[str]]:
    """Aggregate the source rows by (period, region, price band).

    The source also splits counts by nature of act; the normalized table has no nature
    column, so counts are summed per band. The per-region/kind total is preserved
    exactly (validation check 5).
    """
    aggregated: dict[tuple[str, str, str], int] = defaultdict(int)
    for record in records:
        aggregated[(record["region"], record["period"], record["band"])] += int(record["count"])

    def band_sort(value: str) -> tuple[int, str]:
        try:
            return (0, f"{int(value):06d}")
        except ValueError:
            return (1, value)

    rows: list[list[str]] = []
    for region, period, band in sorted(
        aggregated, key=lambda key: (key[0], key[1], band_sort(key[2]))
    ):
        band_label = bands.get(band, "") if band else ""
        identifier = f"{kind}-{region}-{period}" + (f"-{band}" if band else "")
        rows.append(
            [
                identifier,
                period,
                region,
                "",
                kind,
                band_label,
                str(aggregated[(region, period, band)]),
                dataset_id,
            ]
        )
    identifiers = [row[0] for row in rows]
    if len(identifiers) != len(set(identifiers)):
        raise ValueError(f"{kind}: duplicate market_stat ids")
    return rows
