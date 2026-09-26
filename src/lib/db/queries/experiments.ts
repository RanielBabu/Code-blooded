import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../index";
import { admissibleTrials, experimentVersions, experiments, trials } from "../schema";
import { newExperimentId } from "../ids";
import { serializeExperiment, type ExperimentStats } from "../serializers";
import type { Experiment, ExperimentEdge, ExperimentNode, ExperimentStatus } from "@/types/experiment";

/**
 * Read the live revision of every experiment, joined to its identity row.
 *
 * `experiments.current_version` selects the revision, so the join returns
 * exactly one version row per experiment. A revision is never mutated, which
 * is what makes the "current" pointer unambiguous.
 */
function currentRevisionJoin() {
  return and(
    eq(experimentVersions.experimentId, experiments.id),
    eq(experimentVersions.version, experiments.currentVersion)
  );
}

/**
 * Per-experiment cohort totals, computed from raw trials rather than read from
 * a cached column. Recomputing is cheap next to serving a stale number, and a
 * denormalised stat that silently disagrees with the rows beneath it is worse
 * than no stat at all.
 */
async function loadStats(): Promise<Map<string, ExperimentStats>> {
  const rows = await db
    .select({
      experimentId: trials.experimentId,
      participants: sql<number>`count(distinct ${trials.participantId})::int`,
      completedTrials: sql<number>`count(*)::int`,
      avgReactionTimeMs: sql<number | null>`round(avg(${trials.reactionTimeMs}))::int`,
      accuracyPercent: sql<number | null>`round(
        (count(*) filter (where ${trials.correct}))::numeric * 100 / nullif(count(*), 0), 1
      )`,
    })
    .from(trials)
    .where(admissibleTrials)
    .groupBy(trials.experimentId);

  return new Map(
    rows.map((r) => [
      r.experimentId,
      {
        participants: r.participants,
        completedTrials: r.completedTrials,
        avgReactionTimeMs: r.avgReactionTimeMs,
        accuracyPercent: r.accuracyPercent,
      },
    ])
  );
}

export async function listExperiments(): Promise<Experiment[]> {
  const [revisions, stats] = await Promise.all([
    db
      .select({ identity: experiments, version: experimentVersions })
      .from(experiments)
      .innerJoin(experimentVersions, currentRevisionJoin())
      .orderBy(desc(experiments.updatedAt)),
    loadStats(),
  ]);

  return revisions.map((r) => serializeExperiment(r.identity, r.version, stats.get(r.identity.id)));
}

export async function getExperiment(id: string): Promise<Experiment | null> {
  const [row] = await db
    .select({ identity: experiments, version: experimentVersions })
    .from(experiments)
    .innerJoin(experimentVersions, currentRevisionJoin())
    .where(eq(experiments.id, id))
    .limit(1);

  if (!row) return null;

  const stats = (await loadStats()).get(id);
  return serializeExperiment(row.identity, row.version, stats);
}

export interface SaveExperimentInput {
  id?: string;
  name: string;
  description: string;
  status: ExperimentStatus;
  tags: string[];
  trialCount: number;
  nodes: ExperimentNode[];
  edges: ExperimentEdge[];
  author?: string;
}

/**
 * Create or revise an experiment.
 *
 * A save never overwrites. It allocates the next version number, appends an
 * immutable revision, and repoints the experiment at it. That is what lets a
 * published paradigm be traced back to the exact graph a cohort was run
 * against, and it makes concurrent edits non-destructive: the last writer adds
 * a revision rather than erasing the previous state.
 *
 * The version bump and the pointer move happen in one transaction, so a
 * failure cannot leave the experiment pointing at a revision that was never
 * written.
 */
export async function saveExperiment(input: SaveExperimentInput): Promise<Experiment> {
  return db.transaction(async (tx) => {
    const id = input.id ?? newExperimentId();

    const [existing] = await tx
      .select()
      .from(experiments)
      .where(eq(experiments.id, id))
      .limit(1);

    const nextVersion = existing ? existing.currentVersion + 1 : 1;
    const now = new Date();

    // The identity row must exist before the first revision, because
    // experiment_versions.experiment_id is a foreign key onto experiments. On
    // create that means inserting the parent first, then the revision, then
    // repointing the parent at the revision it just wrote.
    if (!existing) {
      await tx.insert(experiments).values({
        id,
        author: input.author ?? null,
        // Provisional until the revision below is written. Both statements run
        // inside this transaction, so no other session can observe the gap.
        currentVersion: 1,
        createdAt: now,
        updatedAt: now,
      });
    }

    const [version] = await tx
      .insert(experimentVersions)
      .values({
        experimentId: id,
        version: nextVersion,
        name: input.name,
        description: input.description,
        status: input.status,
        tags: input.tags,
        trialCount: input.trialCount,
        nodes: input.nodes,
        edges: input.edges,
        author: input.author ?? existing?.author ?? null,
      })
      .returning();

    const [updatedIdentity] = await tx
      .update(experiments)
      .set({ currentVersion: nextVersion, updatedAt: now })
      .where(eq(experiments.id, id))
      .returning();

    const stats = (await loadStats()).get(id);
    return serializeExperiment(updatedIdentity, version, stats);
  });
}

/**
 * Change an experiment's status. Also appends a revision, because publication
 * is the moment a paradigm becomes citable: which graph was live when it went
 * out is part of the record.
 */
export async function setExperimentStatus(
  id: string,
  status: ExperimentStatus
): Promise<Experiment | null> {
  const existing = await getExperiment(id);
  if (!existing) return null;

  return saveExperiment({
    id,
    name: existing.name,
    description: existing.description,
    status,
    tags: existing.tags,
    trialCount: existing.trialCount,
    nodes: existing.nodes,
    edges: existing.edges,
    author: existing.author,
  });
}

/**
 * Copy an experiment as a new draft.
 *
 * Collected data is intentionally not copied. The duplicate is a fresh paradigm
 * at version 1, and `trials` keeps pointing at the original id, so trial
 * records are never ambiguous about which graph produced them.
 */
export async function duplicateExperiment(id: string): Promise<Experiment | null> {
  const source = await getExperiment(id);
  if (!source) return null;

  return saveExperiment({
    name: `${source.name} (Copy)`,
    description: source.description,
    status: "draft",
    tags: source.tags,
    trialCount: source.trialCount,
    nodes: source.nodes,
    edges: source.edges,
    author: source.author,
  });
}

export interface ExperimentVersionSummary {
  version: number;
  status: ExperimentStatus;
  name: string;
  createdAt: string;
}

/** Revision history, newest first. */
export async function listExperimentVersions(id: string): Promise<ExperimentVersionSummary[]> {
  const rows = await db
    .select({
      version: experimentVersions.version,
      status: experimentVersions.status,
      name: experimentVersions.name,
      createdAt: experimentVersions.createdAt,
    })
    .from(experimentVersions)
    .where(eq(experimentVersions.experimentId, id))
    .orderBy(desc(experimentVersions.version));

  return rows.map((r) => ({
    version: r.version,
    status: r.status as ExperimentStatus,
    name: r.name,
    createdAt: r.createdAt.toISOString(),
  }));
}
