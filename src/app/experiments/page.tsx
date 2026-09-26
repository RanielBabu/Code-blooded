"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useExperiments } from "@/hooks/use-experiments";
import { formatMs, formatPercent, formatNumber } from "@/lib/utils";
import {
  FlaskConical,
  Plus,
  Search,
  LayoutGrid,
  List,
  Play,
  Edit3,
  Copy,
  Archive,
  Send,
  EyeOff,
  BarChart2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function ExperimentsPage() {
  const {
    experiments,
    loading,
    publishExperiment,
    unpublishExperiment,
    togglePublishExperiment,
    archiveExperiment,
    duplicateExperiment,
  } = useExperiments();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  const { success } = useToast();

  const filteredExperiments = experiments.filter((exp) => {
    if (statusFilter !== "all" && exp.status !== statusFilter) return false;
    if (
      searchQuery &&
      !exp.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !exp.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleDuplicate = async (id: string) => {
    await duplicateExperiment(id);
    success("Experiment Duplicated", "A working copy has been added to your draft registry.");
  };

  const handleTogglePublish = async (id: string, currentStatus: string) => {
    const willPublish = currentStatus !== "published";
    await togglePublishExperiment(id, willPublish);
    if (willPublish) {
      success("Study Published", "Study is now immediately available in the participant library.");
    } else {
      success("Study Unpublished", "Study is now disabled and blocked from participant access.");
    }
  };

  const handleArchive = async (id: string) => {
    await archiveExperiment(id);
    success("Experiment Archived", "Study archived into historical reference.");
  };

  return (
    <DashboardLayout
      title="Experiment Registry & Study Publishing"
      subtitle="Manage, author, preview, publish, and disable behavioral study protocols"
      actions={
        <Link href="/builder">
          <Button variant="glow" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Create Experiment
          </Button>
        </Link>
      }
    >
      {/* Filters & Search Toolbar */}
      <GlassPanel className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-lg border border-white/10 w-full sm:w-auto overflow-x-auto">
          {["all", "published", "disabled", "draft", "archived"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-mono rounded-md uppercase transition-colors shrink-0 ${
                statusFilter === st
                  ? "bg-[#4F8CFF] text-white font-semibold"
                  : "text-[#A5ADBD] hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search & View Mode Switch */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#697386]" />
            <input
              type="text"
              placeholder="Search experiments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#10141D] text-xs text-white placeholder-[#697386] pl-9 pr-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#4F8CFF]"
            />
          </div>

          <div className="flex items-center gap-1 border border-white/10 rounded-lg p-0.5 bg-white/[0.02]">
            <button
              onClick={() => setViewMode("card")}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === "card" ? "bg-white/15 text-white" : "text-[#697386] hover:text-white"
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === "table" ? "bg-white/15 text-white" : "text-[#697386] hover:text-white"
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </GlassPanel>

      {/* Experiments List / Cards */}
      {filteredExperiments.length === 0 ? (
        <EmptyState
          title="No Experiments Found"
          description="No experiment matched your active filter or search query. Create a new experiment or adjust filters."
          actionLabel="Create New Experiment"
          onAction={() => (window.location.href = "/builder")}
        />
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExperiments.map((exp) => {
            const isPub = exp.status === "published";
            const isDis = exp.status === "disabled";

            return (
              <GlassPanel
                key={exp.id}
                className="p-5 flex flex-col justify-between hover:border-white/20 transition-all duration-200 group relative"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-wide uppercase ${
                        isPub
                          ? "bg-[#10B981]/15 border border-[#10B981]/30 text-[#34D399]"
                          : isDis
                          ? "bg-amber-500/15 border border-amber-500/30 text-amber-400"
                          : "bg-white/10 border border-white/20 text-[#A5ADBD]"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isPub ? "bg-[#10B981] animate-pulse" : "bg-amber-400"
                        }`}
                      />
                      {exp.status}
                    </span>
                    <span className="text-[10px] font-mono text-[#697386]">
                      v{exp.version || 1}.0
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight group-hover:text-[#4F8CFF] transition-colors">
                      {exp.name}
                    </h3>
                    <p className="text-xs text-[#A5ADBD] mt-1 line-clamp-2 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>

                  {/* Metrics row */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/5 font-mono text-center">
                    <div>
                      <span className="text-[10px] text-[#697386] block">Subjects</span>
                      <span className="text-xs font-semibold text-white">
                        {exp.stats?.participants ? formatNumber(exp.stats.participants) : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#697386] block">Mean RT</span>
                      <span className="text-xs font-semibold text-[#4F8CFF]">
                        {exp.stats?.avgReactionTimeMs ? formatMs(exp.stats.avgReactionTimeMs) : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#697386] block">Accuracy</span>
                      <span className="text-xs font-semibold text-[#22C55E]">
                        {exp.stats?.accuracyPercent ? formatPercent(exp.stats.accuracyPercent) : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action buttons: Edit | Analytics | Publish/Unpublish | Duplicate */}
                <div className="pt-4 flex items-center justify-between gap-2 border-t border-white/[0.04]">
                  <div className="flex items-center gap-1.5">
                    <Link href="/builder">
                      <Button variant="secondary" size="sm" leftIcon={<Edit3 className="w-3 h-3" />}>
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/analytics?experimentId=${exp.id}`}>
                      <Button variant="ghost" size="sm" leftIcon={<BarChart2 className="w-3 h-3" />}>
                        Analytics
                      </Button>
                    </Link>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* 1-Click Publish / Unpublish Toggle */}
                    <button
                      onClick={() => handleTogglePublish(exp.id, exp.status)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                        isPub
                          ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-[#10B981]/15 hover:bg-[#10B981]/25 text-[#34D399] border border-[#10B981]/40"
                      }`}
                      title={isPub ? "Unpublish / Disable from participants" : "Publish to participants"}
                    >
                      {isPub ? (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Unpublish</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3" />
                          <span>Publish</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDuplicate(exp.id)}
                      className="p-1.5 rounded hover:bg-white/5 text-[#A5ADBD] hover:text-white transition-colors"
                      title="Duplicate Experiment"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {exp.status !== "archived" && (
                      <button
                        onClick={() => handleArchive(exp.id)}
                        className="p-1.5 rounded hover:bg-white/5 text-[#697386] hover:text-white transition-colors"
                        title="Archive"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </GlassPanel>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <GlassPanel className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0A0D14] border-b border-white/10 text-[#697386] font-mono uppercase">
                <tr>
                  <th className="py-3 px-4 font-normal">Experiment Name</th>
                  <th className="py-3 px-4 font-normal">Status</th>
                  <th className="py-3 px-4 font-normal">Participants</th>
                  <th className="py-3 px-4 font-normal">Trials</th>
                  <th className="py-3 px-4 font-normal">Avg RT</th>
                  <th className="py-3 px-4 font-normal">Accuracy</th>
                  <th className="py-3 px-4 font-normal text-right">Publishing & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredExperiments.map((exp) => {
                  const isPub = exp.status === "published";
                  return (
                    <tr key={exp.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-semibold text-white">
                        <Link href="/builder" className="hover:text-[#4F8CFF] transition-colors">
                          {exp.name}
                        </Link>
                        <p className="text-[11px] text-[#697386] font-normal truncate max-w-xs">
                          {exp.description}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                            isPub
                              ? "bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30"
                              : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {exp.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#A5ADBD]">
                        {exp.stats?.participants || "—"}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#A5ADBD]">
                        {exp.stats?.completedTrials || "—"}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#4F8CFF] font-medium">
                        {exp.stats?.avgReactionTimeMs ? formatMs(exp.stats.avgReactionTimeMs) : "—"}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#22C55E] font-medium">
                        {exp.stats?.accuracyPercent ? formatPercent(exp.stats.accuracyPercent) : "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleTogglePublish(exp.id, exp.status)}
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              isPub
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                : "bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/40"
                            }`}
                          >
                            {isPub ? "Unpublish" : "Publish"}
                          </button>
                          <Link href="/builder">
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassPanel>
      )}
    </DashboardLayout>
  );
}
