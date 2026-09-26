"use client";

import { useState, useEffect, useCallback } from "react";
import { LeaderboardEntry } from "@/types/participant";
import { leaderboardService } from "@/lib/api/services/leaderboard-service";

export function useLeaderboard(
  metric: "reactionTime" | "accuracy" | "consistency" = "reactionTime",
  experimentId?: string
) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await leaderboardService.getLeaderboard(metric, experimentId);
      setEntries(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }, [metric, experimentId]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { entries, loading, error, refresh: fetchLeaderboard };
}
