/**
 * High-Resolution Timing Utility for CognitiveLab
 * ================================================
 *
 * This module is the single source of truth for stimulus-onset and response
 * timestamping in the participant runtime. It is deliberately explicit about
 * WHAT is being measured and WHERE the residual error comes from, because a
 * reaction-time number without a stated error budget is not a measurement.
 *
 * ---------------------------------------------------------------------------
 * THE MEASUREMENT MODEL
 * ---------------------------------------------------------------------------
 * A reaction time is only meaningful relative to a defined event. CognitiveLab
 * defines it as:
 *
 *     RT = t(response) - t(stimulus onset)
 *
 * `t(stimulus onset)` is the hard part. It is tempting to timestamp it at the
 * moment application code asks for the stimulus to be shown. That is wrong, and
 * the error is systematic rather than random:
 *
 *     setStage("trial")            <- enqueues a React update, returns instantly
 *     performance.now()            <- READ HERE, before any pixels exist
 *     ... React render, reconcile, commit ...
 *     ... style, layout, paint, composite ...
 *
 * Timestamping there makes every trial look FASTER than it was, by the cost of
 * an entire render+paint cycle (typically 5-20ms, worse under load). Because
 * that cost varies, it also inflates the standard deviation and corrupts any
 * variance-derived score such as participant consistency.
 *
 * The reference used here is the `requestAnimationFrame` callback timestamp,
 * which is the browser's own estimate of the time at which the frame containing
 * the stimulus began. It is strictly better than reading the clock inside the
 * callback body, because the rAF timestamp is sampled by the browser at frame
 * start rather than after the callback returns.
 *
 * ---------------------------------------------------------------------------
 * THE HONEST ERROR BUDGET
 * ---------------------------------------------------------------------------
 * Browser JavaScript cannot achieve sub-millisecond stimulus onset. JS executes
 * on the main thread; photon emission happens later on the compositor, and the
 * two are not observable to each other. The achievable accuracy is therefore:
 *
 *   Stimulus onset:  +/- 1 frame   (6.9ms @ 144Hz ... 16.7ms @ 60Hz)
 *   Clock resolution: 0.1ms default, 0.005ms when cross-origin isolated
 *   Input latency:   1-8ms wired keyboard, 8-15ms Bluetooth
 *
 * Anything claiming sub-millisecond end-to-end accuracy in a browser is wrong.
 * Laboratory-grade measurement requires a photodiode. The correct engineering
 * response is to measure honestly, reject the trials that cannot be trusted,
 * and publish the uncertainty alongside the number.
 *
 * ---------------------------------------------------------------------------
 * CROSS-ORIGIN ISOLATION
 * ---------------------------------------------------------------------------
 * Without `Cross-Origin-Opener-Policy: same-origin` and
 * `Cross-Origin-Embedder-Policy: credentialless|require-corp`, browsers CLAMP
 * `performance.now()` to 100 microseconds. With isolation the clamp drops to
 * 5 microseconds. The clamp is a floor on resolution, not on accuracy, but it
 * also introduces quantization jitter. See `next.config.ts` for the headers.
 *
 * `measureClockResolution()` probes the live value so a deployment can assert
 * its own configuration rather than assuming it.
 */

export type OnsetSource =
  /** rAF callback timestamp. Preferred: sampled at frame start by the browser. */
  | "raf-timestamp"
  /** performance.now() read inside the rAF callback. Fallback only. */
  | "performance-now"
  /** SSR / no-performance.now fallback. Millisecond resolution, not lab grade. */
  | "date-now";

export interface TrialStop {
  /** response timestamp minus onset timestamp, in milliseconds. */
  reactionTimeMs: number;
  /** Timestamp assigned to stimulus onset. */
  onsetMs: number;
  /** Timestamp assigned to the response. */
  responseMs: number;
  /** How the onset timestamp was obtained, for provenance in exported data. */
  onsetSource: OnsetSource;
  startedAtIso: string;
  stoppedAtIso: string;
  /** True when the response arrived inside the configured response window. */
  withinTimeout: boolean;
}

export interface TrialTimer {
  /**
   * Begin a trial.
   *
   * @param atMs Optional onset timestamp in milliseconds on the
   *   `performance.now()` timeline, typically a `requestAnimationFrame`
   *   callback argument. Supplying this is strongly preferred: it is the
   *   browser's own frame-start estimate. When omitted the current clock is
   *   read, which is LESS accurate because it includes this function's own
   *   call overhead after the render has already been requested.
   * @returns The onset timestamp actually recorded.
   */
  start: (atMs?: number) => number;
  stop: () => TrialStop;
  getElapsed: () => number;
  reset: () => void;
}

