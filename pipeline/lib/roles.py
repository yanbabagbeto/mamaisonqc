"""Rôle d'évaluation: streaming parser, deterministic sampling, coordinates.

Sampling (DATA-CONTRACT.md §4, amended): the sample must be spatially and type
stratified. We allocate the cap across the property types proportionally to their source
counts (largest-remainder / Hamilton, with the contract's priority order as tie-break, and
at least one slot for every type present), then keep, inside each type, the units with the
smallest `sha256(mat18)`. `mat18` itself encodes the MTM grid, so hashing it removes the
contiguous-strip bias while staying fully deterministic.

`xml.etree.ElementTree.iterparse` is used instead of `lxml.iterparse`: the DoD entry
points run with the system `python3`, which has no lxml. Each `RLUEx` subtree is cleared
immediately so a 795 MB Montréal file never lives in memory.
"""

from __future__ import annotations

import hashlib
import heapq
import sqlite3
import struct
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path
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

# Contract priority order, also used as the tie-break for quota allocation.
TYPE_PRIORITY = ("unifamiliale", "copropriete", "plex", "terrain", "non-residentiel", "autre")

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


def sample_hash(matricule: str) -> str:
    """Stable, geography-independent ordering key for the stratified sample."""
    return hashlib.sha256(matricule.encode("utf-8")).hexdigest()


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


def classify_raw(raw: dict[str, str], cubf: CubfReference) -> str:
    return cubf.property_type(
        (raw.get("RL0105A") or "").strip(),
        has_local=bool((raw.get("RL0104F") or "").strip()),
        dwellings=int_or_none(raw.get("RL0311A")),
    )


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
    property_type = classify_raw(raw, cubf)
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


def _extract_raw(element: ET.Element) -> dict[str, str]:
    raw: dict[str, str] = {}
    for node in element.iter():
        tag = node.tag
        if tag in WANTED and tag not in raw:
            text = (node.text or "").strip()
            if text:
                raw[tag] = text
    return raw


# --- Quotas ---------------------------------------------------------------------------
def _hamilton(weights: dict[str, int], amount: int) -> dict[str, int]:
    """Largest-remainder allocation; ties broken by the contract's type priority."""
    total = sum(weights.values())
    if amount <= 0 or total <= 0:
        return {key: 0 for key in weights}
    exact = {key: amount * weight / total for key, weight in weights.items()}
    allocation = {key: int(value) for key, value in exact.items()}
    remainder = amount - sum(allocation.values())
    if remainder:
        order = sorted(
            weights,
            key=lambda key: (-(exact[key] - allocation[key]), TYPE_PRIORITY.index(key)),
        )
        for key in order[:remainder]:
            allocation[key] += 1
    return allocation


def compute_quotas(type_counts: Counter, cap: int) -> dict[str, int] | None:
    """Split the cap across types, proportionally to source counts.

    Returns all counts when there is no cap (cap <= 0) or when the municipality fits.
    Every type present in the source gets at least one slot when the cap allows it, so
    rare types stay auditable instead of disappearing.
    """
    total = sum(type_counts.values())
    if cap <= 0 or total <= cap:
        return {key: type_counts[key] for key in TYPE_PRIORITY if type_counts.get(key, 0) > 0}
    present = [key for key in TYPE_PRIORITY if type_counts.get(key, 0) > 0]
    quotas = {key: 0 for key in present}
    if cap < len(present):
        for key in present[:cap]:
            quotas[key] = 1
        return quotas
    for key in present:
        quotas[key] = 1
    remaining = cap - len(present)
    capacity = {key: type_counts[key] - 1 for key in present}
    capacity = {key: value for key, value in capacity.items() if value > 0}
    for key, value in _hamilton(capacity, remaining).items():
        quotas[key] += value
    if sum(quotas.values()) != cap:
        raise ValueError(f"quota allocation produced {sum(quotas.values())} slots, expected {cap}")
    for key, value in quotas.items():
        if value > type_counts[key]:
            raise ValueError(f"quota {key}={value} exceeds source count {type_counts[key]}")
    return quotas


