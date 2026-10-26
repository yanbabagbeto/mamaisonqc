import { env } from "@/lib/env";
import type { ProvenanceInfo } from "@/shared/provenance";

/**
 * The geocoder is a runtime source, not an ingested dataset, so it has no `dataset` row.
 * Attribution is still required by its CC-BY 4.0 licence (docs/DATA-CONTRACT.md §1).
 */
export const GEOCODER_PROVENANCE: ProvenanceInfo = {
  datasetId: "adresses-quebec",
  name: "Adresses Québec (géocodeur)",
  publisher: "MERN",
  license: "CC-BY 4.0",
  licenseUrl: "https://www.donneesquebec.ca/licence/",
  sourceUrl: env.GEOCODER_URL,
  referenceDate: null,
  fetchedAt: null,
};
