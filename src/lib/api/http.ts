import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Response helpers shared by every route handler.
 *
 * All success responses use the `{ success, data, timestamp }` envelope from
 * `src/types/api.ts`, which is what the existing browser client unwraps. Error
 * responses use `{ success: false, error: { code, message, details } }`.
 *
 * Note the client's `apiRequest` unwraps with `json.data || json`. A falsy
 * `data` (null, 0, "") would fall through to the raw envelope, so `data: null`
 * is normalised to the envelope with an explicit `null` and the client is
 * updated to check for the key rather than truthiness.
 */

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data, timestamp: new Date().toISOString() }, init);
}

export function fail(
  message: string,
  status: number,
  code: string,
  details?: unknown
) {
  return NextResponse.json(
    {
      success: false,
      error: { code, message, ...(details === undefined ? {} : { details }) },
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Wrap a handler so an unexpected throw becomes a 500 with a generic message.
 *
 * Internal failures are logged server-side but never forwarded to the client:
 * a driver error can contain the connection string, table definitions or row
 * contents, and this data is reachable without authentication.
 */
export function route<TArgs extends unknown[]>(
  handler: (...args: TArgs) => Promise<Response>
) {
  return async (...args: TArgs): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof ZodError) {
        return fail("Request payload failed validation.", 400, "VALIDATION_ERROR", error.issues);
      }
      console.error("[cognitivelab] unhandled route error:", error);
      return fail("An unexpected error occurred.", 500, "INTERNAL_ERROR");
    }
  };
}

/** Parse a positive integer query param, ignoring anything unparseable. */
export function readIntParam(value: string | null): number | undefined {
  if (value === null) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}
