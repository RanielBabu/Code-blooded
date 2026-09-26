"use client";

import React, { useState } from "react";
import { Participant } from "@/types/participant";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { formatMs, formatPercent } from "@/lib/utils";
import { GitCompare, Check } from "lucide-react";

interface ComparisonModuleProps {
  participants: Participant[];
}

export function ComparisonModule({ participants }: ComparisonModuleProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([
    participants[0]?.id || "",
    participants[1]?.id || "",
  ].filter(Boolean));

  const toggleParticipant = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      } else {
        setSelectedIds([...selectedIds.slice(1), id]);
      }
    }
  };

  const selectedParticipants = participants.filter((p) => selectedIds.includes(p.id));

  return (
    <GlassPanel className="p-5 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#8B5CF6] flex items-center justify-center">
            <GitCompare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">
              Cross-Participant Response Comparison
            </h3>
            <p className="text-xs text-[#A5ADBD]">
              Select up to 3 subjects for multi-dimensional performance analysis
            </p>
          </div>
        </div>

        {/* Selection chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {participants.slice(0, 6).map((p) => {
            const isSelected = selectedIds.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggleParticipant(p.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-all ${
                  isSelected
                    ? "bg-[#4F8CFF]/20 border-[#4F8CFF]/50 text-white"
                    : "bg-white/5 border-white/10 text-[#A5ADBD] hover:text-white"
                }`}
              >
                {p.displayName.split(" ")[0]} {p.displayName.split(" ")[1]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-white/10 text-[#697386] font-mono uppercase">
              <th className="py-3 px-4 font-normal">Metric Parameter</th>
              {selectedParticipants.map((p) => (
                <th key={p.id} className="py-3 px-4 text-white font-semibold">
                  {p.displayName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono">
            <tr>
              <td className="py-3 px-4 text-[#A5ADBD]">Mean Reaction Time</td>
              {selectedParticipants.map((p) => (
                <td key={p.id} className="py-3 px-4 text-base font-bold text-[#4F8CFF]">
                  {formatMs(p.avgReactionTimeMs)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-4 text-[#A5ADBD]">Task Accuracy</td>
              {selectedParticipants.map((p) => (
                <td key={p.id} className="py-3 px-4 font-bold text-[#22C55E]">
                  {formatPercent(p.accuracyPercent)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-4 text-[#A5ADBD]">Consistency Score (0-100)</td>
              {selectedParticipants.map((p) => (
                <td key={p.id} className="py-3 px-4 text-white font-semibold">
                  {p.consistencyScore}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-4 text-[#A5ADBD]">Total Trials Captured</td>
              {selectedParticipants.map((p) => (
                <td key={p.id} className="py-3 px-4 text-[#A5ADBD]">
                  {p.totalTrials} trials
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-4 text-[#A5ADBD]">Estimated Stroop Latency Cost</td>
              {selectedParticipants.map((p) => (
                <td key={p.id} className="py-3 px-4 text-[#8B5CF6]">
                  +{Math.round((p.avgReactionTimeMs * 0.12))} ms
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </GlassPanel>
  );
}
