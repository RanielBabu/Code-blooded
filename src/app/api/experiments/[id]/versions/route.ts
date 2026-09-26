import { listExperimentVersions } from "@/lib/db/queries/experiments";
import { ok, route } from "@/lib/api/http";

/** Revision history for an experiment, newest first. */
export const GET = route(async (_request: Request, ctx: RouteContext<"/api/experiments/[id]/versions">) => {
  const { id } = await ctx.params;
  return ok(await listExperimentVersions(id));
});
