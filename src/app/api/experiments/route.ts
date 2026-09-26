import { listExperiments } from "@/lib/db/queries/experiments";
import { ok, route } from "@/lib/api/http";

export const GET = route(async () => {
  return ok(await listExperiments());
});
