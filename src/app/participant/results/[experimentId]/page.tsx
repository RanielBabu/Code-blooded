"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { formatTimestamp } from "@/lib/utils";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/lib/auth/auth-context";
import { useParticipantPersonal } from "@/hooks/use-participant-personal";
import {
  Timer,
  Zap,
  Target,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Download,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export default function ParticipantExperimentResultPage() {
  const params = useParams();
  const experimentId = params?.experimentId as string;
  const { user } = useAuth();
  const { data, loading } = useParticipantPersonal(user?.id);

  const trials = (data?.trials ?? []).filter(
    (t) => !experimentId || t.experimentId === experimentId || experimentId === "exp-color-response"
  );

  const experimentName =
    experimentId === "exp-color-response"
      ? "Color Response & Inhibitory Latency Study"
      : "Cognitive Experiment Session";

  const exportResults = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Trial,Stimulus,ReactionTimeMs,Correct,UserResponse,Timestamp"]
        .concat(
          trials.map(
            (t) =>
              `${t.trialNumber},${t.stimulusType},${t.reactionTimeMs},${t.correct},${
                t.response?.selectedAnswer || ""
              },${t.respondedAt || t.startedAt || ""}`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `my_trials_${experimentId || "session"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <RouteGuard allowedRole="participant">
      <DashboardLayout
        title="Session Trial Results"
        subtitle={`Trial-by-trial behavioral report for ${experimentName}`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={exportResults}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs border border-white/10 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <Link
              href={`/preview/${experimentId || "exp-color-response"}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Study</span>
            </Link>
          </div>
        }
      >
        {/* Back Link */}
        <div>
          <Link
            href="/participant/experiments"
            className="inline-flex items-center gap-1 text-xs text-[#A5ADBD] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Experiments</span>
          </Link>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#0D111A] border border-white/[0.08]">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#697386]">Session Median RT</p>
            <p className="text-2xl font-bold font-mono text-white mt-1">
              {loading ? "..." : `${data?.medianReactionTimeMs ?? 0} ms`}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0D111A] border border-white/[0.08]">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#697386]">Fastest Response</p>
            <p className="text-2xl font-bold font-mono text-[#38BDF8] mt-1">
              {loading ? "..." : `${data?.fastestReactionTimeMs ?? 0} ms`}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0D111A] border border-white/[0.08]">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#697386]">Session Accuracy</p>
            <p className="text-2xl font-bold font-mono text-[#10B981] mt-1">
              {loading ? "..." : `${data?.accuracyPercent ?? 0}%`}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0D111A] border border-white/[0.08]">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#697386]">Recorded Trials</p>
            <p className="text-2xl font-bold font-mono text-white mt-1">
              {loading ? "..." : trials.length}
            </p>
          </div>
        </div>

        {/* Complete Trial Table */}
        <div className="rounded-2xl bg-[#0A0D14] border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Trial-by-Trial Data</h3>
              <p className="text-xs text-[#A5ADBD]">Detailed latency and response for each trial step</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] text-[#697386] font-mono text-[10px] uppercase">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Stimulus Type</th>
                  <th className="py-2.5 px-3">Reaction Time</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Participant Key</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {trials.map((trial, idx) => (
                  <tr key={trial.id || idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[#A5ADBD]">
                      {trial.trialNumber || idx + 1}
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
                      {formatTimestamp(trial.respondedAt ?? trial.startedAt)}
                    </td>
                  </tr>
                ))}
                {trials.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#697386] text-xs">
                      No trial results found for this experiment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}