/** Reads the highest-resolution monotonic clock available. */
function now(): number {
  if (typeof window !== "undefined" && window.performance && typeof performance.now === "function") {
    return performance.now();
  }
  // SSR fallback. Millisecond resolution; onset is then only accurate to ~1 frame
  // and this should be treated as non-instrumental.
  return Date.now();
}

function onsetSourceFor(usedRaf: boolean): OnsetSource {
  if (typeof window === "undefined" || !window.performance) return "date-now";
  return usedRaf ? "raf-timestamp" : "performance-now";
}

export function createTrialTimer(responseWindowMs = Number.POSITIVE_INFINITY): TrialTimer {
  let onsetMs = 0;
  let responseMs = 0;
  let startedAtIso = "";
  let hasOnset = false;
  let usedRaf = false;

  const start = (atMs?: number): number => {
    // An explicitly supplied timestamp wins. It comes from the rAF callback
    // argument and therefore predates this function's own execution.
    if (typeof atMs === "number" && Number.isFinite(atMs)) {
      onsetMs = atMs;
      usedRaf = true;
    } else {
      onsetMs = now();
      usedRaf = false;
    }
    startedAtIso = new Date().toISOString();
    hasOnset = true;
    return onsetMs;
  };

  const stop = (): TrialStop => {
    responseMs = now();

    if (!hasOnset) {
      // Defensive: a response arrived without a recorded onset. Report a
      // zero-length trial rather than a negative or NaN value.
      onsetMs = responseMs;
    }

    const rawDelta = responseMs - onsetMs;
    // Guard against a non-monotonic or out-of-order reading. Clamping to 0
    // keeps a bad sample visible as an impossible RT rather than a plausible
    // negative one, which downstream rejection rules can then discard.
    const reactionTimeMs = Math.max(0, roundToTenth(rawDelta));
    const stoppedAtIso = new Date().toISOString();

    return {
      reactionTimeMs,
      onsetMs,
      responseMs,
      onsetSource: onsetSourceFor(usedRaf),
      startedAtIso,
      stoppedAtIso,
      withinTimeout: rawDelta <= responseWindowMs,
    };
  };

  const getElapsed = (): number => {
    if (!hasOnset) return 0;
    return Math.max(0, now() - onsetMs);
  };

  const reset = () => {
    onsetMs = 0;
    responseMs = 0;
    startedAtIso = "";
    hasOnset = false;
    usedRaf = false;
  };

  return { start, stop, getElapsed, reset };
}

/**
 * Round to the 0.1ms reporting grid.
 *
 * NOTE: this is a reporting convention, NOT a claim of precision. See the error
 * budget above: the residual uncertainty is dominated by frame quantization
 * (6.9-16.7ms) and input hardware latency (1-15ms), both of which are orders of
 * magnitude larger than the final digit. Two digits are retained only because
 * the underlying clock provides them; consumers that display integer
 * milliseconds should not read the third digit as signal.
 */
function roundToTenth(ms: number): number {
  return Math.round(ms * 10) / 10;
}

// ---------------------------------------------------------------------------
// TRIAL VALIDITY RULES
// ---------------------------------------------------------------------------

export type TrialRejection =
  /** Response faster than a human motor response is physically possible. */
  | "premature"
  /** No response inside the configured response window. */
  | "timeout"
  /** Robust outlier relative to the participant's own established trials. */
  | "outlier";

export interface TimingRules {
  /**
   * Minimum plausible RT. Human simple reaction times bottom out around
   * 150-200ms; a threshold of 100-150ms reliably discards anticipatory
   * keypresses without discarding genuine fast responses. Values below this
   * indicate the participant was pressing before the stimulus appeared, which
   * makes the sample uninformative rather than fast.
   */
  minValidMs: number;
  /**
   * Maximum RT before the trial is treated as an omission. Without a bound,
   * an inattentive participant produces arbitrarily large samples that inflate
   * the mean of the entire cohort.
   */
  timeoutMs: number;
  /** Whether to apply robust outlier rejection against the session history. */
  filterOutliers: boolean;
  /**
   * Number of preceding in-session trials required before outlier detection is
   * armed. Below this the sample size is too small for a stable estimate.
   */
  outlierMinSamples?: number;
  /** Robust z-score multiplier. 3.5 is the conventional Iglewicz-Hoaglin value. */
  outlierSigma?: number;
}

export interface TrialVerdict {
  valid: boolean;
  reactionTimeMs: number;
  rejection?: TrialRejection;
  detail?: string;
}

export const DEFAULT_TIMING_RULES: TimingRules = {
  minValidMs: 120,
  timeoutMs: 2500,
  filterOutliers: true,
  outlierMinSamples: 4,
  outlierSigma: 3.5,
};

/**
 * Median absolute deviation. Preferred over standard deviation for reaction
 * times because a single anticipatory press inflates a mean-based estimator
 * enough to hide itself, while the median-based estimator is unmoved by it.
 */
