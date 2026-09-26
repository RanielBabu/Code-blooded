"use client";

import React from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/lib/auth/auth-context";
import {
  FlaskConical,
  PlayCircle,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export default function ParticipantExperimentsPage() {
  const { user } = useAuth();

  const studies = [
    {
      id: "exp-color-response",
      title: "Color Response & Inhibitory Latency Study",
      description:
        "Measures simple reaction time and motor inhibition latency to pure chromatic stimuli (Red, Green, Blue, Amber) and geometrical shapes.",
      category: "Visual Psychophysics",
      durationMinutes: 3,
      trials: 12,
      status: "active",
      completedBefore: true,
      lastScore: "264 ms",
    },
    {
      id: "exp-stroop-effect",
      title: "Stroop Semantic Congruency Protocol",
      description:
        "Evaluates cognitive flexibility and interference control when word meanings conflict with physical font colors.",
      category: "Cognitive Control",
      durationMinutes: 4,
      trials: 16,
      status: "active",
      completedBefore: false,
      lastScore: "—",
    },
    {
      id: "exp-n-back-memory",
      title: "2-Back Visual Working Memory Task",
      description:
        "Continuous memory workload test requiring participants to identify whether the current stimulus matches the one from 2 steps prior.",
      category: "Working Memory",
      durationMinutes: 5,
      trials: 20,
      status: "active",
      completedBefore: false,
      lastScore: "—",
    },
  ];

  return (
    <RouteGuard allowedRole="participant">
      <DashboardLayout
        title="My Experiments"
        subtitle="Active cognitive studies and behavioral protocols available for your participation"
      >
        <div className="grid grid-cols-1 gap-4">
          {studies.map((study) => (
            <div
              key={study.id}
              className="p-6 rounded-2xl bg-[#0A0D14] border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="cyan" size="sm">
                    {study.category}
                  </Badge>
                  <span className="text-[11px] font-mono text-[#A5ADBD] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> ~{study.durationMinutes} mins
                  </span>
                  <span className="text-[11px] font-mono text-[#A5ADBD] flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" /> {study.trials} trials
                  </span>
                  {study.completedBefore && (
                    <span className="text-[11px] font-mono text-[#34D399] flex items-center gap-1 bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/30">
                      <CheckCircle2 className="w-3 h-3 text-[#10B981]" /> Completed
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white">{study.title}</h3>
                <p className="text-xs text-[#A5ADBD] max-w-2xl leading-relaxed">
                  {study.description}
                </p>

                {study.completedBefore && (
                  <p className="text-[11px] text-[#697386] font-mono">
                    Previous session best:{" "}
                    <span className="text-[#38BDF8] font-bold">{study.lastScore}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href={`/preview/${study.id}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#10B981] to-[#059669] hover:brightness-110 text-white text-xs font-semibold shadow-[0_0_15px_-3px_rgba(16,185,129,0.35)] transition-all"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>{study.completedBefore ? "Retake Study" : "Start Study"}</span>
                </Link>
                {study.completedBefore && (
                  <Link
                    href={`/participant/results/${study.id}`}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs border border-white/10 transition-colors"
                  >
                    <span>View Results</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}
