"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/lib/auth/auth-context";
import { useParticipantPersonal } from "@/hooks/use-participant-personal";
import {
  Timer,
  Zap,
  Target,
  Activity,
  Layers,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  TrendingDown,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export default function ParticipantPerformancePage() {
  const { user } = useAuth();
  const { data, loading } = useParticipantPersonal(user?.id);
  const [selectedStimulus, setSelectedStimulus] = useState<string>("all");

  const trials = data?.trials ?? [];
  const filteredTrials =
    selectedStimulus === "all"
      ? trials
      : trials.filter((t) => t.stimulusType === selectedStimulus);

  // Calculate first half vs second half RT for fatigue analysis
  const half = Math.floor(filteredTrials.length / 2);
  const firstHalf = filteredTrials.slice(0, half);
  const secondHalf = filteredTrials.slice(half);

  const avgFirstHalf =
    firstHalf.length > 0
      ? Math.round(firstHalf.reduce((sum, t) => sum + t.reactionTimeMs, 0) / firstHalf.length)
      : 0;
  const avgSecondHalf =
    secondHalf.length > 0
      ? Math.round(secondHalf.reduce((sum, t) => sum + t.reactionTimeMs, 0) / secondHalf.length)
      : 0;
  const fatigueDelta = avgSecondHalf - avgFirstHalf;

  // Breakdown by stimulus
  const stimulusTypes = ["color", "text", "image", "mixed"] as const;
  const stimulusBreakdown = stimulusTypes.map((type) => {
    const subset = trials.filter((t) => t.stimulusType === type);
    const count = subset.length;
    const avgRt =
      count > 0 ? Math.round(subset.reduce((a, b) => a + b.reactionTimeMs, 0) / count) : 0;
    const correctCount = subset.filter((t) => t.correct).length;
    const accuracy = count > 0 ? Math.round((correctCount / count) * 100) : 0;
    return { type, count, avgRt, accuracy };
  });

  return (
    <RouteGuard allowedRole="participant">
      <DashboardLayout
        title="My Performance Analytics"
        subtitle="In-depth analysis of your cognitive processing speed, stimulus reaction, and fatigue curves"
        actions={
          <Link
            href="/participant/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs border border-white/10 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        }
      >
        {/* Top Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#0D111A] border border-white/[0.08]">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#697386]">Median Latency</p>
            <p className="text-2xl font-bold font-mono text-white mt-1">
              {loading ? "..." : `${data?.medianReactionTimeMs ?? 0} ms`}
            </p>
            <p className="text-[11px] text-[#A5ADBD] mt-1">
              Fastest: <span className="text-[#38BDF8] font-mono">{data?.fastestReactionTimeMs ?? 0} ms</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0D111A] border border-white/[0.08]">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#697386]">Accuracy Rate</p>
            <p className="text-2xl font-bold font-mono text-white mt-1">
              {loading ? "..." : `${data?.accuracyPercent ?? 0}%`}
            </p>
            <p className="text-[11px] text-[#22C55E] mt-1 flex items-center gap-1">
              High precision response
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0D111A] border border-white/[0.08]">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#697386]">Consistency Rating</p>
            <p className="text-2xl font-bold font-mono text-white mt-1">
              {loading ? "..." : `${data?.consistencyScore ?? 0}/100`}
            </p>
            <p className="text-[11px] text-[#A5ADBD] mt-1">
              Latency standard deviation metric
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0D111A] border border-white/[0.08]">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#697386]">Fatigue Delta (Δ)</p>
            <p className="text-2xl font-bold font-mono text-white mt-1">
              {fatigueDelta > 0 ? `+${fatigueDelta} ms` : `${fatigueDelta} ms`}
            </p>
            <p className="text-[11px] text-[#A5ADBD] mt-1">
              {fatigueDelta > 15
                ? "Slight fatigue in later trials"
                : fatigueDelta < -15
                ? "Practiced speed-up observed"
                : "Steady performance throughout"}
            </p>
          </div>
        </div>

        {/* Reaction Time Curve by Trial */}
        <div className="rounded-2xl bg-[#0A0D14] border border-white/10 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#38BDF8]" />
                Reaction Time Progression by Trial
              </h3>
              <p className="text-xs text-[#A5ADBD]">
                Visualizing ms latency across each individual trial in chronological order
              </p>
            </div>

            {/* Stimulus Filter */}
            <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-lg border border-white/10 text-xs">
              {["all", "color", "text", "image"].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStimulus(st)}
                  className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                    selectedStimulus === st
                      ? "bg-[#4F8CFF] text-white"
                      : "text-[#A5ADBD] hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Latency Chart */}
          <div className="h-64 w-full relative">
            {filteredTrials.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[#697386] text-xs">
                No trials available for the selected filter.
              </div>
            ) : (
              <div className="h-full flex flex-col justify-between">
                <div className="flex-1 flex items-end gap-1.5 sm:gap-2 pt-6 pb-2 border-b border-white/10">
                  {filteredTrials.map((t, idx) => {
                    const maxRt = 650;
                    const minRt = 150;
                    const heightPercent = Math.min(
                      100,
                      Math.max(15, ((t.reactionTimeMs - minRt) / (maxRt - minRt)) * 100)
                    );
                    const isFastest = t.reactionTimeMs === data?.fastestReactionTimeMs;

                    return (
                      <div
                        key={t.id || idx}
                        className="flex-1 flex flex-col items-center group relative h-full justify-end"
                      >
                        {/* Hover Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 pointer-events-none bg-[#141A26] border border-white/20 rounded-md px-2 py-1 shadow-lg text-[10px] font-mono whitespace-nowrap text-white">
                          <div>Trial #{idx + 1}</div>
                          <div className="text-[#38BDF8] font-bold">{t.reactionTimeMs} ms</div>
                          <div className="text-[#A5ADBD] capitalize">{t.stimulusType} · {t.correct ? "Correct" : "Error"}</div>
                        </div>

                        {/* Bar */}
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t transition-all ${
                            isFastest
                              ? "bg-gradient-to-t from-[#38BDF8] to-[#60A5FA] shadow-[0_0_12px_rgba(56,189,248,0.5)]"
                              : t.correct
                              ? "bg-gradient-to-t from-[#4F8CFF]/60 to-[#4F8CFF] group-hover:from-[#4F8CFF] group-hover:to-[#60A5FA]"
                              : "bg-[#EF4444]/60 group-hover:bg-[#EF4444]"
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono text-[#697386] pt-2">
                  <span>Trial #1</span>
                  <span>Trial #{filteredTrials.length}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stimulus Breakdown Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stimulusBreakdown.map((item) => (
            <div
              key={item.type}
              className="p-4 rounded-xl bg-[#0D111A] border border-white/[0.08] hover:border-white/20 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-white">
                  {item.type} Stimulus
                </span>
                <span className="text-[10px] font-mono text-[#A5ADBD]">
                  {item.count} trials
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#A5ADBD]">Average RT:</span>
                  <span className="font-mono font-bold text-white">
                    {item.avgRt > 0 ? `${item.avgRt} ms` : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#A5ADBD]">Accuracy:</span>
                  <span className="font-mono font-bold text-[#10B981]">
                    {item.count > 0 ? `${item.accuracy}%` : "—"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}
