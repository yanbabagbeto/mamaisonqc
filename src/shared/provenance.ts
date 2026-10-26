/** The provenance block is mandatory for every figure the site renders (PRD AC-8, AC-18). */
export type ProvenanceInfo = {
  datasetId: string;
  name: string;
  publisher: string;
  license: string;
  licenseUrl?: string | null;
  sourceUrl: string;
  referenceDate?: string | null;
  fetchedAt?: string | null;
};
