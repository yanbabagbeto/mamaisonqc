/**
 * Tests for the API client: envelope unwrapping, error mapping, offline/timeout behaviour and
 * base-URL resolution. `fetch` is stubbed per test; nothing hits the network.
 */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import {
  ApiError,
  codeFromStatus,
  DEFAULT_BASE_URL,
  getJson,
  postJson,
  requestJson,
  resolveBaseUrl,
  toErrorCode,
} from "./client.ts";

const realFetch = globalThis.fetch;
const realEnv = process.env.EXPO_PUBLIC_API_URL;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function stubFetch(handler: (url: string, init?: RequestInit) => Promise<Response>): void {
  globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) =>
    handler(String(input), init)) as typeof fetch;
}

beforeEach(() => {
  process.env.EXPO_PUBLIC_API_URL = "http://api.test";
});

afterEach(() => {
  globalThis.fetch = realFetch;
  if (realEnv === undefined) delete process.env.EXPO_PUBLIC_API_URL;
  else process.env.EXPO_PUBLIC_API_URL = realEnv;
});

describe("resolveBaseUrl", () => {
  it("uses EXPO_PUBLIC_API_URL and strips trailing slashes", () => {
    process.env.EXPO_PUBLIC_API_URL = "https://api.mamaisonqc.ca/";
    assert.equal(resolveBaseUrl(), "https://api.mamaisonqc.ca");
  });

  it("falls back to localhost when the variable is blank or missing", () => {
    process.env.EXPO_PUBLIC_API_URL = "   ";
    assert.equal(resolveBaseUrl(), DEFAULT_BASE_URL);
    delete process.env.EXPO_PUBLIC_API_URL;
    assert.equal(resolveBaseUrl(), DEFAULT_BASE_URL);
  });
});

describe("error code mapping", () => {
  it("maps HTTP statuses to the web error codes", () => {
    assert.equal(codeFromStatus(401), "UNAUTHORIZED");
    assert.equal(codeFromStatus(404), "NOT_FOUND");
    assert.equal(codeFromStatus(422), "INVALID_INPUT");
    assert.equal(codeFromStatus(429), "RATE_LIMITED");
    assert.equal(codeFromStatus(503), "UPSTREAM_UNAVAILABLE");
    assert.equal(codeFromStatus(500), "INTERNAL");
    assert.equal(codeFromStatus(418), "UNKNOWN");
  });

  it("keeps known payload codes and rejects unknown ones", () => {
    assert.equal(toErrorCode("NOT_FOUND"), "NOT_FOUND");
    assert.equal(toErrorCode("OFFLINE"), "OFFLINE");
    assert.equal(toErrorCode("SOMETHING_ELSE"), "UNKNOWN");
    assert.equal(toErrorCode(42), "UNKNOWN");
  });
});

describe("requestJson", () => {
  it("unwraps { ok: true, data } and sends JSON bodies", async () => {
    let seenUrl = "";
    let seenMethod = "";
    let seenBody = "";
    stubFetch(async (url, init) => {
      seenUrl = url;
      seenMethod = init?.method ?? "";
      seenBody = String(init?.body ?? "");
      return jsonResponse({ ok: true, data: { candidates: [] } });
    });

    const payload = await getJson<{ candidates: unknown[] }>("/api/address/search?q=abc");
    assert.deepEqual(payload, { candidates: [] });
    assert.equal(seenUrl, "http://api.test/api/address/search?q=abc");
    assert.equal(seenMethod, "GET");

    await postJson("/api/mobile/premarket/1/interets", { name: "Sylvie", email: "s@example.com" });
    assert.equal(seenMethod, "POST");
    assert.deepEqual(JSON.parse(seenBody), { name: "Sylvie", email: "s@example.com" });
  });

  it("throws ApiError with the server code and details on { ok: false }", async () => {
    stubFetch(async () =>
      jsonResponse(
        { ok: false, error: { code: "NOT_FOUND", message: "Annonce introuvable.", details: { id: "x" } } },
        404,
      ),
    );

    await assert.rejects(
      () => requestJson("/api/mobile/premarket/x"),
      (error: unknown) => {
        assert.ok(error instanceof ApiError);
        assert.equal(error.code, "NOT_FOUND");
        assert.equal(error.status, 404);
        assert.equal(error.message, "Annonce introuvable.");
        assert.deepEqual(error.details, { id: "x" });
        return true;
      },
    );
  });

  it("maps a network failure to OFFLINE", async () => {
    stubFetch(async () => {
      throw new TypeError("Network request failed");
    });

    await assert.rejects(
      () => requestJson("/api/mobile/regions"),
      (error: unknown) => error instanceof ApiError && error.code === "OFFLINE" && error.status === 0,
    );
  });

  it("maps an aborted request to TIMEOUT", async () => {
    stubFetch(
      (_url, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            const error = new Error("Aborted");
            error.name = "AbortError";
            reject(error);
          });
        }),
    );

    await assert.rejects(
      () => requestJson("/api/mobile/regions", { timeoutMs: 10 }),
      (error: unknown) => error instanceof ApiError && error.code === "TIMEOUT",
    );
  });

  it("maps a non-envelope 500 page to INTERNAL", async () => {
    stubFetch(
      async () =>
        new Response("<html>Oops</html>", { status: 500, headers: { "Content-Type": "text/html" } }),
    );

    await assert.rejects(
      () => requestJson("/api/mobile/regions"),
      (error: unknown) => error instanceof ApiError && error.code === "INTERNAL" && error.status === 500,
    );
  });

  it("maps a 200 non-envelope body to INVALID_RESPONSE", async () => {
    stubFetch(async () => jsonResponse({ unexpected: true }));

    await assert.rejects(
      () => requestJson("/api/mobile/regions"),
      (error: unknown) => error instanceof ApiError && error.code === "INVALID_RESPONSE",
    );
  });
});
