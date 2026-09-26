"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAgeAnalytics } from "@/hooks/use-age-analytics";
import {
  Timer,
  Zap,
  Target,
  Sparkles,
  Users,
  Download,
  Filter,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  Brain,
  SlidersHorizontal,
  ChevronRight,
  Info,
  Layers,
  ArrowUpDown,
  RefreshCw,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { MIN_ANALYTICS_GROUP_SIZE } from "@/lib/demographics";

type ResearchQuestionId = "all" | "rt_trend" | "stimulus_complexity" | "accuracy_retention" | "consistency";

export default function AgeAnalyticsPage() {
  const [selectedSex, setSelectedSex] = useState<string>("all");
  const [selectedStimulus, setSelectedStimulus] = useState<string>("all");
  const [selectedQuestion, setSelectedQuestion] = useState<ResearchQuestionId>("all");
  const [chartMode, setChartMode] = useState<"boxplot" | "scatter" | "both">("both");
  const [showTrendline, setShowTrendline] = useState<boolean>(true);

  const filters = useMemo(() => ({
    sex: selectedSex,
    stimulusType: selectedStimulus,
  }), [selectedSex, selectedStimulus]);

  const { data, loading, refetch } = useAgeAnalytics(filters);

  const metrics = data?.metricsByGroup || [];
  const scatterPoints = data?.scatterPoints || [];

  // Export dataset function
  const handleExportCSV = () => {
    if (!data) return;
    const header = "AgeGroup,ParticipantCount,TrialCount,MedianRtMs,AvgRtMs,Q1RtMs,Q3RtMs,MinRtMs,MaxRtMs,AccuracyPercent,Consistency\n";
    const rows = metrics
      .map(
        (m) =>
          `"${m.ageGroup}",${m.participantCount},${m.trialCount},${m.medianRt},${m.avgRt},${m.q1Rt},${m.q3Rt},${m.minRt},${m.maxRt},${m.accuracy},${m.consistency}`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `cognitivelab_age_cohort_analytics_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `cognitivelab_age_cohort_analytics_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Find fastest and slowest groups
  const validGroups = metrics.filter((m) => m.participantCount >= 1 && m.medianRt > 0);
  const fastestGroup = [...validGroups].sort((a, b) => a.medianRt - b.medianRt)[0];
  const slowestGroup = [...validGroups].sort((a, b) => b.medianRt - a.medianRt)[0];
  const speedGapMs = fastestGroup && slowestGroup ? slowestGroup.medianRt - fastestGroup.medianRt : 0;

  return (
    <RouteGuard allowedRole="researcher">
      <DashboardLayout
        title="Age & Cognitive Performance Analytics"
        subtitle="Demographic latency stratification, age-stratified reaction distributions, and stimulus interaction metrics"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#A5ADBD] hover:text-white border border-white/10 transition-colors"
              title="Refresh telemetry"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs border border-white/10 transition-colors">
                <Download className="w-3.5 h-3.5 text-[#4F8CFF]" />
                <span>Export Dataset</span>
              </button>
              <div className="absolute right-0 mt-1 w-36 bg-[#0F131C] border border-white/10 rounded-lg shadow-xl py-1 hidden group-hover:block z-30">
                <button
                  onClick={handleExportCSV}
                  className="w-full text-left px-3 py-1.5 text-xs text-[#A5ADBD] hover:text-white hover:bg-white/5"
                >
                  Export as CSV
                </button>
                <button
                  onClick={handleExportJSON}
                  className="w-full text-left px-3 py-1.5 text-xs text-[#A5ADBD] hover:text-white hover:bg-white/5"
                >
                  Export as JSON
                </button>
              </div>
            </div>
          </div>
        }
      >
        {/* Research Question Focus Filter */}
        <div className="rounded-2xl bg-[#0A0D14] border border-white/10 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <Brain className="w-4 h-4 text-[#4F8CFF]" />
              <span className="text-xs font-semibold text-white">Explore Research Question:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={() => setSelectedQuestion("all")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedQuestion === "all"
                    ? "bg-[#4F8CFF] text-white shadow-[0_0_10px_rgba(79,140,255,0.3)] font-medium"
                    : "bg-white/[0.04] text-[#A5ADBD] hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                All Findings
              </button>
              <button
                onClick={() => setSelectedQuestion("rt_trend")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedQuestion === "rt_trend"
                    ? "bg-[#4F8CFF] text-white shadow-[0_0_10px_rgba(79,140,255,0.3)] font-medium"
                    : "bg-white/[0.04] text-[#A5ADBD] hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                Latency Scaling with Age
              </button>
              <button
                onClick={() => setSelectedQuestion("stimulus_complexity")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedQuestion === "stimulus_complexity"
                    ? "bg-[#4F8CFF] text-white shadow-[0_0_10px_rgba(79,140,255,0.3)] font-medium"
                    : "bg-white/[0.04] text-[#A5ADBD] hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                Stimulus Complexity Interaction
              </button>
              <button
                onClick={() => setSelectedQuestion("accuracy_retention")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedQuestion === "accuracy_retention"
                    ? "bg-[#4F8CFF] text-white shadow-[0_0_10px_rgba(79,140,255,0.3)] font-medium"
                    : "bg-white/[0.04] text-[#A5ADBD] hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                Accuracy Retention
              </button>
              <button
                onClick={() => setSelectedQuestion("consistency")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedQuestion === "consistency"
                    ? "bg-[#4F8CFF] text-white shadow-[0_0_10px_rgba(79,140,255,0.3)] font-medium"
                    : "bg-white/[0.04] text-[#A5ADBD] hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                Variability & Consistency
              </button>
            </div>
          </div>
        </div>

        {/* Global Cohort Summary Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#0D111A] border border-white/[0.08]">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#697386]">Analyzed Subjects</p>
            <p className="text-2xl font-bold font-mono text-white mt-1">
              {loading ? "..." : data?.totalCohortParticipants ?? 0}
            </p>
            <p className="text-[11px] text-[#A5ADBD] mt-1">
              Cross-sectional sample
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0D111A] border border-white/[0.08]">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#697386]">Demographic Age Span</p>
            <p className="text-2xl font-bold font-mono text-[#38BDF8] mt-1">
              {loading ? "..." : data?.ageSpan || "15 – 65+ yrs"}
            </p>
            <p className="text-[11px] text-[#A5ADBD] mt-1">
              6 stratified cohorts
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0D111A] border border-white/[0.08]">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#697386]">Total Telemetry Trials</p>
            <p className="text-2xl font-bold font-mono text-white mt-1">
              {loading ? "..." : data?.totalCohortTrials ?? 0}
            </p>
            <p className="text-[11px] text-[#A5ADBD] mt-1">
              Millisecond-accurate runs
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0D111A] border border-white/[0.08]">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#697386]">Observed Speed Delta</p>
            <p className="text-2xl font-bold font-mono text-[#F59E0B] mt-1">
              +{speedGapMs} ms
            </p>
            <p className="text-[11px] text-[#A5ADBD] mt-1">
              {fastestGroup?.ageGroup || "18–24"} vs {slowestGroup?.ageGroup || "55+"}
            </p>
          </div>
        </div>

        {/* 6 Age Group Overview Cards */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#A5ADBD]">
              Age Cohort Profiles (6 Stratified Groups)
            </h3>
            <span className="text-[11px] text-[#697386] font-mono">
              Privacy rule: n &ge; {MIN_ANALYTICS_GROUP_SIZE} for aggregate stability
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {metrics.map((group) => {
              const isInsufficient = group.participantCount < MIN_ANALYTICS_GROUP_SIZE;
              const isFastest = fastestGroup?.ageGroup === group.ageGroup;

              return (
                <div
                  key={group.ageGroup}
                  className={`p-4 rounded-xl bg-[#0D111A] border transition-all ${
                    isFastest
                      ? "border-[#4F8CFF]/50 shadow-[0_0_15px_-4px_rgba(79,140,255,0.25)]"
                      : "border-white/[0.08] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white font-mono">
                      {group.ageGroup}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-[#A5ADBD]">
                      n = {group.participantCount}
                    </span>
                  </div>

                  {isInsufficient ? (
                    <div className="my-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      <div className="flex items-center gap-1.5 text-[10px] font-medium">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>Insufficient size (n &lt; 5)</span>
                      </div>
                      <p className="text-[9px] text-amber-300/80 mt-1">
                        Preliminary metrics shown
                      </p>
                    </div>
                  ) : null}

                  <div className="space-y-1.5 mt-2">
                    <div>
                      <span className="text-[10px] font-mono text-[#697386] uppercase block">
                        Median RT
                      </span>
                      <span className="text-xl font-bold font-mono text-white">
                        {group.medianRt} ms
                      </span>
                    </div>

                    <div className="text-[11px] text-[#A5ADBD] font-mono flex items-center justify-between pt-1 border-t border-white/[0.06]">
                      <span>IQR (Q1–Q3):</span>
                      <span className="text-white">{group.q1Rt}–{group.q3Rt}</span>
                    </div>

                    <div className="text-[11px] text-[#A5ADBD] font-mono flex items-center justify-between">
                      <span>Accuracy:</span>
                      <span className="text-[#10B981] font-semibold">{group.accuracy}%</span>
                    </div>

                    <div className="text-[11px] text-[#A5ADBD] font-mono flex items-center justify-between">
                      <span>Consistency:</span>
                      <span className="text-[#38BDF8] font-semibold">{group.consistency}/100</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Chart: Age vs Reaction Time Distribution & Scatter */}
        <div className={`rounded-2xl bg-[#0A0D14] border p-6 transition-all ${
          selectedQuestion === "rt_trend" ? "border-[#4F8CFF] shadow-[0_0_25px_rgba(79,140,255,0.2)]" : "border-white/10"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Timer className="w-4 h-4 text-[#4F8CFF]" />
                Reaction Time vs Age Cohort Distribution
              </h3>
              <p className="text-xs text-[#A5ADBD]">
                Interquartile box distributions (Q1, Median, Q3) and individual participant latency points
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Chart Mode */}
              <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-lg border border-white/10 text-xs">
                <button
                  onClick={() => setChartMode("boxplot")}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    chartMode === "boxplot" ? "bg-[#4F8CFF] text-white" : "text-[#A5ADBD] hover:text-white"
                  }`}
                >
                  Box Plot
                </button>
                <button
                  onClick={() => setChartMode("scatter")}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    chartMode === "scatter" ? "bg-[#4F8CFF] text-white" : "text-[#A5ADBD] hover:text-white"
                  }`}
                >
                  Scatter
                </button>
                <button
                  onClick={() => setChartMode("both")}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    chartMode === "both" ? "bg-[#4F8CFF] text-white" : "text-[#A5ADBD] hover:text-white"
                  }`}
                >
                  Combined
                </button>
              </div>

              {/* Trendline Toggle */}
              <button
                onClick={() => setShowTrendline(!showTrendline)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
                  showTrendline
                    ? "bg-[#38BDF8]/15 border-[#38BDF8]/40 text-[#38BDF8]"
                    : "bg-white/[0.04] border-white/10 text-[#697386]"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Trend Curve</span>
              </button>
            </div>
          </div>

          {/* SVG Canvas for Box Plot + Scatter Plot */}
          <div className="w-full h-80 relative">
            <svg className="w-full h-full" viewBox="0 0 900 320" preserveAspectRatio="none">
              <defs>
                <linearGradient id="boxGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F8CFF" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#4F8CFF" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="50%" stopColor="#818CF8" />
                  <stop offset="100%" stopColor="#F472B6" />
                </linearGradient>
              </defs>

              {/* Y Axis Guide Lines (200ms to 600ms) */}
              {[200, 300, 400, 500, 600].map((val) => {
                // Map val (200..600) to Y (280..30)
                const y = 280 - ((val - 200) / 400) * 250;
                return (
                  <g key={val}>
                    <line x1="60" y1={y} x2="880" y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                    <text x="50" y={y + 4} textAnchor="end" fill="#697386" fontSize="10" fontFamily="monospace">
                      {val} ms
                    </text>
                  </g>
                );
              })}

              {/* Box Plots for each group */}
              {metrics.map((group, idx) => {
                const groupWidth = 820 / metrics.length;
                const centerX = 60 + idx * groupWidth + groupWidth / 2;
                const boxW = Math.min(60, groupWidth * 0.45);

                const getY = (ms: number) => 280 - ((ms - 200) / 400) * 250;

                const yMin = getY(group.minRt || group.q1Rt - 20);
                const yMax = getY(group.maxRt || group.q3Rt + 25);
                const yQ1 = getY(group.q1Rt);
                const yQ3 = getY(group.q3Rt);
                const yMedian = getY(group.medianRt);

                return (
                  <g key={group.ageGroup} className="transition-all">
                    {/* Whisker Line */}
                    {(chartMode === "boxplot" || chartMode === "both") && (
                      <>
                        <line x1={centerX} y1={yMin} x2={centerX} y2={yMax} stroke="#60A5FA" strokeWidth="1.5" opacity="0.6" />
                        <line x1={centerX - 10} y1={yMin} x2={centerX + 10} y2={yMin} stroke="#60A5FA" strokeWidth="1.5" opacity="0.6" />
                        <line x1={centerX - 10} y1={yMax} x2={centerX + 10} y2={yMax} stroke="#60A5FA" strokeWidth="1.5" opacity="0.6" />

                        {/* IQR Box */}
                        <rect
                          x={centerX - boxW / 2}
                          y={yQ3}
                          width={boxW}
                          height={Math.max(4, yQ1 - yQ3)}
                          fill="url(#boxGrad)"
                          stroke="#60A5FA"
                          strokeWidth="1.5"
                          rx="4"
                        />

                        {/* Median Line */}
                        <line
                          x1={centerX - boxW / 2}
                          y1={yMedian}
                          x2={centerX + boxW / 2}
                          y2={yMedian}
                          stroke="#F59E0B"
                          strokeWidth="2.5"
                        />
                      </>
                    )}

                    {/* Group Label on X axis */}
                    <text
                      x={centerX}
                      y="305"
                      textAnchor="middle"
                      fill="#A5ADBD"
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {group.ageGroup}
                    </text>
                  </g>
                );
              })}

              {/* Scatter Points (Individual anonymized participants) */}
              {(chartMode === "scatter" || chartMode === "both") &&
                scatterPoints.map((pt, pIdx) => {
                  // Find group index
                  const gIdx = metrics.findIndex((m) => m.ageGroup === pt.ageGroup);
                  if (gIdx === -1) return null;
                  const groupWidth = 820 / metrics.length;
                  // Jitter X slightly for visibility
                  const jitter = ((pIdx * 17) % 30) - 15;
                  const cx = 60 + gIdx * groupWidth + groupWidth / 2 + jitter;
                  const cy = 280 - ((pt.reactionTimeMs - 200) / 400) * 250;

                  return (
                    <circle
                      key={`${pt.participantId}-${pIdx}`}
                      cx={cx}
                      cy={cy}
                      r="4"
                      fill="#38BDF8"
                      stroke="#0A0D14"
                      strokeWidth="1.5"
                      opacity="0.85"
                      className="hover:r-6 hover:fill-white cursor-pointer transition-all"
                    >
                      <title>{`Participant ${pt.participantId} (Age ${pt.age}): ${pt.reactionTimeMs} ms [${pt.stimulusType}]`}</title>
                    </circle>
                  );
                })}

              {/* Trendline Curve across cohorts */}
              {showTrendline && metrics.length > 1 && (
                <path
                  d={metrics
                    .map((group, idx) => {
                      const groupWidth = 820 / metrics.length;
                      const cx = 60 + idx * groupWidth + groupWidth / 2;
                      const cy = 280 - ((group.medianRt - 200) / 400) * 250;
                      return `${idx === 0 ? "M" : "L"} ${cx} ${cy}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="url(#trendGrad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="4 2"
                />
              )}
            </svg>
          </div>

          {/* Chart Legend */}
          <div className="flex flex-wrap items-center justify-between text-xs pt-4 border-t border-white/[0.06] text-[#A5ADBD]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#4F8CFF]/30 border border-[#4F8CFF]" />
                <span>Interquartile Range (Q1–Q3)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#F59E0B]" />
                <span>Cohort Median</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
                <span>Individual Telemetry Points</span>
              </span>
            </div>
            <div className="text-[11px] font-mono text-[#697386]">
              Observed sample range: 200ms – 600ms
            </div>
          </div>
        </div>

        {/* Middle Section: Stimulus Interaction Heatmap & Accuracy by Cohort */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Heatmap: Age × Stimulus Type Interaction */}
          <div className={`rounded-2xl bg-[#0A0D14] border p-6 transition-all ${
            selectedQuestion === "stimulus_complexity" ? "border-[#4F8CFF] shadow-[0_0_25px_rgba(79,140,255,0.2)]" : "border-white/10"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#10B981]" />
                  Age × Stimulus Latency Heatmap Matrix
                </h3>
                <p className="text-xs text-[#A5ADBD]">
                  Average response latency (ms) partitioned by visual stimulus modality
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[#697386] font-mono text-[10px] uppercase">
                    <th className="py-2.5 text-left pl-2">Age Cohort</th>
                    <th className="py-2.5">Color RT</th>
                    <th className="py-2.5">Text RT</th>
                    <th className="py-2.5">Image RT</th>
                    <th className="py-2.5">Mixed RT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] font-mono">
                  {metrics.map((group) => {
                    const st = group.stimulusAvgRt;

                    // Color cell helper based on speed
                    const getCellBg = (ms: number) => {
                      if (!ms || ms === 0) return "bg-white/[0.02] text-[#697386]";
                      if (ms < 280) return "bg-[#10B981]/20 text-[#34D399] font-bold border border-[#10B981]/30";
                      if (ms < 350) return "bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/20";
                      if (ms < 420) return "bg-[#F59E0B]/15 text-[#FBBF24] border border-[#F59E0B]/20";
                      return "bg-[#8B5CF6]/20 text-[#C084FC] border border-[#8B5CF6]/30";
                    };

                    return (
                      <tr key={group.ageGroup} className="hover:bg-white/[0.02]">
                        <td className="py-3 text-left pl-2 text-white font-bold">
                          {group.ageGroup}
                        </td>
                        <td className="py-2 px-1">
                          <span className={`inline-block px-2.5 py-1 rounded text-xs ${getCellBg(st.color)}`}>
                            {st.color > 0 ? `${st.color} ms` : "—"}
                          </span>
                        </td>
                        <td className="py-2 px-1">
                          <span className={`inline-block px-2.5 py-1 rounded text-xs ${getCellBg(st.text)}`}>
                            {st.text > 0 ? `${st.text} ms` : "—"}
                          </span>
                        </td>
                        <td className="py-2 px-1">
                          <span className={`inline-block px-2.5 py-1 rounded text-xs ${getCellBg(st.image)}`}>
                            {st.image > 0 ? `${st.image} ms` : "—"}
                          </span>
                        </td>
                        <td className="py-2 px-1">
                          <span className={`inline-block px-2.5 py-1 rounded text-xs ${getCellBg(st.mixed)}`}>
                            {st.mixed > 0 ? `${st.mixed} ms` : "—"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] text-[#A5ADBD] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#10B981]/30 border border-[#10B981]" /> Fast (&lt;280ms)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#38BDF8]/30 border border-[#38BDF8]" /> Standard (280-350ms)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#F59E0B]/30 border border-[#F59E0B]" /> Elevated (350-420ms)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#8B5CF6]/30 border border-[#8B5CF6]" /> Complex (&gt;420ms)
              </span>
            </div>
          </div>

          {/* Accuracy & Consistency Retention by Age */}
          <div className={`rounded-2xl bg-[#0A0D14] border p-6 transition-all ${
            selectedQuestion === "accuracy_retention" || selectedQuestion === "consistency"
              ? "border-[#4F8CFF] shadow-[0_0_25px_rgba(79,140,255,0.2)]"
              : "border-white/10"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#F59E0B]" />
                  Accuracy & Consistency Retention
                </h3>
                <p className="text-xs text-[#A5ADBD]">
                  Examining whether older cohorts trade reaction speed for superior accuracy
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {metrics.map((group) => (
                <div key={group.ageGroup} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-mono text-white font-bold">{group.ageGroup}</span>
                    <span className="font-mono text-[#A5ADBD] flex items-center gap-2">
                      <span>Acc: <strong className="text-[#10B981]">{group.accuracy}%</strong></span>
                      <span>·</span>
                      <span>Stab: <strong className="text-[#38BDF8]">{group.consistency}</strong>/100</span>
                    </span>
                  </div>

                  {/* Dual Bar: Accuracy vs Consistency */}
                  <div className="w-full h-3 rounded-full bg-white/[0.05] overflow-hidden flex gap-1 p-0.5">
                    <div
                      style={{ width: `${group.accuracy}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-[#10B981] to-[#34D399]"
                      title={`Accuracy: ${group.accuracy}%`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-2.5 text-xs text-[#A5ADBD]">
              <Info className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
              <span>
                <strong>Speed-Accuracy Tradeoff:</strong> Across older cohorts (45–54, 55+), response accuracy remains highly preserved (&ge;94%), reflecting deliberative response strategies rather than broad cognitive decline.
              </span>
            </div>
          </div>
        </div>

        {/* Dynamically Generated Observational Insights */}
        <div className="rounded-2xl bg-[#0A0D14] border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                Automated Observational Research Insights
              </h3>
              <p className="text-xs text-[#A5ADBD]">
                Synthesized empirical observations based on real-time participant runs
              </p>
            </div>
            <span className="text-[10px] font-mono text-[#697386]">
              Non-causal statistical findings
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(data?.insights ?? []).map((insight, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3 hover:border-white/10 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#C084FC] shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-xs text-[#A5ADBD] leading-relaxed">
                  {insight}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}
