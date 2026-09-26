import { getAnalyticsSummary } from "@/lib/db/queries/analytics";
import { ok, route } from "@/lib/api/http";

export const GET = route(async (request: Request) => {
  const params = new URL(request.url).searchParams;

  const summary = await getAnalyticsSummary({
    experimentId: params.get("experimentId") ?? undefined,
    participantId: params.get("participantId") ?? undefined,
    stimulusType: params.get("stimulusType") ?? undefined,
  });

  return ok(summary);
});
