import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";

import { isApiError } from "../../src/api/client";
import { getEvaluation } from "../../src/api/endpoints";
import type { EvaluationPayload, MobileComparable } from "../../src/api/types";
import { ProvenanceBlock } from "../../src/components/provenance";
import {
  AppText,
  Badge,
  Button,
  Card,
  DataRow,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  SectionTitle,
} from "../../src/components/ui";
import { format, useI18n } from "../../src/i18n";
import type { Dictionary } from "../../src/i18n";
import { centsToInputValue } from "../../src/lib/finance";
import { formatArea, formatCad, formatDate, formatNumber } from "../../src/lib/format";
import { confidenceLabel, confidenceTone, propertyTypeLabel } from "../../src/lib/labels";
import { useAsyncData } from "../../src/lib/useAsyncData";
import { colors, spacing } from "../../src/theme";
import type { Language } from "../../src/i18n";

/**
 * Évaluation — one property: roll values, comparables-based estimate, confidence, comparables
 * table, method and provenance. Below three comparables the estimate is refused (product rule).
 */
export default function EvaluationScreen() {
  const params = useLocalSearchParams<{ matricule?: string }>();
  const matricule = typeof params.matricule === "string" ? params.matricule : "";
  const { t } = useI18n();
  const state = useAsyncData(() => getEvaluation(matricule), `evaluation:${matricule}`);
  const notFound = isApiError(state.error) && state.error.code === "NOT_FOUND";

  return (
    <Screen topInset={false} refreshing={state.refreshing} onRefresh={state.refresh}>
      {state.loading ? <LoadingState label={t.common.loading} /> : null}

      {!state.loading && state.error ? (
        notFound ? (
          <EmptyState title={t.evaluation.notFoundTitle} message={t.evaluation.notFoundBody} />
        ) : (
          <ErrorState title={t.evaluation.screenTitle} error={state.error} onRetry={state.reload} />
        )
      ) : null}

      {!state.loading && !state.error && state.data ? <EvaluationContent payload={state.data} /> : null}
    </Screen>
  );
}

function EvaluationContent({ payload }: { payload: EvaluationPayload }) {
  const { t, lang } = useI18n();
  const router = useRouter();
  const { unit, estimate, comparables } = payload;
  const equityValue = centsToInputValue(unit.valueTotalCents);

  return (
    <>
      <View style={{ gap: spacing.sm, paddingTop: spacing.md }}>
        <Badge label={propertyTypeLabel(t, unit.propertyType)} tone="neutral" />
        <AppText variant="display" accessibilityRole="header">
          {unit.address.length > 0 ? unit.address : t.common.notAvailable}
        </AppText>
        <AppText variant="bodySmall" color={colors.inkMuted}>
          {unit.municipality ?? t.evaluation.municipalityUnknown}
        </AppText>
      </View>

      <EstimateCard estimate={estimate} t={t} lang={lang} />

      <Card>
        <SectionTitle>{t.evaluation.rollTitle}</SectionTitle>
        <DataRow label={t.evaluation.rollTotal} value={formatCad(unit.valueTotalCents, lang)} />
        <DataRow label={t.evaluation.rollLand} value={formatCad(unit.valueLandCents, lang)} />
        <DataRow label={t.evaluation.rollBuilding} value={formatCad(unit.valueBuildingCents, lang)} />
        {unit.valuePriorCents !== null ? (
          <DataRow label={t.evaluation.rollPrior} value={formatCad(unit.valuePriorCents, lang)} />
        ) : null}
        <DataRow label={t.evaluation.rollYear} value={formatNumber(unit.rollYear, lang)} />
        <DataRow
          label={t.evaluation.marketRefDate}
          value={formatDate(unit.marketRefDate, lang)}
        />
      </Card>

      <Card>
        <SectionTitle>{t.evaluation.factsTitle}</SectionTitle>
        <DataRow label={t.evaluation.landArea} value={formatArea(unit.landAreaM2, lang)} />
        <DataRow label={t.evaluation.yearBuilt} value={formatNumber(unit.yearBuilt, lang)} />
        <DataRow label={t.evaluation.matricule} value={unit.matricule} align="left" />
        {unit.umv ? <DataRow label={t.evaluation.umv} value={unit.umv} align="left" /> : null}
        {unit.cubf ? <DataRow label={t.evaluation.cubf} value={unit.cubf} align="left" /> : null}
      </Card>

      <Card>
        <SectionTitle
          right={
            <Badge
              label={format(t.evaluation.comparablesCount, { count: comparables.length })}
              tone="neutral"
            />
          }
        >
          {t.evaluation.comparablesTitle}
        </SectionTitle>
        <AppText variant="caption" color={colors.inkMuted}>
          {t.evaluation.comparablesSubtitle}
        </AppText>
        {comparables.length === 0 ? (
          <>
            <AppText variant="bodySmall" weight="semibold">
              {t.evaluation.comparablesEmptyTitle}
            </AppText>
            <AppText variant="caption" color={colors.inkMuted}>
              {t.evaluation.comparablesEmptyBody}
            </AppText>
          </>
        ) : (
          <View style={{ gap: spacing.md }}>
            {comparables.map((comparable) => (
              <ComparableRow key={`${comparable.matricule}-${comparable.address}`} comparable={comparable} />
            ))}
          </View>
        )}
      </Card>

      <Card>
        <SectionTitle>{t.evaluation.methodTitle}</SectionTitle>
        <AppText variant="bodySmall" color={colors.inkMuted}>
          {t.evaluation.methodBody}
        </AppText>
      </Card>

      <ProvenanceBlock items={payload.provenance} />

      <Button
        label={t.evaluation.equityCta}
        onPress={() => router.push(`/proprietaire?value=${encodeURIComponent(equityValue)}`)}
      />
    </>
  );
}

