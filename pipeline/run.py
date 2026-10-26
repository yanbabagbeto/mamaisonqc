#!/usr/bin/env python3
"""MaMaisonQC open-data ETL — build the normalized artifacts from official Québec sources.

Usage:
    python3 pipeline/run.py                                   # v1 scope, 60k units/municipality
    python3 pipeline/run.py --municipalities 66023,65005 --max-units 2000
    python3 pipeline/run.py --all-municipalities --max-units 0   # whole province (slow, big)

Artifacts (data/normalized/): territories.csv, property_units.csv, market_stats.csv,
datasets.json, README.txt. Reports (data/reports/): ingest-report.json, cubf-mapping.csv.
Provenance: data/manifest.json.

Exit code 0 only when every source was read and every validation check passes.
"""

from __future__ import annotations

import argparse
import csv as _csv
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from lib import checks, config, reference, roles  # noqa: E402
from lib.cubf import load_cubf, load_price_bands  # noqa: E402
from lib.sources import Fetcher, FetchResult, html_guard  # noqa: E402
from lib.util import read_csv, sha256_file, utc_now_iso, write_csv, write_json  # noqa: E402


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build MaMaisonQC normalized datasets")
    parser.add_argument(
        "--municipalities",
        default="",
        help="comma-separated code géographique list (default: v1 scope of 10)",
    )
    parser.add_argument(
        "--all-municipalities",
        action="store_true",
        help="ingest every municipality in the 2026 roll index (province-wide, slow)",
    )
    parser.add_argument(
        "--max-units",
        type=int,
        default=60000,
        help="cap per municipality; 0 = no cap (default: 60000)",
    )
    parser.add_argument("--roll-year", type=int, default=config.ROLL_YEAR)
    parser.add_argument("--min-units-per-municipality", type=int, default=100)
    parser.add_argument("--data-dir", type=Path, default=config.ROOT / "data")
    parser.add_argument("--geopackage-zip", type=Path, default=config.GEOPACKAGE_ARCHIVE_DEFAULT)
    parser.add_argument("--skip-geo", action="store_true", help="do not read coordinates")
    parser.add_argument("--force", action="store_true", help="re-download cached sources")
    args = parser.parse_args(argv)
    if not args.municipalities and not args.all_municipalities:
        args.municipalities = ",".join(code for code, _ in config.SCOPE)
    if args.max_units < 0:
        parser.error("--max-units must be >= 0")
    return args


def fetch_roll_index(fetcher: Fetcher, year: int) -> tuple[dict[str, str], FetchResult]:
    url = config.ROLL_INDEX_URL.format(year=year)
    dest = fetcher.raw_dir / "role" / f"indexRole{year}.csv"
    result = fetcher.fetch(url, dest, validate=html_guard)
    if result.status != "ok":
        return {}, result
    header, rows = read_csv(dest)
    if "code géographique" not in header or "lien" not in header:
        result.status = "failed"
        result.error = f"unexpected index header: {header}"
        return {}, result
    mapping: dict[str, str] = {}
    for row in rows:
        raw_code = (row.get("code géographique") or "").strip()
        if not raw_code:
            continue
        code = raw_code.zfill(5) if raw_code.isdigit() else raw_code.upper()
        link = (row.get("lien") or "").strip()
        if link:
            mapping[code] = link
    return mapping, result


def fetch_municipal_reference(fetcher: Fetcher) -> tuple[dict[str, FetchResult], list[dict[str, str]]]:
    results: dict[str, FetchResult] = {}
    payload, package = fetcher.fetch_json(
        config.MUN_PACKAGE_URL, fetcher.raw_dir / "mamh" / "package_show.json"
    )
    results["package"] = package
    if payload is None:
        return results, []
    resources = payload["result"].get("resources", [])
    found: dict[str, dict] = {}
    for resource in resources:
        name = (resource.get("name") or "").replace("\ufeff", "").lower()
        if not name or (resource.get("format") or "").upper() != "CSV":
            continue
        if "mrc" in name:
            found["mrc"] = resource
        elif "municipalit" in name:
            found["mun"] = resource
    if "mun" not in found or "mrc" not in found:
        return results, resources
    for key, filename in (("mun", "MUN.csv"), ("mrc", "MRC_CM_Arg.csv")):
        resource = found[key]
        payload_result = fetcher.fetch(
            resource["url"], fetcher.raw_dir / "mamh" / filename, validate=html_guard
        )
        results[filename] = payload_result
    return results, resources


