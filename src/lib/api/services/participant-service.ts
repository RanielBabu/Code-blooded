import { Participant } from "@/types/participant";
import { apiRequest } from "../client";
import { mockStore } from "@/lib/mock/mock-storage";

export const participantService = {
  async getAll(): Promise<Participant[]> {
    const res = await apiRequest<Participant[]>("/api/participants", { method: "GET" }, () =>
      mockStore.getParticipants()
    );
    return res.data;
  },

  async getById(id: string): Promise<Participant | null> {
    const res = await apiRequest<Participant | null>(
      `/api/participants/${id}`,
      { method: "GET" },
      () => mockStore.getParticipantById(id) || null
    );
    return res.data;
  },
};
