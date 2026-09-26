"use client";

import { useState, useEffect, useCallback } from "react";
import { ParticipantPersonalSummary } from "@/types/participant";
import { participantService } from "@/lib/api/services/participant-service";

export function useParticipantPersonal(participantId?: string) {
  const [data, setData] = useState<ParticipantPersonalSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPersonalData = useCallback(async () => {
    if (!participantId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await participantService.getPersonalSummary(participantId);
      setData(res);
    } catch (err: any) {
      setError(err?.message || "Failed to load personal participant records");
    } finally {
      setLoading(false);
    }
  }, [participantId]);

  useEffect(() => {
    fetchPersonalData();
  }, [fetchPersonalData]);

  return {
    data,
    loading,
    error,
    refetch: fetchPersonalData,
  };
}
