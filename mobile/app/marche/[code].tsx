import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { isApiError } from "../../src/api/client";
import { getRegion } from "../../src/api/endpoints";
import type { RegionDetailPayload } from "../../src/api/types";
import { ProvenanceBlock } from "../../src/components/provenance";
import {
  AppText,
  BandBar,
  Card,
  DataRow,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  SectionTitle,
  Stat,
} from "../../src/components/ui";
import { format, useI18n } from "../../src/i18n";
import type { Dictionary } from "../../src/i18n";
import { formatCad, formatMonth, formatNumber } from "../../src/lib/format";
import { bandLabel } from "../../src/lib/labels";
import { useAsyncData } from "../../src/lib/useAsyncData";
import { colors, spacing } from "../../src/theme";
import type { Language } from "../../src/i18n";

/** Region detail — sales/mortgage/difficulty totals, price bands and roll coverage. */
export default function RegionScreen() {
  const params = useLocalSearchParams<{ code?: string }>();
  const code = typeof params.code === "string" ? params.code : "";
  const { t, lang } = useI18n();
  const state = useAsyncData(() => getRegion(code), `region:${code}`);
  const notFound = isApiError(state.error) && state.error.code === "NOT_FOUND";

  return (
    <Screen
      topInset={false}
      refreshing={state.refreshing}
      onRefresh={state.refresh}
    >
      {state.loading ? <LoadingState label={t.common.loading} /> : null}

      {!state.loading && state.error ? (
        notFound ? (
          <EmptyState title={t.market.regionNotFoundTitle} message={t.market.regionNotFoundBody} />
        ) : (
          <ErrorState title={t.market.title} error={state.error} onRetry={state.reload} />
        )
      ) : null}

      {!state.loading && !state.error && state.data ? (
        <RegionContent detail={state.data} lang={lang} t={t} />
      ) : null}
    </Screen>
  );
}

function RegionContent({
  detail,
  lang,
  t,
}: {
  detail: RegionDetailPayload;
  lang: Language;
  t: Dictionary;
}) {
  const { coverage } = detail;
  const maxBandCount = detail.priceBands.reduce((max, band) => Math.max(max, band.count), 0);

  return (
    <>
      <View style={{ gap: spacing.xs, paddingTop: spacing.md }}>
        <AppText variant="display" accessibilityRole="header">
          {detail.region.name}
        </AppText>
        {detail.latestPeriod ? (
          <AppText variant="bodySmall" color={colors.inkMuted}>
            {t.market.latestPeriod}: {formatMonth(detail.latestPeriod, lang)}
          </AppText>
        ) : (
          <AppText variant="bodySmall" color={colors.inkMuted}>
            {t.market.noStats}
          </AppText>
        )}
      </View>

      <Card>
        <SectionTitle>{t.market.coverageTitle}</SectionTitle>
        <View style={styles.grid}>
          <Stat label={t.market.coverageUnits} value={formatNumber(coverage.unitCount, lang)} />
          <Stat
            label={t.market.coveredMunicipalities}
            value={`${formatNumber(coverage.coveredMunicipalities, lang)} / ${formatNumber(
              coverage.municipalityCount,
              lang,
            )}`}
          />
          <Stat
            label={t.market.medianValue}
            value={formatCad(coverage.medianRollValueCents, lang)}
          />
          <Stat
            label={t.market.coverageMedianLandArea}
            value={
              coverage.medianLandAreaM2 === null
                ? t.common.notAvailable
                : `${formatNumber(coverage.medianLandAreaM2, lang, 1)} m²`
            }
          />
          <Stat
            label={t.market.coverageRollYear}
            value={
              coverage.rollYear === null ? t.common.notAvailable : formatNumber(coverage.rollYear, lang)
            }
          />
        </View>
        {coverage.coveredMunicipalities === 0 ? (
          <AppText variant="caption" color={colors.warning}>
            {t.market.noRoll}
          </AppText>
        ) : null}
      </Card>

      <Card>
        <SectionTitle>{t.market.totalsTitle}</SectionTitle>
        <AppText variant="caption" color={colors.inkMuted}>
          {format(t.market.totalsSubtitle, { count: detail.window.length })}
        </AppText>
        <View style={styles.grid}>
          <Stat label={t.market.sales} value={formatNumber(detail.totals.ventes, lang)} />
          <Stat label={t.market.mortgage} value={formatNumber(detail.totals.hypotheques, lang)} />
          <Stat
            label={t.market.difficulties}
            value={formatNumber(detail.totals.difficultes, lang)}
          />
        </View>
        <AppText variant="caption" color={colors.inkMuted}>
          {t.market.medianBand}:{" "}
          {detail.medianPriceBand
            ? bandLabel(detail.medianPriceBand, t, lang)
            : t.common.notAvailable}
        </AppText>
      </Card>

      <Card>
        <SectionTitle>{t.market.priceBandsTitle}</SectionTitle>
        <AppText variant="caption" color={colors.inkMuted}>
          {t.market.priceBandsSubtitle}
        </AppText>
        {detail.priceBands.length === 0 ? (
          <AppText variant="bodySmall" color={colors.inkMuted}>
            {t.market.priceBandsEmpty}
          </AppText>
        ) : (
          <View style={{ gap: spacing.md }}>
            {detail.priceBands.map((band) => (
              <BandBar
                key={band.label}
                label={bandLabel(band, t, lang)}
                valueLabel={format(t.market.salesCount, { count: band.count })}
                ratio={maxBandCount > 0 ? band.count / maxBandCount : 0}
                accessibilityLabel={`${bandLabel(band, t, lang)}: ${format(t.market.salesCount, {
                  count: band.count,
                })}`}
              />
            ))}
          </View>
        )}
      </Card>

      <Card>
        <SectionTitle>{t.market.municipalitiesTitle}</SectionTitle>
        <AppText variant="caption" color={colors.inkMuted}>
          {t.market.municipalitiesSubtitle}
        </AppText>
        {detail.municipalities.length === 0 ? (
          <AppText variant="bodySmall" color={colors.inkMuted}>
            {t.market.municipalitiesEmpty}
          </AppText>
        ) : (
          <View>
            {detail.municipalities.map((municipality) => (
              <DataRow
                key={municipality.code}
                label={municipality.name}
                value={
                  municipality.covered
                    ? `${formatNumber(municipality.unitCount, lang)} ${t.market.units} · ${formatCad(
                        municipality.medianRollValueCents,
                        lang,
                      )}`
                    : t.market.noRoll
                }
              />
            ))}
          </View>
        )}
      </Card>

      <ProvenanceBlock items={detail.provenance} title={t.evaluation.provenanceTitle} />
    </>
  );
}

const styles = {
  grid: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: spacing.md },
};
