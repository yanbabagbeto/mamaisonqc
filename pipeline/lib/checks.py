"""Validation checks (DATA-CONTRACT.md §5). Each returns a report entry.

The checks are shared by `run.py` (inline, written to the ingest report and honoured
for the exit code) and by `validate.py` (standalone re-run against the artifacts).
"""

from __future__ import annotations

import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Iterable, Iterator
from xml.etree import ElementTree as ET

from . import config
from .cubf import CubfReference
from .roles import MAT_FIELDS, MAT_WIDTHS, RESIDENTIAL_TYPES
from .util import (
    cents_from_dollars,
    decimal_or_none,
    int_or_none,
    normalize_street,
    number_string,
    sha256_file,
)


def entry(check: str, ok: bool, detail: str) -> dict[str, str]:
    return {"check": check, "status": "pass" if ok else "fail", "detail": detail}


# --- 1. scope coverage ----------------------------------------------------------------
def check_scope(counts: dict[str, dict[str, int]], min_units: int) -> dict[str, str]:
    failing = {
        code: info
        for code, info in counts.items()
        if info.get("emitted", 0) < min_units
    }
    detail = "; ".join(
        f"{code}: {info.get('emitted', 0)}/{info.get('total_source', 0)} units"
        for code, info in sorted(counts.items())
    )
    if failing:
        detail += f" | below minimum {min_units}: {', '.join(sorted(failing))}"
    return entry(
        "1. scope: every municipality produced >= 100 units",
        not failing,
        detail,
    )


# --- 2. five units re-read from the XML ----------------------------------------------
def _pad(value: str | None, width: int) -> str:
    text = (value or "").strip().zfill(width)
    return text[-width:] if len(text) > width else text


def _independent_row(element: ET.Element, municipality_code: str, roll_year: int, source_url: str,
                     dataset_id: str, cubf: CubfReference) -> list[str]:
    """Second, deliberately separate extraction path used only by validation."""

    def text(tag: str) -> str:
        # Descendant search: RL0104A sits under RL0104, RL0101Gx under RL0101/RL0101x.
        node = element.find(f".//{tag}")
        return (node.text or "").strip() if node is not None else ""

    matricule = "".join(_pad(text(tag), width) for tag, width in zip(MAT_FIELDS, MAT_WIDTHS, strict=True))
    code = text("RL0105A")
    dwellings = int_or_none(text("RL0311A"))
    property_type = cubf.property_type(code, has_local=bool(text("RL0104F")), dwellings=dwellings)
    street = text("RL0101Gx")

    def measure(tag: str) -> str:
        amount = decimal_or_none(text(tag))
        if amount is None or amount == 0:
            return ""
        return number_string(amount)

    year = int_or_none(text("RL0307A"))
    year_text = str(year) if year is not None and 1600 <= year <= 2100 else ""
    return [
        f"{municipality_code}-{matricule}",
        municipality_code,
        matricule,
        text("RL0107A"),
        code,
        cubf.label(code),
        property_type,
        text("RL0101Ax"),
        street,
        normalize_street(street) if street else "",
        text("RL0101Ix"),
        measure("RL0302A"),
        measure("RL0301A"),
        year_text,
        measure("RL0306A"),
        cents_from_dollars(text("RL0402A")),
        cents_from_dollars(text("RL0403A")),
        cents_from_dollars(text("RL0404A")),
        cents_from_dollars(text("RL0405A")),
        text("RL0401A"),
        str(roll_year),
        source_url,
        dataset_id,
        "",  # lat: not in the XML
        "",  # lon
    ]


def _pick_sample(rows: list[dict[str, str]], count: int = 5) -> list[dict[str, str]]:
    def key(row: dict[str, str]) -> str:
        import hashlib

        return hashlib.sha256(f"{row['municipality_code']}:{row['matricule']}".encode()).hexdigest()

    return sorted(rows, key=key)[:count]


