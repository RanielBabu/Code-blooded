/**
 * End-to-end smoke test against a running dev server.
 *
 * Verifies the full path: HTTP route handler -> Drizzle -> PostgreSQL, plus
 * the aggregate semantics that the mock layer used to fake. Run with the dev
 * server up: `npm run dev`, then `npm run db:verify`.
 */
import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

for (const file of [".env.local", ".env"]) {
  const path = resolve(process.cwd(), file);
  if (existsSync(path)) {
    config({ path, quiet: true });
    break;
  }
}

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";

let passed = 0;
let failed = 0;

function check(label: string, condition: boolean, detail?: unknown) {
  if (condition) {
    passed++;
    console.log(`  PASS  ${label}`);
  } else {
    failed++;
    console.log(`  FAIL  ${label}`);
    if (detail !== undefined) {
      console.log(`        ${JSON.stringify(detail).slice(0, 400)}`);
    }
  }
}

type Body = Record<string, any>;

interface Res {
  status: number;
  body: Body | null;
}

async function readBody(res: Response): Promise<Body | null> {
  try {
    return (await res.json()) as Body;
  } catch {
    return null;
  }
}

async function get(path: string): Promise<Res> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: "application/json" } });
  return { status: res.status, body: await readBody(res) };
}

async function post(path: string, payload?: unknown): Promise<Res> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  return { status: res.status, body: await readBody(res) };
}

