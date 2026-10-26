"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, Badge, Stat } from "@/components/ui/content";
import { Field, Input } from "@/components/ui/field";
import type { Locale } from "@/i18n/config";
import {
  parseBudget,
  type BudgetComputation,
  type BudgetFieldErrors,
  type BudgetValues,
} from "@/modules/buyer/budget";
import { interpolate } from "@/modules/buyer/format-message";
import type { BuyerMessages } from "@/modules/buyer/messages";
import { formatCad, formatNumber } from "@/shared/format";

const EMPTY_VALUES: BudgetValues = {
  income: "",
  debts: "",
  downPayment: "",
  rate: "",
  years: "25",
};

/**
 * Client-side budget estimate. The calculation is the same pure `parseBudget` used by the unit
 * tests; nothing is persisted and no personal data leaves the browser. The result is explicitly a
 * capacity estimate, never a pre-approval.
 */
export function BudgetCalculator({
  messages,
  locale,
}: {
  messages: BuyerMessages;
  locale: Locale;
}) {
  const t = messages.financing.calculator;
  const [values, setValues] = useState<BudgetValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<BudgetFieldErrors>({});
  const [result, setResult] = useState<BudgetComputation | null>(null);
  const [invalid, setInvalid] = useState(false);

  function update(field: keyof BudgetValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseBudget(values, locale);
    if (!parsed.ok) {
      setErrors(parsed.errors);
      setResult(null);
      setInvalid(true);
      return;
    }
    setErrors({});
    setInvalid(false);
    setResult(parsed.computation);
  }

  const fields: Array<{
    id: keyof BudgetValues;
    label: string;
    hint: string;
    placeholder: string;
    error?: string;
  }> = [
    { id: "income", label: t.incomeLabel, hint: t.incomeHint, placeholder: t.incomePlaceholder, error: errors.income },
    { id: "debts", label: t.debtsLabel, hint: t.debtsHint, placeholder: t.debtsPlaceholder, error: errors.debts },
    { id: "downPayment", label: t.downLabel, hint: t.downHint, placeholder: t.downPlaceholder, error: errors.downPayment },
    { id: "rate", label: t.rateLabel, hint: t.rateHint, placeholder: t.ratePlaceholder, error: errors.rate },
    { id: "years", label: t.yearsLabel, hint: t.yearsHint, placeholder: t.yearsPlaceholder, error: errors.years },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
      <Card>
        <CardHeader>
          <CardTitle>{t.title}</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-sm leading-relaxed text-ink-soft">{t.intro}</p>
          <form onSubmit={submit} noValidate className="space-y-4">
            {fields.map((field) => (
              <Field
                key={field.id}
                label={field.label}
                htmlFor={`budget-${field.id}`}
                hint={field.hint}
                error={field.error ?? null}
              >
                <Input
                  id={`budget-${field.id}`}
                  name={field.id}
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder={field.placeholder}
                  value={values[field.id]}
                  onChange={(event) => update(field.id, event.target.value)}
                  aria-invalid={Boolean(field.error)}
                  aria-describedby={`budget-${field.id}-hint`}
                />
              </Field>
            ))}
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit">{t.submit}</Button>
              <Badge tone="warning">{t.notPreApproval}</Badge>
            </div>
          </form>
          {invalid ? (
            <Alert tone="danger" title={t.invalidTitle}>
              {t.invalidBody}
            </Alert>
          ) : null}
        </CardBody>
      </Card>

      <div className="space-y-6" aria-live="polite">
        {result ? (
          <Card>
            <CardHeader className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>{t.resultTitle}</CardTitle>
              <Badge tone="warning">{t.notPreApproval}</Badge>
            </CardHeader>
            <CardBody className="space-y-5">
              <p className="text-sm leading-relaxed text-ink-soft">{t.resultIntro}</p>
              <dl className="grid gap-5 sm:grid-cols-2">
                <Stat label={t.loanLabel} value={formatCad(result.maxLoanCents, locale)} tone="accent" />
                <Stat label={t.budgetLabel} value={formatCad(result.maxPurchaseCents, locale)} />
                <Stat
                  label={t.paymentLabel}
                  value={formatCad(result.monthlyHousingCents, locale)}
                  hint={t.paymentHint}
                />
                <Stat
                  label={t.incomeLabelResult}
                  value={formatCad(result.grossMonthlyIncomeCents, locale)}
                />
                <Stat label={t.tdsLabel} value={t.tdsValue} hint={`${formatNumber(result.tdsBp / 100, locale)} %`} />
              </dl>
              {result.debtLimited ? (
                <Alert tone="warning" title={t.loanLabel}>
                  {interpolate(t.debtLimited, {
                    debts: formatCad(result.monthlyDebtsCents, locale),
                  })}
                </Alert>
              ) : null}
              <div className="rounded-xl bg-muted px-4 py-3 text-sm leading-relaxed text-ink-soft">
                <p className="font-semibold text-ink">{t.assumptionsTitle}</p>
                <ul className="mt-2 space-y-1">
                  {t.assumptions.map((assumption) => (
                    <li key={assumption}>• {assumption}</li>
                  ))}
                </ul>
              </div>
              <p className="text-xs leading-relaxed text-muted-fg">{t.disclaimer}</p>
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{t.emptyTitle}</CardTitle>
            </CardHeader>
            <CardBody>
              <p className="text-sm leading-relaxed text-ink-soft">{t.emptyBody}</p>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
