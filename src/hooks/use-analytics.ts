"use client";

import { useMemo } from "react";
import { AnalyticsSummary, ResearchInsight, TrialResult } from "@/types/participant";
import { analyticsService } from "@/lib/api/services/analytics-service";
import { trialService } from "@/lib/api/services/trial-service";
import { createAsyncStore, useAsyncStore } from "@/lib/store/async-store";

interface AnalyticsPayload {
  summary: AnalyticsSummary | null;
  insights: ResearchInsight[];
  trials: TrialResult[];
}

export function useAnalytics(experimentId?: string, participantId?: string) {
  // Summary, insights, and raw trials are fetched together and committed as one
  // unit. Committing them separately would let a chart render a summary beside
  // insights computed from a different set of trials.
  const store = useMemo(
    () =>
      createAsyncStore<AnalyticsPayload>(
        { summary: null, insights: [], trials: [] },
        async () => {
          const [summary, insights, trials] = await Promise.all([
            analyticsService.getSummary(experimentId, participantId),
            analyticsService.getInsights(experimentId),
            trialService.getTrials({ experimentId, participantId }),
          ]);
          return { summary, insights, trials };
        }
      ),
    [experimentId, participantId]
  );

  const {
    data: { summary, insights, trials },
    loading,
    error,
    refresh,
  } = useAsyncStore(store);

  return { summary, insights, trials, loading, error, refresh };
}
