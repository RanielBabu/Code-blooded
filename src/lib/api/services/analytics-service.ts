import { AnalyticsSummary, ResearchInsight } from "@/types/participant";
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
};
