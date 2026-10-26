/**
 * Original illustration system for MaMaisonQC.
 *
 * Every asset is hand-built SVG: no photo, no stock icon, no AI render, no external URL and no
 * baked-in text (the product is bilingual; copy always comes from the component next to the
 * drawing). All components are server-safe, decorative by default and accept
 * `className` / `width` / `height` / `title`.
 *
 * Full slot inventory and integration notes: docs/IMAGES.md.
 */
export { HeroHouseScene } from "./hero-house";
export {
  FeatureIllustration,
  FEATURE_TITLES,
  FeatureAcheter,
  FeatureAssurance,
  FeatureFinancement,
  FeatureHypotheque,
  FeatureRenovation,
  FeatureVendre,
  type FeatureKind,
} from "./features";
export {
  RegionScene,
  REGIONS,
  getRegion,
  regionSeed,
  regionVariant,
  type Region,
  type RegionSceneProps,
} from "./region-scene";
export {
  PropertyTypeThumb,
  PROPERTY_TYPE_LABELS,
  PropertyTypeCommercial,
  PropertyTypeCopropriete,
  PropertyTypePlex,
  PropertyTypeTerrain,
  PropertyTypeUnifamiliale,
  type PropertyTypeKind,
} from "./property-types";
export { PreMarketPhone } from "./phone-mockup";
export {
  EmptyStateIllustration,
  EMPTY_STATE_LABELS,
  EmptyNoData,
  EmptyNoInterest,
  EmptyNoListings,
  EmptyNoResults,
  type EmptyStateKind,
} from "./empty-states";
export { PALETTE, type Terrain } from "./palette";
export { illustrationA11y, type IllustrationDimension, type IllustrationProps } from "./types";
