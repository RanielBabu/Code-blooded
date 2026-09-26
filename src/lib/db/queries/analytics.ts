import "server-only";
import { and, sql } from "drizzle-orm";
import { db } from "../index";
import { admissibleTrials, trials } from "../schema";
import { toInt, toNumber } from "../serializers";
import type { AnalyticsSummary, StimulusType } from "@/types/participant";

/**
 * Reaction-time histogram bins.
 *
 * Declared once here and reused so the histogram can never disagree with
 * itself. The final bin is open-ended; `maxMs` is the largest value the
 * preceding bins can hold, not a hard cap on the data.
 */
const RT_BINS = [
  { binRange: "250-300ms", minMs: 250, maxMs: 300 },
  { binRange: "301-350ms", minMs: 301, maxMs: 350 },
  { binRange: "351-400ms", minMs: 351, maxMs: 400 },
  { binRange: "401-450ms", minMs: 401, maxMs: 450 },
  { binRange: "451-500ms", minMs: 451, maxMs: 500 },
  { binRange: "501-550ms", minMs: 501, maxMs: 550 },
  { binRange: "551-600ms", minMs: 551, maxMs: 600 },
  { binRange: "601ms+", minMs: 601, maxMs: Number.MAX_SAFE_INTEGER },
] as const;

const STIMULUS_TYPES: StimulusType[] = ["text", "color", "image", "mixed"];

export interface AnalyticsFilter {
  experimentId?: string;
  participantId?: string;
  stimulusType?: string;
}

/**
 * Build the shared WHERE clause for aggregate queries.
 *
 * `valid IS DISTINCT FROM false` comes from the schema and is the only
 * sanctioned definition of an admissible trial. Every aggregate here filters
 * on it, so a rejected anticipatory press can never re-enter a reported mean.
 */
function filterClause(filter: AnalyticsFilter) {
  const conditions = [admissibleTrials];

  if (filter.experimentId) {
    conditions.push(sql`${trials.experimentId} = ${filter.experimentId}`);
  }
  if (filter.participantId) {
    conditions.push(sql`${trials.participantId} = ${filter.participantId}`);
  }
  // "all" is the UI's sentinel for "no modality filter", not a real value.
  if (filter.stimulusType && filter.stimulusType !== "all") {
    conditions.push(sql`${trials.stimulusType} = ${filter.stimulusType}::stimulus_type`);
  }

  return and(...conditions);
}

/**
 * Cohort-level statistics for a set of trials.
 *
 * Every aggregate is computed in SQL from the raw rows. Postgres returns NULL
 * for an aggregate over an empty set, and that NULL is passed straight through
 * rather than being replaced with zero — a missing measurement must not be
 * reported as a 0 ms response or 0% accuracy.
 *
 * Two standard deviations are deliberately distinguished:
 * - `stddev_samp` for the participant consistency score, which estimates a
 *   population's spread from that participant's own trials (n-1).
 * - `stddev_pop` for the reported cohort figure, describing exactly the trials
 *   in view (n).
 */
