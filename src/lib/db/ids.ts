import { randomInt } from "node:crypto";

/**
 * Identifier generation for records created at runtime.
 *
 * The previous implementation used `Date.now().toString().slice(-4)` for
 * participants, which yields only 10,000 distinct values and reuses them
 * freely: two participants started in the same millisecond collide outright,
 * and the value repeats every ~43 minutes thereafter. That silently overwrote
 * rows and, in a trial batch, produced foreign keys pointing at the wrong
 * subject.
 *
 * These ids stay human-readable in URLs while drawing from a much larger
 * space. `crypto.randomInt` is used rather than `Math.random` so ids are not
 * predictable.
 */

const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

function randomToken(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[randomInt(ALPHABET.length)];
  }
  return out;
}

export function newParticipantId(): string {
  return `part-${randomToken(9)}`;
}

export function newExperimentId(): string {
  return `exp-${randomToken(9)}`;
}

export function newSessionId(): string {
  return `sess_${randomToken(12)}`;
}

export function newTrialId(participantId: string, trialNumber: number): string {
  return `trial-${participantId}-${trialNumber}`;
}
