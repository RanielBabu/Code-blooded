import { Experiment } from "@/types/experiment";
import { apiRequest } from "../client";
import { mockStore } from "@/lib/mock/mock-storage";

export const experimentService = {
  async getAll(): Promise<Experiment[]> {
    const res = await apiRequest<Experiment[]>("/api/experiments", { method: "GET" }, () =>
      mockStore.getExperiments()
    );
    return res.data;
  },

  async getPublished(): Promise<Experiment[]> {
    const res = await apiRequest<Experiment[]>("/api/experiments?status=published", { method: "GET" }, () =>
      mockStore.getPublishedExperiments()
    );
    return res.data;
  },

  async getById(id: string): Promise<Experiment | null> {
    const res = await apiRequest<Experiment | null>(
      `/api/experiments/${id}`,
      { method: "GET" },
      () => mockStore.getExperimentById(id) || null
    );
    return res.data;
  },

  async save(experiment: Experiment): Promise<Experiment> {
    const res = await apiRequest<Experiment>(
      `/api/experiments/${experiment.id}`,
      {
        method: "PUT",
        body: JSON.stringify(experiment),
      },
      () => mockStore.saveExperiment(experiment)
    );
    return res.data;
  },

  async publish(id: string): Promise<Experiment | null> {
    const res = await apiRequest<Experiment | null>(
      `/api/experiments/${id}/publish`,
      { method: "POST" },
      () => mockStore.updateExperimentStatus(id, "published")
    );
    return res.data;
  },

  async unpublish(id: string): Promise<Experiment | null> {
    const res = await apiRequest<Experiment | null>(
      `/api/experiments/${id}/unpublish`,
      { method: "POST" },
      () => mockStore.updateExperimentStatus(id, "disabled")
    );
    return res.data;
  },

  async togglePublish(id: string, publish?: boolean): Promise<Experiment | null> {
    const res = await apiRequest<Experiment | null>(
      `/api/experiments/${id}/toggle-publish`,
      { method: "POST" },
      () => mockStore.togglePublishExperiment(id, publish)
    );
    return res.data;
  },

  async archive(id: string): Promise<Experiment | null> {
    const res = await apiRequest<Experiment | null>(
      `/api/experiments/${id}/archive`,
      { method: "POST" },
      () => mockStore.updateExperimentStatus(id, "archived")
    );
    return res.data;
  },

  async duplicate(id: string): Promise<Experiment | null> {
    const res = await apiRequest<Experiment | null>(
      `/api/experiments/${id}/duplicate`,
      { method: "POST" },
      () => mockStore.duplicateExperiment(id)
    );
    return res.data;
  },
};