def check_reread(
    *,
    municipality_code: str,
    xml_path: Path,
    rows: list[dict[str, str]],
    roll_year: int,
    source_url: str,
    dataset_id: str,
    cubf: CubfReference,
    header: tuple[str, ...],
) -> dict[str, str]:
    sample = _pick_sample(rows, 5)
    if not sample:
        return entry("2. re-read 5 units per municipality", False, f"{municipality_code}: no rows to re-read")
    wanted = {row["matricule"] for row in sample}
    fields = [name for name in header if name not in ("lat", "lon")]
    found: dict[str, dict[str, str]] = {}
    for _, element in ET.iterparse(xml_path, events=("end",)):
        if element.tag != "RLUEx":
            continue
        expected = _independent_row(element, municipality_code, roll_year, source_url, dataset_id, cubf)
        matricule = expected[2]
        if matricule in wanted:
            found[matricule] = dict(zip(header, expected, strict=True))
            if len(found) == len(wanted):
                element.clear()
                break
        element.clear()

    comparisons: list[dict[str, object]] = []
    mismatched_units = 0
    for row in sample:
        expected = found.get(row["matricule"])
        if expected is None:
            comparisons.append({"matricule": row["matricule"], "status": "not_found_in_xml"})
            mismatched_units += 1
            continue
        mismatches = {
            name: {"csv": row.get(name, ""), "xml": expected.get(name, "")}
            for name in fields
            if row.get(name, "") != expected.get(name, "")
        }
        if mismatches:
            mismatched_units += 1
        comparisons.append(
            {
                "matricule": row["matricule"],
                "status": "mismatch" if mismatches else "identical",
                "fields": len(fields),
                "mismatches": mismatches,
            }
        )
    detail = json.dumps(
        {"municipality": municipality_code, "units": comparisons}, ensure_ascii=False
    )
    return entry(
        f"2. re-read 5 units per municipality ({municipality_code})",
        mismatched_units == 0,
        detail,
    )


# --- 3, 4, 7, 8: value/schema checks over the written artifact -----------------------
def check_property_units(
    rows: Iterable[dict[str, str]],
) -> list[dict[str, str]]:
    total = 0
    comparable = 0
    total_lt_land = 0
    examples: list[str] = []
    negatives: list[str] = []
    missing_required: list[str] = []
    roll_years: dict[str, set[str]] = defaultdict(set)
    seen_ids: set[str] = set()
    seen_matricules: set[tuple[str, str]] = set()
    duplicate_ids = 0
    duplicate_matricules = 0
    coordinates = 0
    out_of_bbox: list[str] = []

    numeric_fields = (
        "land_area_m2",
        "frontage_m",
        "year_built",
        "floors",
        "value_land_cents",
        "value_building_cents",
        "value_total_cents",
        "value_prior_cents",
    )
    min_lat, max_lat, min_lon, max_lon = config.QC_BBOX

    for row in rows:
        total += 1
        identifier = row.get("id", "")
        if identifier in seen_ids:
            duplicate_ids += 1
        seen_ids.add(identifier)
        key = (row.get("municipality_code", ""), row.get("matricule", ""))
        if key in seen_matricules:
            duplicate_matricules += 1
        seen_matricules.add(key)
        roll_years[row.get("municipality_code", "")].add(row.get("roll_year", ""))

        for name in config.REQUIRED_UNIT_COLUMNS:
            if (row.get(name) or "") == "":
                missing_required.append(f"{identifier or '?'}:{name}")
        for name in numeric_fields:
            value = row.get(name) or ""
            if value == "":
                continue
            try:
                if float(value) < 0:
                    negatives.append(f"{identifier}:{name}={value}")
            except ValueError:
                negatives.append(f"{identifier}:{name}=not-a-number")
        land = row.get("value_land_cents") or ""
        total_value = row.get("value_total_cents") or ""
        if land and total_value:
            comparable += 1
            try:
                if int(total_value) < int(land):
                    total_lt_land += 1
                    if len(examples) < 5:
                        examples.append(f"{identifier}({total_value}<{land})")
            except ValueError:
                negatives.append(f"{identifier}:value=not-a-number")

        lat = row.get("lat") or ""
        lon = row.get("lon") or ""
        if lat or lon:
            coordinates += 1
            try:
                latitude = float(lat)
                longitude = float(lon)
            except ValueError:
                out_of_bbox.append(f"{identifier}:non-numeric")
                continue
            if not (min_lat <= latitude <= max_lat and min_lon <= longitude <= max_lon):
                out_of_bbox.append(f"{identifier}:{lat},{lon}")

    pct = (100.0 * (comparable - total_lt_land) / comparable) if comparable else 100.0
    value_ok = pct >= 99.0 and comparable > 0
    value_detail = (
        f"{comparable - total_lt_land}/{comparable} units have value_total >= value_land "
        f"({pct:.3f}%); {total_lt_land} exceptions"
    )
    if examples:
        value_detail += f"; first exceptions: {', '.join(examples)}"

    roll_year_inconsistent = {code: sorted(years) for code, years in roll_years.items() if len(years) > 1}
    schema_ok = not negatives and not missing_required and not roll_year_inconsistent
    schema_detail = (
        f"{total} rows; negative values={len(negatives)}; missing required={len(missing_required)}; "
        f"roll_year inconsistent municipalities={len(roll_year_inconsistent)}"
    )
    if negatives:
        schema_detail += f"; negatives: {', '.join(negatives[:5])}"
    if missing_required:
        schema_detail += f"; missing: {', '.join(missing_required[:5])}"
    if roll_year_inconsistent:
        schema_detail += f"; {json.dumps(roll_year_inconsistent, ensure_ascii=False)}"

    return [
        entry("3. value_total_cents >= value_land_cents (>= 99%)", value_ok, value_detail),
        entry("4. no negative values, no null required columns, consistent roll_year", schema_ok, schema_detail),
        entry(
            "7. mat18 unique within each municipality",
            duplicate_matricules == 0 and duplicate_ids == 0,
            f"{total} rows; duplicate (municipality, matricule)={duplicate_matricules}; duplicate ids={duplicate_ids}",
        ),
        entry(
            "8. coordinates inside Québec bbox (45-63N, -80/-57W)",
            not out_of_bbox,
            f"{coordinates} rows with coordinates; outside bbox={len(out_of_bbox)}"
            + (f"; first: {', '.join(out_of_bbox[:5])}" if out_of_bbox else ""),
        ),
    ]


