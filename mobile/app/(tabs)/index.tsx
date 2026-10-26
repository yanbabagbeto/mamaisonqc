import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { searchAddresses } from "../../src/api/endpoints";
import type { AddressCandidate } from "../../src/api/types";
import {
  AppText,
  Button,
  Card,
  EmptyState,
  ErrorState,
  ListRow,
  Screen,
  ScreenIntro,
  SectionTitle,
  TextField,
} from "../../src/components/ui";
import { useI18n } from "../../src/i18n";
import { format } from "../../src/i18n";
import { colors, spacing } from "../../src/theme";

const MIN_QUERY_LENGTH = 3;

/**
 * Accueil — hero, address search (web geocoder endpoint) and the three intent entry points.
 * Search failures are inline: the hero and intents stay usable when the geocoder is down.
 */
export default function HomeScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<AddressCandidate[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<unknown>(null);
  const [lastQuery, setLastQuery] = useState("");

  const canSearch = query.trim().length >= MIN_QUERY_LENGTH;

  async function runSearch(raw: string) {
    const trimmed = raw.trim();
    if (trimmed.length < MIN_QUERY_LENGTH || searching) return;
    setSearching(true);
    setSearchError(null);
    setLastQuery(trimmed);
    try {
      const payload = await searchAddresses(trimmed);
      setCandidates(payload.candidates);
    } catch (error) {
      setSearchError(error);
      setCandidates(null);
    } finally {
      setSearching(false);
    }
  }

  function openCandidate(candidate: AddressCandidate) {
    if (candidate.matricule) {
      router.push(`/evaluation/${encodeURIComponent(candidate.matricule)}`);
      return;
    }
    // The address exists but the roll is not ingested: guide to the covered market instead of
    // pretending to have a valuation (PRD F1.fail).
    router.push("/marche");
  }

  return (
    <Screen
      refreshing={searching && candidates !== null}
      onRefresh={lastQuery ? () => void runSearch(lastQuery) : undefined}
    >
      <ScreenIntro eyebrow={t.home.badge} title={t.home.title} subtitle={t.home.subtitle} />

      <Card>
        <SectionTitle>{t.home.searchTitle}</SectionTitle>
        <TextField
          label={t.home.searchLabel}
          value={query}
          onChangeText={setQuery}
          placeholder={t.home.searchPlaceholder}
          hint={t.home.searchHint}
          autoCapitalize="words"
          autoComplete="street-address"
          textContentType="fullStreetAddress"
          returnKeyType="search"
          onSubmitEditing={() => void runSearch(query)}
        />
        <Button
          label={t.home.searchButton}
          onPress={() => void runSearch(query)}
          disabled={!canSearch}
          loading={searching}
        />
      </Card>

      {searchError ? (
        <ErrorState
          title={t.home.searchErrorTitle}
          error={searchError}
          onRetry={() => void runSearch(lastQuery)}
        />
      ) : null}

      {candidates !== null && !searchError ? (
        <>
          <SectionTitle>
            {format(t.home.resultsCount, { count: candidates.length })}
          </SectionTitle>
          {candidates.length === 0 ? (
            <EmptyState title={t.home.searchEmptyTitle} message={t.home.searchEmptyBody} />
          ) : (
            <View style={{ gap: spacing.sm }}>
              {candidates.map((candidate, index) => (
                <ListRow
                  key={`${candidate.label}-${index}`}
                  title={candidate.label}
                  subtitle={[candidate.city, candidate.postal].filter(Boolean).join(" ")}
                  meta={candidate.matricule ? t.home.openEvaluation : t.home.notCovered}
                  accessibilityLabel={`${candidate.label} — ${
                    candidate.matricule ? t.home.openEvaluation : t.home.notCovered
                  }`}
                  onPress={() => openCandidate(candidate)}
                />
              ))}
            </View>
          )}
        </>
      ) : null}

      <SectionTitle>{t.home.intentsTitle}</SectionTitle>
      <AppText variant="bodySmall" color={colors.inkMuted}>
        {t.home.intentsSubtitle}
      </AppText>

      <Card
        onPress={() => router.push("/pre-marche")}
        accessibilityLabel={`${t.home.intentSellTitle} — ${t.home.intentSellCta}`}
      >
        <AppText variant="section" accessibilityRole="header">
          {t.home.intentSellTitle}
        </AppText>
        <AppText variant="bodySmall" color={colors.inkMuted}>
          {t.home.intentSellBody}
        </AppText>
        <AppText variant="caption" weight="semibold" color={colors.primary}>
          {t.home.intentSellCta} →
        </AppText>
      </Card>

      <Card
        onPress={() => router.push("/marche")}
        accessibilityLabel={`${t.home.intentBuyTitle} — ${t.home.intentBuyCta}`}
      >
        <AppText variant="section" accessibilityRole="header">
          {t.home.intentBuyTitle}
        </AppText>
        <AppText variant="bodySmall" color={colors.inkMuted}>
          {t.home.intentBuyBody}
        </AppText>
        <AppText variant="caption" weight="semibold" color={colors.primary}>
          {t.home.intentBuyCta} →
        </AppText>
      </Card>

      <Card
        onPress={() => router.push("/proprietaire")}
        accessibilityLabel={`${t.home.intentEquityTitle} — ${t.home.intentEquityCta}`}
      >
        <AppText variant="section" accessibilityRole="header">
          {t.home.intentEquityTitle}
        </AppText>
        <AppText variant="bodySmall" color={colors.inkMuted}>
          {t.home.intentEquityBody}
        </AppText>
        <AppText variant="caption" weight="semibold" color={colors.primary}>
          {t.home.intentEquityCta} →
        </AppText>
      </Card>

      <Card>
        <AppText variant="section" accessibilityRole="header">
          {t.home.provenanceTitle}
        </AppText>
        <AppText variant="caption" color={colors.inkMuted} selectable>
          {t.home.provenanceBody}
        </AppText>
      </Card>
    </Screen>
  );
}
