"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Bell, Activity, Sparkles, ExternalLink } from "lucide-react";
import { apiConfig } from "@/lib/api/client";
import { LiveSparkline } from "../visualizations/LiveSparkline";

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Topbar({ title, subtitle, actions }: TopbarProps) {
  const [searchVal, setSearchVal] = useState("");

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
          placeholder="Search experiments, trials, stimuli..."
          className="w-full bg-[#10141D] text-xs text-white placeholder-[#697386] pl-9 pr-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#4F8CFF]/50 transition-colors"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Live Sparkline Widget */}
        <div className="hidden xl:block">
          <LiveSparkline />
        </div>

        {/* Mock Mode Pill */}
        <Link
          href="/settings"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#22C55E]/10 border border-[#22C55E]/25 text-[11px] font-mono text-[#4ADE80] hover:bg-[#22C55E]/15 transition-colors"
          title="CognitiveLab is operating in Mock Mode with local telemetry persistence"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
          <span>MOCK MODE</span>
        </Link>

        {/* Custom Actions (e.g., Export, Create, Filter) */}
        {actions}

        {/* Notifications Icon */}
        <button
          className="relative p-2 text-[#A5ADBD] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#4F8CFF]" />
        </button>
      </div>
    </header>
  );
}
