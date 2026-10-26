import { useRouter } from "expo-router";
import { View } from "react-native";

import { getRegions } from "../../src/api/endpoints";
import type { RegionSummary } from "../../src/api/types";
import { ProvenanceBlock } from "../../src/components/provenance";
import {
  AppText,
  Badge,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  ScreenIntro,
  SectionTitle,
} from "../../src/components/ui";
import { format, useI18n } from "../../src/i18n";
import { useAsyncData } from "../../src/lib/useAsyncData";
import { formatCad, formatMonth, formatNumber } from "../../src/lib/format";
import { bandLabel } from "../../src/lib/labels";
import { colors, spacing } from "../../src/theme";

/** Marché — the 17 administrative regions with real Registre foncier aggregates. */
export default function MarketScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const state = useAsyncData(() => getRegions(), "regions");

  return (
    <Screen refreshing={state.refreshing} onRefresh={state.refresh}>
      <ScreenIntro eyebrow={t.tabs.market} title={t.market.title} subtitle={t.market.subtitle} />

      {state.loading ? <LoadingState label={t.common.loading} /> : null}

      {!state.loading && state.error ? (
        <ErrorState title={t.market.title} error={state.error} onRetry={state.reload} />
      ) : null}

      {!state.loading && !state.error && state.data ? (
        <>
          <SectionTitle>{t.market.regionsTitle}</SectionTitle>
          <AppText variant="bodySmall" color={colors.inkMuted}>
            {t.market.regionsSubtitle}
          </AppText>

          {state.data.regions.length === 0 ? (
            <EmptyState title={t.market.emptyTitle} message={t.market.emptyBody} />
          ) : (
            <View style={{ gap: spacing.md }}>
              {state.data.regions.map((region) => (
                <RegionCard
                  key={region.code}
                  region={region}
                  onPress={() => router.push(`/marche/${encodeURIComponent(region.code)}`)}
                />
              ))}
            </View>
          )}

          <AppText variant="tiny" color={colors.inkSubtle}>
            {t.market.noDataNotice}
          </AppText>

          <ProvenanceBlock items={state.data.provenance} title={t.home.provenanceTitle} />
        </>
      ) : null}
    </Screen>
  );
}

function RegionCard({ region, onPress }: { region: RegionSummary; onPress: () => void }) {
  const { t, lang } = useI18n();
  return (
    <Card onPress={onPress} accessibilityLabel={`${region.name} — ${t.market.viewRegion}`}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
        <AppText variant="section" accessibilityRole="header" style={{ flexShrink: 1 }}>
          {region.name}
        </AppText>
        {region.hasStats ? (
          <Badge
            label={formatMonth(region.latestPeriod, lang) === "—" ? t.market.noStats : formatMonth(region.latestPeriod, lang)}
            tone="success"
          />
        ) : (
          <Badge label={t.market.noStats} tone="warning" />
        )}
      </View>

      {region.hasStats ? (
        <>
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <Summary label={t.market.sales} value={formatNumber(region.salesCount, lang)} />
            <Summary label={t.market.mortgage} value={formatNumber(region.mortgageCount, lang)} />
            <Summary
              label={t.market.difficulties}
              value={formatNumber(region.difficultyCount, lang)}
            />
          </View>
          <AppText variant="caption" color={colors.inkMuted}>
            {t.market.medianBand}:{" "}
            {region.salesMedianBand
              ? bandLabel(region.salesMedianBand, t, lang)
              : t.common.notAvailable}
          </AppText>
        </>
      ) : (
        <AppText variant="caption" color={colors.inkMuted}>
          {t.market.noStats}
        </AppText>
      )}

      <AppText variant="caption" color={colors.inkMuted}>
        {region.hasRoll
          ? `${format(t.market.coveredMunicipalities, { count: region.coveredMunicipalities })} · ${formatNumber(region.unitCount, lang)} ${t.market.units} · ${t.market.medianValue}: ${formatCad(region.medianRollValueCents, lang)}`
          : t.market.noRoll}
      </AppText>

      <AppText variant="caption" weight="semibold" color={colors.primary}>
        {t.market.viewRegion} →
      </AppText>
    </Card>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <AppText variant="tiny" color={colors.inkMuted}>
        {label}
      </AppText>
      <AppText variant="section">{value}</AppText>
    </View>
  );
}
