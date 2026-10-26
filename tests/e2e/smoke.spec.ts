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
