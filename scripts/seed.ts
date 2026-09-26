/**
 * Seed the database from the mock fixtures.
 *
 * The fixtures in `src/lib/mock/` are the only source of sample data, so this
 * script preserves them verbatim as real rows. It is idempotent: re-running it
 * truncates the three tables and re-inserts, so it can be used to reset a
 * development database to a known state.
 *
 * Rejected trials in the fixtures keep their `valid: false` value, and trials
 * without a `valid` field are stored as NULL rather than being back-filled with
 * `true`. That distinction is load-bearing: NULL is what marks a row as
 * admissible-but-unassessed, and rewriting it would change the aggregates.
 */
import { sql } from "drizzle-orm";
import postgres from "postgres";
import { MOCK_EXPERIMENTS } from "../src/lib/mock/mock-experiments";
import { MOCK_PARTICIPANTS } from "../src/lib/mock/mock-participants";
import { MOCK_TRIALS } from "../src/lib/mock/mock-trials";
import type { Experiment } from "../src/types/experiment";
import type { Participant, TrialResult } from "../src/types/participant";
import { experiments, experimentVersions, participants, trials } from "../src/lib/db/schema";
import { drizzle } from "drizzle-orm/postgres-js";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env.local first.");
  process.exit(1);
}

const client = postgres(url, { max: 1, prepare: false });
const db = drizzle(client);

async function seed() {
  console.log("Clearing existing data...");
  // TRUNCATE ... CASCADE in one statement so foreign keys never block it.
  await db.execute(
    sql`truncate table ${trials}, ${participants}, ${experimentVersions}, ${experiments} restart identity cascade`
  );

  console.log(`Inserting ${MOCK_EXPERIMENTS.length} experiments...`);
  for (const exp of MOCK_EXPERIMENTS as Experiment[]) {
    await db.insert(experiments).values({
      id: exp.id,
      author: exp.author ?? null,
      currentVersion: exp.version,
      createdAt: new Date(exp.createdAt),
      updatedAt: new Date(exp.updatedAt),
    });

    await db.insert(experimentVersions).values({
      experimentId: exp.id,
      version: exp.version,
      name: exp.name,
      description: exp.description,
      status: exp.status,
      tags: exp.tags,
      trialCount: exp.trialCount,
      nodes: exp.nodes,
      edges: exp.edges,
      author: exp.author ?? null,
      createdAt: new Date(exp.createdAt),
    });
  }

  console.log(`Inserting ${MOCK_PARTICIPANTS.length} participants...`);
  const participantRows = (MOCK_PARTICIPANTS as Participant[]).map((p) => ({
    id: p.id,
    displayName: p.displayName,
    sessionId: p.sessionId ?? null,
    status: p.status,
    completedExperiments: p.completedExperiments,
    totalTrials: p.totalTrials,
    avgReactionTimeMs: p.avgReactionTimeMs,
    accuracyPercent: p.accuracyPercent,
    consistencyScore: p.consistencyScore,
    createdAt: new Date(p.createdAt),
    lastActiveAt: new Date(p.lastActiveAt),
    notes: p.notes ?? null,
  }));
  await db.insert(participants).values(participantRows);

  console.log(`Inserting ${MOCK_TRIALS.length} trials...`);
  const trialRows = (MOCK_TRIALS as TrialResult[]).map((t) => ({
    id: t.id,
    participantId: t.participantId,
    experimentId: t.experimentId,
    trialNumber: t.trialNumber,
    stimulusType: t.stimulusType,
    stimulus: t.stimulus,
    response: t.response,
    correct: t.correct,
    reactionTimeMs: t.reactionTimeMs,
    startedAt: new Date(t.startedAt),
    respondedAt: new Date(t.respondedAt),
    // Preserve the three-state distinction exactly as the fixture expresses it.
    valid: t.valid ?? null,
    rejection: t.rejection ?? null,
    rejectionDetail: t.rejectionDetail ?? null,
    omission: t.omission ?? null,
    onsetSource: t.onsetSource ?? null,
  }));

  // Insert in chunks so a large fixture set does not exceed the parameter limit.
  const CHUNK = 500;
  for (let i = 0; i < trialRows.length; i += CHUNK) {
    await db.insert(trials).values(trialRows.slice(i, i + CHUNK));
  }

  const [{ count: trialCount }] = await db.select({ count: sql<number>`count(*)::int` }).from(trials);
  const [{ count: participantCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(participants);
  const [{ count: experimentCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(experiments);

  console.log("\nSeed complete:");
  console.log(`  experiments:   ${experimentCount}`);
  console.log(`  participants:  ${participantCount}`);
  console.log(`  trials:        ${trialCount}`);
}

seed()
  .then(async () => {
    await client.end();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Seed failed:", error);
    await client.end();
    process.exit(1);
  });
