"use server";

import { getLocale } from "@/i18n/server";
import { equityStateFromParse, parseEquityInput, type EquityState } from "@/modules/owner/equity";

/**
 * Equity calculation. Pure input → integer-cents output; no persistence and no personal data leaves
 * the request. Field-level errors are returned in the active language so the client can tie them to
 * inputs.
 */
export async function calculateEquityAction(
  _previous: EquityState,
  formData: FormData,
): Promise<EquityState> {
  const locale = await getLocale();
  const parsed = parseEquityInput(
    {
      value: formData.get("value"),
      balance: formData.get("balance"),
      rate: formData.get("rate"),
      years: formData.get("years"),
      months: formData.get("months"),
    },
    locale,
  );
  return equityStateFromParse(parsed);
}
