import { View } from "react-native";

import type { ProvenanceInfo } from "../api/types";
import { useI18n } from "../i18n";
import { formatDate } from "../lib/format";
import { openExternal } from "../lib/links";
import { colors, spacing } from "../theme";

import { AppText, Button, Card, DataRow, Divider } from "./ui";

/**
 * Mandatory provenance block (PRD AC-8/AC-18): every figure the app renders traces to a dataset
 * with its publisher, licence and reference date. Shared by evaluation and market screens.
 */
export function ProvenanceBlock({
  items,
  title,
}: {
  items: ReadonlyArray<ProvenanceInfo>;
  title?: string;
}) {
  const { t, lang } = useI18n();
  if (items.length === 0) return null;

  return (
    <Card>
      <AppText variant="section" accessibilityRole="header">
        {title ?? t.evaluation.provenanceTitle}
      </AppText>
      <AppText variant="caption" color={colors.inkMuted}>
        {t.evaluation.provenanceSynopsis}
      </AppText>
      {items.map((item, index) => (
        <View key={`${item.datasetId}-${index}`} style={{ gap: spacing.xs }}>
          {index > 0 ? <Divider /> : null}
          <AppText variant="bodySmall" weight="semibold" selectable>
            {item.name}
          </AppText>
          <DataRow label={t.evaluation.publisher} value={item.publisher} />
          <DataRow label={t.evaluation.license} value={item.license} />
          {item.referenceDate ? (
            <DataRow
              label={t.evaluation.referenceDate}
              value={formatDate(item.referenceDate, lang)}
            />
          ) : null}
          <Button
            label={t.evaluation.source}
            tone="ghost"
            onPress={() => void openExternal(item.sourceUrl)}
            accessibilityLabel={`${t.evaluation.source}: ${item.name}`}
          />
        </View>
      ))}
    </Card>
  );
}
