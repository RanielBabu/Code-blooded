"use client";

import { useMemo } from "react";
import { ParticipantPersonalSummary } from "@/types/participant";
import { participantService } from "@/lib/api/services/participant-service";
import { createAsyncStore, useAsyncStore } from "@/lib/store/async-store";

export function useParticipantPersonal(participantId?: string) {
  const store = useMemo(
    () =>
      createAsyncStore<ParticipantPersonalSummary | null>(
        null,
        // No participant selected is not an error and not a pending request.
        // Resolving null leaves the store in `success` with no data, which the
        // page renders as an empty state rather than a spinner that never ends.
        () =>
          participantId
            ? participantService.getPersonalSummary(participantId)
            : Promise.resolve(null)
      ),
    [participantId]
  );

  const { data, loading, error, refresh: refetch } = useAsyncStore(store);

  return { data, loading, error, refetch };
}
