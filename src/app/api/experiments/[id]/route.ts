import { getExperiment, saveExperiment } from "@/lib/db/queries/experiments";
import { fail, ok, route } from "@/lib/api/http";
import { ExperimentSchema } from "@/schemas/experiment.schema";

export const GET = route(async (_request: Request, ctx: RouteContext<"/api/experiments/[id]">) => {
  const { id } = await ctx.params;
  const experiment = await getExperiment(id);
  if (!experiment) {
    return fail(`Experiment "${id}" was not found.`, 404, "EXPERIMENT_NOT_FOUND");
  }
  return ok(experiment);
});

/**
 * Save an experiment, appending a new immutable revision.
 *
 * The incoming `version` is deliberately ignored when choosing the new version
 * number. Trusting the client's counter would let two concurrent saves claim
 * the same revision, and the unique index on (experiment_id, version) would
 * reject one of them; the server allocates the next number instead.
 */
export const PUT = route(async (request: Request, ctx: RouteContext<"/api/experiments/[id]">) => {
  const { id } = await ctx.params;
  const body = await request.json();

  const parsed = ExperimentSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Experiment payload failed validation.", 400, "VALIDATION_ERROR", parsed.error.issues);
  }

  const input = parsed.data;
  if (input.id !== id) {
    return fail("Experiment id in the payload does not match the URL.", 400, "ID_MISMATCH");
  }

  const saved = await saveExperiment({
    id,
    name: input.name,
    description: input.description,
    status: input.status,
    tags: input.tags,
    trialCount: input.trialCount,
    nodes: input.nodes,
    edges: input.edges,
    author: input.author,
  });

  return ok(saved);
});
