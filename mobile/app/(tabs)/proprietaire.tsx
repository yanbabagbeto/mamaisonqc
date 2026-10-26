import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import {
  AppText,
  Badge,
  Button,
  Card,
  EmptyState,
  Screen,
  ScreenIntro,
  SectionTitle,
  Stat,
  TextField,
} from "../../src/components/ui";
import { format, useI18n } from "../../src/i18n";
import type { Dictionary } from "../../src/i18n";
import { formatBp, formatCad } from "../../src/lib/format";
import {
  equity,
  MAX_LTV_BP,
  mortgagePaymentCents,
  parseMoneyToCents,
  parseMonths,
  parseRateToBp,
  refinanceHeadroom,
  type EquityResult,
  type RefinanceHeadroomResult,
} from "../../src/lib/finance";
import { limitedByLabel } from "../../src/lib/labels";
import { colors, spacing } from "../../src/theme";

type FormValues = {
  value: string;
  balance: string;
  rate: string;
  years: string;
  months: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

type Computation = {
  paymentCents: number;
  equity: EquityResult;
  headroom: RefinanceHeadroomResult;
};

const INITIAL_VALUES: FormValues = { value: "", balance: "", rate: "", years: "25", months: "0" };

/**
 * Propriétaire — offline equity calculator. The numbers come from `src/lib/finance.ts`, a mirror
 * of the web `@/modules/owner/finance` module (see the TODO there); nothing leaves the device.
 */
export default function OwnerScreen() {
  const { t } = useI18n();
  const params = useLocalSearchParams<{ value?: string }>();
  const [values, setValues] = useState<FormValues>(() => ({
    ...INITIAL_VALUES,
    // Deep link from an evaluation: prefill the property value, keep the other fields empty.
    value: typeof params.value === "string" ? params.value : "",
  }));
  const [errors, setErrors] = useState<FormErrors>({});
  const [result, setResult] = useState<Computation | null>(null);

  function update(field: keyof FormValues, text: string) {
    setValues((previous) => ({ ...previous, [field]: text }));
  }

  function calculate() {
    const parsedValue = parseMoneyToCents(values.value);
    const parsedBalance = parseMoneyToCents(values.balance);
    const parsedRate = parseRateToBp(values.rate);
    const parsedMonths = parseMonths(values.years, values.months);
    const next: FormErrors = {};

    if (!parsedValue.ok) {
      next.value =
        parsedValue.reason === "empty"
          ? t.owner.errors.valueRequired
          : parsedValue.reason === "range"
            ? t.owner.errors.valueRange
            : t.owner.errors.valueInvalid;
    } else if (parsedValue.value === 0) {
      next.value = t.owner.errors.valueRange;
    }

    if (!parsedBalance.ok) {
      next.balance =
        parsedBalance.reason === "empty"
          ? t.owner.errors.balanceRequired
          : t.owner.errors.balanceInvalid;
    }

    if (!parsedRate.ok) {
      next.rate =
        parsedRate.reason === "empty"
          ? t.owner.errors.rateRequired
          : parsedRate.reason === "range"
            ? t.owner.errors.rateRange
            : t.owner.errors.rateInvalid;
    }

    if (!parsedMonths.ok) {
      if (parsedMonths.reason === "empty") {
        next.years = t.owner.errors.yearsRequired;
      } else if (parsedMonths.reason === "range") {
        next.years = t.owner.errors.yearsRange;
      } else if (values.months.trim() !== "" && Number(values.months) > 11) {
        next.months = t.owner.errors.monthsInvalid;
      } else {
        next.years = t.owner.errors.yearsInvalid;
      }
    }

    setErrors(next);
    if (
      Object.keys(next).length > 0 ||
      !parsedValue.ok ||
      !parsedBalance.ok ||
      !parsedRate.ok ||
      !parsedMonths.ok
    ) {
      setResult(null);
      return;
    }

    setResult({
      paymentCents: mortgagePaymentCents({
        principalCents: parsedBalance.value,
        annualRateBp: parsedRate.value,
        amortizationMonths: parsedMonths.value,
      }),
      equity: equity({ estimateCents: parsedValue.value, balanceCents: parsedBalance.value }),
      headroom: refinanceHeadroom({
        estimateCents: parsedValue.value,
        balanceCents: parsedBalance.value,
        maxLtvBp: MAX_LTV_BP,
      }),
    });
  }

  function reset() {
    setValues(INITIAL_VALUES);
    setErrors({});
    setResult(null);
  }

  return (
    <Screen>
      <ScreenIntro eyebrow={t.tabs.owner} title={t.owner.title} subtitle={t.owner.subtitle} />

      <Card>
        <SectionTitle>{t.owner.formTitle}</SectionTitle>
        <AppText variant="caption" color={colors.inkMuted}>
          {t.owner.formSubtitle}
        </AppText>
        <TextField
          label={t.owner.value}
          value={values.value}
          onChangeText={(text) => update("value", text)}
          placeholder={t.owner.valuePlaceholder}
          keyboardType="decimal-pad"
          error={errors.value}
        />
        <TextField
          label={t.owner.balance}
          value={values.balance}
          onChangeText={(text) => update("balance", text)}
          placeholder={t.owner.balancePlaceholder}
          keyboardType="decimal-pad"
          error={errors.balance}
        />
        <TextField
          label={t.owner.rate}
          value={values.rate}
          onChangeText={(text) => update("rate", text)}
          placeholder={t.owner.ratePlaceholder}
          keyboardType="decimal-pad"
          error={errors.rate}
        />
        <View style={{ flexDirection: "row", gap: spacing.md }}>
          <View style={{ flex: 2 }}>
            <TextField
              label={t.owner.years}
              value={values.years}
              onChangeText={(text) => update("years", text)}
              placeholder={t.owner.yearsPlaceholder}
              keyboardType="number-pad"
              error={errors.years}
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextField
              label={t.owner.months}
              value={values.months}
              onChangeText={(text) => update("months", text)}
              placeholder={t.owner.monthsPlaceholder}
              keyboardType="number-pad"
              error={errors.months}
            />
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: spacing.md }}>
          <Button label={t.owner.calculate} onPress={calculate} style={{ flex: 1 }} />
          <Button label={t.owner.reset} tone="ghost" onPress={reset} style={{ flex: 1 }} />
        </View>
      </Card>

      {result ? (
        <ResultCard result={result} t={t} />
      ) : (
        <EmptyState title={t.owner.noResultTitle} message={t.owner.noResultBody} />
      )}

      <AppText variant="tiny" color={colors.inkSubtle}>
        {t.owner.disclaimer}
      </AppText>
    </Screen>
  );
}

