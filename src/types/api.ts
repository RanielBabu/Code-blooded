/**
 * Where a payload actually came from.
 *
 * Recorded on every response so a consumer can never mistake local fixture data
 * for a measurement. `mock-fallback` in particular means the network request
 * failed and the browser is showing synthetic numbers, which a researcher must
 * be able to see rather than infer.
 */
export type DataOrigin = "network" | "mock-configured" | "mock-fallback";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  /** Provenance of `data`. Absent only on server-side envelopes. */
  origin?: DataOrigin;
  /**
   * True when `data` is synthetic because the real request failed. The UI is
   * expected to surface this rather than render the numbers as findings.
   */
  degraded?: boolean;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiConfig {
  baseUrl: string;
  useMockData: boolean;
  simulatedDelayMs: number;
  isBackendConnected: boolean;
  lastSyncAt: string | null;
}
