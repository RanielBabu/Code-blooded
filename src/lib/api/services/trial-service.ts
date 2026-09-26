import { TrialResult, Participant } from "@/types/participant";
import { apiRequest } from "../client";
import { mockStore } from "@/lib/mock/mock-storage";

export const trialService = {
  async getTrials(filter?: {
    experimentId?: string;
    participantId?: string;
    stimulusType?: string;
  }): Promise<TrialResult[]> {
    const query = new URLSearchParams();
    if (filter?.experimentId) query.set("experimentId", filter.experimentId);
    if (filter?.participantId) query.set("participantId", filter.participantId);
    if (filter?.stimulusType) query.set("stimulusType", filter.stimulusType);

    const res = await apiRequest<TrialResult[]>(
      `/api/trials?${query.toString()}`,
      { method: "GET" },
      () => mockStore.getTrials(filter)
    );
    return res.data;
  },

  async submitTrialRun(
    participantName: string,
    trials: TrialResult[]
  ): Promise<{ participant: Participant; trials: TrialResult[] }> {
    const res = await apiRequest<{ participant: Participant; trials: TrialResult[] }>(
      "/api/trials/batch",
      {
        method: "POST",
        body: JSON.stringify({ participantName, trials }),
      },
      () => mockStore.recordTrialRun(participantName, trials)
    );
    return res.data;
  },
};