function ResultCard({ result, t }: { result: Computation; t: Dictionary }) {
  const { lang } = useI18n();
  const negative = result.equity.negative;

  return (
    <Card>
      <SectionTitle>{t.owner.resultTitle}</SectionTitle>

      <Stat label={t.owner.payment} value={formatCad(result.paymentCents, lang)} />
      <AppText variant="caption" color={colors.inkMuted}>
        {t.owner.paymentNote}
      </AppText>

      <View style={{ flexDirection: "row", gap: spacing.md }}>
        <Stat label={t.owner.equity} value={formatCad(result.equity.equityCents, lang)} />
        <Stat label={t.owner.headroom} value={formatCad(result.headroom.headroomCents, lang)} />
      </View>

      <AppText variant="caption" color={colors.inkMuted}>
        {format(t.owner.equityPct, { percent: formatBp(result.equity.equityPctBp, lang) })}
      </AppText>

      {negative ? (
        <>
          <Badge label={t.owner.negativeTitle} tone="danger" />
          <AppText variant="bodySmall" color={colors.danger}>
            {format(t.owner.negativeBody, {
              amount: formatCad(Math.abs(result.equity.equityCents), lang),
            })}
          </AppText>
        </>
      ) : null}

      <AppText variant="caption" color={colors.inkMuted}>
        {t.owner.headroomNote}
      </AppText>
      <AppText variant="caption" color={colors.inkMuted}>
        {t.owner.limitedBy}: {limitedByLabel(t, result.headroom.limitedBy)}
      </AppText>
    </Card>
  );
}
