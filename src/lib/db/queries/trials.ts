import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../index";
import { admissibleTrials, experiments, participants, trials } from "../schema";
import { newParticipantId, newSessionId, newTrialId } from "../ids";
import { serializeParticipant, serializeTrial } from "../serializers";
import type { Participant, TrialResult } from "@/types/participant";

export interface TrialFilter {
  experimentId?: string;
  participantId?: string;
  stimulusType?: string;
  /** Restrict to trials that contribute to aggregates. Defaults to false so
   *  raw exports still include rejected samples, which must remain auditable. */
  admissibleOnly?: boolean;
  limit?: number;
}

export async function listTrials(filter: TrialFilter = {}): Promise<TrialResult[]> {
  const conditions = [];

  if (filter.admissibleOnly) {
    conditions.push(admissibleTrials);
  }
  if (filter.experimentId) {
    conditions.push(eq(trials.experimentId, filter.experimentId));
  }
  if (filter.participantId) {
    conditions.push(eq(trials.participantId, filter.participantId));
  }
  if (filter.stimulusType && filter.stimulusType !== "all") {
    conditions.push(eq(trials.stimulusType, filter.stimulusType as TrialResult["stimulusType"]));
  }

  const query = db
    .select()
    .from(trials)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(trials.startedAt))
    .limit(filter.limit ?? 1000);

  const rows = await query;
  return rows.map(serializeTrial);
}

export interface IncomingTrial {
  experimentId: string;
  trialNumber: number;
  stimulusType: TrialResult["stimulusType"];
  stimulus: TrialResult["stimulus"];
  response: TrialResult["response"];
  correct: boolean;
  reactionTimeMs: number;
  startedAt: string;
  respondedAt: string;
  valid?: boolean;
  rejection?: TrialResult["rejection"];
  rejectionDetail?: string;
  omission?: boolean;
  onsetSource?: TrialResult["onsetSource"];
}

export interface RecordTrialRunResult {
  participant: Participant;
  trials: TrialResult[];
}

export class TrialRunError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string
  ) {
    super(message);
    this.name = "TrialRunError";
  }
}

/**
 * Persist a completed session: one participant row plus all of their trials.
 *
 * Runs in a single transaction. A partial write is not an acceptable outcome
 * for a research record: a participant row whose trials are missing, or trials
 * whose participant is missing, both corrupt the aggregate queries in ways that
 * are hard to notice later. Either the whole session lands or none of it does.
 *
 * Participant headline metrics are derived here from the admissible subset
 * only. An anticipatory press yields a fast, wrong, meaningless sample, and
 * letting it set a participant's reported average would misrepresent them.
 */
export async function recordTrialRun(
  participantName: string,
  incoming: IncomingTrial[]
): Promise<RecordTrialRunResult> {
  if (incoming.length === 0) {
    throw new TrialRunError("A trial run must contain at least one trial.", 400, "EMPTY_TRIAL_RUN");
  }

  const experimentIds = new Set(incoming.map((t) => t.experimentId));
  if (experimentIds.size > 1) {
    // A session belongs to one paradigm. Allowing a mixed batch would make the
    // experiment-level statistics ambiguous.
    throw new TrialRunError(
      "A trial run must reference exactly one experiment.",
      400,
      "MIXED_EXPERIMENTS"
    );
  }
  const experimentId = incoming[0].experimentId;

  return db.transaction(async (tx) => {
    const [experiment] = await tx
      .select({ id: experiments.id })
      .from(experiments)
      .where(eq(experiments.id, experimentId))
      .limit(1);

    if (!experiment) {
      // Guarded explicitly so the FK violation does not surface as an opaque
      // 500 from deep inside the insert.
      throw new TrialRunError(`Unknown experiment "${experimentId}".`, 404, "EXPERIMENT_NOT_FOUND");
    }

    const participantId = newParticipantId();
    const now = new Date();

    const scored = incoming.filter((t) => t.valid !== false);
    const totalTrials = incoming.length;
    const excludedCount = totalTrials - scored.length;

    const correctCount = scored.filter((t) => t.correct).length;
    const accuracy = scored.length > 0 ? (correctCount / scored.length) * 100 : 0;

    const rts = scored.map((t) => t.reactionTimeMs);
    const avgRt = rts.length > 0 ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : 0;

    // Sample variance (n-1): these trials are a sample of the participant's
    // response distribution, so the sample estimate is the correct one.
    const variance =
      rts.length > 1
        ? rts.reduce((acc, val) => acc + Math.pow(val - avgRt, 2), 0) / (rts.length - 1)
        : 0;
    const stdDev = Math.sqrt(variance);
    const consistencyScore = Math.max(40, Math.min(99, Math.round(100 - stdDev / 3)));

    const displayName =
      participantName.trim() || `Participant ${participantId.slice(-4).toUpperCase()}`;

    const [participantRow] = await tx
      .insert(participants)
      .values({
        id: participantId,
        displayName,
        sessionId: newSessionId(),
        status: "completed",
        completedExperiments: 1,
        totalTrials,
        avgReactionTimeMs: avgRt,
        accuracyPercent: Math.round(accuracy * 10) / 10,
        consistencyScore,
        createdAt: now,
        lastActiveAt: now,
        notes:
          excludedCount > 0
            ? `Completed interactive live test run. ${excludedCount} of ${totalTrials} trials excluded by capture-time validity rules (premature / timeout / outlier).`
            : "Completed interactive live test run in CognitiveLab runtime.",
      })
      .returning();

    const inserted = await tx
      .insert(trials)
      .values(
        incoming.map((t) => ({
          id: newTrialId(participantId, t.trialNumber),
          participantId,
          experimentId: t.experimentId,
          trialNumber: t.trialNumber,
          stimulusType: t.stimulusType,
          stimulus: t.stimulus,
          response: t.response,
          correct: t.correct,
          reactionTimeMs: t.reactionTimeMs,
          startedAt: new Date(t.startedAt),
          respondedAt: new Date(t.respondedAt),
          // `undefined` is mapped to NULL, which marks the trial as admissible
          // but of unrecorded provenance. Storing `true` instead would claim
          // validity was assessed when it may not have been.
          valid: t.valid ?? null,
          rejection: t.rejection ?? null,
          rejectionDetail: t.rejectionDetail ?? null,
          omission: t.omission ?? null,
          onsetSource: t.onsetSource ?? null,
        }))
      )
      .returning();

    return {
      participant: serializeParticipant(participantRow),
      trials: inserted.map(serializeTrial),
    };
  });
}

/** Trial counts per experiment, for dashboard rollups. */
export async function getExperimentTrialCounts(): Promise<Record<string, number>> {
  const rows = await db
    .select({
      experimentId: trials.experimentId,
      count: sql<number>`count(*)::int`,
    })
    .from(trials)
    .where(admissibleTrials)
    .groupBy(trials.experimentId);

  return Object.fromEntries(rows.map((r) => [r.experimentId, r.count]));
}
