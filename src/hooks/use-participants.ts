"use client";

import { useState, useEffect, useCallback } from "react";
import { Participant } from "@/types/participant";
import { participantService } from "@/lib/api/services/participant-service";

export function useParticipants() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await participantService.getAll();
      setParticipants(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load participants");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  return { participants, loading, error, refresh: fetchParticipants };
}
