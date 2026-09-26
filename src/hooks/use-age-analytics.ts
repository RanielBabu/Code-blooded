"use client";

import { useState, useEffect, useCallback } from "react";
import { AgeAnalyticsData } from "@/types/participant";
import { analyticsService } from "@/lib/api/services/analytics-service";

interface AgeAnalyticsFilter {
  experimentId?: string;
  sex?: string;
  stimulusType?: string;
  ageGroup?: string;
}

export function useAgeAnalytics(filters?: AgeAnalyticsFilter) {
  const [data, setData] = useState<AgeAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgeAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await analyticsService.getAgeAnalytics(filters);
      setData(res);
    } catch (err: any) {
      setError(err?.message || "Failed to load age cohort analytics");
    } finally {
      setLoading(false);
    }
  }, [filters?.experimentId, filters?.sex, filters?.stimulusType, filters?.ageGroup]);

  useEffect(() => {
    fetchAgeAnalytics();
  }, [fetchAgeAnalytics]);

  return {
    data,
    loading,
    error,
    refetch: fetchAgeAnalytics,
  };
}
