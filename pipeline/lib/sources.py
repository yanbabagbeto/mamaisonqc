"""Source acquisition: HTTP download with cache + retries, CKAN discovery, unpacking.

Cache layout under `data/raw/`:
    role/indexRole2026.csv, role/RL<code>_2026.xml
    registre/package_show.json, registre/donn_*.csv, registre/list_*.csv
    mamh/MUN.csv, mamh/MRC_CM_Arg.csv, mamh/package_show.json
    cubf/CUBF_MEFQ.xlsx
    geo/Role_2026_2.gpkg
    _fetch-meta.json          # fetchedAt/bytes/sha256 per URL (stable across reruns)

Downloads are idempotent: a cached file is never re-downloaded unless --force.
"""

from __future__ import annotations

import json
import shutil
import time
import urllib.error
import urllib.request
import zipfile
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable

from . import config
from .util import sha256_file, utc_now_iso, write_json

USER_AGENT = "MaMaisonQC-pipeline/1.0 (+https://mamaisonqc.local; data ingestion)"


@dataclass
class FetchResult:
    url: str
    path: Path
    status: str = "ok"
    bytes: int = 0
    duration_ms: int = 0
    sha256: str = ""
    fetched_at: str = ""
    cached: bool = False
    error: str | None = None
    method: str = "http"