export async function getAnalyticsSummary(filter: AnalyticsFilter = {}): Promise<AnalyticsSummary> {
  const where = filterClause(filter);

  const [overall] = await db.execute<{
    participant_count: number;
    trial_count: number;
    avg_rt: string | null;
    median_rt: string | null;
    accuracy: string | null;
    fastest_rt: number | null;
    slowest_rt: number | null;
    stddev_pop: string | null;
  }>(sql`
    select
      count(distinct ${trials.participantId})::int as participant_count,
      count(*)::int as trial_count,
      round(avg(${trials.reactionTimeMs}))::int as avg_rt,
      round(percentile_cont(0.5) within group (order by ${trials.reactionTimeMs}))::int as median_rt,
      round(
        (count(*) filter (where ${trials.correct}))::numeric * 100 / nullif(count(*), 0), 1
      ) as accuracy,
      min(${trials.reactionTimeMs})::int as fastest_rt,
      max(${trials.reactionTimeMs})::int as slowest_rt,
      round(stddev_pop(${trials.reactionTimeMs}))::int as stddev_pop
    from ${trials}
    where ${where}
  `).then((r) => (Array.isArray(r) ? r : []));

  // Per-modality latency and accuracy. Grouping happens in SQL; the four
  // stimulus types are unioned in JS so a modality with no trials still appears
  // with a null measurement and a count of zero.
  const breakdownRows = await db.execute<{
    type: StimulusType;
    avg_rt: string | null;
    accuracy: string | null;
    count: number;
  }>(sql`
    select
      ${trials.stimulusType} as type,
      round(avg(${trials.reactionTimeMs}))::int as avg_rt,
      round(
        (count(*) filter (where ${trials.correct}))::numeric * 100 / nullif(count(*), 0), 1
      ) as accuracy,
      count(*)::int as count
    from ${trials}
    where ${where}
    group by ${trials.stimulusType}
  `).then((r) => (Array.isArray(r) ? r : []));

  const breakdownByType = new Map(breakdownRows.map((row) => [row.type, row]));

  const stimulusBreakdown = STIMULUS_TYPES.map((type) => {
    const row = breakdownByType.get(type);
    return {
      type,
      avgRt: row ? toInt(row.avg_rt) : null,
      accuracy: row ? toNumber(row.accuracy) : null,
      count: row ? row.count : 0,
    };
  });

  // Trial-by-trial progression, restricted to trial numbers that were actually
  // collected. The previous implementation emitted ten rows and filled absent
  // ones with a synthetic `400 - trial * 6` ms curve, which drew a smooth
  // learning effect on trials that never ran.
  const progressionRows = await db.execute<{
    trial: number;
    avg_rt: string | null;
    accuracy: string | null;
    text_rt: string | null;
    color_rt: string | null;
    image_rt: string | null;
  }>(sql`
    select
      ${trials.trialNumber} as trial,
      round(avg(${trials.reactionTimeMs}))::int as avg_rt,
      round(
        (count(*) filter (where ${trials.correct}))::numeric * 100 / nullif(count(*), 0), 1
      ) as accuracy,
      round(avg(${trials.reactionTimeMs}) filter (where ${trials.stimulusType} = 'text'))::int as text_rt,
      round(avg(${trials.reactionTimeMs}) filter (where ${trials.stimulusType} = 'color'))::int as color_rt,
      round(avg(${trials.reactionTimeMs}) filter (where ${trials.stimulusType} = 'image'))::int as image_rt
    from ${trials}
    where ${where}
    group by ${trials.trialNumber}
    order by ${trials.trialNumber} asc
  `).then((r) => (Array.isArray(r) ? r : []));

  const trialProgression = progressionRows.map((row) => ({
    trial: row.trial,
    avgRt: toInt(row.avg_rt),
    accuracy: toNumber(row.accuracy),
    textRt: toInt(row.text_rt),
    colorRt: toInt(row.color_rt),
    imageRt: toInt(row.image_rt),
  }));

  // Histogram. Bin membership is resolved with a single grouped query and then
  // assigned in JS, which avoids eight near-identical scans of the trial table.
  const rtRows = await db
    .select({ rt: trials.reactionTimeMs })
    .from(trials)
    .where(where);

  const totalSamples = rtRows.length;
  const rtDistribution = RT_BINS.map((bin) => {
    const count = rtRows.filter(
      (row) => row.rt >= bin.minMs && row.rt <= bin.maxMs
    ).length;
    return {
      binRange: bin.binRange,
      minMs: bin.minMs,
      // Report the last bin's ceiling as the end of the preceding band rather
      // than MAX_SAFE_INTEGER, which is meaningless to display.
      maxMs: bin.maxMs === Number.MAX_SAFE_INTEGER ? 2000 : bin.maxMs,
      count,
      percent: totalSamples > 0 ? Math.round((count / totalSamples) * 100) : 0,
    };
  });

  return {
    participantCount: overall?.participant_count ?? 0,
    trialCount: overall?.trial_count ?? 0,
    averageReactionTimeMs: toInt(overall?.avg_rt ?? null),
    medianReactionTimeMs: toInt(overall?.median_rt ?? null),
    accuracyPercent: toNumber(overall?.accuracy ?? null),
    fastestReactionTimeMs: toInt(overall?.fastest_rt ?? null),
    slowestReactionTimeMs: toInt(overall?.slowest_rt ?? null),
    stdDeviationMs: toInt(overall?.stddev_pop ?? null),
    stimulusBreakdown,
    trialProgression,
    rtDistribution,
  };
}