# --- Scanning and parsing -------------------------------------------------------------
@dataclass
class RollScan:
    municipality_code: str
    roll_year: int
    total_units: int = 0
    type_counts: Counter = field(default_factory=Counter)
    cubf_counts: Counter = field(default_factory=Counter)


@dataclass
class RollResult:
    municipality_code: str
    roll_year: int
    total_units: int = 0
    rows: list[list[str]] = field(default_factory=list)
    quotas: dict[str, int] | None = None


def _check_root(
    path: Path, root_code: str | None, municipality_code: str, roll_year: int | None
) -> int:
    if root_code is None:
        raise RollFormatError(f"{path}: missing RLM01A")
    if not same_municipality_code(root_code, municipality_code):
        raise RollFormatError(
            f"{path}: RLM01A={root_code!r} does not match requested code {municipality_code!r}"
        )
    if not roll_year:
        raise RollFormatError(f"{path}: missing or invalid RLM02A")
    return roll_year


def scan_roll(path: Path, *, municipality_code: str, cubf: CubfReference) -> RollScan:
    """First pass: source totals per property type (needed for the stratified quotas)."""
    root_code: str | None = None
    roll_year: int | None = None
    scan = RollScan(municipality_code=municipality_code, roll_year=0)
    for _, element in ET.iterparse(path, events=("end",)):
        tag = element.tag
        if tag == "RLM01A":
            root_code = (element.text or "").strip()
        elif tag == "RLM02A":
            text = (element.text or "").strip()
            if text:
                roll_year = int(text)
        elif tag == "RLUEx":
            raw = _extract_raw(element)
            scan.total_units += 1
            scan.type_counts[classify_raw(raw, cubf)] += 1
            scan.cubf_counts[(raw.get("RL0105A") or "").strip()] += 1
            element.clear()
    scan.roll_year = _check_root(path, root_code, municipality_code, roll_year)
    return scan


class _MaxItem:
    """Heap item ordered so that the *largest* sort key is on top."""

    __slots__ = ("key", "row")

    def __init__(self, key: str, row: list[str]):
        self.key = key
        self.row = row

    def __lt__(self, other: "_MaxItem") -> bool:  # reversed comparison
        return self.key > other.key


def parse_roll(
    path: Path,
    *,
    municipality_code: str,
    cubf: CubfReference,
    quotas: dict[str, int] | None,
    dataset_id: str = config.DATASET_ROLE,
    source_url: str | None = None,
) -> RollResult:
    """Second pass: keep the `sha256(mat18)`-smallest rows inside each type's quota."""
    source_url = source_url or path.name
    root_code: str | None = None
    roll_year: int | None = None
    result = RollResult(municipality_code=municipality_code, roll_year=0, quotas=quotas)
    heaps: dict[str, list[_MaxItem]] = {key: [] for key in TYPE_PRIORITY}
    kept_all: list[list[str]] = []

    if quotas is None:
        mode = "all"
    elif sum(quotas.values()) == 0:
        mode = "none"
    else:
        mode = "stratified"

    for _, element in ET.iterparse(path, events=("end",)):
        tag = element.tag
        if tag == "RLM01A":
            root_code = (element.text or "").strip()
        elif tag == "RLM02A":
            text = (element.text or "").strip()
            if text:
                roll_year = int(text)
        elif tag == "RLUEx":
            result.total_units += 1
            if mode != "none":
                raw = _extract_raw(element)
                row = normalize_unit(
                    raw,
                    municipality_code=municipality_code,
                    roll_year=roll_year or 0,
                    source_url=source_url,
                    dataset_id=dataset_id,
                    cubf=cubf,
                )
                if mode == "all":
                    kept_all.append(row)
                else:
                    limit = (quotas or {}).get(row[6], 0)
                    if limit > 0:
                        key = sample_hash(row[2])
                        heap = heaps[row[6]]
                        if len(heap) < limit:
                            heapq.heappush(heap, _MaxItem(key, row))
                        elif key < heap[0].key:
                            heapq.heapreplace(heap, _MaxItem(key, row))
            element.clear()

    result.roll_year = _check_root(path, root_code, municipality_code, roll_year)
    if mode == "all":
        result.rows = kept_all
    else:
        result.rows = [item.row for heap in heaps.values() for item in heap]
    result.rows.sort(key=lambda row: row[2])
    return result


