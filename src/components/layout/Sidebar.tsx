"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import {
  LayoutDashboard,
  FlaskConical,
  Users,
  BarChart3,
  Trophy,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const mainNav = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Experiments", href: "/experiments", icon: FlaskConical },
    { label: "Participants", href: "/participants", icon: Users },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { label: "Research Library", href: "/library", icon: BookOpen },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen bg-[#0A0D14] border-r border-white/[0.08] transition-all duration-300 z-30 shrink-0 select-none",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Top Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.08]">
        <Logo size="sm" showText={!collapsed} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-[#697386] hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors hidden lg:flex"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Action: New Experiment */}
      <div className="p-3">
        <Link
          href="/builder"
          className={cn(
            "flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg font-medium text-xs text-white bg-[#4F8CFF] hover:bg-[#3E7BE6] transition-all duration-150 shadow-[0_0_15px_-3px_rgba(79,140,255,0.4)] border border-[#4F8CFF]/40",
            collapsed && "px-0"
          )}
        >
          <PlusCircle className="w-4 h-4 shrink-0" />
          {!collapsed && <span>New Experiment</span>}
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className={cn("px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#697386]", collapsed && "text-center px-0")}>
          {!collapsed ? "Research Workspace" : "•••"}
        </div>

        {mainNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group",
                isActive
                  ? "bg-[#4F8CFF]/15 text-[#60A5FA] border border-[#4F8CFF]/30 shadow-[0_0_12px_rgba(79,140,255,0.15)]"
                  : "text-[#A5ADBD] hover:text-white hover:bg-white/[0.04] border border-transparent",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
                  isActive ? "text-[#4F8CFF]" : "text-[#A5ADBD] group-hover:text-white"
                )}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#4F8CFF] shadow-[0_0_6px_#4F8CFF]" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Profile & Telemetry Pill */}
      <div className="p-3 border-t border-white/[0.08] bg-[#07090E]">
        <div
          className={cn(
            "flex items-center gap-3 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]",
            collapsed && "justify-center p-1"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4F8CFF] to-[#8B5CF6] flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm">
            EL
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">Dr. Elena Vance</p>
              <p className="text-[10px] text-[#A5ADBD] truncate flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3 h-3 text-[#22C55E]" />
                Lead Investigator
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
