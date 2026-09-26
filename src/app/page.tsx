"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { NeuralCanvas } from "@/components/visualizations/NeuralCanvas";
import { LiveSparkline } from "@/components/visualizations/LiveSparkline";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import {
  ArrowRight,
  Sparkles,
  Layers,
  FlaskConical,
  Activity,
  BarChart3,
  Cpu,
  ShieldCheck,
  CheckCircle,
  Play,
  Share2,
  Workflow,
  Eye,
  GitBranch,
  Timer,
  ChevronRight,
  Database,
  ExternalLink,
} from "lucide-react";
import { ReactionTimeLineChart } from "@/components/visualizations/ReactionTimeLineChart";

export default function LandingPage() {
  const sampleProgression = [
    { trial: 1, avgRt: 448, textRt: 395, colorRt: 472, imageRt: 495 },
    { trial: 2, avgRt: 432, textRt: 382, colorRt: 450, imageRt: 480 },
    { trial: 3, avgRt: 420, textRt: 368, colorRt: 435, imageRt: 462 },
    { trial: 4, avgRt: 415, textRt: 360, colorRt: 430, imageRt: 458 },
    { trial: 5, avgRt: 410, textRt: 355, colorRt: 425, imageRt: 450 },
    { trial: 6, avgRt: 398, textRt: 345, colorRt: 412, imageRt: 438 },
    { trial: 7, avgRt: 392, textRt: 338, colorRt: 405, imageRt: 430 },
    { trial: 8, avgRt: 385, textRt: 332, colorRt: 398, imageRt: 422 },
    { trial: 9, avgRt: 380, textRt: 328, colorRt: 392, imageRt: 418 },
    { trial: 10, avgRt: 374, textRt: 320, colorRt: 385, imageRt: 410 },
  ];

  return (
    <div className="min-h-screen bg-[#05060A] text-white overflow-hidden flex flex-col">
      <Navbar />

      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Cinematic Neural Research Network)                      */}
      {/* ========================================================================= */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Interactive Neural Canvas */}
        <NeuralCanvas className="opacity-75" />

        {/* Radial ambient lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-[#4F8CFF]/15 via-[#8B5CF6]/15 to-transparent rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-[#22D3EE]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(79,140,255,0.2)] animate-in fade-in slide-in-from-top-4 duration-500">
            <span className="w-2 h-2 rounded-full bg-[#4F8CFF] animate-pulse shadow-[0_0_8px_#4F8CFF]" />
            <span className="text-xs font-mono tracking-widest uppercase text-[#A5ADBD]">
              COGNITIVE RESEARCH INFRASTRUCTURE
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
            Measure Human Response. <br />
            <span className="bg-gradient-to-r from-[#4F8CFF] via-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent">
              Understand Human Behavior.
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-base sm:text-lg text-[#A5ADBD] max-w-2xl mx-auto leading-relaxed font-normal">
            Build cognitive experiments without code, run precise behavioral trials, and transform
            participant responses into actionable research data.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/builder">
              <Button
                variant="glow"
                size="lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Build an Experiment
              </Button>
            </Link>

            <Link href="/analytics">
              <Button
                variant="secondary"
                size="lg"
                rightIcon={<BarChart3 className="w-4 h-4 text-[#22D3EE]" />}
                className="w-full sm:w-auto"
              >
                Explore Analytics
              </Button>
            </Link>
          </div>

          {/* Live Data Sparkline Overlay */}
          <div className="pt-8 flex flex-col items-center justify-center">
            <div className="flex items-center gap-3">
              <LiveSparkline initialValue={412} />
              <Link
                href="/run/exp-color-response/demo-session"
                className="text-xs text-[#A5ADBD] hover:text-[#4F8CFF] underline font-mono flex items-center gap-1 transition-colors"
              >
                <span>Launch 10-Trial Demo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PLATFORM PIPELINE: From Experiment Design to Evidence                 */}
      {/* ========================================================================= */}
      <section id="platform" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/[0.08] relative bg-[#07090E]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-[#4F8CFF]">
              Unified Research Pipeline
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              From Experiment Design to Evidence
            </h2>
            <p className="text-sm text-[#A5ADBD]">
              A continuous, end-to-end framework replacing legacy fragmented psychophysics tools.
            </p>
          </div>

          {/* 4 Pipeline Stages */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {/* Step 1: Design */}
            <GlassPanel className="p-6 relative group hover:border-[#4F8CFF]/50 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-[#4F8CFF]/10 border border-[#4F8CFF]/30 text-[#4F8CFF] flex items-center justify-center mb-4">
                <Workflow className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-[#697386] uppercase block">Stage 01</span>
              <h3 className="text-base font-semibold text-white mt-1">Experiment Builder</h3>
              <p className="text-xs text-[#A5ADBD] mt-2 leading-relaxed">
                Visual node-graph builder with drag-and-drop stimuli, timing delays, and conditional logic.
              </p>
            </GlassPanel>

            {/* Step 2: Run */}
            <GlassPanel className="p-6 relative group hover:border-[#8B5CF6]/50 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#8B5CF6] flex items-center justify-center mb-4">
                <Play className="w-5 h-5 fill-current" />
              </div>
              <span className="text-[10px] font-mono text-[#697386] uppercase block">Stage 02</span>
              <h3 className="text-base font-semibold text-white mt-1">Participant Runtime</h3>
              <p className="text-xs text-[#A5ADBD] mt-2 leading-relaxed">
                Distraction-free browser runner with frame-accurate stimulus onset, bounded response
                windows, and capture-time exclusion of anticipatory and omission trials.
              </p>
            </GlassPanel>

            {/* Step 3: Measure */}
            <GlassPanel className="p-6 relative group hover:border-[#22D3EE]/50 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/30 text-[#22D3EE] flex items-center justify-center mb-4">
                <Timer className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-[#697386] uppercase block">Stage 03</span>
              <h3 className="text-base font-semibold text-white mt-1">Behavioral Telemetry</h3>
              <p className="text-xs text-[#A5ADBD] mt-2 leading-relaxed">
                High-resolution timestamps captured via <code className="text-[#22D3EE]">performance.now()</code>.
              </p>
            </GlassPanel>

            {/* Step 4: Analyze */}
            <GlassPanel className="p-6 relative group hover:border-[#22C55E]/50 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-[#697386] uppercase block">Stage 04</span>
              <h3 className="text-base font-semibold text-white mt-1">Research Analytics</h3>
              <p className="text-xs text-[#A5ADBD] mt-2 leading-relaxed">
                Real-time distributions, stimulus comparisons, synthesized statistical insights, and CSV export.
              </p>
            </GlassPanel>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. NO-CODE BUILDER LANDING SECTION (Showcase)                            */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs font-mono uppercase tracking-widest text-[#22D3EE]">
                Visual Node Programming
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Build Complex Experiments Without Writing Code.
              </h2>
              <p className="text-sm text-[#A5ADBD]">
                Compose stimuli, timing, responses, conditions and measurements visually.
                Every visual flow translates into a strictly validated JSON experiment definition.
              </p>
            </div>

            <Link href="/builder">
              <Button
                variant="glow"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Open Experiment Builder
              </Button>
            </Link>
          </div>

          {/* Builder Miniature Representation */}
          <GlassPanel elevated className="p-4 sm:p-6 border-white/15 overflow-hidden">
            <div className="rounded-xl bg-[#080B11] border border-white/10 p-4 sm:p-6 relative">
              {/* Flow preview nodes */}
              <div className="flex flex-wrap items-center justify-center gap-4 py-8">
                <div className="p-3 rounded-lg bg-[#10141D] border border-blue-500/40 text-xs text-white flex items-center gap-2">
                  <Play className="w-3.5 h-3.5 text-[#60A5FA]" />
                  <span>Start Experiment</span>
                </div>
                <div className="w-8 border-t border-dashed border-[#4F8CFF]" />

                <div className="p-3 rounded-lg bg-[#10141D] border border-purple-500/40 text-xs text-white flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
                  <span>Color Stimulus</span>
                </div>
                <div className="w-8 border-t border-dashed border-[#8B5CF6]" />

                <div className="p-3 rounded-lg bg-[#10141D] border border-emerald-500/40 text-xs text-white flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-[#4ADE80]" />
                  <span>Capture Response</span>
                </div>
                <div className="w-8 border-t border-dashed border-[#22C55E]" />

                <div className="p-3 rounded-lg bg-[#10141D] border border-cyan-500/40 text-xs text-white flex items-center gap-2">
                  <Timer className="w-3.5 h-3.5 text-[#22D3EE]" />
                  <span>Measure RT</span>
                </div>
                <div className="w-8 border-t border-dashed border-[#22D3EE]" />

                <div className="p-3 rounded-lg bg-[#10141D] border border-rose-500/40 text-xs text-white flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-[#FB7185]" />
                  <span>Store Result</span>
                </div>
              </div>

              {/* JSON Definition badge footer */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#A5ADBD] font-mono">
                <span>NO-CODE UI → STRUCTURED EXPERIMENT DEFINITION</span>
                <span className="text-[#22D3EE]">Zod Schema Validated</span>
              </div>
            </div>
          </GlassPanel>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. ANALYTICS SHOWCASE SECTION                                            */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/[0.08] bg-[#07090E]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-[#8B5CF6]">
              Deep Research Analytics
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Instant Psychometric Intelligence
            </h2>
            <p className="text-sm text-[#A5ADBD]">
              Real-time reaction-time progressions across trials, stimulus types, and participant cohorts.
            </p>
          </div>

          {/* Quick Metrics & Line Chart */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <GlassPanel className="p-4 text-center">
                <span className="text-[10px] text-[#697386] font-mono uppercase block">Avg Reaction Time</span>
                <span className="text-2xl font-bold text-[#4F8CFF] font-mono">412 ms</span>
              </GlassPanel>
              <GlassPanel className="p-4 text-center">
                <span className="text-[10px] text-[#697386] font-mono uppercase block">Accuracy</span>
                <span className="text-2xl font-bold text-[#22C55E] font-mono">91.8%</span>
              </GlassPanel>
              <GlassPanel className="p-4 text-center">
                <span className="text-[10px] text-[#697386] font-mono uppercase block">Trials Captured</span>
                <span className="text-2xl font-bold text-white font-mono">8,420</span>
              </GlassPanel>
              <GlassPanel className="p-4 text-center">
                <span className="text-[10px] text-[#697386] font-mono uppercase block">Active Participants</span>
                <span className="text-2xl font-bold text-[#8B5CF6] font-mono">248</span>
              </GlassPanel>
            </div>

            <GlassPanel elevated className="p-6">
              <ReactionTimeLineChart data={sampleProgression} showStimulusToggles={true} />
            </GlassPanel>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. TECHNICAL ARCHITECTURE SECTION                                        */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-[#4F8CFF]">
              Engine Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Built For Serious Behavioral Research
            </h2>
            <p className="text-sm text-[#A5ADBD]">
              Engineered with clean typed contracts, deterministic timing, and modular state architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassPanel className="p-6 space-y-3">
              <Cpu className="w-8 h-8 text-[#4F8CFF]" />
              <h3 className="text-base font-semibold text-white">Sub-Millisecond Clock</h3>
              <p className="text-xs text-[#A5ADBD] leading-relaxed">
                Utilizes high-resolution browser performance counters to isolate motor latency from
                rendering jitter.
              </p>
            </GlassPanel>

            <GlassPanel className="p-6 space-y-3">
              <GitBranch className="w-8 h-8 text-[#8B5CF6]" />
              <h3 className="text-base font-semibold text-white">Typed API Service Layer</h3>
              <p className="text-xs text-[#A5ADBD] leading-relaxed">
                Clean repository patterns allow seamless switching between Mock Mode and enterprise REST backends.
              </p>
            </GlassPanel>

            <GlassPanel className="p-6 space-y-3">
              <ShieldCheck className="w-8 h-8 text-[#22C55E]" />
              <h3 className="text-base font-semibold text-white">Zod Runtime Validation</h3>
              <p className="text-xs text-[#A5ADBD] leading-relaxed">
                Strict runtime validation guarantees every experiment flow and participant response vector matches schema.
              </p>
            </GlassPanel>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. CALL TO ACTION & FOOTER                                               */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/[0.08] relative overflow-hidden bg-gradient-to-b from-[#07090E] to-[#05060A]">
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Ready to Run Your Next Cognitive Study?
          </h2>
          <p className="text-sm sm:text-base text-[#A5ADBD] max-w-xl mx-auto">
            Experience the no-code experiment builder and high-precision participant runtime in mock mode right now.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/dashboard">
              <Button variant="glow" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Launch Researcher Dashboard
              </Button>
            </Link>
            <Link href="/run/exp-color-response/demo-session">
              <Button variant="secondary" size="lg" leftIcon={<Play className="w-4 h-4 fill-current" />}>
                Run 10-Trial Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-[#05060A] py-12 px-4 sm:px-6 lg:px-8 text-xs text-[#697386]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white font-mono tracking-tight">COGNITIVELAB</span>
            <span>•</span>
            <span>Cognitive Experimentation Platform</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[#A5ADBD]">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/builder" className="hover:text-white transition-colors">Builder</Link>
            <Link href="/experiments" className="hover:text-white transition-colors">Experiments</Link>
            <Link href="/analytics" className="hover:text-white transition-colors">Analytics</Link>
            <Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
            <Link href="/settings" className="hover:text-white transition-colors">API Settings</Link>
          </div>

          <div>
            © 2026 CognitiveLab Systems. Built for Behavioral & Psychological Research.
          </div>
        </div>
      </footer>
    </div>
  );
}
