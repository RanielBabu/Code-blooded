"use client";

import React, { use } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/ui/MetricCard";
import { ChartCard } from "@/components/ui/ChartCard";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ReactionTimeLineChart } from "@/components/visualizations/ReactionTimeLineChart";
import { StimulusComparisonChart } from "@/components/visualizations/StimulusComparisonChart";
import { useAnalytics } from "@/hooks/use-analytics";
import { useParticipants } from "@/hooks/use-participants";
import { formatMs, formatPercent } from "@/lib/utils";
import {
  ArrowLeft,
  Clock,
  Target,
  Layers,
  Award,
  Calendar,
  ShieldCheck,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function ParticipantProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { participants } = useParticipants();
  const participant = participants.find((p) => p.id === resolvedParams.id) || participants[0];

  const { summary, trials } = useAnalytics(undefined, participant?.id);

  if (!participant) {
    return (
      <DashboardLayout title="Participant Profile">
        <div className="p-8 text-center text-[#A5ADBD]">Subject not found.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={participant.displayName}
      subtitle={`Session ID: ${participant.sessionId || "sess_active"} • Subject ID: ${participant.id}`}
      actions={
        <Link href="/participants">
          <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Back to Directory
          </Button>
        </Link>
      }
    >
      {/* 1. Header Profile Banner */}
      <GlassPanel elevated className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-white/15">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#4F8CFF] to-[#8B5CF6] text-white flex items-center justify-center font-bold text-xl shadow-[0_0_20px_rgba(79,140,255,0.3)]">
            {participant.displayName.split(" ")[1]?.slice(0, 2) || "P"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">{participant.displayName}</h2>
              <Badge variant="published" size="sm">Verified Subject</Badge>
            </div>
            <p className="text-xs text-[#A5ADBD] mt-1 max-w-lg leading-relaxed">
              {participant.notes || "Participant active in cognitive benchmarks."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-[#A5ADBD]">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#697386]" />
            <span>Enrolled: {new Date(participant.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </GlassPanel>

      {/* 2. Core Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Mean Reaction Time"
          value={formatMs(participant.avgReactionTimeMs)}
          unit="ms"
          trend="up"
          trendLabel="benchmark compliant"
          icon={<Clock className="w-4 h-4" />}
          accentColor="blue"
        />

        <MetricCard
          label="Task Accuracy"
          value={formatPercent(participant.accuracyPercent)}
          trend="up"
          trendLabel="high response fidelity"
          icon={<Target className="w-4 h-4" />}
          accentColor="success"
        />

        <MetricCard
          label="Consistency Score"
          value={`${participant.consistencyScore} / 100`}
          trendLabel="low latency jitter"
          icon={<Award className="w-4 h-4" />}
          accentColor="violet"
        />

        <MetricCard
          label="Total Trials"
          value={participant.totalTrials}
          unit="trials"
          trendLabel="across completed sessions"
          icon={<Layers className="w-4 h-4" />}
          accentColor="cyan"
        />
      </div>

      {/* 3. Charts: RT Over Trials & RT by Stimulus */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Reaction Time Across Progressive Trials"
          subtitle="Evaluation of intra-session adaptation and fatigue effects"
        >
          <ReactionTimeLineChart
            data={summary?.trialProgression || []}
            showStimulusToggles={false}
            benchmarkLine={participant.avgReactionTimeMs}
          />
        </ChartCard>

        <ChartCard
          title="Reaction Time by Stimulus Category"
          subtitle="Participant performance across Text, Color, Image, and Mixed stimuli"
        >
          <StimulusComparisonChart data={summary?.stimulusBreakdown || []} />
        </ChartCard>
      </div>

      {/* 4. Trial-by-Trial Data Table */}
      <GlassPanel className="p-0 overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Recorded Trial Telemetry
          </h3>
          <span className="text-xs font-mono text-[#697386]">
            {trials.length} Recorded Trials
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#0A0D14] border-b border-white/10 text-[#697386] font-mono uppercase">
              <tr>
                <th className="py-3 px-4 font-normal">Trial #</th>
                <th className="py-3 px-4 font-normal">Stimulus Type</th>
                <th className="py-3 px-4 font-normal">Prompt Condition</th>
                <th className="py-3 px-4 font-normal">Selected Response</th>
                <th className="py-3 px-4 font-normal">Result</th>
                <th className="py-3 px-4 font-normal">Reaction Time</th>
                <th className="py-3 px-4 font-normal">Captured At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {trials.map((t) => (
                <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-bold text-white">#{t.trialNumber}</td>
                  <td className="py-3 px-4">
                    <Badge variant={t.stimulusType === "color" ? "violet" : t.stimulusType === "text" ? "blue" : "cyan"} size="sm">
                      {t.stimulusType}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-[#A5ADBD] font-sans">
                    {t.stimulus.prompt || "Target color task"}
                  </td>
                  <td className="py-3 px-4 text-white font-bold">{t.response.selectedAnswer}</td>
                  <td className="py-3 px-4">
                    {t.correct ? (
                      <span className="flex items-center gap-1 text-[#22C55E]">
                        <CheckCircle className="w-3.5 h-3.5" /> Correct
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[#EF4444]">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-[#4F8CFF] font-semibold text-sm">
                    {formatMs(t.reactionTimeMs)}
                  </td>
                  <td className="py-3 px-4 text-[#697386] text-[10px]">
                    {new Date(t.respondedAt).toLocaleTimeString()}
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
