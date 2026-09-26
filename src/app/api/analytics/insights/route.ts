import { getResearchInsights } from "@/lib/db/queries/insights";
import { ok, route } from "@/lib/api/http";

export const GET = route(async (request: Request) => {
  const params = new URL(request.url).searchParams;

  const insights = await getResearchInsights({
    experimentId: params.get("experimentId") ?? undefined,
    participantId: params.get("participantId") ?? undefined,
  });

  return ok(insights);
});
