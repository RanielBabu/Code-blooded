"use client";

import { useState, useEffect, useCallback } from "react";
import { Experiment } from "@/types/experiment";
import { experimentService } from "@/lib/api/services/experiment-service";

export function useExperiments() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExperiments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await experimentService.getAll();
      setExperiments(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load experiments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExperiments();
  }, [fetchExperiments]);

  const saveExperiment = async (exp: Experiment) => {
    const saved = await experimentService.save(exp);
    setExperiments((prev) => {
      const idx = prev.findIndex((e) => e.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    return saved;
  };

  const publishExperiment = async (id: string) => {
    const updated = await experimentService.publish(id);
    if (updated) {
      setExperiments((prev) => prev.map((e) => (e.id === id ? updated : e)));
    }
    return updated;
  };

  const archiveExperiment = async (id: string) => {
    const updated = await experimentService.archive(id);
    if (updated) {
      setExperiments((prev) => prev.map((e) => (e.id === id ? updated : e)));
    }
    return updated;
  };

  const duplicateExperiment = async (id: string) => {
    const dup = await experimentService.duplicate(id);
    if (dup) {
      setExperiments((prev) => [dup, ...prev]);
    }
    return dup;
  };

  return {
    experiments,
    loading,
    error,
    refresh: fetchExperiments,
    saveExperiment,
    publishExperiment,
    archiveExperiment,
    duplicateExperiment,
  };
}