async function put(path: string, payload: unknown): Promise<Res> {
  const res = await fetch(`${BASE}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return { status: res.status, body: await readBody(res) };
}

async function main() {
  console.log(`\nSmoke testing ${BASE}\n`);

  console.log("health");
  const health = await get("/api/health");
  check("health returns 200", health.status === 200, health.body);
  check("database reachable", health.body?.data?.database === "reachable", health.body);

  console.log("\nexperiments");
  const experiments = await get("/api/experiments");
  check("list returns 200", experiments.status === 200, experiments.body);
  const experimentList = experiments.body?.data ?? [];
  check("seeded 5 experiments", experimentList.length === 5, { got: experimentList.length });
  check(
    "experiments carry node graphs",
    experimentList.every((e: any) => Array.isArray(e.nodes) && e.nodes.length > 0)
  );
  check(
    "timestamps are ISO strings",
    experimentList.every((e: any) => typeof e.createdAt === "string" && !Number.isNaN(Date.parse(e.createdAt)))
  );

  const first = experimentList[0];
  const single = await get(`/api/experiments/${first.id}`);
  check("get by id returns 200", single.status === 200, single.body);
  check("version matches", single.body?.data?.version === first.version, {
    got: single.body?.data?.version,
  });

  const missing = await get("/api/experiments/does-not-exist");
  check("unknown id returns 404", missing.status === 404, missing.body);
  check("404 has structured code", missing.body?.error?.code === "EXPERIMENT_NOT_FOUND", missing.body);

  console.log("\nexperiment versioning");
  const updated = await put(`/api/experiments/${first.id}`, {
    ...first,
    name: `${first.name} (smoke test)`,
  });
  check("put returns 200", updated.status === 200, updated.body);
  check(
    "version incremented",
    updated.body?.data?.version === first.version + 1,
    { was: first.version, now: updated.body?.data?.version }
  );
  check("name persisted", updated.body?.data?.name?.endsWith("(smoke test)") === true);

  const versions = await get(`/api/experiments/${first.id}/versions`);
  check("version history lists 2+ revisions", (versions.body?.data?.length ?? 0) >= 2, versions.body);
  check(
    "history is newest-first",
    versions.body?.data?.[0]?.version === first.version + 1,
    versions.body?.data?.map((v: any) => v.version)
  );

  const published = await post(`/api/experiments/${first.id}/publish`);
  check("publish returns 200", published.status === 200, published.body);
  check("status is published", published.body?.data?.status === "published");

  const duplicated = await post(`/api/experiments/${first.id}/duplicate`);
  check("duplicate returns 200", duplicated.status === 200, duplicated.body);
  check("duplicate is a new id", duplicated.body?.data?.id !== first.id);
  check("duplicate is draft v1", duplicated.body?.data?.version === 1 && duplicated.body?.data?.status === "draft");

  const archived = await post(`/api/experiments/${first.id}/archive`);
  check("archive returns 200", archived.status === 200, archived.body);

  console.log("\nparticipants");
  const participants = await get("/api/participants");
  check("list returns 200", participants.status === 200, participants.body);
  const participantList = participants.body?.data ?? [];
  check("seeded 8 participants", participantList.length === 8, { got: participantList.length });
  const p0 = participantList[0];
  const pOne = await get(`/api/participants/${p0.id}`);
  check("get by id returns 200", pOne.status === 200, pOne.body);

  console.log("\ntrials");
  const allTrials = await get("/api/trials");
  check("list returns 200", allTrials.status === 200, allTrials.body);
  check("seeded 20 trials", (allTrials.body?.data?.length ?? 0) === 20, {
    got: allTrials.body?.data?.length,
  });
  check(
    "raw export includes trials without a valid flag",
    allTrials.body?.data?.some((t: any) => t.valid === null || t.valid === undefined)
  );

  const byExperiment = await get("/api/trials?experimentId=exp-color-response");
  check("filter by experiment works", (byExperiment.body?.data?.length ?? 0) > 0, byExperiment.body);
  check(
    "filter is respected",
    (byExperiment.body?.data ?? []).every((t: any) => t.experimentId === "exp-color-response")
  );

  console.log("\nanalytics (null-honesty)");
  const summary = await get("/api/analytics");
  check("summary returns 200", summary.status === 200, summary.body);
  const s = summary.body?.data;
  check("trial count is numeric", typeof s?.trialCount === "number", s?.trialCount);
  check("mean RT computed from real trials", typeof s?.averageReactionTimeMs === "number", s?.averageReactionTimeMs);
  check("median RT computed", typeof s?.medianReactionTimeMs === "number", s?.medianReactionTimeMs);
  check("stddev computed", typeof s?.stdDeviationMs === "number", s?.stdDeviationMs);
  check("4 stimulus types present", s?.stimulusBreakdown?.length === 4);
  check(
    "absent modalities report null, not 0",
    s?.stimulusBreakdown?.every((x: any) => (x.count === 0 ? x.avgRt === null : typeof x.avgRt === "number")),
    s?.stimulusBreakdown
  );
  check(
    "progression has no invented rows",
    s?.trialProgression?.every((p: any) => p.avgRt === null || typeof p.avgRt === "number"),
    s?.trialProgression?.length
  );
  check("8 histogram bins", s?.rtDistribution?.length === 8, s?.rtDistribution?.length);

  // A participant with no trials must yield nulls, never fabricated figures.
  const emptySummary = await get("/api/analytics?participantId=part-does-not-exist");
  const e = emptySummary.body?.data;
  check("empty scope reports 0 trials", e?.trialCount === 0, e?.trialCount);
  check("empty scope mean RT is null", e?.averageReactionTimeMs === null, e?.averageReactionTimeMs);
  check("empty scope accuracy is null", e?.accuracyPercent === null, e?.accuracyPercent);
  check("empty scope has no progression rows", e?.trialProgression?.length === 0, e?.trialProgression);

  const insights = await get("/api/analytics/insights");
  check("insights return 200", insights.status === 200, insights.body);
  check("insights is an array", Array.isArray(insights.body?.data), insights.body);
  check(
    "no insight invents a measurement",
    !(insights.body?.data ?? []).some((i: any) => /\b0 ms\b/.test(i.message ?? "")),
    insights.body?.data?.map((i: any) => i.message)
  );

  console.log("\nleaderboard");
  const leaderboard = await get("/api/leaderboard?metric=reactionTime");
  check("leaderboard returns 200", leaderboard.status === 200, leaderboard.body);
  const board = leaderboard.body?.data ?? [];
  check("all participants ranked", board.length === 8, { got: board.length });
  check("ranks are 1..n", board.every((e2: any, i: number) => e2.rank === i + 1), board.map((b: any) => b.rank));
  // Participants with no admissible trials hold a null average and are
  // expected to sort last, not to compare as 0 and lead the board.
  const measured = board.filter((b: any) => b.averageReactionTimeMs !== null);
  const unmeasured = board.filter((b: any) => b.averageReactionTimeMs === null);
  check(
    "measured participants sort ascending by reaction time",
    measured.every(
      (e2: any, i: number) => i === 0 || measured[i - 1].averageReactionTimeMs <= e2.averageReactionTimeMs
    ),
    measured.map((b: any) => b.averageReactionTimeMs)
  );
  check(
    "participants with no data sort last",
    board.slice(measured.length).every((b: any) => b.averageReactionTimeMs === null),
    { measured: measured.length, unmeasured: unmeasured.length }
  );
  check(
    "unmeasured participants report zero trials",
    unmeasured.every((b: any) => b.completedTrials === 0),
    unmeasured.map((b: any) => ({ id: b.participantId, n: b.completedTrials }))
  );
  check(
    "no invented per-modality RTs",
    board.every((e2: any) => typeof e2.textRt === "number" || e2.textRt === null),
    board.slice(0, 2)
  );

  const byAccuracy = await get("/api/leaderboard?metric=accuracy");
  check("accuracy metric works", byAccuracy.status === 200, byAccuracy.body);
  const accBoard = (byAccuracy.body?.data ?? []).filter((b: any) => b.accuracyPercent !== null);
  check(
    "sorted descending by accuracy",
    accBoard.every(
      (e2: any, i: number) => i === 0 || accBoard[i - 1].accuracyPercent >= e2.accuracyPercent
    ),
    accBoard.map((b: any) => b.accuracyPercent)
  );

  console.log("\ntrial batch write");
  const batch = await post("/api/trials/batch", {
    participantName: "Smoke Test Subject",
    trials: [
      {
        id: "client-generated-id-should-be-ignored",
        participantId: "client-generated-should-be-ignored",
        experimentId: first.id,
        trialNumber: 1,
        stimulusType: "text",
        stimulus: { prompt: "smoke", text: "RED" },
        response: { selectedAnswer: "RED", inputMethod: "keyboard" },
        correct: true,
        reactionTimeMs: 410,
        startedAt: new Date(Date.now() - 1000).toISOString(),
        respondedAt: new Date().toISOString(),
        valid: true,
        onsetSource: "raf-timestamp",
      },
      {
        id: "also-ignored",
        participantId: "also-ignored",
        experimentId: first.id,
        trialNumber: 2,
        stimulusType: "color",
        stimulus: { prompt: "smoke", text: "BLUE", color: "#3B82F6" },
        response: { selectedAnswer: "RED", inputMethod: "keyboard" },
        correct: false,
        reactionTimeMs: 120,
        startedAt: new Date(Date.now() - 900).toISOString(),
        respondedAt: new Date(Date.now() - 780).toISOString(),
        valid: false,
        rejection: "premature",
        rejectionDetail: "Response preceded stimulus onset",
        onsetSource: "raf-timestamp",
      },
    ],
  });
  check("batch returns 201", batch.status === 201, batch.body);
  check("server allocated a participant id", typeof batch.body?.data?.participant?.id === "string");
  check(
    "server id overrides the client-supplied one",
    !batch.body?.data?.participant?.id?.includes("should-be-ignored")
  );
  check("2 trials stored", (batch.body?.data?.trials?.length ?? 0) === 2, batch.body?.data?.trials?.length);

  const newParticipantId = batch.body?.data?.participant?.id;
  const newTrials = batch.body?.data?.trials ?? [];
  check(
    "rejected trial kept for audit",
    newTrials.some((t: any) => t.valid === false && t.rejection === "premature")
  );
  check(
    "rejection detail retained",
    newTrials.find((t: any) => t.valid === false)?.rejectionDetail?.includes("preceded") === true
  );

  // The premature 120ms press must not contaminate the participant's headline.
  const newParticipant = await get(`/api/participants/${newParticipantId}`);
  check("participant avg excludes the rejected press", newParticipant.body?.data?.avgReactionTimeMs === 410, {
    got: newParticipant.body?.data?.avgReactionTimeMs,
  });
  check("accuracy is over admissible trials only", newParticipant.body?.data?.accuracyPercent === 100, {
    got: newParticipant.body?.data?.accuracyPercent,
  });
  check("totalTrials counts every trial", newParticipant.body?.data?.totalTrials === 2, {
    got: newParticipant.body?.data?.totalTrials,
  });
  check("exclusion is noted", newParticipant.body?.data?.notes?.includes("excluded") === true);

  // The aggregate for that participant must also exclude the 120ms sample.
  const pSummary = await get(`/api/analytics?participantId=${newParticipantId}`);
  check("analytics mean excludes rejected", pSummary.body?.data?.averageReactionTimeMs === 410, {
    got: pSummary.body?.data?.averageReactionTimeMs,
  });
  check("analytics accuracy excludes rejected", pSummary.body?.data?.accuracyPercent === 100);
  check("analytics counts 1 admissible trial", pSummary.body?.data?.trialCount === 1, {
    got: pSummary.body?.data?.trialCount,
  });

  console.log("\nwrite validation");
  const emptyBatch = await post("/api/trials/batch", { participantName: "x", trials: [] });
  check("empty batch rejected with 400", emptyBatch.status === 400, emptyBatch.body);
  check("empty batch has a code", emptyBatch.body?.error?.code === "VALIDATION_ERROR", emptyBatch.body);

  const badExperiment = await post("/api/trials/batch", {
    participantName: "x",
    trials: [
      {
        id: "x",
        participantId: "x",
        experimentId: "no-such-experiment",
        trialNumber: 1,
        stimulusType: "text",
        stimulus: {},
        response: { selectedAnswer: "a", inputMethod: "keyboard" },
        correct: true,
        reactionTimeMs: 300,
        startedAt: new Date().toISOString(),
        respondedAt: new Date().toISOString(),
      },
    ],
  });
  check("unknown experiment returns 404", badExperiment.status === 404, badExperiment.body);
  check("unknown experiment has a code", badExperiment.body?.error?.code === "EXPERIMENT_NOT_FOUND", badExperiment.body);

  const badExperimentSave = await put(`/api/experiments/${first.id}`, { id: first.id, name: "" });
  check("invalid experiment rejected with 400", badExperimentSave.status === 400, badExperimentSave.body);

  const mismatchedId = await put(`/api/experiments/${first.id}`, { ...first, id: "different-id" });
  check("id mismatch rejected with 400", mismatchedId.status === 400, mismatchedId.body);
  check("id mismatch has a code", mismatchedId.body?.error?.code === "ID_MISMATCH", mismatchedId.body);

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("\nSmoke test crashed:", error);
  process.exit(1);
});
