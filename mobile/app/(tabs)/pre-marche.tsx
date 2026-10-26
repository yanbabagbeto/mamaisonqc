import { useRouter } from "expo-router";
import { View } from "react-native";

import { getPremarketListings } from "../../src/api/endpoints";
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
import { formatCad, formatDate } from "../../src/lib/format";
import { horizonLabel, propertyTypeLabel } from "../../src/lib/labels";
import { useAsyncData } from "../../src/lib/useAsyncData";
import { colors, spacing } from "../../src/theme";

/**
 * Pré-marché — public listings with a masked address (street + city only, PRD AC-12).
 * The city and street come from the roll; the civic number is never part of the payload.
 */
export default function PremarketScreen() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const state = useAsyncData(() => getPremarketListings(), "premarket");

  return (
    <Screen refreshing={state.refreshing} onRefresh={state.refresh}>
      <ScreenIntro eyebrow={t.tabs.premarket} title={t.premarket.title} subtitle={t.premarket.subtitle} />

      <SectionTitle>{t.premarket.listTitle}</SectionTitle>

      {state.loading ? <LoadingState label={t.common.loading} /> : null}

      {!state.loading && state.error ? (
        <ErrorState title={t.premarket.title} error={state.error} onRetry={state.reload} />
      ) : null}

      {!state.loading && !state.error && state.data ? (
        state.data.listings.length === 0 ? (
          <EmptyState title={t.premarket.emptyTitle} message={t.premarket.emptyBody} />
        ) : (
          <View style={{ gap: spacing.md }}>
            {state.data.listings.map((listing) => (
              <Card
                key={listing.id}
                onPress={() => router.push(`/pre-marche/${encodeURIComponent(listing.id)}`)}
                accessibilityLabel={`${listing.street}, ${listing.city} — ${t.premarket.viewListing}`}
              >
                <AppText variant="section" accessibilityRole="header">
                  {listing.street} · {listing.city}
                </AppText>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
                  <Badge label={propertyTypeLabel(t, listing.propertyType)} tone="neutral" />
                  <Badge label={horizonLabel(t, listing.horizon)} tone="accent" />
                </View>
                <AppText variant="display">{formatCad(listing.askingPriceCents, lang)}</AppText>
                <AppText variant="bodySmall" color={colors.inkMuted} numberOfLines={2}>
                  {listing.description}
                </AppText>
                <AppText variant="caption" color={colors.inkMuted}>
                  {listing.interestCount === 1
                    ? t.premarket.oneInterest
                    : format(t.premarket.manyInterests, { count: listing.interestCount })}
                  {" · "}
                  {t.premarket.publishedOn} {formatDate(listing.createdAt, lang)}
                </AppText>
                <AppText variant="caption" weight="semibold" color={colors.primary}>
                  {t.premarket.viewListing} →
                </AppText>
              </Card>
            ))}
          </View>
        )
      ) : null}

      <AppText variant="tiny" color={colors.inkSubtle}>
        {t.premarket.maskedNote}
      </AppText>
    </Screen>
  );
}
