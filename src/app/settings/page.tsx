"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { apiConfig } from "@/lib/api/client";
import { mockStore } from "@/lib/mock/mock-storage";
import { useToast } from "@/components/ui/Toast";
import {
  Server,
  Database,
  Cpu,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Globe,
  Sliders,
  Bell,
  CheckCircle2,
} from "lucide-react";

export default function SettingsPage() {
  const [useMock, setUseMock] = useState(apiConfig.useMockData);
  const [apiUrl, setApiUrl] = useState(apiConfig.baseUrl);
  const [latency, setLatency] = useState(apiConfig.simulatedDelayMs);
  const [pingStatus, setPingStatus] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  const { success, error: toastError } = useToast();

  const handleTestPing = async () => {
    setIsPinging(true);
    setPingStatus(null);
    try {
      await new Promise((res) => setTimeout(res, 400));
      if (useMock) {
        setPingStatus("Mock Transport OK (Sub-millisecond Local Store)");
        success("Ping Successful", "Mock storage pipeline is healthy and active.");
      } else {
        const res = await fetch(`${apiUrl}/health`).catch(() => null);
        if (res && res.ok) {
          setPingStatus("Remote REST API Connected");
          success("Backend Online", "Successfully verified remote API status.");
        } else {
          setPingStatus("Backend Unreachable (Falling back to Mock Mode)");
          toastError("Connection Warning", "Configured API URL is unreachable. System will use mock fallback.");
        }
      }
    } finally {
      setIsPinging(false);
    }
  };

  const handleResetData = () => {
    if (confirm("Reset local trial data, participants, and experiments to factory benchmark defaults?")) {
      mockStore.resetToDefaults();
      success("Store Reset", "Restored initial benchmark dataset.");
      setTimeout(() => window.location.reload(), 600);
    }
  };

  const handleSaveSettings = () => {
    apiConfig.useMockData = useMock;
    apiConfig.baseUrl = apiUrl;
    apiConfig.simulatedDelayMs = latency;
    success("Configuration Saved", "API and runtime parameters updated.");
  };

  return (
    <DashboardLayout
      title="Platform Settings"
      subtitle="Configure runtime telemetry, API contracts, mock simulation, and workspace parameters"
    >
      <div className="max-w-4xl space-y-6">
        {/* API & Backend Integration */}
        <GlassPanel elevated className="p-6 space-y-6 border-white/15">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#4F8CFF]/15 border border-[#4F8CFF]/30 text-[#4F8CFF] flex items-center justify-center">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white tracking-tight">
                  API & Backend Integration
                </h3>
                <p className="text-xs text-[#A5ADBD]">
                  Seamlessly toggle between frontend Mock Mode and production API servers
                </p>
              </div>
            </div>

            <Badge variant={useMock ? "published" : "cyan"} size="md">
              {useMock ? "MOCK MODE ACTIVE" : "API MODE CONNECTED"}
            </Badge>
          </div>

          <div className="space-y-4 text-xs">
            {/* Mock Mode Toggle */}
            <div className="p-4 rounded-xl bg-[#080B11] border border-white/10 flex items-center justify-between gap-4">
              <div>
                <label className="text-sm font-semibold text-white block">
                  Enable Local Mock Mode (Frontend-First)
                </label>
                <p className="text-[#A5ADBD] text-xs mt-0.5 max-w-md">
                  Generates realistic psychometric trial data, runs local persistence, and bypasses remote network calls.
                </p>
              </div>
              <input
                type="checkbox"
                checked={useMock}
                onChange={(e) => setUseMock(e.target.checked)}
                className="w-5 h-5 accent-[#4F8CFF] cursor-pointer"
              />
            </div>

            {/* API Base URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#A5ADBD] uppercase">
                Remote API Base URL (NEXT_PUBLIC_API_BASE_URL)
              </label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.cognitivelab.internal/v1"
                className="w-full bg-[#10141D] text-white font-mono text-xs px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-[#4F8CFF]"
              />
              <span className="text-[10px] text-[#697386]">
                Typed contract layer will automatically route requests here when Mock Mode is disabled.
              </span>
            </div>

            {/* Simulated Latency */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono text-[#A5ADBD] uppercase">
                  Simulated Network Roundtrip Latency: {latency} ms
                </label>
              </div>
              <input
                type="range"
                min="0"
                max="800"
                step="20"
                value={latency}
                onChange={(e) => setLatency(parseInt(e.target.value))}
                className="w-full accent-[#4F8CFF] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#697386]">
                <span>0 ms (Instant)</span>
                <span>200 ms (Typical)</span>
                <span>800 ms (High Jitter)</span>
              </div>
            </div>

            {/* Status Ping feedback */}
            {pingStatus && (
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                <span>{pingStatus}</span>
              </div>
            )}

            {/* Test Connection Button */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleTestPing}
                isLoading={isPinging}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Test Connection & Telemetry Ping
              </Button>

              <Button
                variant="glow"
                size="sm"
                onClick={handleSaveSettings}
              >
                Apply Parameters
              </Button>
            </div>
          </div>
        </GlassPanel>

        {/* Experiment Defaults & Reset */}
        <GlassPanel className="p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-[#8B5CF6]" />
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Local Telemetry Store Management
              </h3>
              <p className="text-xs text-[#A5ADBD]">
                CognitiveLab stores benchmark experiments and participant trial runs in reactive local storage.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#080B11] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-white">Reset Benchmark Data</p>
              <p className="text-[11px] text-[#A5ADBD] mt-0.5 max-w-sm">
                Clears live session recordings and restores default 10-trial Stroop dataset and participant records.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={handleResetData}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset to Factory Defaults
            </Button>
          </div>
        </GlassPanel>
      </div>
    </DashboardLayout>
  );
}
