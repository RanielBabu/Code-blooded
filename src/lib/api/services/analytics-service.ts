import { AnalyticsSummary, ResearchInsight, AgeAnalyticsData } from "@/types/participant";
import { apiRequest } from "../client";
import { mockStore } from "@/lib/mock/mock-storage";

export const analyticsService = {
  async getSummary(experimentId?: string, participantId?: string): Promise<AnalyticsSummary> {
    const query = new URLSearchParams();
    if (experimentId) query.set("experimentId", experimentId);
    if (participantId) query.set("participantId", participantId);

    const res = await apiRequest<AnalyticsSummary>(
      `/api/analytics?${query.toString()}`,
      { method: "GET" },
      () => mockStore.getAnalyticsSummary(experimentId, participantId)
    );
    return res.data;
  },

  async getInsights(experimentId?: string): Promise<ResearchInsight[]> {
    const res = await apiRequest<ResearchInsight[]>(
      `/api/analytics/insights${experimentId ? `?experimentId=${experimentId}` : ""}`,
      { method: "GET" },
      () => mockStore.getResearchInsights(experimentId)
    );
    return res.data;
  },

  async getAgeAnalytics(filters?: {
    experimentId?: string;
    sex?: string;
    stimulusType?: string;
    ageGroup?: string;
  }): Promise<AgeAnalyticsData> {
    const query = new URLSearchParams();
    if (filters?.experimentId) query.set("experimentId", filters.experimentId);
    if (filters?.sex) query.set("sex", filters.sex);
    if (filters?.stimulusType) query.set("stimulusType", filters.stimulusType);
    if (filters?.ageGroup) query.set("ageGroup", filters.ageGroup);

    const res = await apiRequest<AgeAnalyticsData>(
      `/api/analytics/age?${query.toString()}`,
      { method: "GET" },
      () => mockStore.getAgeAnalytics(filters)
    );
    return res.data;
  },
};
