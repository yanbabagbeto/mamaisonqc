/**
 * One error envelope for every route handler: { ok: false, error: { code, message, details? } }.
 * Domain code throws AppError; adapters map it once. Never leak stack traces or SQL to clients.
 */

export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "INVALID_INPUT"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "UPSTREAM_UNAVAILABLE"
  | "INTERNAL";

const STATUS: Record<ErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INVALID_INPUT: 422,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  UPSTREAM_UNAVAILABLE: 503,
  INTERNAL: 500,
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly details?: unknown;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.details = details;
  }

  get status(): number {
    return STATUS[this.code];
  }
}

export type ApiSuccess<T> = { ok: true; data: T };
export type ApiFailure = { ok: false; error: { code: ErrorCode; message: string; details?: unknown } };

export function jsonOk<T>(data: T, init?: ResponseInit): Response {
  return Response.json({ ok: true, data } satisfies ApiSuccess<T>, {
    status: 200,
    ...init,
  });
}

export function jsonError(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json(
      {
        ok: false,
        error: { code: error.code, message: error.message, details: error.details },
      } satisfies ApiFailure,
      { status: error.status },
    );
  }
  // Unexpected errors are logged server-side with context by the caller; the client gets nothing.
  console.error("[api] unhandled error", error);
  return Response.json(
    { ok: false, error: { code: "INTERNAL", message: "Une erreur est survenue." } } satisfies ApiFailure,
    { status: 500 },
  );
}
