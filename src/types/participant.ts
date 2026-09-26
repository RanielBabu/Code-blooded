import { Sex, AgeGroup } from "./auth";

export type { Sex, AgeGroup };
export type StimulusType = "text" | "color" | "image" | "mixed";

/**
 * How the stimulus-onset timestamp was obtained. Recorded per trial so the
 * provenance of a reaction time travels with the number, and so a dataset
 * containing degraded samples can be identified after the fact.
 *
 * `raf-timestamp` is the only source considered instrumental. `date-now` is the
 * server-rendering fallback and indicates the sample is not usable.
 */
export type OnsetSource = "raf-timestamp" | "performance-now" | "date-now";

/** Reason a completed trial was excluded from aggregates. */
export type TrialRejection = "premature" | "timeout" | "outlier";

export interface Participant {
  id: string;
  displayName: string;
  dateOfBirth?: string;
  age?: number;
  sex?: Sex;
  ageGroup?: AgeGroup;
  sessionId?: string;
  status: "active" | "completed" | "abandoned";
  completedExperiments: number;
  totalTrials: number;
  avgReactionTimeMs: number;
  accuracyPercent: number;
  consistencyScore: number; // 0 - 100, lower RT variance = higher consistency
  createdAt: string;
  lastActiveAt: string;
  notes?: string;
}

export interface TrialResult {
  id: string;
  participantId: string;
  participantName?: string;
  ageGroup?: AgeGroup;
  sex?: Sex;
  experimentId: string;
  trialNumber: number;
  stimulusType: StimulusType;
  stimulus: {
    prompt?: string;
    text?: string;
    color?: string;
    imageUrl?: string;
    targetRule?: string;
    congruent?: boolean;
  };
  response: {
    selectedAnswer: string;
    inputMethod: "keyboard" | "button" | "mouse";
  };
  correct: boolean;
  reactionTimeMs: number;
  startedAt: string;
  respondedAt: string;

  // --- Measurement provenance ---
  /**
   * Whether this trial passed the capture-time validity rules.
   *
   * This is a genuine three-state field and must not be collapsed:
   * - `true`  — assessed at capture time and passed.
   * - `false` — assessed and rejected (premature / timeout / outlier).
   * - `null`  — not assessed, which is the state of every historical record
   *   captured before validity tracking existed.
   *
   * Aggregate statistics exclude only `false`. Treating `null` as invalid
   * would silently empty previously collected datasets, so the SQL filter is
   * `valid IS DISTINCT FROM false` and never `WHERE valid`.
   *
   * Undefined is accepted on input for backwards compatibility with clients
   * that predate the field, and is normalised to `null` on write.
   */
  valid?: boolean | null;
  /** Populated when `valid` is false. */
  rejection?: TrialRejection;
  /** Human-readable justification, retained so exclusions are auditable. */
  rejectionDetail?: string;
  /** True when no response arrived inside the response window. */
  omission?: boolean;
  /** How the stimulus-onset timestamp was derived. */
  onsetSource?: OnsetSource;
}

/**
 * Aggregate statistics over a set of admissible trials.
 *
 * Every derived measurement is `number | null`. `null` means "no data supports
 * this figure" and is deliberately distinct from `0`:
 *
 * - `0 ms` is a claim that a response took no time, which is not a thing that
 *   can be measured. `null` is the absence of a claim.
 * - `0%` accuracy is a claim that every response was wrong.
 *
 * Consumers must render `null` as a gap rather than coercing it to zero. The
 * earlier mock layer substituted invented values for missing data (a synthetic
 * `400 - trial * 6` ms curve, a `0.92`/`1.05`/`1.15` per-modality multiplier),
 * which produced charts that looked complete while describing no measurement.
 */
export interface AnalyticsSummary {
  /** Counts are always known, even when zero. */
  participantCount: number;
  trialCount: number;
  averageReactionTimeMs: number | null;
  medianReactionTimeMs: number | null;
  accuracyPercent: number | null;
  fastestReactionTimeMs: number | null;
  slowestReactionTimeMs: number | null;
  stdDeviationMs: number | null;
  stimulusBreakdown: {
    type: StimulusType;
    avgRt: number | null;
    accuracy: number | null;
    count: number;
  }[];
  /** One entry per trial number actually observed, in ascending order. */
  trialProgression: {
    trial: number;
    avgRt: number | null;
    accuracy: number | null;
    textRt?: number | null;
    colorRt?: number | null;
    imageRt?: number | null;
  }[];
  /**
   * Fixed histogram bins. `count` is a real integer and may legitimately be
   * zero for an empty bin, so this series stays fully numeric.
   */
  rtDistribution: {
    binRange: string;
    minMs: number;
    maxMs: number;
    count: number;
    percent: number;
  }[];
}

export interface AgeGroupMetric {
  ageGroup: AgeGroup;
  participantCount: number;
  trialCount: number;
  avgRt: number;
  medianRt: number;
  minRt: number;
  maxRt: number;
  q1Rt: number; // 25th percentile
  q3Rt: number; // 75th percentile
  accuracy: number;
  consistency: number;
  stimulusAvgRt: {
    text: number;
    color: number;
    image: number;
    mixed: number;
  };
  insufficientData?: boolean;
}

export interface AgeScatterPoint {
  age: number;
  reactionTimeMs: number;
  accuracy: number;
  stimulusType: StimulusType;
  participantId: string; // anonymized e.g. "P-004"
  ageGroup: AgeGroup;
}

export interface AgeAnalyticsData {
  metricsByGroup: AgeGroupMetric[];
  scatterPoints: AgeScatterPoint[];
  totalCohortParticipants: number;
  totalCohortTrials: number;
  ageSpan: string;
  insights: string[];
}

export interface ParticipantPersonalSummary {
  participant: Participant;
  experimentsCompleted: number;
  totalTrials: number;
  avgReactionTimeMs: number;
  medianReactionTimeMs: number;
  fastestReactionTimeMs: number;
  slowestReactionTimeMs: number;
  accuracyPercent: number;
  consistencyScore: number;
  trials: TrialResult[];
  personalBests: {
    fastestRt: { value: number; taskName: string; date: string };
    bestAccuracy: { value: number; taskName: string; date: string };
    mostConsistent: { value: number; taskName: string; date: string };
    mostTrials: { value: number; taskName: string; date: string };
    bestColorRt: { value: number; taskName: string; date: string };
    bestImageRt: { value: number; taskName: string; date: string };
    bestTextRt: { value: number; taskName: string; date: string };
  };
}

/**
 * A ranked cohort entry. Metrics are null when the participant has no
 * admissible trials in the requested scope, rather than being back-filled with
 * a guess.
 */
export interface LeaderboardEntry {
  rank: number;
  participantId: string;
  displayName: string;
  ageGroup?: AgeGroup;
  averageReactionTimeMs: number | null;
  accuracyPercent: number | null;
  completedTrials: number;
  consistencyScore: number | null;
  textRt: number | null;
  colorRt: number | null;
  imageRt: number | null;
  trend: "up" | "down" | "neutral";
  lastActive: string;
}

export interface ResearchInsight {
  id: string;
  category: "latency" | "accuracy" | "stimulus" | "learning";
  title: string;
  message: string;
  type: "positive" | "neutral" | "warning";
  metricImpact?: string;
}
