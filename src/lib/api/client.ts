import { ApiResponse, ApiConfig } from "@/types/api";
import { clearDegraded, reportDegraded } from "./degraded";

export const apiConfig: ApiConfig = {
  // Defaults to same-origin route handlers under /api. An empty baseUrl keeps
  // requests on the current host, which preserves the COOP/COEP isolation
  // headers and avoids a cross-origin preflight on every trial batch.
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  // Database-backed by default. The previous default (`!== "false"`) meant the
  // localStorage mock won unless explicitly disabled, so a real backend was
  // never exercised unless someone knew to set the flag.
  useMockData: process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true",
  simulatedDelayMs: 180,
  isBackendConnected: false,
  lastSyncAt: new Date().toISOString(),
};

/**
 * A request that reached the server and was refused.
 *
 * Distinct from a transport failure: the server answered, so there is nothing
 * to "fall back" from. A 404 in particular means the endpoint does not exist,
 * and quietly substituting fixture data for a missing route is how a page ends
 * up rendering invented numbers with no indication anything went wrong.
 */
class HttpStatusError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "HttpStatusError";
  }
}

/**
 * Clean typed API request dispatcher.
 *
 * Provenance is reported on every response via `origin`, and a degraded
 * response additionally sets `degraded` and raises the on-screen notice. The
 * fallback is reserved for genuine transport failures: the backend being
 * unreachable is a degraded mode worth papering over, whereas a missing or
 * erroring endpoint is a defect and is surfaced as one.
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
  mockFallback?: () => T | Promise<T>
): Promise<ApiResponse<T>> {
  if (apiConfig.useMockData && mockFallback) {
    if (apiConfig.simulatedDelayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, apiConfig.simulatedDelayMs));
    }
    const data = await mockFallback();
    return {
      success: true,
      data,
      origin: "mock-configured",
      timestamp: new Date().toISOString(),
    };
  }

  const url = `${apiConfig.baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options?.headers,
      },
    });
  } catch (error) {
    // Transport-level failure: DNS, connection refused, offline. The backend
    // may well be fine, so serving fixture data keeps the page usable -- but it
    // is announced, never silent.
    if (mockFallback) {
      const reason = error instanceof Error ? error.message : "network request failed";
      console.error(
        `[CognitiveLab] ${endpoint} could not reach the server. Showing local fixture data instead.`,
        error
      );
      reportDegraded(endpoint, reason);
      const data = await mockFallback();
      return {
        success: true,
        data,
        origin: "mock-fallback",
        degraded: true,
        message: "Local fixture data: the server was unreachable.",
        timestamp: new Date().toISOString(),
      };
    }
    throw error;
  }

  if (!response.ok) {
    // Surface the server's structured error code so a 404 is distinguishable
    // from a 500 in the console, instead of only reporting the status line.
    let code = `HTTP_${response.status}`;
    try {
      const body = await response.json();
      if (body?.error?.code) code = body.error.code;
    } catch {
      // Non-JSON error body; the status-derived code stands.
    }
    // Deliberately not routed to the fixture fallback. A 404 means the route is
    // missing; answering with mock data would render a page of invented
    // measurements that looks entirely healthy. This propagates to the caller,
    // which surfaces the error state to the researcher.
    throw new HttpStatusError(
      response.status,
      `API Request failed [${code}]: ${response.status} ${response.statusText}`
    );
  }

  const json = await response.json();
  // A success proves the backend is reachable, so any standing degraded notice
  // is no longer accurate.
  clearDegraded();
  return {
    success: true,
    // Check for the key rather than truthiness: a legitimate `null` payload
    // (a missing experiment) would otherwise fall through and hand the raw
    // envelope back to the caller as if it were the data.
    data: json && typeof json === "object" && "data" in json ? json.data : json,
    origin: "network",
    timestamp: new Date().toISOString(),
  };
}
