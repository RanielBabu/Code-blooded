"use client";

import { useMemo } from "react";
import { AgeAnalyticsData } from "@/types/participant";
import { analyticsService } from "@/lib/api/services/analytics-service";
import { createAsyncStore, useAsyncStore } from "@/lib/store/async-store";

interface AgeAnalyticsFilter {
  experimentId?: string;
  sex?: string;
  stimulusType?: string;
  ageGroup?: string;
}

export function useAgeAnalytics(filters?: AgeAnalyticsFilter) {
  // Cohort filters are edited freely, so the store is keyed on the individual
  // filter values. Changing a filter builds a new store, and the previous
  // store's in-flight request can no longer commit -- otherwise a slow response
  // for the previous cohort would be charted under the new label.
  const store = useMemo(
    () =>
      createAsyncStore<AgeAnalyticsData | null>(
        null,
        () =>
          analyticsService.getAgeAnalytics({
            experimentId: filters?.experimentId,
            sex: filters?.sex,
            stimulusType: filters?.stimulusType,
            ageGroup: filters?.ageGroup,
          })
      ),
    [filters?.experimentId, filters?.sex, filters?.stimulusType, filters?.ageGroup]
  );

  const { data, loading, error, refresh: refetch } = useAsyncStore(store);

  return { data, loading, error, refetch };
}
