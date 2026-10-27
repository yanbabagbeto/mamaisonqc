"use client";

import { useActionState, useState } from "react";

import { calculateEquityAction } from "@/app/proprietaire/equite/actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Alert, Stat } from "@/components/ui/content";
import { Field, Input } from "@/components/ui/field";
import type { Locale } from "@/i18n/config";
import type { EquityField, EquityState } from "@/modules/owner/equity";
import { fill, type OwnerMessages } from "@/modules/owner/messages";
import { formatCad, formatCadPrecise, formatPercent } from "@/shared/format";

type CalculatorLabels = OwnerMessages["equity"]["calculator"];

function describedBy(id: string, error?: string, hasHint = false): string | undefined {
  if (error) return `${id}-error`;
  return hasHint ? `${id}-hint` : undefined;
}

export function EquityCalculator({
  initialState,
  labels,
  locale,
  refinanceHref,
}: {
  initialState: EquityState;
  labels: CalculatorLabels;
  locale: Locale;
  refinanceHref: string;
}) {
  const [state, formAction, pending] = useActionState(calculateEquityAction, initialState);
  const [value, setValue] = useState(initialState.values.value);
  const [balance, setBalance] = useState(initialState.values.balance);
  const [rate, setRate] = useState(initialState.values.rate);
  const [years, setYears] = useState(initialState.values.years);
  const [months, setMonths] = useState(initialState.values.months);

  const result = state.result;
  // While the action runs, the previous result's errors must not sit next to "Calcul en cours…".
  const error = (field: EquityField) => (pending ? undefined : state.errors[field]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
      <Card>
        <CardBody>
          <CardTitle>{labels.cardTitle}</CardTitle>
          <p className="mt-1 text-sm text-ink-soft">{labels.cardIntro}</p>

          <form action={formAction} noValidate className="mt-5 space-y-4">
            {!pending && state.status === "invalid" ? (
              <Alert tone="warning" title={labels.invalidTitle}>
                {labels.invalidBody}
              </Alert>
            ) : null}

            <Field
              label={labels.valueLabel}
              htmlFor="equity-value"
              hint={labels.valueHint}
              error={error("value")}
            >
              <Input
                id="equity-value"
                name="value"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder={labels.valuePlaceholder}
                required
                value={value}
                onChange={(event) => setValue(event.target.value)}
                aria-invalid={error("value") ? true : undefined}
                aria-describedby={describedBy("equity-value", error("value"), true)}
                disabled={pending}
              />
            </Field>

            <Field
              label={labels.balanceLabel}
              htmlFor="equity-balance"
              hint={labels.balanceHint}
              error={error("balance")}
            >
              <Input
                id="equity-balance"
                name="balance"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder={labels.balancePlaceholder}
                required
                value={balance}
                onChange={(event) => setBalance(event.target.value)}
                aria-invalid={error("balance") ? true : undefined}
                aria-describedby={describedBy("equity-balance", error("balance"), true)}
                disabled={pending}
              />
            </Field>

            <Field
              label={labels.rateLabel}
              htmlFor="equity-rate"
              hint={labels.rateHint}
              error={error("rate")}
            >
              <Input
                id="equity-rate"
                name="rate"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder={labels.ratePlaceholder}
                required
                value={rate}
                onChange={(event) => setRate(event.target.value)}
                aria-invalid={error("rate") ? true : undefined}
                aria-describedby={describedBy("equity-rate", error("rate"), true)}
                disabled={pending}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label={labels.yearsLabel} htmlFor="equity-years" error={error("years")}>
                <Input
                  id="equity-years"
                  name="years"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={50}
                  step={1}
                  placeholder={labels.yearsPlaceholder}
                  value={years}
                  onChange={(event) => setYears(event.target.value)}
                  aria-invalid={error("years") ? true : undefined}
                  aria-describedby={error("years") ? "equity-years-error" : undefined}
                  disabled={pending}
                />
              </Field>
              <Field label={labels.monthsLabel} htmlFor="equity-months" error={error("months")}>
                <Input
                  id="equity-months"
                  name="months"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={11}
                  step={1}
                  placeholder={labels.monthsPlaceholder}
                  value={months}
                  onChange={(event) => setMonths(event.target.value)}
                  aria-invalid={error("months") ? true : undefined}
                  aria-describedby={error("months") ? "equity-months-error" : undefined}
                  disabled={pending}
                />
              </Field>
            </div>

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? labels.submitting : labels.submit}
            </Button>
          </form>
        </CardBody>
      </Card>

      <div aria-live="polite" aria-atomic="true" className="min-h-24">
        {result ? (
          <EquityResult
            result={result}
            labels={labels}
            locale={locale}
            refinanceHref={refinanceHref}
          />
        ) : (
          <EmptyPrompt labels={labels} />
        )}
      </div>
    </div>
  );
}

