"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/ui/MetricCard";
import { ChartCard } from "@/components/ui/ChartCard";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { ReactionTimeLineChart } from "@/components/visualizations/ReactionTimeLineChart";
import { ReactionTimeHistogram } from "@/components/visualizations/ReactionTimeHistogram";
import {
  StimulusComparisonChart,
  AccuracyBarChart,
} from "@/components/visualizations/StimulusComparisonChart";
import { ResearchInsightsPanel } from "@/components/analytics/ResearchInsightsPanel";
import { useAnalytics } from "@/hooks/use-analytics";
import { useExperiments } from "@/hooks/use-experiments";
import { useParticipants } from "@/hooks/use-participants";
import { formatMs, formatPercent, formatNumber, downloadCsvFile, downloadJsonFile } from "@/lib/utils";
import {
  Download,
  FileSpreadsheet,
  FileCode2,
  Filter,
  Users,
  Layers,
  Clock,
  Gauge,
  Target,
  Zap,
  TrendingDown,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function AnalyticsPage() {
  const [selectedExperimentId, setSelectedExperimentId] = useState<string>("exp-color-response");
  const [selectedStimulus, setSelectedStimulus] = useState<string>("all");

  const { summary, insights, trials, loading } = useAnalytics(selectedExperimentId);
  const { experiments } = useExperiments();
  const { participants } = useParticipants();
  const { success } = useToast();

  const handleExportCsv = () => {
    if (!trials || trials.length === 0) return;
    const headers = [
      "Trial ID",
      "Participant",
      "Trial Number",
      "Stimulus Type",
      "Prompt",
      "Selected Answer",
      "Correct",
      "Reaction Time (ms)",
      "Started At",
      "Responded At",
    ];
    const rows = trials.map((t) => [
      t.id,
      t.participantName || t.participantId,
      t.trialNumber,
      t.stimulusType,
      t.stimulus.prompt || "",
      t.response.selectedAnswer,
      t.correct ? "TRUE" : "FALSE",
      t.reactionTimeMs,
      t.startedAt,
      t.respondedAt,
    ]);
    downloadCsvFile("cognitivelab_psychometric_export.csv", headers, rows);
    success("CSV Export Generated", "Exported all participant trial records.");
  };

  const handleExportJson = () => {
    downloadJsonFile("cognitivelab_analytics_summary.json", {
      experimentId: selectedExperimentId,
      summary,
      insights,
      exportedAt: new Date().toISOString(),
    });
    success("JSON Export Generated", "Structured analytics summary downloaded.");
  };

  // Participant average latency comparison data
  const participantRtData = participants.slice(0, 6).map((p) => ({
    name: p.displayName.split(" ")[1] || p.displayName,
    accuracy: p.accuracyPercent,
    avgRt: p.avgReactionTimeMs,
  }));

  return (
    <DashboardLayout
      title="Research Analytics"
      subtitle="Psychometric distributions, latency variance, and stimulus comparison"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportJson}
            leftIcon={<FileCode2 className="w-3.5 h-3.5" />}
          >
            Export JSON
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleExportCsv}
            leftIcon={<FileSpreadsheet className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>
        </div>
      }
    >
      {/* Filters Toolbar */}
      <GlassPanel className="p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Experiment Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#697386] uppercase">Experiment:</span>
            <select
              value={selectedExperimentId}
              onChange={(e) => setSelectedExperimentId(e.target.value)}
              className="bg-[#10141D] text-xs text-white px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#4F8CFF]"
            >
              {experiments.map((exp) => (
                <option key={exp.id} value={exp.id}>
                  {exp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stimulus Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#697386] uppercase">Stimulus Filter:</span>
            <select
              value={selectedStimulus}
              onChange={(e) => setSelectedStimulus(e.target.value)}
              className="bg-[#10141D] text-xs text-white px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#4F8CFF]"
            >
              <option value="all">All Stimuli (Text, Color, Image, Mixed)</option>
              <option value="text">Lexical Text Only</option>
              <option value="color">Color Conflict (Stroop)</option>
              <option value="image">Visual Image / Icon</option>
              <option value="mixed">Mixed Multimodal</option>
            </select>
          </div>
        </div>

        <div className="text-xs font-mono text-[#A5ADBD] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
          <span>Telemetric Clock: Synchronized</span>
        </div>
      </GlassPanel>

      {/* 1. ANALYTICS HERO METRICS (7 key psychometric figures) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <MetricCard
          label="Participants"
          value={formatNumber(summary?.participantCount || 0)}
          unit="subjects"
          icon={<Users className="w-3.5 h-3.5" />}
          accentColor="blue"
        />

        <MetricCard
          label="Trials Count"
          value={formatNumber(summary?.trialCount || 0)}
          unit="trials"
          icon={<Layers className="w-3.5 h-3.5" />}
          accentColor="violet"
        />

        <MetricCard
          label="Mean RT"
          value={formatMs(summary?.averageReactionTimeMs)}
          icon={<Clock className="w-3.5 h-3.5" />}
          accentColor="cyan"
        />

        <MetricCard
          label="Median RT"
          value={formatMs(summary?.medianReactionTimeMs)}
          icon={<Gauge className="w-3.5 h-3.5" />}
          accentColor="blue"
        />

        <MetricCard
          label="Accuracy"
          value={formatPercent(summary?.accuracyPercent)}
          icon={<Target className="w-3.5 h-3.5" />}
          accentColor="success"
        />

        <MetricCard
          label="Fastest RT"
          value={formatMs(summary?.fastestReactionTimeMs)}
          icon={<Zap className="w-3.5 h-3.5" />}
          accentColor="warning"
        />

        <MetricCard
          label="Slowest RT"
          value={formatMs(summary?.slowestReactionTimeMs)}
          icon={<TrendingDown className="w-3.5 h-3.5" />}
          accentColor="violet"
        />
      </div>

      {/* 2. SYNTHESIZED RESEARCH INSIGHTS (Computed from empirical data) */}
      <ResearchInsightsPanel insights={insights} />

      {/* 3. CHART 1: REACTION TIME OVER TRIALS WITH TOGGLES */}
      <ChartCard
        title="Reaction Time Over Trials"
        subtitle="Individual stimulus categories (Text, Color, Image) across progressive trial numbers"
      >
        <ReactionTimeLineChart
          data={summary?.trialProgression || []}
          showStimulusToggles={true}
          benchmarkLine={summary?.medianReactionTimeMs ?? undefined}
        />
      </ChartCard>

      {/* 4. CHARTS 2 & 3: LATENCY DISTRIBUTION & STIMULUS TYPE COMPARISON */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Reaction Time Latency Distribution"
          subtitle="Empirical density of reaction times across 50 ms bins"
        >
          <ReactionTimeHistogram data={summary?.rtDistribution || []} />
        </ChartCard>

        <ChartCard
          title="Reaction Time by Stimulus Category"
          subtitle="Direct comparison of processing latency across Text, Color, Image, and Mixed stimuli"
        >
          <StimulusComparisonChart data={summary?.stimulusBreakdown || []} />
        </ChartCard>
      </div>

      {/* 5. CHARTS 4 & 5: ACCURACY BY STIMULUS & PARTICIPANT COMPARISON */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Accuracy by Stimulus Category"
          subtitle="Error rate and response precision across experimental stimuli conditions"
        >
          <AccuracyBarChart
            data={
              summary?.stimulusBreakdown.map((s) => ({
                name: s.type.toUpperCase(),
                accuracy: s.accuracy,
              })) || []
            }
          />
        </ChartCard>

        <ChartCard
          title="Top Participant Cohort Latency Benchmark"
          subtitle="Inter-subject mean reaction time comparison across verified trials"
        >
          <div className="h-[260px] overflow-y-auto divide-y divide-white/5">
            {participants.slice(0, 7).map((p, idx) => (
              <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[#697386]">#{idx + 1}</span>
                  <span className="font-medium text-white">{p.displayName}</span>
                </div>
                <div className="flex items-center gap-4 font-mono">
                  <span className="text-[#4F8CFF] font-semibold">{formatMs(p.avgReactionTimeMs)}</span>
                  <span className="text-[#22C55E]">{formatPercent(p.accuracyPercent)}</span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </DashboardLayout>
  );
}
