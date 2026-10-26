import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, Stat } from "@/components/ui/content";
import { type Locale } from "@/i18n/config";
import { MIN_COMPARABLES_FOR_ESTIMATE } from "@/modules/valuation/estimate";
import type { EvaluationMessages } from "@/modules/valuation/messages";
import type { ValuationResult } from "@/modules/valuation/types";
import { formatCad, formatNumber } from "@/shared/format";

import { ConfidenceBadge } from "./confidence-badge";

/**
 * "Not enough data" is a designed state, not an error: the roll value above remains the official
 * figure, and no estimate number is rendered below the 3-comparable threshold.
 */
function InsufficientData({
  count,
  reason,
  messages,
}: {
  count: number;
  reason: ValuationResult["insufficientReason"];
  messages: EvaluationMessages;
}) {
  const dispersed = reason === "dispersion";
  const implausible = reason === "implausible";
  return (
    <div
      className="rounded-card border border-dashed border-border-strong bg-paper/60 px-5 py-8 text-center"
      data-insufficient="true"
    >
      <p className="font-display text-lg font-bold text-ink">
        {messages.estimate.insufficientTitle}
      </p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
        {dispersed
          ? messages.estimate.insufficientDispersed
          : implausible
            ? messages.estimate.insufficientImplausible
            : count === 0
              ? messages.estimate.insufficientNone
              : messages.estimate.insufficientSome(count)}{" "}
        {dispersed || implausible
          ? null
          : messages.estimate.insufficientThreshold(MIN_COMPARABLES_FOR_ESTIMATE)}
      </p>
      <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-relaxed text-ink-soft">
        {messages.estimate.insufficientHidden}
      </p>
      {dispersed || implausible ? null : (
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-fg">
          {messages.estimate.insufficientReason}
        </p>
      )}
    </div>
  );
}

/**
 * Estimation block: the estimate, its P25–P75 range, the confidence label and an explicit method
 * sentence — the PRD forbids an opaque number. All figures derive from the roll values of the
 * comparables in `ComparablesTable`; the parent page carries the provenance block.
 */
export function EstimateSection({
  valuation,
  messages,
  locale,
}: {
  valuation: ValuationResult;
  messages: EvaluationMessages;
  locale: Locale;
}) {
  const sufficient = valuation.estimateAvailable;

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-center justify-between gap-3">
        <CardTitle>{messages.estimate.title}</CardTitle>
        <Badge tone="primary">{messages.estimate.badge}</Badge>
      </CardHeader>
      <CardBody className="space-y-6">
        {sufficient ? (
          <>
            <dl className="grid gap-6 sm:grid-cols-3">
              <Stat
                label={messages.estimate.value}
                value={formatCad(valuation.estimateCents, locale)}
                tone="accent"
                hint={messages.estimate.valueHint}
              />
              <Stat
                label={messages.estimate.range}
                value={`${formatCad(valuation.lowCents, locale)} – ${formatCad(valuation.highCents, locale)}`}
                hint={messages.estimate.rangeHint}
              />
              <Stat
                label={messages.estimate.comparablesCount}
                value={formatNumber(valuation.comparablesCount, locale)}
                hint={messages.estimate.comparablesCountHint}
              />
            </dl>

            <div className="flex flex-wrap items-center gap-3">
              <ConfidenceBadge
                confidence={valuation.confidence}
                label={messages.confidence[valuation.confidence]}
              />
              <p className="text-sm text-ink-soft">
                {messages.estimate.countSentence(valuation.comparablesCount)}
              </p>
            </div>

            <div className="rounded-xl bg-muted px-4 py-3 text-sm leading-relaxed text-ink-soft">
              <p>
                <strong className="text-ink">{messages.estimate.methodTitle}</strong>{" "}
                {messages.estimate.method(valuation.comparablesCount)}
              </p>
              <p className="mt-2">
                <strong className="text-ink">{messages.estimate.confidenceTitle}</strong>{" "}
                {messages.estimate.confidenceRule}
              </p>
            </div>
          </>
        ) : (
          <InsufficientData
            count={valuation.comparablesCount}
            reason={valuation.insufficientReason}
            messages={messages}
          />
        )}
      </CardBody>
    </Card>
  );
}
