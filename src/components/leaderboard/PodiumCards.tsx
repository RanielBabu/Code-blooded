"use client";

import React from "react";
import { LeaderboardEntry } from "@/types/participant";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Trophy, Medal, Award, Zap, Target, Gauge } from "lucide-react";
import { formatMs, formatPercent } from "@/lib/utils";
import Link from "next/link";

export function PodiumCards({ entries }: { entries: LeaderboardEntry[] }) {
  if (!entries || entries.length < 3) return null;

  const first = entries[0];
  const second = entries[1];
  const third = entries[2];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4">
      {/* Silver - Rank 2 */}
      <div className="order-2 md:order-1">
        <GlassPanel className="p-5 border-white/15 relative overflow-hidden group hover:border-[#8B5CF6]/50 transition-all">
          <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
            <Medal className="w-12 h-12 text-[#8B5CF6]" />
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-[#8B5CF6] text-xs font-mono font-bold flex items-center justify-center">
              2
            </span>
            <span className="text-[11px] font-mono uppercase text-[#A5ADBD]">Silver Benchmark</span>
          </div>

          <Link href={`/participants/${second.participantId}`} className="hover:underline">
            <h4 className="text-base font-bold text-white tracking-tight truncate">
              {second.displayName}
            </h4>
          </Link>

          <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="text-[10px] text-[#697386] font-mono uppercase block">Mean RT</span>
              <span className="text-sm font-bold text-white font-mono">{formatMs(second.averageReactionTimeMs)}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#697386] font-mono uppercase block">Accuracy</span>
              <span className="text-sm font-bold text-[#22C55E] font-mono">{formatPercent(second.accuracyPercent)}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#697386] font-mono uppercase block">Consistency</span>
              <span className="text-sm font-bold text-[#8B5CF6] font-mono">{second.consistencyScore}</span>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Gold - Rank 1 (Elevated in Center) */}
      <div className="order-1 md:order-2 md:-translate-y-2">
        <GlassPanel elevated className="p-6 border-[#4F8CFF]/50 bg-gradient-to-b from-[#151A24] to-[#0A0D14] relative overflow-hidden group shadow-[0_0_30px_rgba(79,140,255,0.2)]">
          <div className="absolute top-0 right-0 p-4 opacity-25 group-hover:opacity-50 transition-opacity">
            <Trophy className="w-16 h-16 text-[#4F8CFF]" />
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="w-7 h-7 rounded-full bg-[#4F8CFF] text-[#05060A] text-xs font-mono font-black flex items-center justify-center shadow-[0_0_12px_#4F8CFF]">
              1
            </span>
            <span className="text-xs font-mono uppercase font-bold text-[#4F8CFF] tracking-wider">
              Optimal Latency Rank
            </span>
          </div>

          <Link href={`/participants/${first.participantId}`} className="hover:underline">
            <h4 className="text-lg font-bold text-white tracking-tight truncate">
              {first.displayName}
            </h4>
          </Link>

          <div className="mt-5 pt-4 border-t border-white/15 grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="text-[10px] text-[#A5ADBD] font-mono uppercase block">Mean RT</span>
              <span className="text-base font-extrabold text-[#4F8CFF] font-mono">
                {formatMs(first.averageReactionTimeMs)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#A5ADBD] font-mono uppercase block">Accuracy</span>
              <span className="text-base font-extrabold text-[#22C55E] font-mono">
                {formatPercent(first.accuracyPercent)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#A5ADBD] font-mono uppercase block">Consistency</span>
              <span className="text-base font-extrabold text-[#22D3EE] font-mono">
                {first.consistencyScore}
              </span>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Bronze - Rank 3 */}
      <div className="order-3">
        <GlassPanel className="p-5 border-white/15 relative overflow-hidden group hover:border-[#22D3EE]/50 transition-all">
          <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
            <Award className="w-12 h-12 text-[#22D3EE]" />
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-[#22D3EE]/20 border border-[#22D3EE]/40 text-[#22D3EE] text-xs font-mono font-bold flex items-center justify-center">
              3
            </span>
            <span className="text-[11px] font-mono uppercase text-[#A5ADBD]">Bronze Benchmark</span>
          </div>

          <Link href={`/participants/${third.participantId}`} className="hover:underline">
            <h4 className="text-base font-bold text-white tracking-tight truncate">
              {third.displayName}
            </h4>
          </Link>

          <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="text-[10px] text-[#697386] font-mono uppercase block">Mean RT</span>
              <span className="text-sm font-bold text-white font-mono">{formatMs(third.averageReactionTimeMs)}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#697386] font-mono uppercase block">Accuracy</span>
              <span className="text-sm font-bold text-[#22C55E] font-mono">{formatPercent(third.accuracyPercent)}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#697386] font-mono uppercase block">Consistency</span>
              <span className="text-sm font-bold text-[#22D3EE] font-mono">{third.consistencyScore}</span>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
