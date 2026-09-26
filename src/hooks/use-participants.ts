"use client";

import { useMemo } from "react";
import { Participant } from "@/types/participant";
import { participantService } from "@/lib/api/services/participant-service";
import { createAsyncStore, useAsyncStore } from "@/lib/store/async-store";

export function useParticipants() {
  // The store is the single source of truth for the cohort. It is created once
  // per hook instance, so mounting the page fetches fresh -- and a slow response
  // that arrives after a newer request began is discarded by the store's
  // generation guard rather than overwriting the current cohort.
  const store = useMemo(
    () => createAsyncStore<Participant[]>([], () => participantService.getAll()),
    []
  );

  const { data: participants, loading, error, refresh } = useAsyncStore(store);

  return { participants, loading, error, refresh };
}
