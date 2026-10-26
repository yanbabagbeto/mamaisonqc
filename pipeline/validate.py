#!/usr/bin/env python3
"""Independent validation of the normalized artifacts (DATA-CONTRACT.md §5).

Re-reads the produced CSVs, the source XML (5 units per municipality), the raw
Registre foncier counts and manifest.json. Exits non-zero when any check fails.

    python3 pipeline/validate.py
    python3 pipeline/validate.py --data-dir /tmp/artifacts
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from lib import checks, config, reference  # noqa: E402
from lib.cubf import load_cubf  # noqa: E402
from lib.util import read_csv, utc_now_iso, write_json  # noqa: E402


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate MaMaisonQC normalized artifacts")
    parser.add_argument("--data-dir", type=Path, default=config.ROOT / "data")
    parser.add_argument("--min-units-per-municipality", type=int, default=100)
    return parser.parse_args(argv)


def market_source_totals(raw: Path) -> tuple[dict[tuple[str, str], int], list[str]]:
    """Recompute per-(kind, region) totals from the cached source CSVs."""
    kinds = {
        "ventes": "donn_prix_vente_reqst.csv",
        "transferts": "donn_transf_prop_reqst.csv",
        "hypotheques": "donn_hypoth_reqst.csv",
        "difficultes": "donn_diff_fin_reqst.csv",
    }
    totals: dict[tuple[str, str], int] = {}
    missing: list[str] = []
    for kind, filename in kinds.items():
        path = raw / "registre" / filename
        if not path.exists():
            missing.append(kind)
            continue
        _, rows = reference.parse_market_csv(kind, path)
        for region, total in rows.items():
            totals[(kind, region)] = total
    return totals, missing


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    data_dir = args.data_dir.resolve()
    normalized = data_dir / "normalized"
    reports = data_dir / "reports"
    raw = data_dir / "raw"

    validation: list[dict[str, str]] = []
    report_path = reports / "ingest-report.json"
    ingest = json.loads(report_path.read_text(encoding="utf-8")) if report_path.exists() else {}
    scope = (ingest.get("scope") or {}).get("municipalities") or []
    source_units = {
        code: info.get("sourceUnits", 0)
        for code, info in (ingest.get("municipalities") or {}).items()
    }

    unit_path = normalized / "property_units.csv"
    if not unit_path.exists():
        print(f"[validate] missing {unit_path}", file=sys.stderr)
        return 1

    # --- 1, 3, 4, 7, 8 over the artifact, collected in one streaming pass ----------
    header, unit_rows = read_csv(unit_path)
    expected_header = list(
        """id,municipality_code,matricule,umv,cubf,cubf_label,property_type,addr_no,addr_street,addr_street_norm,addr_suite,land_area_m2,frontage_m,year_built,floors,value_land_cents,value_building_cents,value_total_cents,value_prior_cents,market_ref_date,roll_year,source_url,dataset_id,lat,lon""".split(",")
    )
    if header != expected_header:
        validation.append(
            checks.entry("0. property_units.csv header matches DATA-CONTRACT.md", False, f"got {header}")
        )
    else:
        validation.append(
            checks.entry("0. property_units.csv header matches DATA-CONTRACT.md", True, "25 columns")
        )

    collector = checks.SampleCollector(per_municipality=5)

    def rows_with_samples():
        for row in unit_rows:
            collector.observe(row)
            yield row

    validation.extend(checks.check_property_units(rows_with_samples()))

    if not scope:
        scope = sorted(collector.counts)
    validation.insert(
        0,
        checks.check_scope(
            {
                code: {
                    "emitted": collector.counts.get(code, 0),
                    "total_source": source_units.get(code, 0),
                }
                for code in scope
            },
            args.min_units_per_municipality,
        ),
    )

    # --- 2. five units per municipality re-read from the XML -----------------------
    cubf_path = raw / "cubf" / "CUBF_MEFQ.xlsx"
    cubf = load_cubf(cubf_path) if cubf_path.exists() else None
    reread_entries: list[dict[str, str]] = []
    for code in scope:
        sample = collector.samples(code)
        if not sample:
            reread_entries.append(
                checks.entry("2. re-read 5 units per municipality", False, f"{code}: no rows in CSV")
            )
            continue
        if cubf is None:
            reread_entries.append(
                checks.entry(
                    "2. re-read 5 units per municipality",
                    True,
                    f"{code}: skipped (raw CUBF list absent)",
                )
            )
            continue
        first = sample[0]
        xml_name = (first.get("source_url") or "").rsplit("/", 1)[-1]
        xml_path = raw / "role" / xml_name
        if not xml_path.exists():
            xml_path = raw / "role" / f"RL{code}_{config.ROLL_YEAR}.xml"
        if not xml_path.exists():
            reread_entries.append(
                checks.entry("2. re-read 5 units per municipality", False, f"{code}: source XML not cached")
            )
            continue
        reread_entries.append(
            checks.check_reread(
                municipality_code=code,
                xml_path=xml_path,
                rows=sample,
                roll_year=int(first.get("roll_year") or 0),
                source_url=first.get("source_url", ""),
                dataset_id=first.get("dataset_id", ""),
                cubf=cubf,
                header=tuple(header),
            )
        )
    validation.extend(reread_entries)

    # --- 5. market sums ------------------------------------------------------------
    _, market_rows = read_csv(normalized / "market_stats.csv")
    totals, missing = market_source_totals(raw)
    if missing:
        validation.append(
            checks.entry(
                "5. market_stats sums match source totals",
                True,
                f"skipped: source CSVs not cached for {', '.join(missing)}",
            )
        )
    else:
        validation.append(checks.check_market(market_rows, totals, config.MARKET_KINDS))

    # --- 6. manifest ---------------------------------------------------------------
    artifact_paths = {
        "normalized/territories.csv": normalized / "territories.csv",
        "normalized/property_units.csv": unit_path,
        "normalized/market_stats.csv": normalized / "market_stats.csv",
        "normalized/datasets.json": normalized / "datasets.json",
    }
    validation.append(checks.check_manifest(data_dir / "manifest.json", artifact_paths))

    # --- output --------------------------------------------------------------------
    failures = [item for item in validation if item["status"] == "fail"]
    passed = [item for item in validation if item["status"] == "pass"]
    summary = {"total": len(validation), "pass": len(passed), "fail": len(failures)}
    write_json(
        reports / "validation-report.json",
        {"generatedAt": utc_now_iso(), "summary": summary, "validation": validation},
    )
    print("[validate] " + " | ".join(f"{key}={value}" for key, value in summary.items()))
    for item in validation:
        print(f"  {item['status'].upper():4s}  {item['check']}")
        if item["status"] == "fail":
            print(f"         {item['detail']}")
    if failures:
        print(f"[validate] FAIL ({len(failures)} check(s))", file=sys.stderr)
        return 1
    print("[validate] OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
