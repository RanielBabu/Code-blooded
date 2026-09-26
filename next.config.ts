import type { NextConfig } from "next";

/**
 * Cross-Origin Isolation
 * ----------------------
 * The participant runtime measures reaction time with `performance.now()`. The
 * resolution the browser guarantees for that clock depends on cross-origin
 * isolation:
 *
 *   isolated (COOP + COEP)   ->  5 microseconds
 *   not isolated (default)  ->  100 microseconds, CLAMPED
 *
 * The clamp is a quantisation floor, not an accuracy floor, but it also injects
 * jitter and it is the reason the previous footer claim of "sub-millisecond
 * precision" was unsupportable. See src/lib/timing.ts for the full error budget.
 *
 * Why `credentialless` and not `require-corp`:
 * `require-corp` blocks every cross-origin subresource that does not opt in via
 * CORP. The image stimulus mode renders a researcher-supplied `stimulus.imageUrl`
 * directly as an <img src>, which would silently fail to load.
 * `credentialless` still grants cross-origin isolation but permits no-credential
 * cross-origin loads, so third-party stimuli keep working.
 *
 * Set CROSS_ORIGIN_ISOLATION=false to disable. Required if you need to embed
 * cross-origin resources that do not support credentialless, at the cost of the
 * 0.1ms clock clamp. Verify the live result in Settings or the runtime footer;
 * `measureClockResolution()` in src/lib/timing.ts probes it rather than assuming.
 */
const crossOriginIsolation = process.env.CROSS_ORIGIN_ISOLATION !== "false";

const isolationHeaders = crossOriginIsolation
  ? [
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
    ]
  : [];

const nextConfig: NextConfig = {
  // Keep the PostgreSQL driver and the ORM out of the bundler. Both are
  // server-only native/connection-aware packages that must run on Node, and
  // bundling them breaks connection pooling under the dev server's reloads.
  serverExternalPackages: ["postgres", "drizzle-orm"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: isolationHeaders,
      },
    ];
  },
};

export default nextConfig;