# --- 5. market counts vs source totals ------------------------------------------------
def check_market(
    rows: Iterable[dict[str, str]],
    source_totals: dict[tuple[str, str], int],
    kinds: Iterable[str],
) -> dict[str, str]:
    derived: Counter = Counter()
    for row in rows:
        derived[(row.get("kind", ""), row.get("region_code", ""))] += int(row.get("count") or 0)
    keys = set(derived) | set(source_totals)
    mismatches = []
    for kind, region in sorted(keys):
        expected = source_totals.get((kind, region), 0)
        actual = derived.get((kind, region), 0)
        if expected != actual:
            mismatches.append(f"{kind}/{region}: source={expected} csv={actual}")
    total_source = sum(source_totals.values())
    total_derived = sum(derived.values())
    detail = (
        f"{len(keys)} (kind, region) pairs; source total={total_source}; csv total={total_derived}; "
        f"mismatches={len(mismatches)}"
    )
    if mismatches:
        detail += f"; {', '.join(mismatches[:5])}"
    return entry("5. market_stats sums match source totals", not mismatches, detail)


# --- 6. manifest ----------------------------------------------------------------------
def check_manifest(manifest_path: Path, artifact_paths: dict[str, Path]) -> dict[str, str]:
    if not manifest_path.exists():
        return entry("6. manifest records sources and artifact checksums", False, "manifest.json missing")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    sources = manifest.get("sources") or []
    artifacts = {item.get("path"): item for item in manifest.get("artifacts") or []}
    problems: list[str] = []
    if not sources:
        problems.append("no sources recorded")
    for source in sources:
        for key in ("id", "url", "fetchedAt"):
            if not source.get(key):
                problems.append(f"source missing {key}: {source.get('url', '?')}")
    for name, path in artifact_paths.items():
        record = artifacts.get(name)
        if record is None:
            problems.append(f"{name} not listed")
            continue
        if record.get("sha256") != sha256_file(path):
            problems.append(f"{name} sha256 mismatch")
    detail = (
        f"{len(sources)} sources; {len(artifacts)} artifacts; problems={len(problems)}"
        + (f"; {', '.join(problems[:5])}" if problems else "")
    )
    return entry("6. manifest records sources and artifact checksums", not problems, detail)


class SampleCollector:
    """Streaming helper: keep the 5 smallest-hash rows per municipality plus counts.

    Used by validate.py so the property_units artifact is read once, without holding
    the whole file in memory.
    """

    def __init__(self, per_municipality: int = 5):
        self.per_municipality = per_municipality
        self.counts: Counter = Counter()
        self._samples: dict[str, list[tuple[str, dict[str, str]]]] = defaultdict(list)

    def _hash(self, row: dict[str, str]) -> str:
        import hashlib

        return hashlib.sha256(
            f"{row.get('municipality_code', '')}:{row.get('matricule', '')}".encode()
        ).hexdigest()

    def observe(self, row: dict[str, str]) -> None:
        code = row.get("municipality_code", "")
        self.counts[code] += 1
        bucket = self._samples[code]
        digest = self._hash(row)
        bucket.append((digest, row))
        bucket.sort(key=lambda item: item[0])
        if len(bucket) > self.per_municipality:
            bucket.pop()

    def samples(self, code: str) -> list[dict[str, str]]:
        return [row for _, row in self._samples.get(code, [])]
