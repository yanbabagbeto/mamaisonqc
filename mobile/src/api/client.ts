/**
 * Typed JSON client for the MaMaisonQC web API (Next.js route handlers under `src/app/api/**`).
 *
 * - Base URL: `EXPO_PUBLIC_API_URL` (inlined at build time by Expo) or `http://localhost:3000`
 *   for the iOS simulator / web. A physical device needs the Mac's LAN IP — see README.
 * - Every response uses the web envelope `{ ok: true, data }` | `{ ok: false, error }`
 *   (src/shared/errors.ts); this client unwraps `data` and converts failures to `ApiError`.
 * - 8 s timeout. Offline and timeout are distinct codes so the UI can show the right French or
 *   English message (`src/i18n/index.tsx`): the client itself never displays copy.
 */

export const DEFAULT_BASE_URL = "http://localhost:3000";
export const DEFAULT_TIMEOUT_MS = 8_000;

/** Web error codes (src/shared/errors.ts) plus the client-side transport codes. */
export const API_ERROR_CODES = [
  "OFFLINE",
  "TIMEOUT",
  "INVALID_RESPONSE",
  "UNKNOWN",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "INVALID_INPUT",
  "CONFLICT",
  "RATE_LIMITED",
  "UPSTREAM_UNAVAILABLE",
  "INTERNAL",
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

const KNOWN_CODES = new Set<string>(API_ERROR_CODES);

const STATUS_TO_CODE: Record<number, ApiErrorCode> = {
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  422: "INVALID_INPUT",
  429: "RATE_LIMITED",
  503: "UPSTREAM_UNAVAILABLE",
};

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  /** HTTP status, or 0 for transport failures (offline, timeout). */
  readonly status: number;
  readonly details: unknown;

  constructor(code: ApiErrorCode, message: string, status = 0, details: unknown = undefined) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** Configured base URL, without a trailing slash. Empty/blank env falls back to localhost. */
export function resolveBaseUrl(): string {
  // Static member access on purpose: Expo only inlines literal `process.env.EXPO_PUBLIC_*` reads.
  const configured = process.env.EXPO_PUBLIC_API_URL;
  const base = typeof configured === "string" && configured.trim().length > 0 ? configured.trim() : DEFAULT_BASE_URL;
  return base.replace(/\/+$/, "");
}

export function toErrorCode(raw: unknown): ApiErrorCode {
  return typeof raw === "string" && KNOWN_CODES.has(raw) ? (raw as ApiErrorCode) : "UNKNOWN";
}

export function codeFromStatus(status: number): ApiErrorCode {
  const mapped = STATUS_TO_CODE[status];
  if (mapped) return mapped;
  if (status >= 500) return "INTERNAL";
  return "UNKNOWN";
}

export type RequestOptions = {
  method?: "GET" | "POST";
  /** JSON body for POST; serialized with `JSON.stringify`. */
  body?: unknown;
  timeoutMs?: number;
  headers?: Record<string, string>;
};

type Envelope<T> =
  | { ok: true; data: T }
  | { ok: false; error?: { code?: string; message?: string; details?: unknown } };

function isAbortError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: unknown }).name === "AbortError"
  );
}

/**
 * Calls `path` on the API and returns the unwrapped `data` payload.
 * Throws `ApiError` for transport failures, non-2xx responses and non-envelope bodies.
 */
export async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = { Accept: "application/json", ...options.headers };
  const init: RequestInit = { method: options.method ?? "GET", headers, signal: controller.signal };
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(options.body);
  }

  try {
    let response: Response;
    try {
      response = await fetch(`${resolveBaseUrl()}${path}`, init);
    } catch (error) {
      if (isAbortError(error)) {
        throw new ApiError("TIMEOUT", `Request timed out after ${timeoutMs} ms`, 0);
      }
      throw new ApiError("OFFLINE", "Network request failed", 0);
    }

    const text = await response.text().catch(() => "");
    let payload: unknown = null;
    try {
      payload = text.length > 0 ? JSON.parse(text) : null;
    } catch {
      payload = null;
    }

    if (payload !== null && typeof payload === "object" && "ok" in payload) {
      const envelope = payload as Envelope<T>;
      if (envelope.ok === true) {
        return envelope.data;
      }
      const apiError = envelope.error;
      throw new ApiError(
        toErrorCode(apiError?.code),
        apiError?.message ?? "API error",
        response.status,
        apiError?.details,
      );
    }

    if (!response.ok) {
      throw new ApiError(
        codeFromStatus(response.status),
        `HTTP ${response.status}`,
        response.status,
      );
    }
    throw new ApiError("INVALID_RESPONSE", "Response is not a MaMaisonQC API envelope", response.status);
  } finally {
    clearTimeout(timer);
  }
}

export function getJson<T>(path: string, options: Omit<RequestOptions, "method" | "body"> = {}): Promise<T> {
  return requestJson<T>(path, { ...options, method: "GET" });
}

export function postJson<T>(path: string, body: unknown, options: Omit<RequestOptions, "method" | "body"> = {}): Promise<T> {
  return requestJson<T>(path, { ...options, method: "POST", body });
}