@dataclass
class Fetcher:
    raw_dir: Path
    force: bool = False
    timeout: int = 600
    retries: int = 4
    _meta: dict[str, dict[str, Any]] = field(default_factory=dict)

    def __post_init__(self) -> None:
        self.raw_dir.mkdir(parents=True, exist_ok=True)
        meta_path = self.raw_dir / "_fetch-meta.json"
        if meta_path.exists():
            try:
                self._meta = json.loads(meta_path.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                self._meta = {}

    # -- metadata ------------------------------------------------------------------
    def meta_for(self, url: str) -> dict[str, Any]:
        return self._meta.get(url, {})

    def _save_meta(self) -> None:
        write_json(self.raw_dir / "_fetch-meta.json", self._meta)

    def _record(self, result: FetchResult) -> FetchResult:
        self._meta[result.url] = {
            "fetchedAt": result.fetched_at,
            "bytes": result.bytes,
            "sha256": result.sha256,
            "status": result.status,
        }
        self._save_meta()
        return result

    # -- public --------------------------------------------------------------------
    def fetch(
        self,
        url: str,
        dest: Path,
        *,
        validate: Callable[[Path], None] | None = None,
        content_type: str | None = None,
    ) -> FetchResult:
        dest.parent.mkdir(parents=True, exist_ok=True)
        if dest.exists() and dest.stat().st_size > 0 and not self.force:
            meta = self._meta.get(url, {})
            fetched_at = meta.get("fetchedAt") or datetime.fromtimestamp(
                dest.stat().st_mtime, tz=timezone.utc
            ).strftime("%Y-%m-%dT%H:%M:%SZ")
            digest = meta.get("sha256") or sha256_file(dest)
            self._meta[url] = {
                "fetchedAt": fetched_at,
                "bytes": dest.stat().st_size,
                "sha256": digest,
                "status": "ok",
            }
            return FetchResult(
                url=url,
                path=dest,
                bytes=dest.stat().st_size,
                sha256=digest,
                fetched_at=fetched_at,
                cached=True,
                method="cache",
            )

        last_error = ""
        for attempt in range(1, self.retries + 1):
            started = time.monotonic()
            tmp = dest.with_suffix(dest.suffix + ".part")
            try:
                request = urllib.request.Request(
                    url, headers={"User-Agent": USER_AGENT, "Accept": content_type or "*/*"}
                )
                with urllib.request.urlopen(request, timeout=self.timeout) as response:
                    with tmp.open("wb") as handle:
                        shutil.copyfileobj(response, handle, length=1 << 20)
                if tmp.stat().st_size == 0:
                    raise ValueError("empty response")
                if validate is not None:
                    validate(tmp)
                tmp.replace(dest)
                duration_ms = int((time.monotonic() - started) * 1000)
                result = FetchResult(
                    url=url,
                    path=dest,
                    bytes=dest.stat().st_size,
                    duration_ms=duration_ms,
                    sha256=sha256_file(dest),
                    fetched_at=utc_now_iso(),
                )
                return self._record(result)
            except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, ValueError, OSError) as exc:
                last_error = f"{type(exc).__name__}: {exc}"
                tmp.unlink(missing_ok=True)
                if attempt < self.retries:
                    time.sleep(min(2 * attempt, 8))
        result = FetchResult(
            url=url,
            path=dest,
            status="failed",
            duration_ms=int(0),
            error=last_error,
        )
        return self._record(result)

    def fetch_json(self, url: str, dest: Path) -> tuple[Any | None, FetchResult]:
        result = self.fetch(url, dest, content_type="application/json")
        if result.status != "ok":
            return None, result
        try:
            return json.loads(dest.read_text(encoding="utf-8")), result
        except json.JSONDecodeError as exc:
            result.status = "failed"
            result.error = f"invalid JSON: {exc}"
            return None, result

    def datastore_csv(self, resource_id: str, dest: Path, *, page_size: int = 10000) -> FetchResult:
        """Fallback when the CKAN `/download/` endpoint is flaky (it returned 404
        intermittently on 2026-10-26): page the official datastore API and write an
        equivalent CSV. The rows and field names are the resource's own."""
        started = time.monotonic()
        dest.parent.mkdir(parents=True, exist_ok=True)
        base = config.REGISTRE_DATASTORE_URL.format(rid=resource_id)
        records: list[dict[str, Any]] = []
        fields: list[str] = []
        offset = 0
        try:
            while True:
                url = f"{base}&limit={page_size}&offset={offset}"
                request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
                with urllib.request.urlopen(request, timeout=self.timeout) as response:
                    payload = json.loads(response.read().decode("utf-8"))
                result = payload["result"]
                if not fields:
                    fields = [f["id"] for f in result["fields"] if f["id"] != "_id"]
                page = result["records"]
                records.extend(page)
                total = result["total"]
                offset += len(page)
                if offset >= total or not page:
                    break
            import csv as _csv

            with dest.open("w", encoding="utf-8", newline="") as handle:
                writer = _csv.writer(handle, lineterminator="\n")
                writer.writerow(fields)
                for record in records:
                    writer.writerow([record.get(name, "") for name in fields])
            return FetchResult(
                url=base,
                path=dest,
                bytes=dest.stat().st_size,
                duration_ms=int((time.monotonic() - started) * 1000),
                sha256=sha256_file(dest),
                fetched_at=utc_now_iso(),
                method="datastore",
            )
        except Exception as exc:  # noqa: BLE001 - reported, never raised
            return FetchResult(url=base, path=dest, status="failed", error=f"{type(exc).__name__}: {exc}")

    # -- archives ------------------------------------------------------------------
    def ensure_geopackage(self, archive: Path, member: str, dest: Path) -> FetchResult:
        def file_url(path: Path) -> str:
            return f"file://{path.resolve()}"

        if dest.exists() and dest.stat().st_size > 0 and not self.force:
            key = file_url(archive)
            existing = self._meta.get(key, {})
            fetched_at = existing.get("fetchedAt") or datetime.fromtimestamp(
                dest.stat().st_mtime, tz=timezone.utc
            ).strftime("%Y-%m-%dT%H:%M:%SZ")
            return self._record(
                FetchResult(
                    url=key,
                    path=dest,
                    bytes=dest.stat().st_size,
                    sha256=existing.get("sha256") or sha256_file(dest),
                    fetched_at=fetched_at,
                    cached=True,
                    method="cache",
                )
            )
        if not archive.exists():
            return FetchResult(
                url=file_url(archive),
                path=dest,
                status="failed",
                error=f"GeoPackage archive not found: {archive}",
            )
        started = time.monotonic()
        dest.parent.mkdir(parents=True, exist_ok=True)
        tmp = dest.with_suffix(dest.suffix + ".part")
        with zipfile.ZipFile(archive) as bundle:
            with bundle.open(member) as source, tmp.open("wb") as target:
                shutil.copyfileobj(source, target, length=8 << 20)
        tmp.replace(dest)
        return self._record(
            FetchResult(
                url=file_url(archive),
                path=dest,
                bytes=dest.stat().st_size,
                duration_ms=int((time.monotonic() - started) * 1000),
                sha256=sha256_file(dest),
                fetched_at=utc_now_iso(),
                method="zip",
            )
        )


def html_guard(path: Path) -> None:
    """Reject HTML error pages served with HTTP 200/404 by the CKAN endpoint."""
    with path.open("rb") as handle:
        head = handle.read(512).lstrip()
    lowered = head.lower()
    if lowered.startswith(b"<!doctype") or lowered.startswith(b"<html"):
        raise ValueError("server returned an HTML page instead of data")
