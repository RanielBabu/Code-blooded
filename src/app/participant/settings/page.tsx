"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/lib/auth/auth-context";
import {
  User,
  ShieldCheck,
  Lock,
  LogOut,
  Calendar,
  Layers,
  FileText,
  KeyRound,
  CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export default function ParticipantSettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <RouteGuard allowedRole="participant">
      <DashboardLayout
        title="Settings & Privacy"
        subtitle="Manage your participant profile, data privacy preferences, and session security"
      >
        <div className="max-w-4xl space-y-6">
          {/* Profile Overview Card */}
          <div className="rounded-2xl bg-[#0A0D14] border border-white/10 p-6">
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <User className="w-4 h-4 text-[#10B981]" />
              Participant Identity
            </h3>
            <p className="text-xs text-[#A5ADBD] mb-6">
              Your registered demographic profile and research identifier
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#697386]">
                  Display Name
                </span>
                <p className="text-sm font-bold text-white mt-1">{user?.displayName || "—"}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#697386]">
                  Participant ID
                </span>
                <p className="text-sm font-mono font-bold text-[#38BDF8] mt-1">{user?.id || "—"}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#697386]">
                  Age & Cohort
                </span>
                <p className="text-sm font-bold text-white mt-1">
                  Age {user?.age ?? "—"} ·{" "}
                  <span className="text-[#10B981] font-mono font-semibold">
                    {user?.ageGroup} Cohort
                  </span>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#697386]">
                  Biological Sex
                </span>
                <p className="text-sm font-bold text-white mt-1 capitalize">
                  {user?.sex?.replace(/_/g, " ") || "Not Specified"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 sm:col-span-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#697386]">
                  Date of Birth
                </span>
                <p className="text-sm font-mono text-white mt-1 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#A5ADBD]" />
                  <span>{user?.dateOfBirth || "Confidential"}</span>
                  <span className="text-[10px] text-[#A5ADBD]">
                    (Used strictly for age cohort categorization; never shared)
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Privacy & Confidentiality Guarantee */}
          <div className="rounded-2xl bg-[#0A0D14] border border-white/10 p-6">
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              Data Privacy & Anonymity Architecture
            </h3>
            <p className="text-xs text-[#A5ADBD] mb-4">
              CognitiveLab enforces zero-knowledge participant identity separation by design:
            </p>

            <div className="space-y-3 text-xs text-[#A5ADBD]">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-medium">Pseudonymized Identifier:</span> Researchers and investigators
                  only observe your anonymized subject code (<code className="text-[#38BDF8]">P-XXX</code>). Your personal name is never revealed.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-medium">No Cross-Participant Exposure:</span> You have exclusive access to
                  your own trial logs and personal bests. You cannot view other subjects&apos; data or the participant directory.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-medium">Cohort Aggregation Threshold:</span> Demographic metrics are only
                  analyzed in groups of 5 or more participants to prevent de-anonymization of outliers.
                </div>
              </div>
            </div>
          </div>

          {/* Logout Action */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of Session</span>
            </button>
          </div>
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}
