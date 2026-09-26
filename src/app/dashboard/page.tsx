"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/ui/MetricCard";
import { ChartCard } from "@/components/ui/ChartCard";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ReactionTimeLineChart } from "@/components/visualizations/ReactionTimeLineChart";
import { ReactionTimeHistogram } from "@/components/visualizations/ReactionTimeHistogram";
import { AccuracyBarChart } from "@/components/visualizations/StimulusComparisonChart";
import { useAnalytics } from "@/hooks/use-analytics";
import { useExperiments } from "@/hooks/use-experiments";
import { formatMs, formatPercent, formatNumber, downloadCsvFile } from "@/lib/utils";
import {
  FlaskConical,
  Users,
  CheckCircle2,
  Clock,
  Target,
  Plus,
  Play,
  Download,
  ArrowUpRight,
  Sparkles,
  Activity,
  Layers,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function DashboardPage() {
  const { summary, trials, loading } = useAnalytics("exp-color-response");
  const { experiments } = useExperiments();
  const { success } = useToast();

  const handleExportCsv = () => {
    if (!trials || trials.length === 0) return;
    const headers = [
      "Trial ID",
      "Participant",
      "Experiment",
      "Trial #",
      "Stimulus Type",
      "Selected Answer",
      "Correct",
      "Reaction Time (ms)",
      "Started At",
      "Responded At",
    ];
    const rows = trials.map((t) => [
      t.id,
      t.participantName || t.participantId,
      t.experimentId,
      t.trialNumber,
      t.stimulusType,
      t.response.selectedAnswer,
      t.correct ? "TRUE" : "FALSE",
      t.reactionTimeMs,
      t.startedAt,
      t.respondedAt,
    ]);
    downloadCsvFile("cognitivelab_dashboard_trials.csv", headers, rows);
    success("CSV Export Ready", "Exported recent trial telemetry.");
  };

  const accuracyData = [
    { name: "Color Study", accuracy: 91.8 },
    { name: "Stroop Task", accuracy: 88.4 },
    { name: "Visual Search", accuracy: 94.2 },
    { name: "RSVP", accuracy: 85.7 },
    { name: "Choice Latency", accuracy: 96.5 },
  ];

  const recentActivity = [
    {
      experiment: "Color Response Study",
      detail: "10-trial benchmark run completed by Subject P-801",
      time: "2 minutes ago",
      type: "trial",
      badge: "Completed",
      badgeVariant: "published" as const,
    },
    {
      experiment: "Visual Search Paradigm",
      detail: "New participant session initialized (sess_904_alpha)",
      time: "8 minutes ago",
      type: "session",
      badge: "In Progress",
      badgeVariant: "cyan" as const,
    },
    {
      experiment: "Rapid Serial Visual Presentation",
      detail: "Updated timing ISI jitter parameters to 120ms",
      time: "25 minutes ago",
      type: "edit",
      badge: "Updated",
      badgeVariant: "violet" as const,
    },
    {
      experiment: "Multi-Choice Motor Latency",
      detail: "Archived baseline dataset with 410 participants",
      time: "1 hour ago",
      type: "archive",
      badge: "Archived",
      badgeVariant: "archived" as const,
    },
  ];

  return (
    <DashboardLayout
      title="Research Overview"
      subtitle="Behavioral telemetry and active cognitive experiment metrics"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCsv}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>

          <Link href="/builder">
            <Button
              variant="glow"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              New Experiment
            </Button>
          </Link>
        </div>
      }
    >
      {/* 1. TOP METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          label="Active Experiments"
          value={experiments.filter((e) => e.status === "published").length || 5}
          unit="studies"
          change="+2"
          trend="up"
          trendLabel="this month"
          icon={<FlaskConical className="w-4 h-4" />}
          accentColor="blue"
          sparklineData={[3, 3, 4, 4, 5, 5, 5]}
        />

        <MetricCard
          label="Participants"
          value={formatNumber(summary?.participantCount || 248)}
          unit="subjects"
          change="+14.2%"
          trend="up"
          trendLabel="vs prior week"
          icon={<Users className="w-4 h-4" />}
          accentColor="violet"
          sparklineData={[180, 195, 210, 222, 235, 240, 248]}
        />

        <MetricCard
          label="Trials Completed"
          value={formatNumber(summary?.trialCount || 8420)}
          unit="trials"
          change="+1,240"
          trend="up"
          trendLabel="session total"
          icon={<Layers className="w-4 h-4" />}
          accentColor="cyan"
          sparklineData={[6200, 6800, 7100, 7600, 8000, 8200, 8420]}
        />

        <MetricCard
          label="Avg Reaction Time"
          value={formatMs(summary?.averageReactionTimeMs || 412)}
          change="-18 ms"
          trend="up"
          trendLabel="faster than norm"
          icon={<Clock className="w-4 h-4" />}
          accentColor="success"
          sparklineData={[430, 425, 420, 418, 415, 414, 412]}
        />

        <MetricCard
          label="Cohort Accuracy"
          value={formatPercent(summary?.accuracyPercent || 91.8)}
          change="+1.4%"
          trend="up"
          trendLabel="high fidelity"
          icon={<Target className="w-4 h-4" />}
          accentColor="warning"
          sparklineData={[89, 90, 90.5, 91, 91.2, 91.5, 91.8]}
        />
      </div>

      {/* 2. PRIMARY ANALYTICS: Reaction Time Over Trials */}
      <ChartCard
        title="Reaction Time Latency Progression Over Trials"
        subtitle="Tracking trial-by-trial adaptation, Stroop interference, and learning effects (T1–T10)"
        headerAction={
          <Link href="/analytics">
            <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
              Deep Analytics
            </Button>
          </Link>
        }
      >
        <ReactionTimeLineChart
          data={summary?.trialProgression || []}
          showStimulusToggles={true}
          benchmarkLine={412}
        />
      </ChartCard>

      {/* 3. SECONDARY CHARTS: Accuracy by Experiment & RT Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Accuracy by Active Experiment"
          subtitle="Participant response correctness percentage across distinct research paradigms"
        >
          <AccuracyBarChart data={accuracyData} />
        </ChartCard>

        <ChartCard
          title="Reaction Time Latency Distribution"
          subtitle="Empirical response distribution across 50ms latency bins"
        >
          <ReactionTimeHistogram data={summary?.rtDistribution || []} />
        </ChartCard>
      </div>

      {/* 4. RECENT ACTIVITY & QUICK ACTION BANNER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Experiment Activity */}
        <div className="lg:col-span-2">
          <GlassPanel className="p-5 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#4F8CFF]" />
                <h3 className="text-base font-semibold text-white tracking-tight">
                  Recent Telemetry & Experiment Activity
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#697386]">Live Feed</span>
            </div>

            <div className="divide-y divide-white/5">
              {recentActivity.map((act, i) => (
                <div key={i} className="py-3 flex items-start justify-between gap-4">
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-semibold text-white tracking-tight truncate">
                      {act.experiment}
                    </p>
                    <p className="text-[11px] text-[#A5ADBD] truncate">{act.detail}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={act.badgeVariant} size="sm">
                      {act.badge}
                    </Badge>
                    <span className="text-[10px] text-[#697386] font-mono hidden sm:inline">
                      {act.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>

        {/* Quick Launch Demo Banner */}
        <GlassPanel elevated className="p-6 flex flex-col justify-between border-[#4F8CFF]/30 bg-gradient-to-b from-[#10141D] to-[#0A0D14]">
          <div className="space-y-3">
            <div className="w-9 h-9 rounded-xl bg-[#4F8CFF]/15 border border-[#4F8CFF]/30 text-[#4F8CFF] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Color Response Demo Study
            </h3>
            <p className="text-xs text-[#A5ADBD] leading-relaxed">
              Launch the built-in 10-trial chromatic task. High-resolution timestamps are measured and instantly appended to this live dashboard.
            </p>
          </div>

          <div className="pt-6 space-y-2">
            <Link href="/preview/exp-color-response" className="block">
              <Button
                variant="glow"
                size="md"
                className="w-full"
                leftIcon={<Play className="w-4 h-4 fill-current" />}
              >
                Run 10-Trial Preview
              </Button>
            </Link>
            <Link href="/builder" className="block">
              <Button variant="outline" size="sm" className="w-full">
                Open in Visual Builder
              </Button>
            </Link>
          </div>
        </GlassPanel>
      </div>
    </DashboardLayout>
  );
}
