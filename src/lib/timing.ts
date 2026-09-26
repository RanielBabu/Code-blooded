/**
 * High-Resolution Timing Utility for CognitiveLab
 *
 * NOTE ON LABORATORY-GRADE ACCURACY:
 * Browser-based psychophysics and cognitive reaction-time measurement rely on `window.performance.now()`,
 * which provides high-precision sub-millisecond timestamps relative to navigation start.
 *
 * KNOWN LIMITATIONS & BROWSER TIMING NUANCES:
 * 1. Display Refresh Rate (V-Sync): Stimulus presentation occurs at monitor refresh boundaries (60Hz = ~16.6ms,
 *    144Hz = ~6.9ms). The exact pixel illumination time can vary slightly relative to JS thread execution.
 * 2. Input Hardware Latency: Standard USB keyboards poll between 125Hz (8ms jitter) and 1000Hz (1ms).
 *    Bluetooth peripherals may introduce 8-15ms of latency.
 * 3. Browser Event Loop: Heavy DOM manipulations or animation repaints could delay dispatch of KeyboardEvent / MouseEvent.
 *
 * SYSTEM DESIGN MITIGATION:
 * During trial stimulus display and response capture:
 * - NO decorative CSS transitions or Framer Motion loops are active on the stimulus canvas.
 * - Stimulus timestamp is registered immediately when rendered to the DOM.
 * - Responses are captured on raw keydown / pointerdown handlers using `performance.now()`.
 */

export interface TrialTimer {
  start: () => number;
  stop: () => {
    reactionTimeMs: number;
    startedAtMs: number;
    stoppedAtMs: number;
    startedAtIso: string;
    stoppedAtIso: string;
  };
  getElapsed: () => number;
  reset: () => void;
}

export function createTrialTimer(): TrialTimer {
  let startTimeMs = 0;
  let startedAtIso = "";

  const start = (): number => {
    // If running in SSR fallback to Date.now()
    startTimeMs = typeof window !== "undefined" && window.performance ? performance.now() : Date.now();
    startedAtIso = new Date().toISOString();
    return startTimeMs;
  };

  const stop = () => {
    const stopTimeMs = typeof window !== "undefined" && window.performance ? performance.now() : Date.now();
    const stoppedAtIso = new Date().toISOString();
    const reactionTimeMs = Math.max(0, Math.round((stopTimeMs - startTimeMs) * 10) / 10);

    return {
      reactionTimeMs,
      startedAtMs: startTimeMs,
      stoppedAtMs: stopTimeMs,
      startedAtIso,
      stoppedAtIso,
    };
  };

  const getElapsed = (): number => {
    if (!startTimeMs) return 0;
    const now = typeof window !== "undefined" && window.performance ? performance.now() : Date.now();
    return Math.max(0, now - startTimeMs);
  };

  const reset = () => {
    startTimeMs = 0;
    startedAtIso = "";
  };

  return { start, stop, getElapsed, reset };
}
