"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ExperimentCanvas } from "@/components/builder/ExperimentCanvas";
import { experimentService } from "@/lib/api/services/experiment-service";
import { Experiment } from "@/types/experiment";
import { ToastProvider } from "@/components/ui/Toast";

function BuilderContent() {
  const searchParams = useSearchParams();
  const expId = searchParams.get("id");
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const exps = await experimentService.getAll();
        const target = (expId ? exps.find((e) => e.id === expId) : null) || exps[0];
        setExperiment(target);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [expId]);

  if (loading || !experiment) {
    return (
      <div className="h-screen w-screen bg-[#05060A] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#4F8CFF] border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-[#A5ADBD]">Initializing Graph Canvas...</span>
        </div>
      </div>
    );
  }

  return (
    <ExperimentCanvas
      initialExperiment={experiment}
      onSave={async (updated) => {
        return await experimentService.save(updated);
      }}
      onPublish={async (id) => {
        return await experimentService.publish(id);
      }}
    />
  );
}

export default function BuilderPage() {
  return (
    <ToastProvider>
      <Suspense
        fallback={
          <div className="h-screen w-screen bg-[#05060A] flex items-center justify-center text-white">
            <div className="w-8 h-8 rounded-full border-2 border-[#4F8CFF] border-t-transparent animate-spin" />
          </div>
        }
      >
        <BuilderContent />
      </Suspense>
    </ToastProvider>
  );
}
