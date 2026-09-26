import { listTrials } from "@/lib/db/queries/trials";
import { ok, readIntParam, route } from "@/lib/api/http";

export const GET = route(async (request: Request) => {
  const params = new URL(request.url).searchParams;

  const trials = await listTrials({
    experimentId: params.get("experimentId") ?? undefined,
    participantId: params.get("participantId") ?? undefined,
    stimulusType: params.get("stimulusType") ?? undefined,
    // Raw exports must include rejected samples; only aggregate consumers
    // should opt into the admissible subset.
    admissibleOnly: params.get("admissibleOnly") === "true",
    limit: readIntParam(params.get("limit")),
  });

  return ok(trials);
});