function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function medianAbsoluteDeviation(values: number[], center: number): number {
  if (values.length === 0) return 0;
  return median(values.map((v) => Math.abs(v - center)));
}

/**
 * Decide whether a completed trial is admissible.
 *
 * Rejection is applied AT CAPTURE TIME and recorded on the trial, rather than
 * silently filtered out of an aggregate. A dataset that has been cleaned is
 * only interpretable if the reader knows what was removed and why.
 *
 * @param reactionTimeMs The measured RT.
 * @param rules Validation thresholds.
 * @param priorRts RTs already accepted in this session, used for outlier
 *   detection. Order matters not; the caller supplies the accepted history.
 */
export function evaluateTrial(
  reactionTimeMs: number,
  rules: TimingRules = DEFAULT_TIMING_RULES,
  priorRts: number[] = []
): TrialVerdict {
  if (!Number.isFinite(reactionTimeMs)) {
    return { valid: false, reactionTimeMs, rejection: "premature", detail: "Non-finite measurement" };
  }

  if (reactionTimeMs < rules.minValidMs) {
    return {
      valid: false,
      reactionTimeMs,
      rejection: "premature",
      detail: `RT ${reactionTimeMs}ms below ${rules.minValidMs}ms floor; likely anticipatory press`,
    };
  }

  if (reactionTimeMs > rules.timeoutMs) {
    return {
      valid: false,
      reactionTimeMs,
      rejection: "timeout",
      detail: `RT ${reactionTimeMs}ms exceeds ${rules.timeoutMs}ms response window`,
    };
  }

  const minSamples = rules.outlierMinSamples ?? DEFAULT_TIMING_RULES.outlierMinSamples!;
  if (rules.filterOutliers && priorRts.length >= minSamples) {
    const center = median(priorRts);
    const mad = medianAbsoluteDeviation(priorRts, center);
    // MAD collapses to 0 for a perfectly uniform history, in which case there
    // is no basis for an outlier test and the trial passes.
    if (mad > 0) {
      // 0.6745 maps MAD to the standard-deviation-equivalent of a normal
      // distribution, so the multiplier keeps its familiar interpretation.
      const robustZ = Math.abs(reactionTimeMs - center) / (mad * 0.6745);
      const sigma = rules.outlierSigma ?? DEFAULT_TIMING_RULES.outlierSigma!;
      if (robustZ > sigma) {
        return {
          valid: false,
          reactionTimeMs,
          rejection: "outlier",
          detail: `Robust z ${robustZ.toFixed(2)} exceeds ${sigma}; RT ${reactionTimeMs}ms vs session median ${Math.round(center)}ms`,
        };
      }
    }
  }

  return { valid: true, reactionTimeMs };
}

// ---------------------------------------------------------------------------
// CLOCK DIAGNOSTICS
// ---------------------------------------------------------------------------

export interface ClockDiagnostics {
  /** Smallest non-zero delta observed between consecutive clock reads. */
  resolutionMs: number;
  /** True when the page is cross-origin isolated and the clamp is lifted. */
  crossOriginIsolated: boolean;
  /** Best available explanation of the observed resolution. */
  note: string;
}

/**
 * Probe the live clock resolution.
 *
 * Successive `performance.now()` reads inside one task are separated by
 * sub-microsecond amounts, but the returned value is quantised to the browser's
 * guarantee. Sampling many pairs and taking the smallest non-zero difference
 * therefore recovers that quantisation, which is what determines the digit
 * that carries no information.
 *
 * Exposed so a deployment can verify its own cross-origin isolation headers
 * instead of trusting that they were applied.
 */
export async function measureClockResolution(samples = 2000): Promise<ClockDiagnostics> {
  const isolated =
    typeof window !== "undefined" &&
    typeof window.crossOriginIsolated === "boolean" &&
    window.crossOriginIsolated === true;

  if (typeof window === "undefined" || !window.performance) {
    return {
      resolutionMs: 1,
      crossOriginIsolated: false,
      note: "Server environment: Date.now() fallback, millisecond resolution. Not instrumental.",
    };
  }

  let smallest = Number.POSITIVE_INFINITY;
  let previous = performance.now();
  for (let i = 0; i < samples; i += 1) {
    const current = performance.now();
    const delta = current - previous;
    if (delta > 0 && delta < smallest) smallest = delta;
    previous = current;
  }

  const resolutionMs = Number.isFinite(smallest) ? smallest : 0;

  return {
    resolutionMs,
    crossOriginIsolated: isolated,
    note: isolated
      ? `Cross-origin isolated: performance.now() clamped to 5us. Observed ${resolutionMs.toFixed(4)}ms.`
      : `Not cross-origin isolated: performance.now() clamped to 0.1ms. Observed ${resolutionMs.toFixed(4)}ms. Add COOP/COEP headers in next.config.ts.`,
  };
}
