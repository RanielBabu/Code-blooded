"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  FlaskConical,
  X,
  ArrowRight,
  Shield,
  Sparkles,
  Lock,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { Role } from "@/types/auth";
import { MOCK_USERS } from "@/lib/auth/mock-users";

interface RoleSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetGameId?: string;
  targetGameName?: string;
}

export function RoleSelectModal({
  isOpen,
  onClose,
  targetGameId,
  targetGameName,
}: RoleSelectModalProps) {
  const router = useRouter();
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleSelectRole = (role: Role) => {
    onClose();

    // If already logged in with the requested role
    if (user && user.role === role) {
      if (role === "researcher") {
        router.push(targetGameId ? "/experiments" : "/dashboard");
      } else {
        router.push(targetGameId ? `/preview/${targetGameId}` : "/participant/dashboard");
      }
      return;
    }

    // Direct user to Sign In / Profile form to enter Name, Email, Sex, Birthdate
    const params = new URLSearchParams();
    params.set("role", role);
    if (targetGameId) {
      params.set("game", targetGameId);
    }
    router.push(`/login?${params.toString()}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="max-w-lg w-full bg-[#0D111A] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[#A5ADBD] hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4F8CFF]/10 border border-[#4F8CFF]/30 text-[11px] font-mono text-[#60A5FA]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Select Your Access Role</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {targetGameName ? `Access ${targetGameName}` : "Enter CognitiveLab"}
          </h2>
          <p className="text-xs text-[#A5ADBD] max-w-sm mx-auto">
            Choose how you wish to experience the platform. Researchers have full administrative access.
          </p>
        </div>

        {/* Role Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Option 1: Participant */}
          <button
            type="button"
            onClick={() => handleSelectRole("participant")}
            className="p-5 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] hover:from-[#10B981]/15 hover:to-transparent border border-white/10 hover:border-[#10B981]/50 text-left transition-all group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#34D399] group-hover:scale-110 transition-transform">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-[#34D399] transition-colors">
                  Participant
                </h3>
                <p className="text-xs text-[#A5ADBD] mt-1 leading-relaxed">
                  Browse available published games, run behavioral trials, and track personal reaction times.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-[#34D399] font-medium">
              <span>{targetGameId ? "Play this Game" : "Study Library"}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Option 2: Researcher */}
          <button
            type="button"
            onClick={() => handleSelectRole("researcher")}
            className="p-5 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] hover:from-[#4F8CFF]/15 hover:to-transparent border border-white/10 hover:border-[#4F8CFF]/50 text-left transition-all group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#4F8CFF]/15 border border-[#4F8CFF]/30 flex items-center justify-center text-[#60A5FA] group-hover:scale-110 transition-transform">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-[#60A5FA] transition-colors">
                  Researcher
                </h3>
                <p className="text-xs text-[#A5ADBD] mt-1 leading-relaxed">
                  Full access to experiment builder, game publishing toggles, cohort datasets, and age analytics.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-[#60A5FA] font-medium">
              <span>Full Access Console</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* Footer Note & Full Sign In Link */}
        <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#697386]">
          <span>Zero-knowledge role separation active</span>
          <button
            onClick={() => {
              onClose();
              router.push("/login");
            }}
            className="text-[#60A5FA] hover:underline"
          >
            Custom credentials login →
          </button>
        </div>
      </div>
    </div>
  );
}
