"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useParticipants } from "@/hooks/use-participants";
import { formatMs, formatPercent } from "@/lib/utils";
import { Users, Search, ArrowRight, ShieldCheck, Clock, Target } from "lucide-react";

export default function ParticipantsPage() {
  const { participants, loading } = useParticipants();
  const [search, setSearch] = useState("");

  const filtered = participants.filter((p) =>
    p.displayName.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout
      title="Participant Directory"
      subtitle="Psychometric session tracking, subject cohorts, and individual latency profiles"
    >
      {/* Search Header */}
      <GlassPanel className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#697386]" />
          <input
            type="text"
            placeholder="Search participant pseudonym or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#10141D] text-xs text-white placeholder-[#697386] pl-9 pr-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#4F8CFF]"
          />
        </div>

        <div className="text-xs font-mono text-[#A5ADBD]">
          Total Registered Cohort: <strong className="text-white">{participants.length} Subjects</strong>
        </div>
      </GlassPanel>

      {/* Participants Table */}
      <GlassPanel className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#0A0D14] border-b border-white/10 text-[#697386] font-mono uppercase">
              <tr>
                <th className="py-3 px-4 font-normal">Subject Identifier</th>
                <th className="py-3 px-4 font-normal">Status</th>
                <th className="py-3 px-4 font-normal">Completed Studies</th>
                <th className="py-3 px-4 font-normal">Total Trials</th>
                <th className="py-3 px-4 font-normal">Mean RT</th>
                <th className="py-3 px-4 font-normal">Accuracy</th>
                <th className="py-3 px-4 font-normal">Consistency</th>
                <th className="py-3 px-4 font-normal text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-medium text-white">
                    <Link
                      href={`/participants/${p.id}`}
                      className="hover:text-[#4F8CFF] transition-colors flex items-center gap-2"
                    >
                      <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-[#A5ADBD]">
                        {p.id.slice(-2)}
                      </span>
                      <span>{p.displayName}</span>
                    </Link>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={p.status === "completed" ? "published" : "draft"} size="sm">
                      {p.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-[#A5ADBD]">
                    {p.completedExperiments} studies
                  </td>
                  <td className="py-3.5 px-4 text-[#A5ADBD]">
                    {p.totalTrials} trials
                  </td>
                  <td className="py-3.5 px-4 text-[#4F8CFF] font-semibold text-sm">
                    {formatMs(p.avgReactionTimeMs)}
                  </td>
                  <td className="py-3.5 px-4 text-[#22C55E] font-semibold text-sm">
                    {formatPercent(p.accuracyPercent)}
                  </td>
                  <td className="py-3.5 px-4 text-[#8B5CF6]">
                    {p.consistencyScore} / 100
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link href={`/participants/${p.id}`}>
                      <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                        Inspect
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