function EmptyPrompt({ labels }: { labels: CalculatorLabels }) {
  return (
    <Card>
      <CardBody>
        <CardTitle>{labels.emptyTitle}</CardTitle>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{labels.emptyBody}</p>
        <p className="mt-3 text-xs leading-relaxed text-muted-fg">{labels.emptyNote}</p>
      </CardBody>
    </Card>
  );
}

function EquityResult({
  result,
  labels,
  locale,
  refinanceHref,
}: {
  result: NonNullable<EquityState["result"]>;
  labels: CalculatorLabels;
  locale: Locale;
  refinanceHref: string;
}) {
  const equityRatio = result.equityPctBp / 10_000;
  const hasRoom = !result.negative && result.headroomCents > 0;
  const ltv = labels.ltvLabel;
  const headroomHint =
    result.limitedBy === "solde"
      ? labels.headroomHintBalance
      : result.limitedBy === "aucune"
        ? labels.headroomHintNone
        : labels.headroomHintRoom;

  return (
    <Card>
      <CardBody className="space-y-4">
        <div>
          <CardTitle>{labels.resultTitle}</CardTitle>
          <p className="mt-1 text-xs text-muted-fg">{labels.resultHint}</p>
        </div>

        {result.negative ? (
          <Alert tone="danger" title={labels.negativeTitle}>
            {labels.negativeBefore}{" "}
            <strong className="font-semibold">
              {formatCadPrecise(result.deficitCents, locale)}
            </strong>.{" "}
            {labels.negativeAfter}
          </Alert>
        ) : null}

        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Stat
            label={labels.paymentLabel}
            value={
              result.balanceCents === 0
                ? labels.paymentNoMortgage
                : formatCadPrecise(result.paymentCents, locale)
            }
            hint={
              result.balanceCents === 0
                ? labels.paymentHintNoMortgage
                : fill(labels.paymentHint, { months: result.amortizationMonths })
            }
          />
          <Stat
            label={labels.equityLabel}
            value={formatCad(result.equityCents, locale)}
            hint={fill(labels.equityHint, { percent: formatPercent(equityRatio, 1, locale) })}
            tone={result.negative ? undefined : "accent"}
          />
          <Stat
            label={fill(labels.headroomLabel, { ltv })}
            value={
              result.headroomCents > 0
                ? formatCad(result.headroomCents, locale)
                : labels.headroomNone
            }
            hint={headroomHint}
          />
          <Stat
            label={fill(labels.maxLoanLabel, { ltv })}
            value={formatCad(result.maxLoanCents, locale)}
            hint={fill(labels.maxLoanHint, { ltv })}
          />
        </dl>

        {hasRoom ? (
          <div className="space-y-2 border-t border-border pt-4">
            <p className="text-sm text-ink-soft">{labels.refinanceNote}</p>
            <ButtonLink href={refinanceHref} variant="secondary">
              {labels.refinanceCta}
            </ButtonLink>
          </div>
        ) : null}

        <details className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm">
          <summary className="cursor-pointer font-semibold text-ink">{labels.assumptionsTitle}</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-soft">
            {labels.assumptions.map((assumption) => (
              <li key={assumption}>{assumption}</li>
            ))}
          </ul>
        </details>

        <p className="text-xs leading-relaxed text-muted-fg">{labels.disclaimer}</p>
      </CardBody>
    </Card>
  );
}