function EstimateCard({
  estimate,
  t,
  lang,
}: {
  estimate: EvaluationPayload["estimate"];
  t: Dictionary;
  lang: Language;
}) {
  return (
    <Card>
      <AppText variant="caption" color={colors.inkMuted}>
        {t.evaluation.estimateTitle}
      </AppText>

      {estimate.estimateAvailable ? (
        <>
          <AppText variant="hero">{formatCad(estimate.estimateCents, lang)}</AppText>
          <DataRow
            label={t.evaluation.estimateRange}
            value={`${formatCad(estimate.lowCents, lang)} – ${formatCad(estimate.highCents, lang)}`}
          />
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
            <AppText variant="caption" color={colors.inkMuted}>
              {t.evaluation.estimateConfidence}
            </AppText>
            <Badge
              label={confidenceLabel(t, estimate.confidence)}
              tone={confidenceTone(estimate.confidence)}
            />
          </View>
          <AppText variant="caption" color={colors.inkMuted}>
            {format(t.evaluation.estimateComparables, { count: estimate.comparablesCount })}
          </AppText>
          <AppText variant="tiny" color={colors.inkSubtle}>
            {t.evaluation.estimateDisclaimer}
          </AppText>
        </>
      ) : (
        <>
          <AppText variant="section">{t.evaluation.estimateUnavailableTitle}</AppText>
          <AppText variant="bodySmall" color={colors.inkMuted}>
            {t.evaluation.estimateUnavailableBody}
          </AppText>
        </>
      )}
    </Card>
  );
}

function ComparableRow({ comparable }: { comparable: MobileComparable }) {
  const { t, lang } = useI18n();
  return (
    <View
      style={{ gap: spacing.xs, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: spacing.sm }}
    >
      <AppText variant="bodySmall" weight="semibold">
        {comparable.address.length > 0 ? comparable.address : t.common.notAvailable}
      </AppText>
      <DataRow label={t.evaluation.comparableValue} value={formatCad(comparable.valueTotalCents, lang)} />
      <DataRow label={t.evaluation.comparableArea} value={formatArea(comparable.landAreaM2, lang)} />
      <DataRow label={t.evaluation.comparableYear} value={formatNumber(comparable.yearBuilt, lang)} />
    </View>
  );
}
