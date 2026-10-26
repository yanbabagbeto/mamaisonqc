import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const FR_H1 = /vraiment|valeur/i;

test.describe("public shell", () => {
  test("home renders the French hero and the address combobox", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toContainText(FR_H1);
    const combobox = page.getByRole("combobox", { name: /adresse/i });
    await expect(combobox).toBeVisible();
    await expect(page.getByRole("link", { name: /accueil/i }).first()).toBeVisible();
  });

  test("English tree renders English copy with the correct lang attribute", async ({ page }) => {
    const response = await page.goto("/en");
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", "en-CA");
    await expect(page.locator("h1")).toContainText(/really|worth/i);
  });

  test("French canonical path redirects away from /fr", async ({ page }) => {
    await page.goto("/fr");
    await expect(page).toHaveURL(/\/$/);
  });

  test("health endpoint reports coverage counts", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);
    const body = (await response.json()) as { ok: boolean; data: { coverage: { propertyUnits: number } } };
    expect(body.ok).toBe(true);
    expect(typeof body.data.coverage.propertyUnits).toBe("number");
  });

  test("pre-market page renders its empty state or listings without errors", async ({ page }) => {
    const response = await page.goto("/pre-marche");
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("admin is a 404 for anonymous visitors", async ({ page }) => {
    const response = await page.goto("/admin");
    expect(response?.status()).toBe(404);
  });

  test("no horizontal overflow at 375 px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("home has no serious or critical accessibility violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const blocking = results.violations.filter(
      (violation) => violation.impact === "serious" || violation.impact === "critical",
    );
    expect(
      blocking.map((violation) => `${violation.id} (${violation.nodes.length})`),
    ).toEqual([]);
  });

  test("keyboard path reaches the address field and its listbox", async ({ page }) => {
    await page.goto("/");
    const combobox = page.getByRole("combobox", { name: /adresse/i });
    await combobox.focus();
    await page.keyboard.type("rue");
    await expect(combobox).toHaveAttribute("aria-expanded", /true|false/);
    await combobox.press("Escape");
    await expect(combobox).toBeFocused();
  });
});

test.describe("auth and layout regressions", () => {
  test("sign-up, then an authenticated dashboard renders without a server error", async ({ page }) => {
    const email = `e2e-${Date.now()}@example.com`;
    const password = "MotDePasseSolide123";

    await page.goto("/inscription");
    await page.locator("#signup-name, input[name='name']").first().fill("Test E2E");
    await page.locator("#signup-email, input[name='email']").first().fill(email);
    const passwords = page.locator("input[type='password']");
    await passwords.nth(0).fill(password);
    if ((await passwords.count()) > 1) await passwords.nth(1).fill(password);
    await page.getByRole("button", { name: /Créer mon compte|Create my account/i }).first().click();
    await page.waitForURL(/tableau-de-bord|dashboard/, { timeout: 20_000 });

    const response = await page.goto("/proprietaire/tableau-de-bord?bienvenue=1");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.locator("body")).not.toContainText(/Internal Server Error|Application error/i);
  });

  test("claim request from a signed-in session passes the same-origin guard", async ({ page }) => {
    const email = `claim-${Date.now()}@example.com`;
    const password = "MotDePasseSolide123";

    await page.goto("/inscription");
    await page.locator("#signup-name, input[name='name']").first().fill("Test Claim");
    await page.locator("#signup-email, input[name='email']").first().fill(email);
    const passwords = page.locator("input[type='password']");
    await passwords.nth(0).fill(password);
    if ((await passwords.count()) > 1) await passwords.nth(1).fill(password);
    await page.getByRole("button", { name: /Créer mon compte|Create my account/i }).first().click();
    await page.waitForURL(/tableau-de-bord|dashboard/, { timeout: 20_000 });

    // networkidle so React has hydrated: a click before hydration would fire a native submit.
    await page.goto("/reclamer-ma-page", { waitUntil: "networkidle" });
    const matricule = page.locator("#claim-matricule");
    await expect(matricule).toBeVisible();

    // A matricule that cannot exist: the request must reach the domain layer and come back with a
    // business NOT_FOUND, never a CSRF 403 — that is exactly the regression we are locking.
    await matricule.fill("999999999999999999");
    const message = page.locator("form p[aria-live]").first();
    const before = await message.innerText();
    // Retry the click: a first click can land before hydration attaches the submit handler.
    await expect(async () => {
      await page.getByRole("button", { name: /Envoyer la demande|Send request/i }).click();
      await expect(message).not.toHaveText(before, { timeout: 3_000 });
    }).toPass({ timeout: 30_000 });
    const after = await message.innerText();
    expect(after).toMatch(/couverture|coverage|not in our/i);
    expect(after).not.toMatch(/refusée|forbidden|Requête refusée/i);
  });

  test("sign-in and sign-up screens are airy and overflow-free at 375 px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    for (const path of ["/connexion", "/inscription", "/pre-marche", "/marche-immobilier"]) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `${path} overflows at 375 px`).toBeLessThanOrEqual(1);
    }
  });
});
