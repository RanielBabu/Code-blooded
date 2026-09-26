"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ChartCard } from "@/components/ui/ChartCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PodiumCards } from "@/components/leaderboard/PodiumCards";
import { ComparisonModule } from "@/components/leaderboard/ComparisonModule";
import { ReactionTimeLineChart } from "@/components/visualizations/ReactionTimeLineChart";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { useParticipants } from "@/hooks/use-participants";
import { useAnalytics } from "@/hooks/use-analytics";
import { formatMs, formatPercent } from "@/lib/utils";
import {
  Trophy,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  Clock,
  Target,
  Award,
  ArrowRight,
} from "lucide-react";

export default function LeaderboardPage() {
  const [metric, setMetric] = useState<"reactionTime" | "accuracy" | "consistency">("reactionTime");
  const { entries, loading } = useLeaderboard(metric);
  const { participants } = useParticipants();
  const { summary } = useAnalytics("exp-color-response");

  return (
    <DashboardLayout
      title="Performance Benchmark Leaderboard"
      subtitle="Comparative cognitive latency and accuracy across standardized experimental conditions"
    >
      {/* Scientific Context Disclaimer Banner */}
      <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-[#A5ADBD] flex items-start gap-3">
        <Info className="w-4 h-4 text-[#4F8CFF] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white">Methodological Note: </strong>
          Rankings are calibrated strictly against the active benchmark task (Color Response & Stroop
          Interference) under controlled experimental display conditions. These measurements reflect
          task-specific psychomotor latency and do not constitute an evaluation of general cognitive ability.
        </div>
      </div>

      {/* Metric Selector Toolbar */}
      <GlassPanel className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#697386] uppercase">Ranking Metric:</span>
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setMetric("reactionTime")}
              className={`px-3 py-1 text-xs font-mono rounded-md transition-colors ${
                metric === "reactionTime"
                  ? "bg-[#4F8CFF] text-white font-semibold"
                  : "text-[#A5ADBD] hover:text-white"
              }`}
            >
              Mean Latency (Fastest RT)
            </button>
            <button
              onClick={() => setMetric("accuracy")}
              className={`px-3 py-1 text-xs font-mono rounded-md transition-colors ${
                metric === "accuracy"
                  ? "bg-[#22C55E] text-white font-semibold"
                  : "text-[#A5ADBD] hover:text-white"
              }`}
            >
              Accuracy (%)
            </button>
            <button
              onClick={() => setMetric("consistency")}
              className={`px-3 py-1 text-xs font-mono rounded-md transition-colors ${
                metric === "consistency"
                  ? "bg-[#8B5CF6] text-white font-semibold"
                  : "text-[#A5ADBD] hover:text-white"
              }`}
            >
              Consistency Index
            </button>
          </div>
        </div>

        <div className="text-xs font-mono text-[#A5ADBD]">
          Active Task: <strong className="text-white">Color Response Study (10 Trials)</strong>
        </div>
      </GlassPanel>

      {/* 1. TOP 3 PODIUM DISPLAY */}
      <PodiumCards entries={entries} />

      {/* 2. USER PERFORMANCE GRAPH (Crypto-Dashboard Style with Stimulus Lines) */}
      <ChartCard
        title="Multi-Stimulus Reaction Time Progression"
        subtitle="Tracking reaction time across trial progression for Text, Color, and Image stimulus modalities"
      >
        <ReactionTimeLineChart
          data={summary?.trialProgression || []}
          showStimulusToggles={true}
          benchmarkLine={412}
        />
      </ChartCard>

      {/* 3. MULTI-PARTICIPANT COMPARISON MODULE */}
      <ComparisonModule participants={participants} />

      {/* 4. FULL LEADERBOARD DATA TABLE */}
      <GlassPanel className="p-0 overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#4F8CFF]" />
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Cohort Benchmark Standings
            </h3>
          </div>
          <span className="text-xs font-mono text-[#697386]">
            {entries.length} Verified Participants
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#0A0D14] border-b border-white/10 text-[#697386] font-mono uppercase">
              <tr>
                <th className="py-3 px-4 font-normal">Rank</th>
                <th className="py-3 px-4 font-normal">Participant</th>
                <th className="py-3 px-4 font-normal">Mean Reaction Time</th>
                <th className="py-3 px-4 font-normal">Accuracy</th>
                <th className="py-3 px-4 font-normal">Consistency</th>
                <th className="py-3 px-4 font-normal">Completed Trials</th>
                <th className="py-3 px-4 font-normal">Trend</th>
                <th className="py-3 px-4 font-normal text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {entries.map((entry) => (
                <tr key={entry.participantId} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                        entry.rank === 1
                          ? "bg-[#4F8CFF] text-[#05060A]"
                          : entry.rank === 2
                          ? "bg-[#8B5CF6]/30 text-[#A78BFA]"
                          : entry.rank === 3
                          ? "bg-[#22D3EE]/30 text-[#22D3EE]"
                          : "text-[#697386]"
                      }`}
                    >
                      #{entry.rank}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-white font-sans">
                    <Link
                      href={`/participants/${entry.participantId}`}
                      className="hover:text-[#4F8CFF] transition-colors"
                    >
                      {entry.displayName}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-[#4F8CFF] font-bold text-sm">
                    {formatMs(entry.averageReactionTimeMs)}
                  </td>
                  <td className="py-3.5 px-4 text-[#22C55E] font-semibold text-sm">
                    {formatPercent(entry.accuracyPercent)}
                  </td>
                  <td className="py-3.5 px-4 text-[#8B5CF6]">
                    {entry.consistencyScore}
                  </td>
                  <td className="py-3.5 px-4 text-[#A5ADBD]">
                    {entry.completedTrials}
                  </td>
                  <td className="py-3.5 px-4">
                    {entry.trend === "up" && (
                      <span className="flex items-center gap-1 text-[#22C55E]">
                        <TrendingUp className="w-3.5 h-3.5" /> Fast
                      </span>
                    )}
                    {entry.trend === "down" && (
                      <span className="flex items-center gap-1 text-[#EF4444]">
                        <TrendingDown className="w-3.5 h-3.5" /> High RT
                      </span>
                    )}
                    {entry.trend === "neutral" && (
                      <span className="flex items-center gap-1 text-[#A5ADBD]">
                        <Minus className="w-3.5 h-3.5" /> Steady
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link href={`/participants/${entry.participantId}`}>
                      <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </DashboardLayout>
  );
}
