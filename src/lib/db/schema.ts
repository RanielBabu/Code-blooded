import { sql } from "drizzle-orm";
import {
  bigserial,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { ExperimentEdge, ExperimentNode } from "@/types/experiment";

export const experimentStatusEnum = pgEnum("experiment_status", ["draft", "published", "archived"]);
export const participantStatusEnum = pgEnum("participant_status", ["active", "completed", "abandoned"]);
export const stimulusTypeEnum = pgEnum("stimulus_type", ["text", "color", "image", "mixed"]);
export const onsetSourceEnum = pgEnum("onset_source", ["raf-timestamp", "performance-now", "date-now"]);
export const trialRejectionEnum = pgEnum("trial_rejection", ["premature", "timeout", "outlier"]);

/**
 * Stable identity for an experiment, plus a pointer to the revision that is
 * currently live. Deliberately holds no descriptive columns: name, status and
 * the node graph all live on `experiment_versions`, so there is exactly one
 * source of truth per revision and no risk of the summary row drifting from
 * the revision it claims to describe.
 */
export const experiments = pgTable("experiments", {
  id: text("id").primaryKey(),
  author: text("author"),
  currentVersion: integer("current_version").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Append-only revision history. Saving an experiment inserts a new row rather
 * than overwriting, so a published paradigm can always be traced back to the
 * exact node graph a given cohort was actually run against.
 *
 * Rows are never updated in place; the only mutation is a new version number.
 */
export const experimentVersions = pgTable(
  "experiment_versions",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    experimentId: text("experiment_id")
      .notNull()
      .references(() => experiments.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    status: experimentStatusEnum("status").notNull().default("draft"),
    tags: text("tags")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    trialCount: integer("trial_count").notNull().default(10),
    nodes: jsonb("nodes")
      .$type<ExperimentNode[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    edges: jsonb("edges")
      .$type<ExperimentEdge[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    author: text("author"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("experiment_versions_experiment_version_uk").on(table.experimentId, table.version),
    index("experiment_versions_experiment_id_idx").on(table.experimentId),
  ]
);

export const participants = pgTable(
  "participants",
  {
    id: text("id").primaryKey(),
    displayName: text("display_name").notNull(),
    sessionId: text("session_id"),
    status: participantStatusEnum("status").notNull().default("active"),
    completedExperiments: integer("completed_experiments").notNull().default(0),
    totalTrials: integer("total_trials").notNull().default(0),
    avgReactionTimeMs: integer("avg_reaction_time_ms").notNull().default(0),
    accuracyPercent: real("accuracy_percent").notNull().default(0),
    consistencyScore: integer("consistency_score").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }).notNull().defaultNow(),
    notes: text("notes"),
  },
  (table) => [index("participants_last_active_at_idx").on(table.lastActiveAt)]
);

/**
 * One row per completed trial. This is the primary research record: reaction
 * times are never aggregated on write and never discarded, so any statistic can
 * be recomputed from raw samples after the fact.
 */
export const trials = pgTable(
  "trials",
  {
    id: text("id").primaryKey(),
    participantId: text("participant_id")
      .notNull()
      .references(() => participants.id, { onDelete: "cascade" }),
    experimentId: text("experiment_id")
      .notNull()
      .references(() => experiments.id, { onDelete: "cascade" }),
    trialNumber: integer("trial_number").notNull(),
    stimulusType: stimulusTypeEnum("stimulus_type").notNull(),
    stimulus: jsonb("stimulus").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    response: jsonb("response").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    correct: boolean("correct").notNull(),
    reactionTimeMs: integer("reaction_time_ms").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    respondedAt: timestamp("responded_at", { withTimezone: true }).notNull(),

    /**
     * Capture-time validity. NULL is a meaningful third state, not "unknown":
     * it marks a historical row recorded before validity tracking existed.
     * Such rows are treated as admissible so old datasets keep their original
     * meaning instead of silently emptying. Only an explicit `false` excludes
     * a trial. See `admissibleTrials`.
     */
    valid: boolean("valid"),
    rejection: trialRejectionEnum("rejection"),
    rejectionDetail: text("rejection_detail"),
    omission: boolean("omission"),
    onsetSource: onsetSourceEnum("onset_source"),
  },
  (table) => [
    index("trials_experiment_id_idx").on(table.experimentId),
    index("trials_participant_id_idx").on(table.participantId),
    // Covers the hot aggregate path: filter one experiment, drop rejects.
    index("trials_experiment_valid_idx").on(table.experimentId, table.valid),
    index("trials_stimulus_type_idx").on(table.stimulusType),
  ]
);

/**
 * The single definition of "may this trial contribute to a reported statistic".
 *
 * `IS DISTINCT FROM false` is true for both `true` and `NULL`, which is the
 * intended semantics: a trial is excluded only when it was explicitly rejected
 * as premature, a timeout, or an outlier.
 *
 * Every aggregate in the analytics layer must use this expression. Writing
 * `WHERE valid` or `WHERE valid = true` instead would silently drop all
 * historical rows and quietly change previously published results.
 */
export const admissibleTrials = sql`${trials.valid} is distinct from false`;

export type ExperimentRow = typeof experiments.$inferSelect;
export type ExperimentVersionRow = typeof experimentVersions.$inferSelect;
export type ParticipantRow = typeof participants.$inferSelect;
export type TrialRow = typeof trials.$inferSelect;
