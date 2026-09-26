"use client";

import { useMemo } from "react";
import { LeaderboardEntry } from "@/types/participant";
import { leaderboardService } from "@/lib/api/services/leaderboard-service";
import { createAsyncStore, useAsyncStore } from "@/lib/store/async-store";

export function useLeaderboard(
  metric: "reactionTime" | "accuracy" | "consistency" = "reactionTime",
  experimentId?: string
) {
  // A different metric or experiment is a different ranking, so it gets a
  // different store. The old store is discarded, which also discards any
  // in-flight request that would have delivered the previous ranking.
  const store = useMemo(
    () =>
      createAsyncStore<LeaderboardEntry[]>(
        [],
        () => leaderboardService.getLeaderboard(metric, experimentId)
      ),
    [metric, experimentId]
  );

  const { data: entries, loading, error, refresh } = useAsyncStore(store);

  return { entries, loading, error, refresh };
}
