"use client";

import React from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/lib/auth/auth-context";
import { useParticipantPersonal } from "@/hooks/use-participant-personal";
import {
  Award,
  Zap,
  Target,
  Sparkles,
  Trophy,
  Flame,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export default function ParticipantPersonalBestsPage() {
  const { user } = useAuth();
  const { data, loading } = useParticipantPersonal(user?.id);
  const pBests = data?.personalBests;

  const records = [
    {
      title: "Fastest Response Time",
      description: "Fastest verified response on any visual stimulus trial",
      value: `${pBests?.fastestRt?.value ?? 0} ms`,
      sub: pBests?.fastestRt?.taskName || "Color Response Task",
      icon: Zap,
      gradient: "from-[#38BDF8] to-[#0284C7]",
      border: "border-[#38BDF8]/40",
      textAccent: "text-[#38BDF8]",
    },
    {
      title: "Peak Accuracy Score",
      description: "Highest accuracy percentage recorded in a single session",
      value: `${pBests?.bestAccuracy?.value ?? 100}%`,
      sub: pBests?.bestAccuracy?.taskName || "Standard Protocol",
      icon: Target,
      gradient: "from-[#10B981] to-[#059669]",
      border: "border-[#10B981]/40",
      textAccent: "text-[#10B981]",
    },
    {
      title: "Maximum Consistency",
      description: "Lowest latency variability across 10 consecutive trials",
      value: `${pBests?.mostConsistent?.value ?? 88}/100`,
      sub: "Neuro-motor stability score",
      icon: Sparkles,
      gradient: "from-[#8B5CF6] to-[#6D28D9]",
      border: "border-[#8B5CF6]/40",
      textAccent: "text-[#8B5CF6]",
    },
    {
      title: "Color Stimulus Record",
      description: "Personal best for chromatic visual detection",
      value: `${pBests?.bestColorRt?.value ?? 245} ms`,
      sub: "Color Response Study",
      icon: Trophy,
      gradient: "from-[#F59E0B] to-[#D97706]",
      border: "border-[#F59E0B]/40",
      textAccent: "text-[#F59E0B]",
    },
    {
      title: "Image Stimulus Record",
      description: "Personal best for complex visual shape recognition",
      value: `${pBests?.bestImageRt?.value ?? 280} ms`,
      sub: "Visual Discrimination",
      icon: Flame,
      gradient: "from-[#EC4899] to-[#BE185D]",
      border: "border-[#EC4899]/40",
      textAccent: "text-[#EC4899]",
    },
    {
      title: "Text Stimulus Record",
      description: "Personal best for lexical comprehension response",
      value: `${pBests?.bestTextRt?.value ?? 310} ms`,
      sub: "Semantic Stroop Task",
      icon: CheckCircle,
      gradient: "from-[#06B6D4] to-[#0891B2]",
      border: "border-[#06B6D4]/40",
      textAccent: "text-[#06B6D4]",
    },
  ];

  const milestones = [
    {
      name: "Sub-300ms Reflex",
      description: "Clocked a reaction time under 300 milliseconds",
      achieved: (pBests?.fastestRt?.value ?? 999) < 300,
      tier: "Gold",
    },
    {
      name: "Sharpshooter",
      description: "Maintained 95%+ accuracy in a session",
      achieved: (pBests?.bestAccuracy?.value ?? 0) >= 95,
      tier: "Platinum",
    },
    {
      name: "Trial Centurion",
      description: "Completed 50+ total experimental trials",
      achieved: (data?.totalTrials ?? 0) >= 50,
      tier: "Silver",
    },
    {
      name: "Steel Focus",
      description: "Achieved a consistency rating above 85",
      achieved: (pBests?.mostConsistent?.value ?? 0) >= 85,
      tier: "Diamond",
    },
  ];

  return (
    <RouteGuard allowedRole="participant">
      <DashboardLayout
        title="Personal Bests & Records"
        subtitle="Your highest cognitive milestones, fastest reflexes, and personal achievement history"
        actions={
          <Link
            href="/preview/exp-color-response"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-xs font-semibold shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)] transition-all"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Beat a Record</span>
          </Link>
        }
      >
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#F59E0B]/10 via-[#0A1628]/80 to-[#10B981]/10 border border-white/10 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#FBBF24] text-[11px] font-mono font-medium">
                  <Trophy className="w-3 h-3 text-[#FBBF24]" />
                  Hall of Personal Records
                </span>
                <span className="text-xs text-[#A5ADBD] font-mono">
                  {user?.displayName}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Your Cognitive Trophies
              </h2>
              <p className="text-xs sm:text-sm text-[#A5ADBD] mt-1 max-w-2xl leading-relaxed">
                Every session you complete updates your records dynamically. These personal bests are tracked
                privately on your account.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3 bg-white/[0.04] p-3 rounded-xl border border-white/10">
              <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/20 border border-[#F59E0B]/30 flex items-center justify-center text-[#FBBF24]">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-[#697386] uppercase">Top Speed</p>
                <p className="text-lg font-mono font-bold text-white">
                  {pBests?.fastestRt?.value ?? 0} ms
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Record Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map((rec) => {
            const Icon = rec.icon;
            return (
              <div
                key={rec.title}
                className={`p-5 rounded-xl bg-[#0D111A] border ${rec.border} relative overflow-hidden group hover:scale-[1.01] transition-all`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#A5ADBD]">
                      {rec.title}
                    </h4>
                    <p className="text-xs text-[#697386] mt-0.5">{rec.description}</p>
                  </div>
                  <div
                    className={`w-9 h-9 rounded-lg bg-gradient-to-tr ${rec.gradient} flex items-center justify-center text-white shadow-md`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-2">
                  <div className={`text-3xl font-mono font-bold ${rec.textAccent}`}>
                    {loading ? "..." : rec.value}
                  </div>
                  <p className="text-[11px] text-[#A5ADBD] font-mono mt-1">{rec.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Milestones & Badges */}
        <div className="rounded-2xl bg-[#0A0D14] border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                Cognitive Milestones
              </h3>
              <p className="text-xs text-[#A5ADBD]">
                Badges unlocked through high precision and sustained reaction speed
              </p>
            </div>
            <span className="text-xs font-mono text-[#A5ADBD]">
              {milestones.filter((m) => m.achieved).length} of {milestones.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {milestones.map((m) => (
              <div
                key={m.name}
                className={`p-4 rounded-xl border transition-all ${
                  m.achieved
                    ? "bg-[#10B981]/5 border-[#10B981]/30"
                    : "bg-white/[0.02] border-white/[0.06] opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      m.achieved
                        ? "bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/40"
                        : "bg-white/5 text-[#697386]"
                    }`}
                  >
                    {m.tier}
                  </span>
                  {m.achieved ? (
                    <CheckCircle className="w-4 h-4 text-[#10B981]" />
                  ) : (
                    <Clock className="w-4 h-4 text-[#697386]" />
                  )}
                </div>
                <h4 className="text-sm font-bold text-white">{m.name}</h4>
                <p className="text-xs text-[#A5ADBD] mt-1 leading-relaxed">{m.description}</p>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}
