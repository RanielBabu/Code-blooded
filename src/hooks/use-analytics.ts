"use client";

import { useState, useEffect, useCallback } from "react";
import { AnalyticsSummary, ResearchInsight, TrialResult } from "@/types/participant";
import { analyticsService } from "@/lib/api/services/analytics-service";
import { trialService } from "@/lib/api/services/trial-service";

export function useAnalytics(experimentId?: string, participantId?: string) {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [insights, setInsights] = useState<ResearchInsight[]>([]);
  const [trials, setTrials] = useState<TrialResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [sum, ins, trs] = await Promise.all([
        analyticsService.getSummary(experimentId, participantId),
        analyticsService.getInsights(experimentId),
        trialService.getTrials({ experimentId, participantId }),
      ]);
      setSummary(sum);
      setInsights(ins);
      setTrials(trs);
    } catch (err: any) {
      setError(err?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [experimentId, participantId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { summary, insights, trials, loading, error, refresh: loadData };
}
