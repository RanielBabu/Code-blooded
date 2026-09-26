"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/lib/auth/auth-context";
import { experimentService } from "@/lib/api/services/experiment-service";
import { Experiment } from "@/types/experiment";
import {
  Play,
  Clock,
  Sparkles,
  Layers,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function ParticipantExperimentsPage() {
  const { user } = useAuth();
  const [publishedGames, setPublishedGames] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGames = useCallback(async () => {
    try {
      setLoading(true);
      const games = await experimentService.getPublished();
      setPublishedGames(games);
    } catch (err) {
      console.error("Failed to load published studies", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();
    // Poll or re-check periodically so when researcher publishes/disables in another tab it reflects
    const interval = setInterval(fetchGames, 2000);
    return () => clearInterval(interval);
  }, [fetchGames]);

  return (
    <RouteGuard allowedRole="participant">
      <DashboardLayout
        title="Study Library"
        subtitle="Select a published cognitive experiment to participate and record high-precision reaction telemetry"
        actions={
          <button
            onClick={fetchGames}
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#A5ADBD] hover:text-white border border-white/10 transition-colors"
            title="Refresh available studies"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        }
      >
        {/* Top Info Banner */}
        <div className="p-4 rounded-2xl bg-[#0A0D14] border border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#34D399]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Active Research Protocol Library</p>
              <p className="text-[11px] text-[#A5ADBD]">
                {publishedGames.length} {publishedGames.length === 1 ? "study" : "studies"} currently authorized and published by researchers
              </p>
            </div>
          </div>
          <div className="text-[11px] font-mono text-[#697386] hidden sm:block">
            Participant ID: <span className="text-[#34D399]">{user?.id}</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && publishedGames.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#10B981] border-t-transparent animate-spin" />
            <p className="text-xs font-mono text-[#A5ADBD]">Checking researcher catalog...</p>
          </div>
        )}

        {/* Empty State (If researcher unpublished all games) */}
        {!loading && publishedGames.length === 0 && (
          <div className="py-20 px-6 rounded-2xl bg-[#0A0D14] border border-white/10 text-center max-w-lg mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Studies Currently Published</h3>
            <p className="text-xs text-[#A5ADBD] leading-relaxed">
              The research investigators currently have no studies in active published status.
              As soon as a researcher publishes a game, it will appear here immediately.
            </p>
          </div>
        )}

        {/* 3-Column Desktop Grid following the reference card layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedGames.map((study) => (
            <div
              key={study.id}
              className="rounded-2xl bg-[#0A0D14] border border-white/10 hover:border-[#10B981]/40 p-6 flex flex-col justify-between transition-all duration-200 group hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.15)] relative overflow-hidden"
            >
              <div>
                {/* Card Top: Published Badge & Version */}
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#34D399] text-[10px] font-mono font-medium tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                    PUBLISHED
                  </span>
                  <span className="text-[11px] font-mono text-[#697386] bg-white/[0.04] px-2 py-0.5 rounded border border-white/5">
                    v{study.version || 1}
                  </span>
                </div>

                {/* Large Simple Game Title */}
                <h3 className="text-xl font-bold text-white group-hover:text-[#34D399] transition-colors mb-2">
                  {study.name}
                </h3>

                {/* Short Description */}
                <p className="text-xs text-[#A5ADBD] leading-relaxed mb-6">
                  {study.description}
                </p>
              </div>

              {/* Card Bottom: Metadata & Single Primary Action Button */}
              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-2">
                <div className="text-[10px] font-mono text-[#697386]">
                  <div>Updated: {new Date(study.updatedAt || Date.now()).toLocaleDateString("en-GB")}</div>
                  <div className="flex items-center gap-1 text-[#A5ADBD] mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4F8CFF]" />
                    Live Version: {study.version || 1}
                  </div>
                </div>

                <Link
                  href={`/preview/${study.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:brightness-110 text-white text-xs font-semibold shadow-[0_0_15px_-3px_rgba(16,185,129,0.35)] transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play Study</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}
