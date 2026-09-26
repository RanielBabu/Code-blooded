import { LeaderboardEntry } from "@/types/participant";
import { apiRequest } from "../client";
import { mockStore } from "@/lib/mock/mock-storage";

export const leaderboardService = {
  async getLeaderboard(
    metric: "reactionTime" | "accuracy" | "consistency" = "reactionTime",
    experimentId?: string
  ): Promise<LeaderboardEntry[]> {
    const res = await apiRequest<LeaderboardEntry[]>(
      `/api/leaderboard?metric=${metric}${experimentId ? `&experimentId=${experimentId}` : ""}`,
      { method: "GET" },
      () => mockStore.getLeaderboard(metric)
    );
    return res.data;
  },
};
