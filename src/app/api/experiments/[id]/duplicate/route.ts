import { duplicateExperiment } from "@/lib/db/queries/experiments";
import { fail, ok, route } from "@/lib/api/http";

export const POST = route(async (_request: Request, ctx: RouteContext<"/api/experiments/[id]/duplicate">) => {
  const { id } = await ctx.params;
  const experiment = await duplicateExperiment(id);
  if (!experiment) {
    return fail(`Experiment "${id}" was not found.`, 404, "EXPERIMENT_NOT_FOUND");
  }
  return ok(experiment);
});
