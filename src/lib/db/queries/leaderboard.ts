import "server-only";
import { sql } from "drizzle-orm";
import { db } from "../index";
import { participants, trials } from "../schema";
import { toInt, toNumber } from "../serializers";
import type { LeaderboardEntry } from "@/types/participant";

export type LeaderboardMetric = "reactionTime" | "accuracy" | "consistency";

/**
 * Cohort ranking, computed in SQL.
 *
 * Two details in this query are load-bearing:
 *
 * 1. `count(t.id)`, never `count(*)`. An unmatched LEFT JOIN still yields one
 *    row, so `count(*)` reports 1 trial for a participant who has none, and the
 *    accuracy division would then divide by 1.
 *
 * 2. The trial filter `t.valid IS DISTINCT FROM false` is what excludes
 *    rejected anticipatory presses. It is spelled out here instead of reusing
 *    the `admissibleTrials` helper because that helper renders a fully
 *    qualified `"trials"."valid"`, which cannot be used against the `t` alias
 *    the join introduces. The semantics are identical.
 *
 * Column references use the `t` alias via `sql.raw` because Drizzle renders
 * table objects as their quoted real name (`"trials"."reaction_time_ms"`),
 * which is not a valid reference once the table is aliased.
 */
const AGG = {
  avgRt: sql.raw(`round(avg(t.reaction_time_ms))::int`),
  accuracy: sql.raw(
    `round((count(t.id) filter (where t.correct))::numeric * 100 / nullif(count(t.id), 0), 1)`
  ),
  completedTrials: sql.raw(`count(t.id)::int`),
  consistency: sql.raw(
    `greatest(40, least(99, round(100 - coalesce(stddev_samp(t.reaction_time_ms), 0) / 3)))::int`
  ),
  textRt: sql.raw(`round(avg(t.reaction_time_ms) filter (where t.stimulus_type = 'text'))::int`),
  colorRt: sql.raw(`round(avg(t.reaction_time_ms) filter (where t.stimulus_type = 'color'))::int`),
  imageRt: sql.raw(`round(avg(t.reaction_time_ms) filter (where t.stimulus_type = 'image'))::int`),
} as const;

/**
 * Ranking window and outer ordering.
 *
 * These must sort identically or the row numbers come back out of sequence,
 * so both spell out NULL placement the same way instead of relying on the
 * dialect default (ASC defaults to NULLS LAST, DESC to NULLS FIRST).
 *
 * The window cannot use a NULLS clause, so nulls are forced last by a boolean
 * leading the sort: `(col is null)` is false for real values and true for
 * nulls, and ascending therefore puts measured participants first.
 *
 * `participant_id` is the tiebreak in both, so participants with equal scores
 * keep a stable rank across requests rather than shuffling.
 */
const RANK_SORT: Record<LeaderboardMetric, ReturnType<typeof sql.raw>> = {
  reactionTime: sql.raw(`(avg_rt is null), avg_rt asc, participant_id asc`),
  accuracy: sql.raw(`(accuracy is null), accuracy desc, participant_id asc`),
  consistency: sql.raw(`(consistency is null), consistency desc, participant_id asc`),
};

const RANK_ORDER: Record<LeaderboardMetric, ReturnType<typeof sql.raw>> = {
  reactionTime: sql.raw(`(avg_rt is null), avg_rt asc, participant_id asc`),
  accuracy: sql.raw(`(accuracy is null), accuracy desc, participant_id asc`),
  consistency: sql.raw(`(consistency is null), consistency desc, participant_id asc`),
};

export async function getLeaderboard(
  metric: LeaderboardMetric = "reactionTime",
  experimentId?: string
): Promise<LeaderboardEntry[]> {
  const sort = RANK_SORT[metric] ?? RANK_SORT.reactionTime;
  const order = RANK_ORDER[metric] ?? RANK_ORDER.reactionTime;

  // When an experiment is in scope, restrict the join to that experiment's
  // trials so the metrics describe the cohort that actually ran it. Without
  // the filter the join spans every trial the participant has.
  const scope = experimentId ? sql`and t.experiment_id = ${experimentId}` : sql``;

  const rows = await db.execute<{
    participant_id: string;
    display_name: string;
    avg_rt: number | null;
    accuracy: string | null;
    completed_trials: number;
    consistency: number | null;
    text_rt: number | null;
    color_rt: number | null;
    image_rt: number | null;
    last_active_at: Date;
    rank: string;
  }>(sql`
    select
      ranked.*,
      row_number() over (order by ${sort}) as rank
    from (
      select
        p.id as participant_id,
        p.display_name as display_name,
        ${AGG.avgRt} as avg_rt,
        ${AGG.accuracy} as accuracy,
        ${AGG.completedTrials} as completed_trials,
        ${AGG.consistency} as consistency,
        ${AGG.textRt} as text_rt,
        ${AGG.colorRt} as color_rt,
        ${AGG.imageRt} as image_rt,
        p.last_active_at as last_active_at
      from ${participants} p
      left join ${trials} t
        on t.participant_id = p.id
        and t.valid is distinct from false
        ${scope}
      group by p.id, p.display_name, p.last_active_at
    ) ranked
    order by ${order}, participant_id asc
  `).then((r) => (Array.isArray(r) ? r : []));

  return rows.map((row) => {
    const avgRt = toInt(row.avg_rt);
    return {
      // Postgres types row_number() as bigint, which the driver hands back as a
      // string. Without this coercion a rank of "1" fails a numeric comparison
      // and serialises as a string in the JSON payload.
      rank: toInt(row.rank) ?? 0,
      participantId: row.participant_id,
      displayName: row.display_name,
      averageReactionTimeMs: avgRt,
      accuracyPercent: toNumber(row.accuracy),
      completedTrials: row.completed_trials,
      consistencyScore: toInt(row.consistency),
      // Null when this participant has no trials of that modality. The previous
      // implementation substituted `avgRt * 0.92` / `* 1.05` / `* 1.15`, which
      // displayed an invented per-modality latency for conditions the
      // participant never saw.
      textRt: toInt(row.text_rt),
      colorRt: toInt(row.color_rt),
      imageRt: toInt(row.image_rt),
      trend: avgRt === null ? "neutral" : avgRt < 400 ? "up" : avgRt > 450 ? "down" : "neutral",
      lastActive: new Date(row.last_active_at).toISOString(),
    };
  });
}