def fetch_registre(fetcher: Fetcher) -> tuple[dict[str, FetchResult], dict[str, Path]]:
    results: dict[str, FetchResult] = {}
    csv_paths: dict[str, Path] = {}
    payload, package = fetcher.fetch_json(
        config.REGISTRE_PACKAGE_URL, fetcher.raw_dir / "registre" / "package_show.json"
    )
    results["package"] = package
    if payload is None:
        return results, csv_paths
    resources = payload["result"].get("resources", [])
    by_kind: dict[str, dict] = {}
    workbook: dict | None = None
    for resource in resources:
        name = (resource.get("name") or "").lower().replace("\ufeff", "")
        fmt = (resource.get("format") or "").upper()
        if fmt == "XLSX":
            workbook = resource
        if fmt != "CSV":
            continue
        # Two companion resources are lookups ("Liste des natures de ..."), not counts.
        if name.startswith("liste") or "nature" in name:
            continue
        if "plage de prix" in name:
            by_kind["ventes"] = resource
        elif "transfert" in name:
            by_kind["transferts"] = resource
        elif "hypoth" in name:
            by_kind["hypotheques"] = resource
        elif "difficult" in name:
            by_kind["difficultes"] = resource
    for kind in config.MARKET_KINDS:
        resource = by_kind.get(kind)
        if resource is None:
            results[kind] = FetchResult(
                url=f"resource:{kind}", path=fetcher.raw_dir / "registre" / f"{kind}.csv",
                status="failed", error="resource not found in package_show",
            )
            continue
        filename = resource["url"].rsplit("/", 1)[-1]
        dest = fetcher.raw_dir / "registre" / filename
        result = fetcher.fetch(resource["url"], dest, validate=html_guard)
        if result.status != "ok":
            # The CKAN /download/ endpoint 404s intermittently; the datastore API is
            # the same official resource and is stable. Record which one was used.
            fallback = fetcher.datastore_csv(resource["id"], dest)
            if fallback.status == "ok":
                fallback.method = f"datastore (download failed: {result.error})"
                result = fallback
        results[kind] = result
        if result.status == "ok":
            csv_paths[kind] = dest
    if workbook is not None:
        dest = fetcher.raw_dir / "registre" / "market_stats.xlsm"
        results["bands"] = fetcher.fetch(workbook["url"], dest)
    return results, csv_paths


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    data_dir = args.data_dir.resolve()
    normalized = data_dir / "normalized"
    reports = data_dir / "reports"
    raw = data_dir / "raw"
    for directory in (normalized, reports, raw):
        directory.mkdir(parents=True, exist_ok=True)

    fetcher = Fetcher(raw, force=args.force)
    sources: list[dict] = []

    def record_source(source_id: str, result: FetchResult) -> None:
        sources.append(
            {
                "id": source_id,
                "url": result.url,
                "status": result.status,
                "bytes": result.bytes,
                "durationMs": result.duration_ms,
                "error": result.error,
                "method": result.method,
            }
        )

    def abort(message: str) -> int:
        report = {
            "generatedAt": utc_now_iso(),
            "sources": sources,
            "scope": {"municipalities": []},
            "counts": {"territories": 0, "propertyUnits": 0, "marketStats": 0},
            "validation": [checks.entry("0. sources reachable", False, message)],
        }
        write_json(reports / "ingest-report.json", report)
        print(f"[run] FAILED: {message}", file=sys.stderr)
        return 1

    # --- 1. sources ----------------------------------------------------------------
    index, index_result = fetch_roll_index(fetcher, args.roll_year)
    record_source(f"role-evaluation-{args.roll_year}:index", index_result)
    if index_result.status != "ok":
        return abort(f"roll index unavailable: {index_result.error}")

    if args.all_municipalities:
        requested = sorted(index)
    else:
        requested = []
        for piece in args.municipalities.split(","):
            piece = piece.strip()
            if not piece:
                continue
            code = config.normalize_muni_code(piece)
            if code not in index:
                return abort(f"municipality {piece!r} is not in the {args.roll_year} roll index")
            requested.append(code)
        requested = sorted(set(requested))
    if not requested:
        return abort("no municipality selected")

    mun_results, _ = fetch_municipal_reference(fetcher)
    for key, result in mun_results.items():
        record_source(f"mamh-municipalites:{key}", result)
    mun_csv = raw / "mamh" / "MUN.csv"
    mrc_csv = raw / "mamh" / "MRC_CM_Arg.csv"
    if mun_results.get("MUN.csv", FetchResult("", Path(), status="failed")).status != "ok" or not mrc_csv.exists():
        return abort("MAMH municipal reference unavailable")

    cubf_dest = raw / "cubf" / "CUBF_MEFQ.xlsx"
    cubf_result = fetcher.fetch(config.CUBF_XLSX_URL, cubf_dest)
    record_source("cubf-mefq", cubf_result)
    if cubf_result.status != "ok":
        return abort(f"CUBF list unavailable: {cubf_result.error}")
    cubf = load_cubf(cubf_dest)

    registre_results, market_paths = fetch_registre(fetcher)
    for key, result in registre_results.items():
        record_source(f"registre-foncier-stats:{key}", result)
    missing_market = [kind for kind in config.MARKET_KINDS if kind not in market_paths]
    if missing_market:
        return abort(f"market sources unavailable: {', '.join(missing_market)}")
    bands_path = raw / "registre" / "market_stats.xlsm"
    if not bands_path.exists():
        return abort("market workbook (price-band dictionary) unavailable")
    bands = load_price_bands(bands_path)

    gpkg_path = raw / "geo" / "Role_2026_2.gpkg"
    geo_available = not args.skip_geo
    if geo_available:
        geo_result = fetcher.ensure_geopackage(
            args.geopackage_zip, config.GEOPACKAGE_MEMBER, gpkg_path
        )
        record_source("role-geopackage-2026", geo_result)
        if geo_result.status != "ok":
            return abort(
                f"GeoPackage (coordinates) unavailable: {geo_result.error}; "
                "pass --skip-geo to build without coordinates"
            )
    else:
        geo_available = False

    # --- 2. property units ---------------------------------------------------------
    unit_header = roles.PROPERTY_UNIT_HEADER
    property_units_path = normalized / "property_units.csv"
    per_municipality: dict[str, dict] = {}
    market_rows: list[list[str]] = []
    market_source_totals: dict[tuple[str, str], int] = {}
    all_cubf_counts: Counter = Counter()
    validation: list[dict[str, str]] = []
    total_property_units = 0

    with property_units_path.open("w", encoding="utf-8", newline="") as handle:
        writer = _csv.writer(handle, lineterminator="\n")
        writer.writerow(unit_header)
        for code in requested:
            url = index.get(code) or config.ROLL_XML_URL.format(code=code, year=args.roll_year)
            xml_name = url.rsplit("/", 1)[-1]
            dest = raw / "role" / xml_name
            xml_result = fetcher.fetch(url, dest, validate=html_guard)
            record_source(f"role-evaluation-{args.roll_year}:{code}", xml_result)
            if xml_result.status != "ok":
                return abort(f"roll XML for {code} unavailable: {xml_result.error}")
            try:
                parsed = roles.parse_roll(
                    dest,
                    municipality_code=code,
                    cubf=cubf,
                    max_units=args.max_units,
                    dataset_id=config.DATASET_ROLE,
                    source_url=url,
                )
            except roles.RollFormatError as exc:
                return abort(str(exc))

            matched = 0
            if geo_available and parsed.rows:
                matched, _ = roles.join_coordinates(gpkg_path, code, parsed.rows)

            for row in parsed.rows:
                writer.writerow(row)
            total_property_units += len(parsed.rows)
            all_cubf_counts.update(parsed.cubf_counts)

            emitted_types = Counter(row[6] for row in parsed.rows)
            per_municipality[code] = {
                "name": dict(config.SCOPE).get(code, ""),
                "sourceUnits": parsed.total_units,
                "emitted": len(parsed.rows),
                "coordinates": matched,
                "rollYear": parsed.roll_year,
                # Counts are for the EMITTED (capped) rows the app will load; the
                # source-wide distribution is kept alongside for transparency.
                "propertyTypes": dict(sorted(emitted_types.items())),
                "propertyTypesSource": dict(sorted(parsed.property_type_counts.items())),
            }

            # Validation check 2 needs the written rows; validate per municipality and
            # release memory before moving to the next one.
            csv_rows = [dict(zip(unit_header, row, strict=True)) for row in parsed.rows]
            validation.append(
                checks.check_reread(
                    municipality_code=code,
                    xml_path=dest,
                    rows=csv_rows,
                    roll_year=parsed.roll_year,
                    source_url=url,
                    dataset_id=config.DATASET_ROLE,
                    cubf=cubf,
                    header=unit_header,
                )
            )
            print(
                f"[run] {code}: {parsed.total_units} source units, {len(parsed.rows)} kept, "
                f"roll_year={parsed.roll_year}, coordinates={matched}",
                flush=True,
            )

    # --- 3. territories ------------------------------------------------------------
    territory_rows, _ = reference.load_territories(mun_csv, mrc_csv)
    write_csv(normalized / "territories.csv", reference.TERRITORY_HEADER, territory_rows)

    # --- 4. market stats -----------------------------------------------------------
    market_source_row_count = 0
    for kind in config.MARKET_KINDS:
        path = market_paths[kind]
        records, totals = reference.parse_market_csv(kind, path)
        market_source_row_count += len(records)
        for region, total in totals.items():
            market_source_totals[(kind, region)] = total
        market_rows.extend(reference.build_market_stats(kind, records, bands))
    write_csv(normalized / "market_stats.csv", reference.MARKET_HEADER, market_rows)

    # --- 5. README + datasets.json ------------------------------------------------
    total_source_units = sum(info["sourceUnits"] for info in per_municipality.values())
    readme_lines = [
        "MaMaisonQC — normalized open data (generated by pipeline/run.py)",
        "",
        f"property_units.csv is a TRUNCATED SAMPLE: {total_property_units} of "
        f"{total_source_units} source units for {len(per_municipality)} municipality(ies), "
        f"cap = {args.max_units or 'none'} units/municipality.",
        "Selection rule (docs/DATA-CONTRACT.md §4): unifamiliale/copropriete/plex first,",
        "then the rest, by ascending mat18. Do not treat it as full coverage.",
        "",
        "Per municipality (kept / source units):",
    ]
    for code in sorted(per_municipality):
        info = per_municipality[code]
        readme_lines.append(f"  {code}: {info['emitted']} / {info['sourceUnits']}")
    readme_lines += [
        "",
        "Sources, licences, CUBF mapping and validation results: docs/DATA.md.",
        "Provenance: data/manifest.json and data/reports/ingest-report.json.",
    ]
    (normalized / "README.txt").write_text("\n".join(readme_lines) + "\n", encoding="utf-8")

    datasets_path = normalized / "datasets.json"
    datasets = build_datasets(
        args=args,
        fetcher=fetcher,
        per_municipality=per_municipality,
        market_source_rows=market_source_row_count,
        market_periods=sorted({row[1] for row in market_rows}),
        territory_rows=territory_rows,
        cubf_count=len(cubf.labels),
        gpkg_path=gpkg_path if geo_available else None,
        index_result=index_result,
        mun_results=mun_results,
        registre_results=registre_results,
        cubf_result=cubf_result,
    )
    write_json(datasets_path, datasets)

    # CUBF mapping used (for docs/DATA.md and audit).
    cubf_rows = []
    seen_codes = sorted(all_cubf_counts)
    for code in seen_codes:
        property_type = cubf.property_type(
            code,
            has_local=False,
            dwellings=None,
        )
        cubf_rows.append([code, cubf.label(code), property_type, str(all_cubf_counts[code])])
    write_csv(
        reports / "cubf-mapping.csv",
        ("cubf", "label", "cubf_default_type", "units_in_scope"),
        cubf_rows,
    )

    # --- 6. validation over the artifacts ------------------------------------------
    header, unit_rows = read_csv(property_units_path)
    if header != list(unit_header):
        return abort(f"property_units.csv header mismatch: {header}")
    validation.extend(checks.check_property_units(unit_rows))

    market_header, market_rows_read = read_csv(normalized / "market_stats.csv")
    if market_header != list(reference.MARKET_HEADER):
        return abort(f"market_stats.csv header mismatch: {market_header}")
    validation.append(
        checks.check_market(market_rows_read, market_source_totals, config.MARKET_KINDS)
    )

    validation.insert(
        0,
        checks.check_scope(
            {code: {"emitted": info["emitted"], "total_source": info["sourceUnits"]}
             for code, info in per_municipality.items()},
            args.min_units_per_municipality,
        ),
    )

    # --- 7. manifest ---------------------------------------------------------------
    artifact_paths = {
        "normalized/territories.csv": normalized / "territories.csv",
        "normalized/property_units.csv": property_units_path,
        "normalized/market_stats.csv": normalized / "market_stats.csv",
        "normalized/datasets.json": datasets_path,
    }
    manifest = {
        "generatedAt": utc_now_iso(),
        "sources": [
            {
                "id": item["id"],
                "url": item["url"],
                "fetchedAt": fetcher.meta_for(item["url"]).get("fetchedAt", ""),
                "bytes": item["bytes"],
                "sha256": fetcher.meta_for(item["url"]).get("sha256", ""),
            }
            for item in sources
            if item["status"] == "ok"
        ],
        "artifacts": [
            {
                "path": name,
                "bytes": path.stat().st_size,
                "sha256": sha256_file(path),
            }
            for name, path in artifact_paths.items()
        ],
    }
    write_json(data_dir / "manifest.json", manifest)
    validation.append(checks.check_manifest(data_dir / "manifest.json", artifact_paths))

    # --- 8. report -----------------------------------------------------------------
    caps = {
        "maxUnitsPerMunicipality": args.max_units,
        "applied": any(info["sourceUnits"] > args.max_units for info in per_municipality.values())
        if args.max_units
        else False,
        "perMunicipality": {
            code: {
                "sourceUnits": info["sourceUnits"],
                "emitted": info["emitted"],
                "truncated": bool(args.max_units and info["sourceUnits"] > args.max_units),
            }
            for code, info in sorted(per_municipality.items())
        },
    }
    report = {
        "generatedAt": utc_now_iso(),
        "sources": [
            {
                "id": item["id"],
                "url": item["url"],
                "status": item["status"],
                "bytes": item["bytes"],
                "durationMs": item["durationMs"],
                "error": item["error"],
            }
            for item in sources
        ],
        "scope": {"municipalities": requested},
        "counts": {
            "territories": len(territory_rows),
            "propertyUnits": total_property_units,
            "marketStats": len(market_rows),
        },
        "validation": validation,
        "cap": caps,
        "municipalities": per_municipality,
        "geopackage": {
            "available": geo_available,
            "path": str(gpkg_path) if geo_available else None,
            "layer": config.GEOPACKAGE_LAYER,
            "srs": "EPSG:4269",
        },
        "cubf": {
            "distinct_codes_in_scope": len(seen_codes),
            "mapping_file": "reports/cubf-mapping.csv",
        },
    }
    write_json(reports / "ingest-report.json", report)

    failed = [item for item in validation if item["status"] != "pass"]
    print("\n[run] validation")
    for item in validation:
        print(f"  {item['status'].upper():4s}  {item['check']}")
    print(
        f"\n[run] territories={len(territory_rows)} propertyUnits={total_property_units} "
        f"marketStats={len(market_rows)}"
    )
    print(
        f"[run] artifacts: "
        + ", ".join(f"{name} ({path.stat().st_size} B)" for name, path in artifact_paths.items())
    )
    if failed:
        print(f"[run] {len(failed)} validation check(s) failed", file=sys.stderr)
        return 1
    print("[run] OK")
    return 0


