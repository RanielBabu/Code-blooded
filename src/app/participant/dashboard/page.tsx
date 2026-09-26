"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { formatClock } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";
import { useParticipantPersonal } from "@/hooks/use-participant-personal";
import { experimentService } from "@/lib/api/services/experiment-service";
import { Experiment } from "@/types/experiment";
import {
  Timer,
  Zap,
  Target,
  Activity,
  Award,
  FlaskConical,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Play,
  Layers,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export default function ParticipantDashboardPage() {
  const { user } = useAuth();
  const { data, loading } = useParticipantPersonal(user?.id);
  const [publishedGames, setPublishedGames] = useState<Experiment[]>([]);

  const fetchGames = useCallback(async () => {
    try {
      const games = await experimentService.getPublished();
      setPublishedGames(games);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchGames();
    const interval = setInterval(fetchGames, 2000);
    return () => clearInterval(interval);
  }, [fetchGames]);

  const pBests = data?.personalBests;

  return (
    <RouteGuard allowedRole="participant">
      <DashboardLayout
        title="Participant Dashboard"
        subtitle="Your private performance telemetry, reaction times, and active studies"
        actions={
          <Link
            href="/participant/experiments"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-xs font-semibold shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)] transition-all"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Browse Studies ({publishedGames.length})</span>
          </Link>
        }
      >
        {/* Welcome & Privacy Protection Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#10B981]/15 via-[#0A1628]/80 to-[#4F8CFF]/15 border border-white/10 p-6">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 text-[#34D399] text-[11px] font-mono font-medium">
                  <Lock className="w-3 h-3 text-[#10B981]" />
                  Private Participant Profile
                </span>
                <span className="text-xs text-[#A5ADBD] font-mono">
                  ID: {user?.id}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Welcome back, {user?.displayName}
              </h2>
              <p className="text-xs sm:text-sm text-[#A5ADBD] mt-1 max-w-2xl leading-relaxed">
                Age <span className="text-white font-semibold">{user?.age ?? "—"}</span> (Cohort{" "}
                <span className="text-[#34D399] font-mono font-semibold">{user?.ageGroup}</span>).
                Your behavioral reaction times are recorded with high-precision microsecond telemetry.
                Researchers only see anonymized aggregate metrics.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#10B981]/20 border border-[#10B981]/30 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#34D399]" />
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#697386]">Privacy Status</p>
                  <p className="text-xs font-semibold text-white">Full Anonymity</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Personal Metric KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl bg-[#0D111A] border border-white/[0.08] relative overflow-hidden group hover:border-[#10B981]/40 transition-all">
            <div className="flex items-center justify-between text-[#A5ADBD] mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider">Median RT</span>
              <Timer className="w-4 h-4 text-[#10B981]" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {loading ? "..." : `${data?.medianReactionTimeMs ?? 0} ms`}
            </div>
            <div className="text-[10px] text-[#A5ADBD] mt-1 flex items-center gap-1">
              <span>Average: {data?.avgReactionTimeMs ?? 0} ms</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0D111A] border border-white/[0.08] relative overflow-hidden group hover:border-[#38BDF8]/40 transition-all">
            <div className="flex items-center justify-between text-[#A5ADBD] mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider">Fastest RT</span>
              <Zap className="w-4 h-4 text-[#38BDF8]" />
            </div>
            <div className="text-2xl font-bold text-[#38BDF8] font-mono">
              {loading ? "..." : `${data?.fastestReactionTimeMs ?? 0} ms`}
            </div>
            <div className="text-[10px] text-[#A5ADBD] mt-1">
              Personal record
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0D111A] border border-white/[0.08] relative overflow-hidden group hover:border-[#F59E0B]/40 transition-all">
            <div className="flex items-center justify-between text-[#A5ADBD] mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider">Accuracy</span>
              <Target className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {loading ? "..." : `${data?.accuracyPercent ?? 0}%`}
            </div>
            <div className="text-[10px] text-[#A5ADBD] mt-1">
              Correct responses
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0D111A] border border-white/[0.08] relative overflow-hidden group hover:border-[#8B5CF6]/40 transition-all">
            <div className="flex items-center justify-between text-[#A5ADBD] mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider">Trials Completed</span>
              <Activity className="w-4 h-4 text-[#8B5CF6]" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {loading ? "..." : data?.totalTrials ?? 0}
            </div>
            <div className="text-[10px] text-[#A5ADBD] mt-1">
              Across all tasks
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0D111A] border border-white/[0.08] relative overflow-hidden group hover:border-[#EC4899]/40 transition-all">
            <div className="flex items-center justify-between text-[#A5ADBD] mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider">Consistency</span>
              <Sparkles className="w-4 h-4 text-[#EC4899]" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {loading ? "..." : `${data?.consistencyScore ?? 0}/100`}
            </div>
            <div className="text-[10px] text-[#A5ADBD] mt-1">
              Latency stability
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0D111A] border border-white/[0.08] relative overflow-hidden group hover:border-[#4F8CFF]/40 transition-all">
            <div className="flex items-center justify-between text-[#A5ADBD] mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider">Experiments</span>
              <FlaskConical className="w-4 h-4 text-[#4F8CFF]" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {loading ? "..." : data?.experimentsCompleted ?? 0}
            </div>
            <div className="text-[10px] text-[#A5ADBD] mt-1">
              Participated
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DESIRED PARTICIPANT STUDY LIBRARY CARDS (Reference Layout: 3 on row 1, 2 on row 2) */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Play className="w-4 h-4 text-[#10B981] fill-current" />
                Available Studies & Experiments
              </h3>
              <p className="text-xs text-[#A5ADBD]">
                Live protocols currently published by researchers. Choose a study to begin.
              </p>
            </div>
            <span className="text-xs font-mono text-[#697386]">
              {publishedGames.length} Active Studies
            </span>
          </div>

          {publishedGames.length === 0 ? (
            <div className="py-12 px-6 rounded-2xl bg-[#0A0D14] border border-white/10 text-center max-w-md mx-auto space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
              <p className="text-sm font-semibold text-white">No Studies Published Yet</p>
              <p className="text-xs text-[#A5ADBD]">
                Your researcher has not yet enabled any active games. Please check back shortly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedGames.map((study) => (
                <div
                  key={study.id}
                  className="rounded-2xl bg-[#0A0D14] border border-white/10 hover:border-[#10B981]/40 p-6 flex flex-col justify-between transition-all duration-200 group hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.15)] relative overflow-hidden"
                >
                  <div>
                    {/* Card Top: Published Badge & Version */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#34D399] text-[10px] font-mono font-medium tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                        PUBLISHED
                      </span>
                      <span className="text-[11px] font-mono text-[#697386] bg-white/[0.04] px-2 py-0.5 rounded border border-white/5">
                        v{study.version || 1}
                      </span>
                    </div>

                    {/* Large Simple Game Title */}
                    <h3 className="text-xl font-bold text-white group-hover:text-[#34D399] transition-colors mb-2">
                      {study.name}
                    </h3>

                    {/* Short Description */}
                    <p className="text-xs text-[#A5ADBD] leading-relaxed mb-6">
                      {study.description}
                    </p>
                  </div>

                  {/* Card Bottom: Metadata & Single Primary Action Button */}
                  <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-2">
                    <div className="text-[10px] font-mono text-[#697386]">
                      <div>Updated: {new Date(study.updatedAt || Date.now()).toLocaleDateString("en-GB")}</div>
                      <div className="flex items-center gap-1 text-[#A5ADBD] mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4F8CFF]" />
                        Live Version: {study.version || 1}
                      </div>
                    </div>

                    <Link
                      href={`/preview/${study.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:brightness-110 text-white text-xs font-semibold shadow-[0_0_15px_-3px_rgba(16,185,129,0.35)] transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play Study</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Section: Personal Trophies Snippet & Recent Trials */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* Personal Trophies Card */}
          <div className="rounded-2xl bg-[#0A0D14] border border-white/10 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#F59E0B]" />
                  <h3 className="text-sm font-bold text-white">Personal Trophies</h3>
                </div>
                <Link
                  href="/participant/personal-bests"
                  className="text-[11px] text-[#60A5FA] hover:underline flex items-center gap-1"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/15 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8]">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">Fastest Response</p>
                      <p className="text-[10px] text-[#A5ADBD] font-mono">
                        {pBests?.fastestRt?.taskName || "Reaction Speed"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#38BDF8]">
                    {pBests?.fastestRt?.value ?? 0} ms
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B]">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">Peak Accuracy</p>
                      <p className="text-[10px] text-[#A5ADBD] font-mono">Precision rate</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#F59E0B]">
                    {pBests?.bestAccuracy?.value ?? 100}%
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06]">
              <p className="text-[10px] text-[#697386] font-mono text-center">
                Tracked privately across your active sessions
              </p>
            </div>
          </div>

          {/* Recent Trial Breakdown */}
          <div className="lg:col-span-2 rounded-2xl bg-[#0A0D14] border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Recent Trial Latencies</h3>
                <p className="text-xs text-[#A5ADBD]">Your latest recorded behavioral trial responses</p>
              </div>
              <Link
                href="/participant/performance"
                className="text-xs text-[#60A5FA] hover:underline flex items-center gap-1"
              >
                Detailed Performance <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] text-[#697386] font-mono text-[10px] uppercase">
                  <th className="py-2.5 px-3">Trial ID</th>
                  <th className="py-2.5 px-3">Stimulus</th>
                  <th className="py-2.5 px-3">Reaction Time</th>
                  <th className="py-2.5 px-3">Outcome</th>
                  <th className="py-2.5 px-3">Key / Response</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {(data?.trials ?? []).slice(0, 6).map((trial, idx) => (
                  <tr key={trial.id || idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[#A5ADBD]">
                      #{idx + 1} ({trial.trialNumber})
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/[0.04] border border-white/10 text-white">
                        {trial.stimulusType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-white">
                      {trial.reactionTimeMs} ms
                    </td>
                    <td className="py-2.5 px-3">
                      {trial.correct ? (
                        <span className="inline-flex items-center gap-1 text-[#22C55E] text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[#EF4444] text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> Missed
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#A5ADBD]">
                      {trial.response?.selectedAnswer || "—"}
                    </td>
                    <td className="py-2.5 px-3 text-[#697386] font-mono text-[10px]">
                      {formatClock(trial.respondedAt ?? trial.startedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </DashboardLayout>
    </RouteGuard>
  );
}
