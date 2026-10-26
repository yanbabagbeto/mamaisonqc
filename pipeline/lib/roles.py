"""Rôle d'évaluation: streaming parser, normalisation, deterministic sampling, coordinates.

`xml.etree.ElementTree.iterparse` is used instead of `lxml.iterparse`: the DoD entry
points run with the system `python3`, which has no lxml. Both parse incrementally; each
`RLUEx` subtree is cleared as soon as it has been read, and the root is cleared
periodically so a 795 MB Montréal file never lives in memory.
"""

from __future__ import annotations

import heapq
import sqlite3
import struct
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable, Iterator
from xml.etree import ElementTree as ET

from . import config
from .cubf import CubfReference
from .util import (
    cents_from_dollars,
    decimal_or_none,
    int_or_none,
    normalize_street,
    number_string,
)

# Fields read from each <RLUEx>. First non-empty value wins (document order).
WANTED = {
    "RL0101Ax",
    "RL0101Gx",
    "RL0101Ix",
    "RL0104A",
    "RL0104B",
    "RL0104C",
    "RL0104D",
    "RL0104E",
    "RL0104F",
    "RL0105A",
    "RL0106A",
    "RL0107A",
    "RL0301A",
    "RL0302A",
    "RL0306A",
    "RL0307A",
    "RL0311A",
    "RL0401A",
    "RL0402A",
    "RL0403A",
    "RL0404A",
    "RL0405A",
}

MAT_FIELDS = ("RL0104A", "RL0104B", "RL0104C", "RL0104D", "RL0104E", "RL0104F")
MAT_WIDTHS = (4, 2, 4, 1, 3, 4)  # sums to 18 -> the official mat18

PROPERTY_UNIT_HEADER = (
    "id",
    "municipality_code",
    "matricule",
    "umv",
    "cubf",
    "cubf_label",
    "property_type",
    "addr_no",
    "addr_street",
    "addr_street_norm",
    "addr_suite",
    "land_area_m2",
    "frontage_m",
    "year_built",
    "floors",
    "value_land_cents",
    "value_building_cents",
    "value_total_cents",
    "value_prior_cents",
    "market_ref_date",
    "roll_year",
    "source_url",
    "dataset_id",
    "lat",
    "lon",
)

RESIDENTIAL_TYPES = {"unifamiliale", "copropriete", "plex"}


class RollFormatError(RuntimeError):
    pass


def build_mat18(raw: dict[str, str]) -> str:
    """mat18 = A(4)+B(2)+C(4)+D(1)+E(3)+F(4), zero-padded.

    Verified against the MAMH Rôle 2026 GeoPackage `mat18` / `id_provinc` fields.
    """
    parts = []
    for tag, width in zip(MAT_FIELDS, MAT_WIDTHS, strict=True):
        value = (raw.get(tag) or "").strip()
        padded = value.zfill(width)
        if len(padded) > width:
            padded = padded[-width:]
        parts.append(padded)
    return "".join(parts)


def _measure(value: str | None) -> str:
    """Physical measure: 0 means 'not applicable/absent' in these fields, so empty."""
    amount = decimal_or_none(value)
    if amount is None or amount == 0:
        return ""
    return number_string(amount)


def _year_built(value: str | None) -> str:
    year = int_or_none(value)
    # The 2026 attribute structure documents the domain 1600–2050; 0 is a filler.
    if year is None or year < 1600 or year > 2100:
        return ""
    return str(year)