def build_datasets(
    *,
    args: argparse.Namespace,
    fetcher: Fetcher,
    per_municipality: dict[str, dict],
    market_source_rows: int,
    market_periods: list[str],
    territory_rows: list[list[str]],
    cubf_count: int,
    gpkg_path: Path | None,
    index_result: FetchResult,
    mun_results: dict[str, FetchResult],
    registre_results: dict[str, FetchResult],
    cubf_result: FetchResult,
) -> list[dict]:
    def fetched_at(result: FetchResult) -> str:
        return fetcher.meta_for(result.url).get("fetchedAt") or result.fetched_at

    def sha(result: FetchResult) -> str:
        return fetcher.meta_for(result.url).get("sha256") or result.sha256

    roll_units = sum(info["sourceUnits"] for info in per_municipality.values())
    datasets = [
        {
            "id": config.DATASET_ROLE,
            "name": "Rôle d'évaluation foncière du Québec 2026",
            "publisher": "Ministère des Affaires municipales et de l'Habitation (MAMH)",
            "license": config.ROLL_LICENSE,
            "licenseUrl": config.ROLL_LICENSE_URL,
            "sourceUrl": config.ROLL_INDEX_URL.format(year=args.roll_year),
            "fetchedAt": fetched_at(index_result),
            "referenceDate": str(args.roll_year),
            "rowCount": roll_units,
            "checksum": f"sha256:{sha(index_result)}",
            "notes": (
                f"{len(per_municipality)} municipal roll files read ({roll_units} units before the "
                f"{args.max_units or 'no'} units/municipality cap). Per-file SHA-256 in "
                "data/manifest.json. Coordinates joined from the MAMH Rôle 2026 GeoPackage "
                "point layer rol_unite_p_2026 (EPSG:4269) when available."
            ),
        },
        {
            "id": config.DATASET_REGISTRE,
            "name": "Statistiques du Registre foncier du Québec sur le marché immobilier",
            "publisher": "Registre foncier du Québec",
            "license": config.REGISTRE_LICENSE,
            "licenseUrl": config.REGISTRE_LICENSE_URL,
            "sourceUrl": config.REGISTRE_PACKAGE_URL,
            "fetchedAt": fetched_at(registre_results.get("package", FetchResult("", Path()))),
            "referenceDate": market_periods[-1] if market_periods else "",
            "rowCount": market_source_rows,
            "checksum": f"sha256:{sha(registre_results.get('package', FetchResult('', Path())))}",
            "notes": (
                "Four monthly CSVs (ventes by price band, transferts, hypothèques, "
                "difficultés) aggregated by (period, region, price band). Price-band labels "
                "read from the publisher's XLSX dictionary sheet 'Codes'."
            ),
        },
        {
            "id": config.DATASET_MUN,
            "name": "Répertoire des municipalités du Québec",
            "publisher": "Ministère des Affaires municipales et de l'Habitation (MAMH)",
            "license": config.MUN_LICENSE,
            "licenseUrl": config.MUN_LICENSE_URL,
            "sourceUrl": config.MUN_PACKAGE_URL,
            "fetchedAt": fetched_at(mun_results.get("MUN.csv", FetchResult("", Path()))),
            "referenceDate": "",
            "rowCount": len(territory_rows),
            "checksum": f"sha256:{sha(mun_results.get('MUN.csv', FetchResult('', Path())))}",
            "notes": (
                "MUN.csv (municipalities, MRC and region labels, population) and "
                "MRC_CM_Arg.csv (MRC names and population). 2 metropolitan communities (CM) "
                "are not MRCs and are excluded; there is no province-level code in the source."
            ),
        },
        {
            "id": config.DATASET_CUBF,
            "name": "Codes d'utilisation des biens-fonds (CUBF) — MEFQ",
            "publisher": "Ministère des Affaires municipales et de l'Habitation (MAMH)",
            "license": config.CUBF_LICENSE,
            "licenseUrl": config.CUBF_LICENSE_URL,
            "sourceUrl": config.CUBF_XLSX_URL,
            "fetchedAt": fetched_at(cubf_result),
            "referenceDate": "2025",
            "rowCount": cubf_count,
            "checksum": f"sha256:{sha(cubf_result)}",
            "notes": "Sheet 'LISTE NUMÉRIQUE' (edition 2025); label per code and property_type rules.",
        },
    ]
    if gpkg_path is not None and gpkg_path.exists():
        datasets.append(
            {
                "id": config.DATASET_GEOPACKAGE,
                "name": "Rôle d'évaluation foncière 2026 — GeoPackage (unit points)",
                "publisher": "Ministère des Affaires municipales et de l'Habitation (MAMH)",
                "license": config.ROLL_LICENSE,
                "licenseUrl": config.ROLL_LICENSE_URL,
                "sourceUrl": f"file://{gpkg_path.resolve()}",
                "fetchedAt": fetcher.meta_for(f"file://{args.geopackage_zip.resolve()}").get(
                    "fetchedAt", ""
                ),
                "referenceDate": str(args.roll_year),
                "rowCount": gpkg_point_count(gpkg_path),
                "checksum": f"sha256:{sha256_file(gpkg_path)}",
                "notes": (
                    "Extracted from the MAMH ROLE2026_GEOPACKAGE archive provided with the "
                    "project (no public download URL is recorded in the contract). Layer "
                    "rol_unite_p_2026, MULTIPOINT, EPSG:4269; joined on mat18."
                ),
            }
        )
    return datasets


def gpkg_point_count(path: Path) -> int:
    import sqlite3

    connection = sqlite3.connect(f"file:{path}?mode=ro", uri=True)
    try:
        return int(connection.execute(f"SELECT COUNT(*) FROM {config.GEOPACKAGE_LAYER}").fetchone()[0])
    finally:
        connection.close()


if __name__ == "__main__":
    raise SystemExit(main())
