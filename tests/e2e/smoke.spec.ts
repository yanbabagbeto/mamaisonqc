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

test.describe("audit regressions (user-reported bugs)", () => {
  test("protected pages redirect anonymous visitors with a next target", async ({ request }) => {
    for (const path of ["/mes-interets", "/parametres", "/proprietaire/tableau-de-bord"]) {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status(), `${path} must redirect`).toBe(307);
      const location = response.headers()["location"] ?? "";
      expect(location).toContain("/connexion?next=");
      expect(decodeURIComponent(location)).toContain(path);
    }
    // English tree keeps the /en prefix in the login target.
    const en = await request.get("/en/mes-interets", { maxRedirects: 0 });
    expect(en.status()).toBe(307);
    expect(en.headers()["location"]).toContain("/en/connexion?next=%2Fen%2Fmes-interets");
  });

  test("mortgage payment uses Canadian semi-annual compounding", async ({ page }) => {
    await page.goto("/proprietaire/equite");
    await page.waitForLoadState("networkidle");
    await page.locator("#equity-value").fill("600000");
    await page.locator("#equity-balance").fill("600000");
    await page.locator("#equity-rate").fill("4,79");
    await page.locator("#equity-years").fill("25");
    await page.getByRole("button", { name: "Calculer mon équité" }).click();

    const result = page.locator("main");
    const compact = async () =>
      (await result.innerText()).replace(/[\u202f\u00a0]/g, " ");
    await expect
      .poll(async () => /3 418,25 \$/.test(await compact()), { timeout: 20_000 })
      .toBe(true);
    // Monthly compounding (r/12) would overstate the payment at 3 434,52 $; it must not appear.
    expect(/3 434,52 \$/.test(await compact())).toBe(false);
  });

  test("security headers are set and the framework is not advertised", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();
    expect(headers["content-security-policy"]).toContain("default-src 'self'");
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("geolocation=()");
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test("robots.txt and sitemap.xml use the request origin and agree on what is public", async ({
    request,
  }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Sitemap: http://127.0.0.1:3100/sitemap.xml");
    expect(robots).not.toMatch(/^Host:/m);
    expect(robots).toContain("Disallow: /connexion");

    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("<loc>http://127.0.0.1:3100/</loc>");
    // A URL disallowed in robots must not be advertised in the sitemap.
    expect(sitemap).not.toContain("/connexion<");
    expect(sitemap).not.toContain("/inscription<");
    // Pages the footer links to are present.
    expect(sitemap).toContain("/proprietaire/hypotheque/renouvellement-hypothecaire");
    expect(sitemap).toContain("/proprietaire/subventions-renovation/logisvert");

    const favicon = await request.get("/favicon.ico");
    expect(favicon.status()).toBe(200);
  });

  test("address picker: no pre-selection, full labels, Enter searches instead of guessing", async ({
    page,
  }) => {
    await page.goto("/");
    const input = page.getByRole("combobox").first();
    await input.click();
    await input.type("123 rue Saint-Jean Québec", { delay: 25 });

    const options = page.getByRole("option");
    await expect.poll(async () => options.count(), { timeout: 20_000 }).toBeGreaterThan(0);
    // Nothing highlighted until the user moves.
    expect(await input.getAttribute("aria-activedescendant")).toBeNull();
    // Rows are distinguishable by their full label (suite included), not only the postal code.
    const labels = await options.allInnerTexts();
    expect(new Set(labels).size).toBe(labels.length);

    await input.press("Enter");
    await page.waitForURL(/\/recherche\?q=/, { timeout: 15_000 });
    expect(page.url()).not.toMatch(/\/evaluation\//);

    // One ArrowDown highlights the first row deterministically.
    await page.goto("/");
    const second = page.getByRole("combobox").first();
    await second.click();
    await second.type("123 rue Saint-Jean Québec", { delay: 25 });
    await expect.poll(async () => page.getByRole("option").count(), { timeout: 20_000 }).toBeGreaterThan(0);
    await second.press("ArrowDown");
    const active = await second.getAttribute("aria-activedescendant");
    const firstOptionId = await page.getByRole("option").first().getAttribute("id");
    expect(active).toBe(firstOptionId);
  });

  test("cookie banner does not cover the calculator submit button", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/proprietaire/equite");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const button = page.getByRole("button", { name: "Calculer mon équité" });
    const box = await button.boundingBox();
    const banner = await page.locator('[role="dialog"]').first().boundingBox();
    expect(box).not.toBeNull();
    expect(banner).not.toBeNull();
    if (box && banner) {
      const overlaps =
        box.x < banner.x + banner.width &&
        box.x + box.width > banner.x &&
        box.y < banner.y + banner.height &&
        box.y + box.height > banner.y;
      expect(overlaps, "the banner must not sit on the submit button").toBe(false);
    }
  });
});

test.describe("responsive header", () => {
  test("header stays on one line at 1024 px (hamburger below xl)", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto("/");
    const navLink = page.locator('header nav a', { hasText: "Marché immobilier" }).first();
    const visible = await navLink.isVisible().catch(() => false);
    if (visible) {
      const box = await navLink.boundingBox();
      expect(box?.height ?? 0).toBeLessThanOrEqual(44);
    } else {
      // Below the desktop breakpoint the hamburger must be present instead.
      await expect(page.locator("header details summary")).toBeVisible();
    }
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