def normalize_unit(
    raw: dict[str, str],
    *,
    municipality_code: str,
    roll_year: int,
    source_url: str,
    dataset_id: str,
    cubf: CubfReference,
) -> list[str]:
    matricule = build_mat18(raw)
    cubf_code = (raw.get("RL0105A") or "").strip()
    dwellings = int_or_none(raw.get("RL0311A"))
    has_local = bool((raw.get("RL0104F") or "").strip())
    property_type = cubf.property_type(cubf_code, has_local=has_local, dwellings=dwellings)
    street = (raw.get("RL0101Gx") or "").strip()
    return [
        f"{municipality_code}-{matricule}",
        municipality_code,
        matricule,
        (raw.get("RL0107A") or "").strip(),
        cubf_code,
        cubf.label(cubf_code),
        property_type,
        (raw.get("RL0101Ax") or "").strip(),
        street,
        normalize_street(street) if street else "",
        (raw.get("RL0101Ix") or "").strip(),
        _measure(raw.get("RL0302A")),
        _measure(raw.get("RL0301A")),
        _year_built(raw.get("RL0307A")),
        _measure(raw.get("RL0306A")),
        cents_from_dollars(raw.get("RL0402A")),
        cents_from_dollars(raw.get("RL0403A")),
        cents_from_dollars(raw.get("RL0404A")),
        cents_from_dollars(raw.get("RL0405A")),
        (raw.get("RL0401A") or "").strip(),
        str(roll_year),
        source_url,
        dataset_id,
        "",  # lat, joined from the GeoPackage later
        "",  # lon
    ]


class _MaxItem:
    """Heap item ordered so that the *largest* sort key is on top."""

    __slots__ = ("key", "row")

    def __init__(self, key: tuple[str, ...], row: list[str]):
        self.key = key
        self.row = row

    def __lt__(self, other: "_MaxItem") -> bool:  # reversed comparison
        return self.key > other.key


@dataclass
class RollResult:
    municipality_code: str
    roll_year: int
    total_units: int = 0
    rows: list[list[str]] = field(default_factory=list)
    property_type_counts: Counter = field(default_factory=Counter)
    cubf_counts: Counter = field(default_factory=Counter)
    duplicates: int = 0


def _sort_key(row: list[str]) -> tuple[str, ...]:
    """Residential/condo/plex first, then ascending mat18 (fixed width -> lexical ok)."""
    return ("0" if row[6] in RESIDENTIAL_TYPES else "1", row[2])


def parse_roll(
    path: Path,
    *,
    municipality_code: str,
    cubf: CubfReference,
    max_units: int,
    dataset_id: str = config.DATASET_ROLE,
    source_url: str | None = None,
) -> RollResult:
    source_url = source_url or path.name
    roll_year: int | None = None
    seen_root_code: str | None = None
    selector: list[_MaxItem] = []
    result = RollResult(municipality_code=municipality_code, roll_year=0)
    seen_matricules: set[str] = set()

    # Note: iterparse with only ('end',) does not populate `context.root`, so there is
    # nothing to clear at the root. Each RLUEx subtree is cleared as soon as it has
    # been read, which bounds memory to the current unit plus the (empty) sibling list.
    for _, element in ET.iterparse(path, events=("end",)):
        tag = element.tag
        if tag == "RLM01A":
            seen_root_code = (element.text or "").strip()
        elif tag == "RLM02A":
            text = (element.text or "").strip()
            if text:
                roll_year = int(text)
        elif tag == "RLUEx":
            raw: dict[str, str] = {}
            for node in element.iter():
                node_tag = node.tag
                if node_tag in WANTED and node_tag not in raw:
                    text = (node.text or "").strip()
                    if text:
                        raw[node_tag] = text
            result.total_units += 1
            row = _normalize_without_roll_year(
                raw,
                municipality_code=municipality_code,
                roll_year=roll_year or 0,
                source_url=source_url,
                dataset_id=dataset_id,
                cubf=cubf,
            )
            result.property_type_counts[row[6]] += 1
            result.cubf_counts[row[4]] += 1
            if row[2] in seen_matricules:
                result.duplicates += 1
            seen_matricules.add(row[2])
            if max_units <= 0:
                selector.append(_MaxItem(_sort_key(row), row))
            elif len(selector) < max_units:
                heapq.heappush(selector, _MaxItem(_sort_key(row), row))
            elif _sort_key(row) < selector[0].key:
                heapq.heapreplace(selector, _MaxItem(_sort_key(row), row))
            element.clear()

    if seen_root_code is None:
        raise RollFormatError(f"{path}: missing RLM01A")
    if not same_municipality_code(seen_root_code, municipality_code):
        raise RollFormatError(
            f"{path}: RLM01A={seen_root_code!r} does not match requested code {municipality_code!r}"
        )
    if not roll_year:
        raise RollFormatError(f"{path}: missing or invalid RLM02A")
    result.roll_year = roll_year
    result.rows = [item.row for item in selector]
    result.rows.sort(key=lambda row: row[2])
    return result


