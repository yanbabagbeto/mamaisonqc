"""Small stdlib helpers shared by the pipeline: normalisation, IO, XLSX reading.

Deliberately dependency-free (no pandas/lxml): the entry points in the DoD run with
`python3`, which on this machine has no lxml/pandas. ElementTree's `iterparse` gives
the same streaming behaviour as `lxml.iterparse`.
"""

from __future__ import annotations

import csv
import hashlib
import json
import re
import unicodedata
import zipfile
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from pathlib import Path
from typing import Any, Iterable, Iterator
from xml.etree import ElementTree as ET

# --- Text normalisation --------------------------------------------------------------
# Mirrors src/shared/slug.ts exactly so search matching agrees with the app.
_ACCENT_MAP = str.maketrans(
    {
        "œ": "oe",
        "æ": "ae",
        "Œ": "OE",
        "Æ": "AE",
        "ø": "o",
        "Ø": "O",
        "ł": "l",
        "Ł": "L",
        "đ": "d",
        "Đ": "D",
        "ß": "ss",
    }
)


def strip_accents(value: str) -> str:
    mapped = value.translate(_ACCENT_MAP)
    decomposed = unicodedata.normalize("NFD", mapped)
    return "".join(ch for ch in decomposed if not unicodedata.combining(ch))


def slugify(value: str) -> str:
    text = strip_accents(value).lower()
    text = text.replace("'", "").replace("’", "")
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = re.sub(r"-{2,}", "-", text)
    return text.strip("-")


def normalize_street(value: str) -> str:
    text = strip_accents(value).lower()
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s{2,}", " ", text).strip()


# --- Numbers -------------------------------------------------------------------------
def decimal_or_none(value: str | None) -> Decimal | None:
    """Parse a source number. Returns None for absent values, raises on garbage."""
    if value is None:
        return None
    text = str(value).strip().replace("\u00a0", "").replace(" ", "").replace(",", ".")
    if text == "":
        return None
    try:
        return Decimal(text)
    except InvalidOperation as exc:  # pragma: no cover - source is trusted but checked
        raise ValueError(f"not a number: {value!r}") from exc


def number_string(value: Decimal | None) -> str:
    """Deterministic decimal rendering: no exponent, no trailing zeros."""
    if value is None:
        return ""
    if value == value.to_integral_value():
        return str(int(value))
    return format(value.normalize(), "f")


def cents_from_dollars(value: str | None) -> str:
    """Dollars (source unit) -> integer cents. Absent -> empty string. 0 stays 0."""
    amount = decimal_or_none(value)
    if amount is None:
        return ""
    cents = (amount * 100).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
    return str(int(cents))


def int_or_none(value: str | None) -> int | None:
    amount = decimal_or_none(value)
    if amount is None:
        return None
    return int(amount)


# --- Time ----------------------------------------------------------------------------
def utc_now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


# --- Hashing -------------------------------------------------------------------------
def sha256_file(path: Path, chunk: int = 1 << 20) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(chunk), b""):
            digest.update(block)
    return digest.hexdigest()


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


# --- CSV / JSON ----------------------------------------------------------------------
def write_csv(path: Path, header: Iterable[str], rows: Iterable[Iterable[Any]]) -> int:
    """Write RFC-4180 CSV, UTF-8, `\\n` endings, no BOM. Returns row count."""
    path.parent.mkdir(parents=True, exist_ok=True)
    count = 0
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle, lineterminator="\n")
        writer.writerow(list(header))
        for row in rows:
            writer.writerow(["" if value is None else value for value in row])
            count += 1
    return count


def read_csv(path: Path) -> tuple[list[str], Iterator[dict[str, str]]]:
    handle = path.open("r", encoding="utf-8", newline="")
    reader = csv.reader(handle)
    try:
        header = next(reader)
    except StopIteration:
        handle.close()
        return [], iter(())

    def rows() -> Iterator[dict[str, str]]:
        try:
            for values in reader:
                yield {name: (values[i] if i < len(values) else "") for i, name in enumerate(header)}
        finally:
            handle.close()

    return header, rows()


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(payload, ensure_ascii=False, indent=2)
    path.write_text(text + "\n", encoding="utf-8")


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


# --- XLSX / XLSM reader (stdlib only) -------------------------------------------------
_NS_MAIN = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
_NS_REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
_NS_PKG = "http://schemas.openxmlformats.org/package/2006/relationships"


def _q(namespace: str, tag: str) -> str:
    return f"{{{namespace}}}{tag}"


class XlsxWorkbook:
    """Minimal read-only XLSX/XLSM reader: sheet name -> {(row, col): text}."""

    def __init__(self, path: Path):
        self._zip = zipfile.ZipFile(path)
        self._shared = self._read_shared_strings()
        self._sheets = self._read_sheet_index()

    def close(self) -> None:
        self._zip.close()

    def __enter__(self) -> "XlsxWorkbook":
        return self

    def __exit__(self, *exc: object) -> None:
        self.close()

    def _read_shared_strings(self) -> list[str]:
        try:
            root = ET.fromstring(self._zip.read("xl/sharedStrings.xml"))
        except KeyError:
            return []
        strings: list[str] = []
        for item in root.findall(_q(_NS_MAIN, "si")):
            strings.append("".join(node.text or "" for node in item.iter(_q(_NS_MAIN, "t"))))
        return strings

    def _read_sheet_index(self) -> dict[str, str]:
        workbook = ET.fromstring(self._zip.read("xl/workbook.xml"))
        rels = ET.fromstring(self._zip.read("xl/_rels/workbook.xml.rels"))
        targets = {rel.get("Id"): rel.get("Target") for rel in rels.findall(_q(_NS_PKG, "Relationship"))}
        index: dict[str, str] = {}
        for sheet in workbook.findall(f"{_q(_NS_MAIN, 'sheets')}/{_q(_NS_MAIN, 'sheet')}"):
            name = sheet.get("name") or ""
            rel_id = sheet.get(_q(_NS_REL, "id"))
            target = targets.get(rel_id or "", "")
            if target.startswith("/"):
                target = target.lstrip("/")
            else:
                target = f"xl/{target}"
            index[name] = target
        return index

    def sheet(self, name: str) -> dict[tuple[int, int], str]:
        target = self._sheets.get(name)
        if target is None:
            raise KeyError(f"sheet {name!r} not found; available: {sorted(self._sheets)}")
        root = ET.fromstring(self._zip.read(target))
        grid: dict[tuple[int, int], str] = {}
        for cell in root.iter(_q(_NS_MAIN, "c")):
            ref = cell.get("r") or ""
            match = re.match(r"([A-Z]+)(\d+)", ref)
            if not match:
                continue
            col = _column_index(match.group(1))
            row = int(match.group(2))
            ctype = cell.get("t")
            value_node = cell.find(_q(_NS_MAIN, "v"))
            inline = cell.find(_q(_NS_MAIN, "is"))
            if ctype == "inlineStr":
                text = "".join(node.text or "" for node in cell.iter(_q(_NS_MAIN, "t")))
            elif value_node is None or value_node.text is None:
                continue
            elif ctype == "s":
                try:
                    text = self._shared[int(value_node.text)]
                except (ValueError, IndexError):
                    continue
            else:
                text = value_node.text
            if text is not None and str(text) != "":
                grid[(row, col)] = str(text)
        return grid


def _column_index(letters: str) -> int:
    index = 0
    for char in letters:
        index = index * 26 + (ord(char) - ord("A") + 1)
    return index
