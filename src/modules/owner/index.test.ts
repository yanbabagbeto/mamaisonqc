import { describe, expect, it } from "vitest";

import { equity, fill, messagesFor, mortgagePaymentCents, parseMoneyToCents } from "./index";

describe("owner module public surface", () => {
  it("exposes the finance primitives without any server-only import", () => {
    expect(
      mortgagePaymentCents({ principalCents: 30_000_000, annualRateBp: 500, amortizationMonths: 300 }),
    ).toBe(175_377);
    expect(equity({ estimateCents: 50_000_000, balanceCents: 30_000_000 }).equityCents).toBe(
      20_000_000,
    );
    expect(parseMoneyToCents("450 000,50")).toEqual({ ok: true, value: 45_000_050 });
  });

  it("exposes the active-language dictionary and its small formatter", () => {
    expect(messagesFor("fr").auth.signIn.title).toBe("Connexion");
    expect(messagesFor("en").auth.signIn.title).toBe("Log in");
    expect(fill("Bonjour {name}.", { name: "Sylvie" })).toBe("Bonjour Sylvie.");
  });
});