def same_municipality_code(left: str, right: str) -> bool:
    """MAMH codes are 5-digit; the index/CLI may drop the leading zero. Some
    non-organised territories use alphabetic codes (e.g. NR020) in the roll index."""
    left, right = left.strip(), right.strip()
    if left.isdigit() and right.isdigit():
        return left.zfill(5) == right.zfill(5)
    return left.upper() == right.upper()


def _normalize_without_roll_year(
    raw: dict[str, str],
    *,
    municipality_code: str,
    roll_year: int,
    source_url: str,
    dataset_id: str,
    cubf: CubfReference,
) -> list[str]:
    return normalize_unit(
        raw,
        municipality_code=municipality_code,
        roll_year=roll_year,
        source_url=source_url,
        dataset_id=dataset_id,
        cubf=cubf,
    )


# --- Coordinates ----------------------------------------------------------------------
def parse_gpkg_point(blob: bytes | None) -> tuple[float, float] | None:
    """Return (longitude, latitude) from a GeoPackage MULTIPOINT/POINT blob."""
    if not blob or len(blob) < 8 or blob[:2] != b"GP":
        return None
    flags = blob[3]
    if flags & 0x10:  # empty geometry flag
        return None
    envelope_size = {0: 0, 1: 32, 2: 48, 3: 48, 4: 48}.get((flags >> 1) & 0x07, 0)
    offset = 8 + envelope_size
    return _wkb_first_point(blob, offset)


def _wkb_first_point(buffer: bytes, offset: int) -> tuple[float, float] | None:
    if offset + 5 > len(buffer):
        return None
    endian = buffer[offset]
    fmt = "<" if endian == 1 else ">"
    type_raw = struct.unpack(fmt + "I", buffer[offset + 1 : offset + 5])[0]
    offset += 5
    has_z = bool(type_raw & 0x80000000)
    has_m = bool(type_raw & 0x40000000)
    if type_raw & 0x20000000:  # EWKB SRID
        type_raw &= 0x1FFFFFFF
        offset += 4
    type_raw &= 0x0FFFFFFF
    dims, base = divmod(type_raw, 1000)
    has_z = has_z or dims in (1, 3)
    has_m = has_m or dims in (2, 3)
    if base == 4:  # MultiPoint: each point is a full WKB Point
        if offset + 4 > len(buffer):
            return None
        count = struct.unpack(fmt + "I", buffer[offset : offset + 4])[0]
        if count == 0:
            return None
        return _wkb_first_point(buffer, offset + 4)
    if base == 1:  # Point
        size = 16 + (8 if has_z else 0) + (8 if has_m else 0)
        if offset + size > len(buffer):
            return None
        x, y = struct.unpack(fmt + "dd", buffer[offset : offset + 16])
        return x, y
    return None


def join_coordinates(
    gpkg_path: Path,
    municipality_code: str,
    rows: list[list[str]],
    *,
    lat_index: int = 23,
    lon_index: int = 24,
) -> tuple[int, int]:
    """Fill lat/lon on rows from the official point layer. Returns (matched, total)."""
    wanted = {row[2] for row in rows}
    if not wanted:
        return 0, 0
    connection = sqlite3.connect(f"file:{gpkg_path}?mode=ro", uri=True)
    try:
        cursor = connection.execute(
            f"SELECT mat18, geom FROM {config.GEOPACKAGE_LAYER} WHERE code_mun = ?",
            (municipality_code,),
        )
        matched = 0
        by_matricule = {row[2]: row for row in rows}
        for mat18, geom in cursor:
            if mat18 not in wanted:
                continue
            point = parse_gpkg_point(geom)
            if point is None:
                continue
            longitude, latitude = point
            row = by_matricule[mat18]
            row[lat_index] = f"{latitude:.6f}"
            row[lon_index] = f"{longitude:.6f}"
            matched += 1
        return matched, len(rows)
    finally:
        connection.close()
