"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { NeuralCanvas } from "@/components/visualizations/NeuralCanvas";
import { RoleSelectModal } from "@/components/auth/RoleSelectModal";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Volume2,
  Target,
  Palette,
  Diamond,
  BookOpen,
  Hourglass,
  ShieldCheck,
  ChevronRight,
  Layers,
  FlaskConical,
  BarChart3,
  Lock,
  Play,
  Activity,
  Workflow,
  Timer,
  Database,
} from "lucide-react";

export default function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<{ id: string; name: string } | null>(null);

  const games = [
    {
      id: "exp-flash-count",
      name: "Flash Count",
      tagline: "Visual Flashes",
      description: "Count rapid white pulses in a short visual sequence.",
      icon: Zap,
      gradient: "from-[#38BDF8] to-[#0284C7]",
      border: "border-[#38BDF8]/40",
      accent: "#38BDF8",
    },
    {
      id: "exp-tone-detect",
      name: "Tone Detect",
      tagline: "Auditory Oddball",
      description: "Detect the unexpected low tone within an auditory stream.",
      icon: Volume2,
      gradient: "from-[#8B5CF6] to-[#6D28D9]",
      border: "border-[#8B5CF6]/40",
      accent: "#8B5CF6",
    },
    {
      id: "exp-visual-search",
      name: "Visual Search",
      tagline: "Feature Pop-Out",
      description: "Find the colored target rapidly among similar distractors.",
      icon: Target,
      gradient: "from-[#10B981] to-[#059669]",
      border: "border-[#10B981]/40",
      accent: "#10B981",
    },
    {
      id: "exp-color-response",
      name: "Color Word",
      tagline: "Stroop Latency",
      description: "Identify font ink color under semantic text conflict.",
      icon: Palette,
      gradient: "from-[#F59E0B] to-[#D97706]",
      border: "border-[#F59E0B]/40",
      accent: "#F59E0B",
    },
    {
      id: "exp-object-hunt",
      name: "Object Hunt",
      tagline: "Visual Memory",
      description: "Locate and confirm the requested target symbol in array.",
      icon: Diamond,
      gradient: "from-[#EC4899] to-[#BE185D]",
      border: "border-[#EC4899]/40",
      accent: "#EC4899",
    },
  ];

  const handleGameClick = (id: string, name: string) => {
    setSelectedGame({ id, name });
    setModalOpen(true);
  };

  const handleOpenSignIn = () => {
    setSelectedGame(null);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#07090F] text-white overflow-hidden flex flex-col relative selection:bg-[#4F8CFF]/30 select-none">
      <Navbar />

      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Inspired by Reference Graphic with Isometric Surface)     */}
      {/* ========================================================================= */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-24 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle Neural Network mesh in background */}
        <NeuralCanvas className="opacity-35" />

        {/* Isometric 3D Grid Plane Illusion */}
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <div
            className="w-[140%] h-[140%] -left-[20%] -top-[10%]"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)
              `,
              backgroundSize: "64px 64px",
              transform: "perspective(900px) rotateX(55deg) rotateZ(-12deg) translateZ(-60px)",
            }}
          />
        </div>

        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-[#3B82F6]/20 via-[#6366F1]/15 to-transparent rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-[420px] h-[420px] bg-[#06B6D4]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Hero Typography & Actions */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse shadow-[0_0_8px_#3B82F6]" />
                <span className="text-[11px] font-mono tracking-widest uppercase text-[#A5ADBD]">
                  COGNITIVE RESEARCH PROTOCOLS
                </span>
              </div>

              {/* Headline matching user reference prompt */}
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
                Foundation of the <br />
                <span className="bg-gradient-to-r from-[#60A5FA] via-[#38BDF8] to-[#818CF8] bg-clip-text text-transparent">
                  new cognitive epoch
                </span>
              </h1>

              {/* Supporting Copy */}
              <p className="text-sm sm:text-base text-[#A5ADBD] max-w-xl leading-relaxed">
                Designing behavioral experiments, measuring human response latency with sub-millisecond precision, and laying the foundation of cognitive discovery for researchers, participants, and communities alike.
              </p>

              {/* Button: "Know about Research" (instead of Contact Us!) */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link href="/library">
                  <button className="px-6 py-3 rounded-full bg-[#0D111A] hover:bg-[#141A26] text-white text-xs sm:text-sm font-semibold border border-white/15 shadow-[0_0_20px_rgba(0,0,0,0.6)] hover:border-white/30 transition-all flex items-center gap-2 group">
                    <BookOpen className="w-4 h-4 text-[#38BDF8]" />
                    <span>Know about Research</span>
                    <ArrowRight className="w-4 h-4 text-[#A5ADBD] group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>

                <button
                  onClick={handleOpenSignIn}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:brightness-110 text-white text-xs sm:text-sm font-semibold shadow-[0_0_25px_-4px_rgba(59,130,246,0.5)] transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Enter Platform</span>
                </button>
              </div>
            </div>

            {/* Right: The 3D Elevated Glowing Tile (Visual tribute to user reference image) */}
            <div className="lg:col-span-5 flex justify-center items-center relative">
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
                {/* 3D Isometric Tile */}
                <div
                  className="w-52 h-52 sm:w-60 sm:h-60 rounded-3xl bg-gradient-to-tr from-[#1D4ED8] via-[#2563EB] to-[#60A5FA] shadow-[0_25px_60px_-15px_rgba(37,99,235,0.7),0_0_40px_rgba(59,130,246,0.3)] border border-white/30 flex items-center justify-center p-6 text-center cursor-pointer transition-all hover:scale-105 duration-300 relative group"
                  onClick={handleOpenSignIn}
                  style={{
                    transform: "perspective(800px) rotateX(25deg) rotateY(-18deg) rotateZ(12deg)",
                  }}
                >
                  {/* Subtle top gloss ring */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-6 h-2 rounded-full bg-white/40" />

                  <div className="space-y-2 text-white">
                    <Hourglass className="w-10 h-10 mx-auto text-white drop-shadow-md animate-pulse" />
                    <p className="text-sm font-bold tracking-tight">CognitiveLab Engine</p>
                    <p className="text-[10px] font-mono text-white/80">
                      5 Connected Studies · 0.001ms Latency
                    </p>
                    <span className="inline-block mt-2 text-[10px] font-mono bg-white/20 px-2.5 py-1 rounded-full text-white backdrop-blur-sm">
                      Click to Enter →
                    </span>
                  </div>
                </div>

                {/* Ambient Floor Glow underneath the tile */}
                <div className="absolute bottom-6 w-56 h-12 bg-[#2563EB]/40 blur-2xl rounded-full pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Floating Pill Center Dock (Like in reference) */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-[#0D111A]/90 border border-white/10 shadow-xl backdrop-blur-xl text-xs text-[#A5ADBD]">
              <span className="flex items-center gap-1.5 text-white font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
                5 Studies Live
              </span>
              <span>•</span>
              <Link href="/analytics" className="hover:text-white transition-colors">
                Telemetry
              </Link>
              <span>•</span>
              <Link href="/leaderboard" className="hover:text-white transition-colors">
                Leaderboard
              </Link>
              <span>•</span>
              <button
                onClick={handleOpenSignIn}
                className="text-[#60A5FA] hover:text-[#93C5FD] font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Enter Workspace</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
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
      {/* 2. THE 5 GAME CAPSULES (Moving / Floating across the bottom as requested)   */}
      {/* ========================================================================= */}
      <section className="relative z-10 pb-16 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06] pt-8 bg-[#06080D]">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#697386]">
                Interactive Study Suite
              </p>
              <h2 className="text-xl font-bold text-white tracking-tight">
                5 Connected Behavioral Experiments
              </h2>
            </div>
            <p className="text-xs text-[#A5ADBD]">
              Click any game capsule to test as a <strong>Participant</strong> or manage as a <strong>Researcher</strong>.
            </p>
          </div>

          {/* Row of 5 Capsule Cards in rounded white/frosted containers matching reference bottom dock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {games.map((g) => {
              const Icon = g.icon;
              return (
                <div
                  key={g.id}
                  onClick={() => handleGameClick(g.id, g.name)}
                  className="p-5 rounded-2xl bg-[#0D111A] hover:bg-[#141A26] border border-white/10 hover:border-white/25 transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-4 hover:-translate-y-1 shadow-lg hover:shadow-2xl relative overflow-hidden"
                >
                  <div className="space-y-3">
                    {/* Icon Capsule */}
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${g.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    <div>
                      <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-[#A5ADBD]">
                        {g.tagline}
                      </span>
                      <h3 className="text-base font-bold text-white group-hover:text-[#60A5FA] transition-colors mt-1.5">
                        {g.name}
                      </h3>
                      <p className="text-xs text-[#A5ADBD] leading-relaxed mt-1">
                        {g.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-[#697386] group-hover:text-white transition-colors">
                    <span>Click to Enter</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Role Selection Modal (triggers on click of any game or Sign In button) */}
      <RoleSelectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        targetGameId={selectedGame?.id}
        targetGameName={selectedGame?.name}
      />
    </div>
  );
}
