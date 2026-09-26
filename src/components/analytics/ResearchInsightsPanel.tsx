"use client";

import React from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ResearchInsight } from "@/types/participant";
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";

export function ResearchInsightsPanel({ insights }: { insights: ResearchInsight[] }) {
  if (!insights || insights.length === 0) return null;

  return (
    <GlassPanel className="p-5 lg:p-6 border-[#4F8CFF]/25 bg-gradient-to-br from-[#10141D] to-[#0A0D14]">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-[#4F8CFF]/15 border border-[#4F8CFF]/30 text-[#4F8CFF] flex items-center justify-center">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Synthesized Research Insights
          </h3>
          <p className="text-[11px] text-[#A5ADBD]">
            Statistically computed from active trial telemetry
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors flex items-start gap-3"
          >
            {insight.type === "positive" && (
              <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
            )}
            {insight.type === "warning" && (
              <AlertCircle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
            )}
            {insight.type === "neutral" && (
              <TrendingUp className="w-4 h-4 text-[#4F8CFF] shrink-0 mt-0.5" />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-white tracking-tight">
                  {insight.title}
                </span>
                {insight.metricImpact && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#22D3EE] border border-white/10">
                    {insight.metricImpact}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#A5ADBD] mt-1 leading-relaxed">
                {insight.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
