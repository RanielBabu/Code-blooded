import { getLeaderboard, type LeaderboardMetric } from "@/lib/db/queries/leaderboard";
import { ok, route } from "@/lib/api/http";

const METRICS: LeaderboardMetric[] = ["reactionTime", "accuracy", "consistency"];

export const GET = route(async (request: Request) => {
  const params = new URL(request.url).searchParams;

  const requested = params.get("metric") as LeaderboardMetric | null;
  const metric = requested && METRICS.includes(requested) ? requested : "reactionTime";

  return ok(await getLeaderboard(metric, params.get("experimentId") ?? undefined));
});
