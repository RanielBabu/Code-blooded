"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ToastProvider } from "@/components/ui/Toast";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function DashboardLayout({
  children,
  title,
  subtitle,
  actions,
}: DashboardLayoutProps) {
  return (
    <ToastProvider>
      <div className="flex h-screen bg-[#05060A] text-white overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Right Main Region */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar title={title} subtitle={subtitle} actions={actions} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#05060A]">
            <div className="max-w-7xl mx-auto space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
