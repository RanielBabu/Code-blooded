import { ApiResponse, ApiConfig } from "@/types/api";

export const apiConfig: ApiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.cognitivelab.internal/v1",
  useMockData: process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false",
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
      throw new Error(`API Request failed with status ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    return {
      success: true,
      data: json.data || json,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
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