def same_municipality_code(left: str, right: str) -> bool:
    """MAMH codes are 5-digit; the index/CLI may drop the leading zero. Some
    non-organised territories use alphabetic codes (e.g. NR020) in the roll index."""
    left, right = left.strip(), right.strip()
    if left.isdigit() and right.isdigit():
        return left.zfill(5) == right.zfill(5)
    return left.upper() == right.upper()


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


def _bbox_update(box: list[float] | None, latitude: float, longitude: float) -> list[float]:
    if box is None:
        return [latitude, latitude, longitude, longitude]
    if latitude < box[0]:
        box[0] = latitude
    if latitude > box[1]:
        box[1] = latitude
    if longitude < box[2]:
        box[2] = longitude
    if longitude > box[3]:
        box[3] = longitude
    return box


def _bbox_dict(box: list[float] | None) -> dict[str, float] | None:
    if box is None:
        return None
    return {
        "minLat": round(box[0], 6),
        "maxLat": round(box[1], 6),
        "minLon": round(box[2], 6),
        "maxLon": round(box[3], 6),
    }


def join_coordinates(
    gpkg_path: Path,
    municipality_code: str,
    rows: list[list[str]],
    *,
    lat_index: int = 23,
    lon_index: int = 24,
) -> tuple[int, int, dict[str, float] | None, dict[str, float] | None, int]:
    """Fill lat/lon on rows and return kept-vs-source coverage.

    Returns (matched, source_points, source_bbox, kept_bbox, source_points_inside_kept_bbox).
    The bbox comparison is what DATA-CONTRACT §4.3 asks for; the point-inside share is a
    more robust audit for municipalities with a few far-flung outlier units (a bbox is
    driven by extremes, the share is not).
    """
    wanted = {row[2] for row in rows}
    if not wanted:
        return 0, 0, None, None, 0
    connection = sqlite3.connect(f"file:{gpkg_path}?mode=ro", uri=True)
    try:
        cursor = connection.execute(
            f"SELECT mat18, geom FROM {config.GEOPACKAGE_LAYER} WHERE code_mun = ?",
            (municipality_code,),
        )
        source_box: list[float] | None = None
        kept_box: list[float] | None = None
        matched = 0
        source_points = 0
        source_lats: list[float] = []
        source_lons: list[float] = []
        by_matricule = {row[2]: row for row in rows}
        for mat18, geom in cursor:
            point = parse_gpkg_point(geom)
            if point is None:
                continue
            longitude, latitude = point
            source_points += 1
            source_lats.append(latitude)
            source_lons.append(longitude)
            source_box = _bbox_update(source_box, latitude, longitude)
            if mat18 not in wanted:
                continue
            row = by_matricule[mat18]
            row[lat_index] = f"{latitude:.6f}"
            row[lon_index] = f"{longitude:.6f}"
            kept_box = _bbox_update(kept_box, latitude, longitude)
            matched += 1
        inside = 0
        if kept_box is not None:
            min_lat, max_lat, min_lon, max_lon = kept_box
            for latitude, longitude in zip(source_lats, source_lons, strict=True):
                if min_lat <= latitude <= max_lat and min_lon <= longitude <= max_lon:
                    inside += 1
        return matched, source_points, _bbox_dict(source_box), _bbox_dict(kept_box), inside
    finally:
        connection.close()
