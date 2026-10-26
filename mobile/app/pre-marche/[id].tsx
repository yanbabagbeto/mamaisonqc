import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { isApiError } from "../../src/api/client";
import { getPremarketListing, sendInterest } from "../../src/api/endpoints";
import { INTEREST_LIMITS } from "../../src/api/types";
import type { PremarketListing } from "../../src/api/types";
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
  TextField,
} from "../../src/components/ui";
import { format, useI18n } from "../../src/i18n";
import { formatArea, formatCad, formatDate } from "../../src/lib/format";
import { horizonLabel, propertyTypeLabel } from "../../src/lib/labels";
import { useAsyncData } from "../../src/lib/useAsyncData";
import { colors, spacing } from "../../src/theme";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Pre-market detail + interest form. The form validates locally with the same limits as the
 * server schema (`interestSchema`), then posts to `/api/mobile/premarket/[id]/interets`;
 * server errors are mapped through the shared `ApiError` codes.
 */
export default function PremarketDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const listingId = typeof params.id === "string" ? params.id : "";
  const { t } = useI18n();
  const state = useAsyncData(() => getPremarketListing(listingId), `listing:${listingId}`);
  const notFound = isApiError(state.error) && state.error.code === "NOT_FOUND";

  return (
    <Screen topInset={false}>
      {state.loading ? <LoadingState label={t.common.loading} /> : null}

      {!state.loading && state.error ? (
        notFound ? (
          <EmptyState title={t.premarket.notFoundTitle} message={t.premarket.notFoundBody} />
        ) : (
          <ErrorState title={t.premarket.title} error={state.error} onRetry={state.reload} />
        )
      ) : null}

      {!state.loading && !state.error && state.data ? (
        <ListingContent listing={state.data.listing} />
      ) : null}
    </Screen>
  );
}

function ListingContent({ listing }: { listing: PremarketListing }) {
  const { t, lang } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    message?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<unknown>(null);

  function validate(): boolean {
    const next: { name?: string; email?: string; message?: string } = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (trimmedName.length < INTEREST_LIMITS.nameMin) {
      next.name = t.premarket.invalidName;
    }
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      next.email = t.premarket.invalidEmail;
    }
    if (trimmedMessage.length > INTEREST_LIMITS.messageMax) {
      next.message = format(t.premarket.messageTooLong, { count: INTEREST_LIMITS.messageMax });
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit() {
    if (submitting || !validate()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await sendInterest(listing.id, {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <View style={{ gap: spacing.xs, paddingTop: spacing.md }}>
        <Badge label={t.premarket.maskedNote} tone="warning" />
        <AppText variant="display" accessibilityRole="header">
          {listing.street} · {listing.city}
        </AppText>
        <AppText variant="bodySmall" color={colors.inkMuted}>
          {formatArea(listing.landAreaM2, lang)}
        </AppText>
      </View>

      <Card>
        <AppText variant="caption" color={colors.inkMuted}>
          {t.premarket.askingPrice}
        </AppText>
        <AppText variant="hero">{formatCad(listing.askingPriceCents, lang)}</AppText>
        <DataRow label={t.evaluation.typeLabel} value={propertyTypeLabel(t, listing.propertyType)} />
        <DataRow label={t.premarket.horizon} value={horizonLabel(t, listing.horizon)} />
        <DataRow
          label={t.premarket.publishedOn}
          value={formatDate(listing.createdAt, lang)}
        />
        <DataRow
          label={t.premarket.interests}
          value={
            listing.interestCount === 1
              ? t.premarket.oneInterest
              : format(t.premarket.manyInterests, { count: listing.interestCount })
          }
        />
      </Card>

      <Card>
        <SectionTitle>{t.premarket.descriptionLabel}</SectionTitle>
        <AppText variant="body" selectable>
          {listing.description}
        </AppText>
      </Card>

      {submitted ? (
        <Card>
          <AppText variant="section" accessibilityRole="header">
            {t.premarket.successTitle}
          </AppText>
          <AppText variant="bodySmall" color={colors.inkMuted}>
            {t.premarket.successBody}
          </AppText>
        </Card>
      ) : (
        <Card>
          <SectionTitle>{t.premarket.interestTitle}</SectionTitle>
          <AppText variant="caption" color={colors.inkMuted}>
            {t.premarket.interestSubtitle}
          </AppText>
          <TextField
            label={`${t.premarket.formName} (${t.common.required})`}
            value={name}
            onChangeText={setName}
            placeholder={t.premarket.formNamePlaceholder}
            error={fieldErrors.name}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            maxLength={INTEREST_LIMITS.nameMax}
          />
          <TextField
            label={`${t.premarket.formEmail} (${t.common.required})`}
            value={email}
            onChangeText={setEmail}
            placeholder={t.premarket.formEmailPlaceholder}
            error={fieldErrors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
          />
          <TextField
            label={format(t.premarket.formMessage, { count: INTEREST_LIMITS.messageMax })}
            value={message}
            onChangeText={setMessage}
            placeholder={t.premarket.formMessagePlaceholder}
            error={fieldErrors.message}
            multiline
            maxLength={INTEREST_LIMITS.messageMax}
          />
          {submitError ? (
            <ErrorState title={t.premarket.errorTitle} error={submitError} />
          ) : null}
          <Button
            label={submitting ? t.premarket.formSubmitting : t.premarket.formSubmit}
            onPress={() => void submit()}
            loading={submitting}
          />
        </Card>
      )}
    </>
  );
}
