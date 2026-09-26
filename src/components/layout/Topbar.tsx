"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Activity,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Lock,
  ChevronDown,
  UserCheck,
  User,
  ArrowRightLeft,
  LogOut,
  Zap,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { MOCK_USERS } from "@/lib/auth/mock-users";
import { LiveSparkline } from "../visualizations/LiveSparkline";

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Topbar({ title, subtitle, actions }: TopbarProps) {
  const [searchVal, setSearchVal] = useState("");
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);
  const { user, isParticipant, isResearcher, switchDemoUser, logout } = useAuth();
  const router = useRouter();

  // Close demo switcher dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setSwitcherOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitch = (userId: string, targetRole: "researcher" | "participant") => {
    switchDemoUser(userId);
    setSwitcherOpen(false);
    if (targetRole === "participant") {
      router.push("/participant/dashboard");
    } else {
      router.push("/researcher/age-analytics");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="h-16 bg-[#080B11]/90 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col min-w-0">
        <h1 className="text-base sm:text-lg font-bold text-white tracking-tight truncate flex items-center gap-2">
          {title}
        </h1>
        {subtitle && <p className="text-[11px] text-[#A5ADBD] truncate hidden sm:block">{subtitle}</p>}
      </div>

      {/* Center Search Input */}
      <div className="hidden lg:flex items-center flex-1 max-w-xs relative">
        <Search className="w-3.5 h-3.5 absolute left-3 text-[#697386]" />
        <input
          type="text"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          placeholder={
            isParticipant
              ? "Search your experiments, trials..."
              : "Search experiments, participants, metrics..."
          }
          className="w-full bg-[#10141D] text-xs text-white placeholder-[#697386] pl-9 pr-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#4F8CFF]/50 transition-colors"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Live Sparkline Widget */}
        <div className="hidden xl:block">
          <LiveSparkline />
        </div>

        {/* Role Badge Indicator */}
        {isParticipant ? (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#10B981]/10 border border-[#10B981]/30 text-[11px] font-mono text-[#34D399]"
            title="Private Participant Access — only your personal trial data is visible"
          >
            <Lock className="w-3 h-3 text-[#10B981]" />
            <span className="hidden sm:inline font-semibold">PARTICIPANT</span>
            <span className="text-[#A5ADBD] hidden md:inline">({user?.ageGroup})</span>
          </div>
        ) : (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#4F8CFF]/10 border border-[#4F8CFF]/30 text-[11px] font-mono text-[#60A5FA]"
            title="Researcher Access — Full workspace, participant directory & age analytics"
          >
            <ShieldCheck className="w-3 h-3 text-[#4F8CFF]" />
            <span className="hidden sm:inline font-semibold">RESEARCHER</span>
          </div>
        )}

        {/* 1-Click Demo User Switcher Dropdown */}
        <div className="relative" ref={switcherRef}>
          <button
            onClick={() => setSwitcherOpen(!switcherOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-white transition-colors"
            title="Switch demo role or user"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-[#4F8CFF]" />
            <span className="hidden sm:inline text-[#A5ADBD] text-[11px]">Demo:</span>
            <span className="font-semibold text-xs max-w-[100px] truncate">
              {user?.displayName ? user.displayName.split(" ")[0] : "Switch"}
            </span>
            <ChevronDown className="w-3 h-3 text-[#697386]" />
          </button>

          {switcherOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-[#0F131C] border border-white/10 rounded-xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#697386]">
                  1-Click Role & Demo Switcher
                </p>
                <p className="text-xs text-white font-medium">Switch perspective instantly</p>
              </div>

              <div className="space-y-1">
                {MOCK_USERS.map((u) => {
                  const isCurrent = user?.id === u.id;
                  const isPart = u.role === "participant";
                  return (
                    <button
                      key={u.id}
                      onClick={() => handleSwitch(u.id, u.role)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                        isCurrent
                          ? "bg-white/[0.08] border border-white/15"
                          : "hover:bg-white/[0.04] border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${
                            isPart
                              ? "bg-gradient-to-tr from-[#10B981] to-[#06B6D4]"
                              : "bg-gradient-to-tr from-[#4F8CFF] to-[#8B5CF6]"
                          }`}
                        >
                          {u.displayName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white truncate">
                            {u.displayName}
                          </p>
                          <p className="text-[10px] text-[#A5ADBD] font-mono flex items-center gap-1">
                            <span>Age {u.age}</span>
                            <span>•</span>
                            <span>{u.ageGroup}</span>
                            <span>•</span>
                            <span className={isPart ? "text-[#34D399]" : "text-[#60A5FA]"}>
                              {isPart ? "Participant" : "Researcher"}
                            </span>
                          </p>
                        </div>
                      </div>
                      {isCurrent && (
                        <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between px-1">
                <Link
                  href="/login"
                  onClick={() => setSwitcherOpen(false)}
                  className="text-[11px] text-[#60A5FA] hover:underline flex items-center gap-1"
                >
                  <User className="w-3 h-3" />
                  Full Login / Register
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mock Mode Pill */}
        <Link
          href="/settings"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#22C55E]/10 border border-[#22C55E]/25 text-[11px] font-mono text-[#4ADE80] hover:bg-[#22C55E]/15 transition-colors"
          title="CognitiveLab is operating in Mock Mode with local telemetry persistence"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
          <span>MOCK</span>
        </Link>

        {/* Custom Actions (e.g., Export, Create, Filter) */}
        {actions}
      </div>
    </header>
  );
}
