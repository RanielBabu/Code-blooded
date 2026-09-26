"use client";

import { useMemo } from "react";
import { Experiment } from "@/types/experiment";
import { experimentService } from "@/lib/api/services/experiment-service";
import { createAsyncStore, useAsyncStore } from "@/lib/store/async-store";

export function useExperiments() {
  const store = useMemo(
    () => createAsyncStore<Experiment[]>([], () => experimentService.getAll()),
    []
  );

  const { data: experiments, loading, error, refresh, setData } = useAsyncStore(store);

  // Mutations write through the store rather than into component state, so the
  // list the table renders is the same list the fetcher writes into. Re-fetching
  // the whole collection to reflect one row we just saved would also make that
  // row flicker while the request was in flight.

  const saveExperiment = async (exp: Experiment) => {
    const saved = await experimentService.save(exp);
    setData((prev) => {
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
      setData((prev) => prev.map((e) => (e.id === id ? updated : e)));
    }
    return updated;
  };

  const unpublishExperiment = async (id: string) => {
    const updated = await experimentService.unpublish(id);
    if (updated) {
      setExperiments((prev) => prev.map((e) => (e.id === id ? updated : e)));
    }
    return updated;
  };

  const togglePublishExperiment = async (id: string, publish?: boolean) => {
    const updated = await experimentService.togglePublish(id, publish);
    if (updated) {
      setExperiments((prev) => prev.map((e) => (e.id === id ? updated : e)));
    }
    return updated;
  };

  const archiveExperiment = async (id: string) => {
    const updated = await experimentService.archive(id);
    if (updated) {
      setData((prev) => prev.map((e) => (e.id === id ? updated : e)));
    }
    return updated;
  };

  const duplicateExperiment = async (id: string) => {
    const dup = await experimentService.duplicate(id);
    if (dup) {
      setData((prev) => [dup, ...prev]);
    }
    return dup;
  };

  return {
    experiments,
    loading,
    error,
    refresh,
    saveExperiment,
    publishExperiment,
    unpublishExperiment,
    togglePublishExperiment,
    archiveExperiment,
    duplicateExperiment,
  };
}
