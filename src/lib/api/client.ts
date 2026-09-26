import { ApiResponse, ApiConfig } from "@/types/api";

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
 * Clean typed API request dispatcher
 * If mock mode is active, it invokes the local mock handler with realistic network simulation.
 * If API mode is active, it dispatches to NEXT_PUBLIC_API_BASE_URL with headers and error handling.
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
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const url = `${apiConfig.baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options?.headers,
      },
    });

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
      throw new Error(`API Request failed [${code}]: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    return {
      success: true,
      // Check for the key rather than truthiness: a legitimate `null` payload
      // (a missing experiment) would otherwise fall through and hand the raw
      // envelope back to the caller as if it were the data.
      data: json && typeof json === "object" && "data" in json ? json.data : json,
      timestamp: new Date().toISOString(),
    };
  } catch (error: unknown) {
    // If backend connection fails and fallback exists, informatively fall back
    if (mockFallback) {
      console.warn(`[CognitiveLab API Mode]: Endpoint ${endpoint} failed. Falling back to local mock data.`, error);
      const data = await mockFallback();
      return {
        success: true,
        data,
        message: "Fallback from failed API connection",
        timestamp: new Date().toISOString(),
      };
    }
    throw error;
  }
}
