import type { Experiment, ExperimentNode, ExperimentEdge, ExperimentStatus } from "@/types/experiment";
import type { Participant, TrialResult, StimulusType, OnsetSource, TrialRejection } from "@/types/participant";
import type { ExperimentRow, ExperimentVersionRow, ParticipantRow, TrialRow } from "./schema";

/**
 * Row -> API shape mappers.
 *
 * Two rules hold throughout:
 *
 * 1. Timestamps become ISO-8601 strings. The API contract is JSON, and handing
 *    a client a `Date` serialises it to a locale-formatted string that differs
 *    between runtimes. `toISOString()` is deterministic.
 *
 * 2. Absent values stay `null`. They are never replaced with `0`, `""` or a
 *    plausible guess, because every consumer of this data is a research
 *    display that would otherwise display an invented measurement as fact.
 */

/** Postgres returns `numeric`/`real` as strings to avoid float precision loss. */
function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function toInt(value: unknown): number | null {
  const n = toNumber(value);
  return n === null ? null : Math.round(n);
}

function toIso(value: Date | string | null | undefined): string {
  if (!value) return new Date(0).toISOString();
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function toNullableIso(value: Date | string | null | undefined): string | undefined {
  if (!value) return undefined;
  return toIso(value);
}

export function serializeParticipant(row: ParticipantRow): Participant {
  return {
    id: row.id,
    displayName: row.displayName,
    sessionId: row.sessionId ?? undefined,
    status: row.status,
    completedExperiments: row.completedExperiments,
    totalTrials: row.totalTrials,
    avgReactionTimeMs: row.avgReactionTimeMs,
    accuracyPercent: row.accuracyPercent,
    consistencyScore: row.consistencyScore,
    createdAt: toIso(row.createdAt),
    lastActiveAt: toIso(row.lastActiveAt),
    notes: row.notes ?? undefined,
  };
}

export function serializeTrial(row: TrialRow): TrialResult {
  return {
    id: row.id,
    participantId: row.participantId,
    experimentId: row.experimentId,
    trialNumber: row.trialNumber,
    stimulusType: row.stimulusType as StimulusType,
    stimulus: (row.stimulus ?? {}) as TrialResult["stimulus"],
    response: (row.response ?? {}) as TrialResult["response"],
    correct: row.correct,
    reactionTimeMs: row.reactionTimeMs,
    startedAt: toIso(row.startedAt),
    respondedAt: toIso(row.respondedAt),
    // Preserved as null rather than collapsed to false: `null` marks a
    // historical row that predates validity tracking, and it is admissible.
    valid: row.valid,
    rejection: (row.rejection ?? undefined) as TrialRejection | undefined,
    rejectionDetail: row.rejectionDetail ?? undefined,
    omission: row.omission ?? undefined,
    onsetSource: (row.onsetSource ?? undefined) as OnsetSource | undefined,
  };
}

export interface ExperimentStats {
  participants: number;
  completedTrials: number;
  avgReactionTimeMs: number | null;
  accuracyPercent: number | null;
}

export function serializeExperiment(
  identity: ExperimentRow,
  version: ExperimentVersionRow,
  stats?: ExperimentStats
): Experiment {
  return {
    id: identity.id,
    name: version.name,
    description: version.description,
    status: version.status as ExperimentStatus,
    version: version.version,
    tags: version.tags ?? [],
    trialCount: version.trialCount,
    nodes: (version.nodes ?? []) as ExperimentNode[],
    edges: (version.edges ?? []) as ExperimentEdge[],
    createdAt: toIso(identity.createdAt),
    updatedAt: toIso(version.createdAt),
    author: version.author ?? identity.author ?? undefined,
    stats: stats
      ? {
          participants: stats.participants,
          completedTrials: stats.completedTrials,
          avgReactionTimeMs: stats.avgReactionTimeMs ?? 0,
          accuracyPercent: stats.accuracyPercent ?? 0,
        }
      : undefined,
  };
}

export { toNumber, toInt, toIso, toNullableIso };
