"""Static configuration: source URLs, contracts, paths.

Everything here is copied from docs/DATA-CONTRACT.md or verified against the live
source. No URL is guessed: each one below was fetched successfully (HTTP 200) on
2026-10-26 and the response was checked.
"""

from __future__ import annotations

import re
from pathlib import Path

PIPELINE_DIR = Path(__file__).resolve().parents[1]
ROOT = PIPELINE_DIR.parent

ROLL_YEAR = 2026

# --- v1 scope (DATA-CONTRACT.md §4) ------------------------------------------------
SCOPE: tuple[tuple[str, str], ...] = (
    ("66023", "Montréal"),
    ("65005", "Laval"),
    ("58227", "Longueuil"),
    ("23027", "Québec"),
    ("81017", "Gatineau"),
    ("43027", "Sherbrooke"),
    ("37067", "Trois-Rivières"),
    ("58007", "Brossard"),
    ("64008", "Terrebonne"),
    ("75017", "Saint-Jérôme"),
)

# --- Sources -----------------------------------------------------------------------
# Rôle d'évaluation foncière 2026 (MAMH / Affaires municipales, CC-BY 4.0).
ROLL_INDEX_URL = "https://donneesouvertes.affmunqc.net/role/indexRole{year}.csv"
ROLL_XML_URL = "https://donneesouvertes.affmunqc.net/role/RL{code}_{year}.xml"

# Statistiques du Registre foncier (Registre foncier du Québec, CC-BY 4.0).
REGISTRE_PACKAGE_URL = (
    "https://www.donneesquebec.ca/recherche/api/3/action/"
    "package_show?id=statistiques-du-registre-foncier-du-quebec-sur-le-marche-immobilier"
)
REGISTRE_DATASTORE_URL = (
    "https://www.donneesquebec.ca/recherche/api/3/action/datastore_search?resource_id={rid}"
)
REGISTRE_RESOURCE_NAMES = {
    "ventes": "Nombre de vente par plage de prix",
    "transferts": "Nombre de transferts de propriété",
    "hypotheques": "Nombre d’hypothèques",
    "difficultes": "Nombre d’actes de difficulté financière",
}

# Répertoire des municipalités du Québec (MAMH, CC-BY 4.0).
MUN_PACKAGE_URL = (
    "https://www.donneesquebec.ca/recherche/api/3/action/"
    "package_show?id=repertoire-des-municipalites-du-quebec"
)
MUN_PACKAGE_PAGE = "https://www.donneesquebec.ca/recherche/dataset/repertoire-des-municipalites-du-quebec"

# Liste des codes d'utilisation des biens-fonds (CUBF), MAMH.
CUBF_PAGE_URL = (
    "https://www.mamh.gouv.qc.ca/evaluation-fonciere/"
    "manuel-devaluation-fonciere-du-quebec/codes-dutilisation-des-biens-fonds/"
)
CUBF_XLSX_URL = (
    "https://cdn-contenu.quebec.ca/cdn-contenu/adm/min/affaires-municipales/"
    "publications/evaluation_fonciere/manuel_evaluation_fonciere/CUBF_MEFQ.xlsx"
)

# Georeferenced roll (coordinates). Distributed by MAMH as a GeoPackage; the exact
# local archive is provided by the project owner (no public URL recorded in the
# contract). The pipeline extracts it on demand and records the local path.
GEOPACKAGE_ARCHIVE_DEFAULT = Path.home() / "Downloads" / "ROLE2026_GEOPACKAGE.zip"
GEOPACKAGE_MEMBER = "Role2026_geopackage/Role_2026_2.gpkg"
GEOPACKAGE_LAYER = "rol_unite_p_2026"

# Licences (exact strings taken from the publisher / CKAN metadata).
ROLL_LICENSE = "CC-BY 4.0"
ROLL_LICENSE_URL = "https://creativecommons.org/licenses/by/4.0/"
REGISTRE_LICENSE = "Attribution (CC-BY 4.0)"
REGISTRE_LICENSE_URL = "https://www.donneesquebec.ca/licence/#cc-by"
MUN_LICENSE = "Attribution (CC-BY 4.0)"
MUN_LICENSE_URL = "https://www.donneesquebec.ca/licence/#cc-by"
# The MAMH CUBF page states no explicit licence; the data contract lists the source
# as "open government licence". We record the contract's wording and no URL.
CUBF_LICENSE = "Open government licence"
CUBF_LICENSE_URL = ""

DATASET_ROLE = "role-evaluation-2026"
DATASET_REGISTRE = "registre-foncier-stats"
DATASET_MUN = "mamh-municipalites"
DATASET_CUBF = "cubf"
DATASET_GEOPACKAGE = "role-evaluation-2026-geopackage"

# Required columns. A unit row with an empty required value fails validation.
REQUIRED_UNIT_COLUMNS = (
    "id",
    "municipality_code",
    "matricule",
    "property_type",
    "roll_year",
    "source_url",
    "dataset_id",
)

PROPERTY_TYPES = ("unifamiliale", "copropriete", "plex", "terrain", "non-residentiel", "autre")
MARKET_KINDS = ("ventes", "transferts", "hypotheques", "difficultes")

# Québec's geographic bounding box for the coordinate check (DATA-CONTRACT.md §5.8).
QC_BBOX = (45.0, 63.0, -80.0, -57.0)

CODE_RE = re.compile(r"^\d+$")


def normalize_muni_code(value: str) -> str:
    """MAMH codes are five digits; accept '1023', '01023' or 1023 and zero-pad.

    The 2026 roll index also lists a handful of non-organised territories with
    alphabetic codes (e.g. NR020); those are accepted verbatim.
    """
    text = str(value).strip().upper()
    if not text:
        raise ValueError("empty municipality code")
    if text.isdigit():
        if len(text) > 5:
            raise ValueError(f"municipality code too long: {value!r}")
        return text.zfill(5)
    if re.fullmatch(r"[A-Z0-9]{2,5}", text):
        return text
    raise ValueError(f"invalid municipality code: {value!r}")
