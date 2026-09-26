"use client";

import React, { useEffect, useState, use } from "react";
import { ParticipantRuntime } from "@/components/runtime/ParticipantRuntime";
import { experimentService } from "@/lib/api/services/experiment-service";
import { Experiment } from "@/types/experiment";

export default function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const exp = await experimentService.getById(resolvedParams.id);
        if (exp) {
          setExperiment(exp);
        } else {
          const all = await experimentService.getAll();
          setExperiment(all[0]);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [resolvedParams.id]);

  if (loading || !experiment) {
    return (
      <div className="min-h-screen bg-[#05060A] flex items-center justify-center text-white font-mono text-xs">
        Loading Preview Environment...
      </div>
    );
  }

  return <ParticipantRuntime experiment={experiment} isPreview={true} />;
}
