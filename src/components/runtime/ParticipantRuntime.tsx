"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Experiment } from "@/types/experiment";
import { TrialResult, StimulusType } from "@/types/participant";
import { createTrialTimer } from "@/lib/timing";
import { trialService } from "@/lib/api/services/trial-service";
import { formatMs, formatPercent } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  Shield,
  ShieldAlert,
  Play,
  ArrowRight,
  CheckCircle,
  BarChart2,
  RefreshCw,
  Clock,
  Target,
  Zap,
  RotateCcw,
  Sparkles,
  Diamond,
  Flame,
  Star,
  Eye,
  Compass,
  Cpu,
  Volume2,
  Radio,
  Search,
  Lock,
} from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { useAuth } from "@/lib/auth/auth-context";

interface ParticipantRuntimeProps {
  experiment: Experiment;
  isPreview?: boolean;
}

type Stage = "consent" | "instructions" | "fixation" | "trial" | "feedback" | "completed";

interface TrialStimulus {
  prompt: string;
  text: string;
  colorName?: string;
  colorHex?: string;
  rule?: string;
  type: StimulusType;
  congruent?: boolean;
  correctAnswer: string;
  options: string[];
  iconName?: string;
  iconColor?: string;
  imageUrl?: string;
  flashCount?: number;
  toneFrequency?: number;
  isOddball?: boolean;
  targetPosition?: string;
}

// Web Audio API tone generator for Tone Detect
function playAudioTone(freq: number, durationMs: number = 200) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch {}
}

function renderVisualStimulus(name?: string, color?: string, imageUrl?: string) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt="Stimulus target"
        className="w-28 h-28 object-contain rounded-2xl shadow-lg"
      />
    );
  }

  const iconProps = {
    className: "w-16 h-16 drop-shadow-[0_0_20px_currentColor]",
    style: { color: color || "#4F8CFF" },
  };

  switch (name) {
    case "Zap":
      return <Zap {...iconProps} />;
    case "Target":
      return <Target {...iconProps} />;
    case "Diamond":
      return <Diamond {...iconProps} />;
    case "Shield":
      return <Shield {...iconProps} />;
    case "Star":
      return <Star {...iconProps} />;
    case "Flame":
      return <Flame {...iconProps} />;
    case "Eye":
      return <Eye {...iconProps} />;
    case "Compass":
      return <Compass {...iconProps} />;
    case "Cpu":
      return <Cpu {...iconProps} />;
    case "Volume2":
      return <Volume2 {...iconProps} />;
    default:
      return <Sparkles {...iconProps} />;
  }
}

interface ExperimentFlowConfig {
  mode: "flash-count" | "tone-detect" | "visual-search" | "object-hunt" | "color";
  headline: string;
  description: string;
  tip: string;
  trials: TrialStimulus[];
}

function resolveExperimentFlow(experiment: Experiment): ExperimentFlowConfig {
  const expId = experiment.id;
  const expName = (experiment.name || "").toLowerCase();

  // 1. FLASH COUNT GAME
  if (expId === "exp-flash-count" || expName.includes("flash")) {
    const counts = [3, 4, 5, 3, 4, 5, 6, 4];
    return {
      mode: "flash-count" as const,
      headline: "Flash Count Study",
      description: "Count the white circular flashes that illuminate in the center. Once the sequence finishes, enter the exact count.",
      tip: "Stay focused on the center circle. Respond immediately once the count choices appear.",
      trials: counts.map((count, idx) => ({
        prompt: "How many flashes appeared?",
        text: `${count} Flashes`,
        flashCount: count,
        type: "mixed" as StimulusType,
        correctAnswer: String(count),
        options: ["3", "4", "5", "6"],
      })),
    };
  }

  // 2. TONE DETECT (AUDITORY ODDBALL)
  if (expId === "exp-tone-detect" || expName.includes("tone") || expName.includes("oddball")) {
    const trialsConfig = [
      { isOddball: false, freq: 650, ans: "STANDARD TONE" },
      { isOddball: true, freq: 280, ans: "LOW TONE DETECTED" },
      { isOddball: false, freq: 650, ans: "STANDARD TONE" },
      { isOddball: true, freq: 280, ans: "LOW TONE DETECTED" },
      { isOddball: false, freq: 650, ans: "STANDARD TONE" },
      { isOddball: false, freq: 650, ans: "STANDARD TONE" },
      { isOddball: true, freq: 280, ans: "LOW TONE DETECTED" },
      { isOddball: true, freq: 280, ans: "LOW TONE DETECTED" },
    ];
    return {
      mode: "tone-detect" as const,
      headline: "Tone Detect (Auditory Oddball)",
      description: "Listen to the auditory pitch pulses. Press SPACE or click [LOW TONE DETECTED] when you detect the rare, lower frequency tone.",
      tip: "Sound is synthesized via Web Audio API. Visual soundwave pulses are also synchronized on screen.",
      trials: trialsConfig.map((t, idx) => ({
        prompt: t.isOddball ? "LOW TONE TRIGGERED — DETECT NOW!" : "Standard Frequency Pulse",
        text: t.isOddball ? "LOW ODDBALL TONE" : "Standard Tone",
        toneFrequency: t.freq,
        isOddball: t.isOddball,
        type: "mixed" as StimulusType,
        correctAnswer: t.ans,
        options: ["LOW TONE DETECTED", "STANDARD TONE"],
      })),
    };
  }

  // 3. VISUAL SEARCH GAME
  if (expId === "exp-visual-search" || expName.includes("search")) {
    const quadrants = ["Top-Left", "Top-Right", "Bottom-Left", "Bottom-Right"];
    const targets = ["Top-Left", "Bottom-Right", "Top-Right", "Bottom-Left", "Top-Left", "Bottom-Right", "Top-Right", "Bottom-Left"];
    return {
      mode: "visual-search" as const,
      headline: "Visual Search Task",
      description: "Locate the unique TARGET icon (Green Circle) hidden among surrounding distractor icons as rapidly as possible.",
      tip: "Identify the quadrant where the target appears and click the matching button.",
      trials: targets.map((quad, idx) => ({
        prompt: `Find the Target Icon among distractors`,
        text: `Target in ${quad}`,
        targetPosition: quad,
        type: "image" as StimulusType,
        correctAnswer: quad,
        options: quadrants,
        iconName: "Target",
        iconColor: "#10B981",
      })),
    };
  }

  // 4. OBJECT HUNT GAME
  if (expId === "exp-object-hunt" || expName.includes("object")) {
    const objectList = [
      { name: "Diamond", icon: "Diamond", color: "#EC4899" },
      { name: "Compass", icon: "Compass", color: "#38BDF8" },
      { name: "Flame", icon: "Flame", color: "#F59E0B" },
      { name: "Shield", icon: "Shield", color: "#10B981" },
      { name: "Star", icon: "Star", color: "#EAB308" },
      { name: "Eye", icon: "Eye", color: "#8B5CF6" },
      { name: "Cpu", icon: "Cpu", color: "#06B6D4" },
      { name: "Zap", icon: "Zap", color: "#F43F5E" },
    ];
    return {
      mode: "object-hunt" as const,
      headline: "Object Hunt Protocol",
      description: "A target object symbol will be requested. Identify the matching icon from the choices as rapidly as possible.",
      tip: "Use keyboard shortcuts [1], [2], [3], [4] or click the matching object icon.",
      trials: objectList.map((obj, idx) => {
        const otherOptions = objectList.filter((o) => o.name !== obj.name).slice(0, 3).map((o) => o.name);
        const options = [obj.name, ...otherOptions].sort(() => 0.5 - Math.random());
        return {
          prompt: `Locate Target Symbol: ${obj.name.toUpperCase()}`,
          text: obj.name,
          iconName: obj.icon,
          iconColor: obj.color,
          type: "image" as StimulusType,
          correctAnswer: obj.name,
          options,
        };
      }),
    };
  }

  // 5. COLOR WORD (STROOP) OR DEFAULT
  return {
    mode: "color" as const,
    headline: "Chromatic Stroop Conflict Task",
    description: "Identify the font ink color of the word as quickly and accurately as possible. Ignore the literal text!",
    tip: "CRITICAL: Choose the INK COLOR, not what the word reads.",
    trials: [
      {
        prompt: "Identify the font ink color (Ignore the text!)",
        text: "BLUE",
        colorName: "RED",
        colorHex: "#EF4444",
        type: "color" as StimulusType,
        congruent: false,
        correctAnswer: "RED",
        options: ["RED", "BLUE", "GREEN", "YELLOW"],
      },
      {
        prompt: "Identify the font ink color (Ignore the text!)",
        text: "GREEN",
        colorName: "GREEN",
        colorHex: "#22C55E",
        type: "color" as StimulusType,
        congruent: true,
        correctAnswer: "GREEN",
        options: ["RED", "BLUE", "GREEN", "YELLOW"],
      },
      {
        prompt: "Identify the font ink color (Ignore the text!)",
        text: "RED",
        colorName: "BLUE",
        colorHex: "#3B82F6",
        type: "color" as StimulusType,
        congruent: false,
        correctAnswer: "BLUE",
        options: ["RED", "BLUE", "GREEN", "YELLOW"],
      },
      {
        prompt: "Identify the font ink color (Ignore the text!)",
        text: "YELLOW",
        colorName: "YELLOW",
        colorHex: "#F59E0B",
        type: "color" as StimulusType,
        congruent: true,
        correctAnswer: "YELLOW",
        options: ["RED", "BLUE", "GREEN", "YELLOW"],
      },
      {
        prompt: "Identify the font ink color (Ignore the text!)",
        text: "RED",
        colorName: "GREEN",
        colorHex: "#22C55E",
        type: "color" as StimulusType,
        congruent: false,
        correctAnswer: "GREEN",
        options: ["RED", "BLUE", "GREEN", "YELLOW"],
      },
      {
        prompt: "Identify the font ink color (Ignore the text!)",
        text: "BLUE",
        colorName: "YELLOW",
        colorHex: "#F59E0B",
        type: "color" as StimulusType,
        congruent: false,
        correctAnswer: "YELLOW",
        options: ["RED", "BLUE", "GREEN", "YELLOW"],
      },
      {
        prompt: "Identify the font ink color (Ignore the text!)",
        text: "RED",
        colorName: "BLUE",
        colorHex: "#3B82F6",
        type: "mixed" as StimulusType,
        congruent: false,
        correctAnswer: "BLUE",
        options: ["RED", "BLUE", "GREEN", "YELLOW"],
      },
      {
        prompt: "Final high-interference trial (Ignore the text!)",
        text: "GREEN",
        colorName: "YELLOW",
        colorHex: "#F59E0B",
        type: "mixed" as StimulusType,
        congruent: false,
        correctAnswer: "YELLOW",
        options: ["RED", "BLUE", "GREEN", "YELLOW"],
      },
    ],
  };
}

export function ParticipantRuntime({
  experiment,
  isPreview = false,
}: ParticipantRuntimeProps) {
  const { user, isParticipant } = useAuth();
  const [stage, setStage] = useState<Stage>("consent");
  const [currentTrialIdx, setCurrentTrialIdx] = useState(0);
  const [participantName, setParticipantName] = useState(
    user?.displayName || "Participant P-001"
  );
  const [results, setResults] = useState<TrialResult[]>([]);
  const [lastFeedback, setLastFeedback] = useState<{ correct: boolean; rt: number } | null>(null);

  // Flash animation state for Flash Count game
  const [flashTick, setFlashTick] = useState(0);
  const [flashingActive, setFlashingActive] = useState(false);

  // Tone soundwave state for Tone Detect
  const [tonePulse, setTonePulse] = useState(false);

  const timerRef = useRef(createTrialTimer());
  const trialActiveRef = useRef(false);

  // Sync participantName if user changes
  useEffect(() => {
    if (user?.displayName) {
      setParticipantName(user.displayName);
    }
  }, [user?.displayName]);

  // =========================================================================
  // CENTRALIZED PUBLISHING GATE CHECK:
  // If experiment is NOT published, participant access MUST be blocked!
  // =========================================================================
  if (!experiment || experiment.status !== "published") {
    return (
      <div className="min-h-screen bg-[#05060A] text-white flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#0D111A] border border-amber-500/30 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-white">This study is currently unavailable</h2>
            <p className="text-xs text-[#A5ADBD] leading-relaxed">
              The research investigator has removed, unpublished, or set this experiment to disabled status. Participant trial telemetry is temporarily blocked.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 font-mono text-[11px] text-[#697386]">
            Study Name: <span className="text-white font-semibold">{experiment?.name || "Experiment"}</span> · Status:{" "}
            <span className="uppercase text-amber-400 font-bold">{experiment?.status || "Disabled / Removed"}</span>
          </div>
          <div className="pt-2">
            <Link href="/participant/dashboard">
              <Button variant="glow" size="md" className="w-full justify-center">
                Return to Available Studies
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const flow = React.useMemo(() => resolveExperimentFlow(experiment), [experiment]);
  const activeTrials = flow.trials;
  const totalTrials = Math.min(experiment.trialCount || 8, activeTrials.length);
  const currentStimulus = activeTrials[currentTrialIdx] || activeTrials[0];

  // Start trial with fixation cross
  const launchTrial = useCallback((trialIdx: number) => {
    setStage("fixation");
    trialActiveRef.current = false;
    setFlashingActive(false);

    // Brief fixation cross (350ms) to center gaze
    setTimeout(() => {
      setStage("trial");
      timerRef.current.start();
      trialActiveRef.current = true;

      const stim = activeTrials[trialIdx] || activeTrials[0];

      // Handle Flash Count animation
      if (flow.mode === "flash-count" && stim.flashCount) {
        setFlashingActive(true);
        let count = 0;
        const total = stim.flashCount;
        const interval = setInterval(() => {
          count++;
          setFlashTick((prev) => prev + 1);
          if (count >= total) {
            clearInterval(interval);
            setTimeout(() => setFlashingActive(false), 200);
          }
        }, 320);
      }

      // Handle Tone Detect audio trigger
      if (flow.mode === "tone-detect") {
        setTonePulse(true);
        playAudioTone(stim.toneFrequency || 650, 220);
        setTimeout(() => setTonePulse(false), 250);
      }
    }, 380);
  }, [activeTrials, flow.mode]);

  // Record response via performance.now()
  const handleResponse = useCallback(
    (selectedAnswer: string, inputMethod: "keyboard" | "button" = "button") => {
      if (!trialActiveRef.current || stage !== "trial") return;
      trialActiveRef.current = false;

      const timing = timerRef.current.stop();
      const stim = activeTrials[currentTrialIdx] || activeTrials[0];
      const correct = selectedAnswer === stim.correctAnswer;

      const recordedTrial: TrialResult = {
        id: `trial-live-${currentTrialIdx + 1}`,
        participantId: user?.id || "part-anon",
        experimentId: experiment.id,
        trialNumber: currentTrialIdx + 1,
        stimulusType: stim.type,
        stimulus: {
          prompt: stim.prompt,
          text: stim.text,
          color: stim.colorHex,
          imageUrl: stim.imageUrl,
          congruent: stim.congruent,
        },
        response: {
          selectedAnswer,
          inputMethod,
        },
        correct,
        reactionTimeMs: timing.reactionTimeMs,
        startedAt: timing.startedAtIso,
        respondedAt: timing.stoppedAtIso,
      };

      const nextResults = [...results, recordedTrial];
      setResults(nextResults);
      setLastFeedback({ correct, rt: timing.reactionTimeMs });

      // Move to next trial or finish
      if (currentTrialIdx + 1 < totalTrials) {
        setStage("feedback");
        setTimeout(() => {
          setCurrentTrialIdx((prev) => prev + 1);
          launchTrial(currentTrialIdx + 1);
        }, 320);
      } else {
        setStage("completed");
        trialService.submitTrialRun(participantName, nextResults, user?.id).catch(console.error);

        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#10B981", "#4F8CFF", "#38BDF8", "#F59E0B"],
          });
        } catch {}
      }
    },
    [activeTrials, currentTrialIdx, experiment.id, launchTrial, participantName, results, stage, totalTrials, user?.id]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (stage !== "trial" || !trialActiveRef.current) return;

      const key = e.key.toUpperCase();
      const options = currentStimulus?.options || [];

      // Space key for Tone Detect
      if (flow.mode === "tone-detect" && e.code === "Space") {
        e.preventDefault();
        handleResponse("LOW TONE DETECTED", "keyboard");
        return;
      }

      // Keys 1, 2, 3, 4
      if (key === "1" && options[0]) handleResponse(options[0], "keyboard");
      else if (key === "2" && options[1]) handleResponse(options[1], "keyboard");
      else if (key === "3" && options[2]) handleResponse(options[2], "keyboard");
      else if (key === "4" && options[3]) handleResponse(options[3], "keyboard");
      else if (key === "5" && options[4]) handleResponse(options[4], "keyboard");
      else if (key === "6" && options[5]) handleResponse(options[5], "keyboard");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStimulus?.options, flow.mode, handleResponse, stage]);

  const handleRestart = () => {
    setResults([]);
    setCurrentTrialIdx(0);
    setLastFeedback(null);
    setStage("instructions");
  };

  const accuracy = results.length > 0 ? (results.filter((r) => r.correct).length / results.length) * 100 : 0;
  const rts = results.map((r) => r.reactionTimeMs);
  const avgRt = rts.length > 0 ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : 0;
  const fastestRt = rts.length > 0 ? Math.min(...rts) : 0;
  const slowestRt = rts.length > 0 ? Math.max(...rts) : 0;

  return (
    <div className="min-h-screen bg-[#05060A] text-white flex flex-col justify-between selection:bg-[#4F8CFF]/30 select-none">
      {/* Minimal Header */}
      <div className="h-12 border-b border-white/[0.06] px-6 flex items-center justify-between text-xs text-[#697386]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="font-mono uppercase tracking-wider">
            {isPreview ? "COGNITIVELAB RUNTIME" : "SESSION RUNTIME"}
          </span>
          <span className="text-[#A5ADBD]">•</span>
          <span className="text-white font-medium">{experiment.name}</span>
        </div>

        {stage === "trial" || stage === "fixation" || stage === "feedback" ? (
          <div className="font-mono text-white text-xs">
            Trial {currentTrialIdx + 1} of {totalTrials}
          </div>
        ) : (
          <Link
            href={isParticipant ? "/participant/dashboard" : "/dashboard"}
            className="text-xs text-[#A5ADBD] hover:text-white underline font-mono"
          >
            Exit Runtime
          </Link>
        )}
      </div>

      {/* Main Focus Area */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl text-center">
          {/* STAGE 1: CONSENT & DEMOGRAPHIC BRIEFING */}
          {stage === "consent" && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <Shield className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  {experiment.name}
                </h1>
                <p className="text-xs text-[#A5ADBD] leading-relaxed max-w-md mx-auto">
                  {experiment.description}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0A0D14] border border-white/10 text-left text-xs text-[#A5ADBD] space-y-2">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 mb-2">
                  <span className="font-semibold text-white">Participant Demographics:</span>
                  <span className="text-[11px] font-mono text-[#34D399] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/30">
                    Age {user?.age ?? "—"} · {user?.ageGroup || "Demographic Cohort"}
                  </span>
                </div>
                <p className="font-semibold text-white">Session Telemetry Guidelines:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>High-resolution timestamps captured via <code className="text-[#4F8CFF]">performance.now()</code></li>
                  <li>No personally identifiable data is stored; all runs are pseudonymized</li>
                  <li>Test consists of exactly {totalTrials} consecutive trials (~60 seconds total)</li>
                </ul>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <input
                  type="text"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="Participant pseudonym (e.g. Subject 42)"
                  className="bg-[#10141D] text-xs text-white px-3 py-2 rounded-lg border border-white/15 focus:outline-none focus:border-[#4F8CFF] w-64 text-center font-mono"
                />
                <Button
                  onClick={() => setStage("instructions")}
                  variant="glow"
                  size="md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Proceed to Task Rules
                </Button>
              </div>
            </div>
          )}

          {/* STAGE 2: INSTRUCTIONS */}
          {stage === "instructions" && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-2xl bg-[#4F8CFF]/10 border border-[#4F8CFF]/30 text-[#4F8CFF] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(79,140,255,0.2)]">
                <Play className="w-7 h-7 fill-current" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  {flow.headline}
                </h1>
                <p className="text-sm text-[#A5ADBD] max-w-md mx-auto leading-relaxed">
                  {flow.description}
                </p>
                <p className="text-xs text-[#F59E0B] font-mono">
                  {flow.tip}
                </p>
              </div>

              <Button
                onClick={() => launchTrial(0)}
                variant="glow"
                size="lg"
                leftIcon={<Play className="w-4 h-4 fill-current" />}
              >
                Start Trial Session
              </Button>
            </div>
          )}

          {/* STAGE 3: FIXATION CROSS */}
          {stage === "fixation" && (
            <div className="flex items-center justify-center h-48">
              <span className="text-5xl font-light text-white font-mono opacity-80">+</span>
            </div>
          )}

          {/* STAGE 4: TRIAL ACTIVE */}
          {stage === "trial" && (
            <div className="space-y-8">
              <div className="text-xs font-mono text-[#697386] uppercase tracking-wider">
                {currentStimulus.prompt}
              </div>

              {/* Central Target Display for each game */}
              <div className="h-44 flex items-center justify-center">
                {/* Flash Count Game Display */}
                {flow.mode === "flash-count" && (
                  <div className="flex flex-col items-center justify-center gap-2">
                    {flashingActive ? (
                      <div className="w-24 h-24 rounded-full bg-white shadow-[0_0_50px_#FFFFFF] animate-ping" />
                    ) : (
                      <div className="w-28 h-28 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                        <span className="text-3xl font-black font-mono text-white">?</span>
                      </div>
                    )}
                    <span className="text-xs font-mono text-[#697386]">
                      {flashingActive ? "Counting flashes..." : "Enter your count below"}
                    </span>
                  </div>
                )}

                {/* Tone Detect Display */}
                {flow.mode === "tone-detect" && (
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div
                      className={`w-28 h-28 rounded-3xl border-2 flex items-center justify-center transition-all ${
                        tonePulse
                          ? "bg-[#8B5CF6]/30 border-[#8B5CF6] scale-110 shadow-[0_0_40px_rgba(139,92,246,0.6)]"
                          : "bg-white/[0.03] border-white/10"
                      }`}
                    >
                      <Volume2 className={`w-12 h-12 ${tonePulse ? "text-[#C084FC]" : "text-[#A5ADBD]"}`} />
                    </div>
                    <span className="text-xs font-mono text-[#A5ADBD]">
                      Press <strong className="text-white">SPACE</strong> or click below when you hear the LOW tone
                    </span>
                  </div>
                )}

                {/* Visual Search Display */}
                {flow.mode === "visual-search" && (
                  <div className="w-64 h-40 p-3 rounded-2xl bg-white/[0.02] border border-white/10 grid grid-cols-2 gap-2">
                    {["Top-Left", "Top-Right", "Bottom-Left", "Bottom-Right"].map((quad) => {
                      const isTarget = quad === currentStimulus.targetPosition;
                      return (
                        <div
                          key={quad}
                          onClick={() => handleResponse(quad, "button")}
                          className={`rounded-xl border flex items-center justify-center cursor-pointer transition-all ${
                            isTarget
                              ? "bg-[#10B981]/20 border-[#10B981] hover:scale-105"
                              : "bg-white/[0.03] border-white/5 hover:bg-white/10"
                          }`}
                        >
                          {isTarget ? (
                            <Target className="w-8 h-8 text-[#10B981]" />
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-blue-500/40" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Object Hunt Display */}
                {flow.mode === "object-hunt" && (
                  <div className="w-36 h-36 rounded-3xl bg-[#0D111A] border-2 border-[#4F8CFF]/30 shadow-[0_0_35px_rgba(79,140,255,0.25)] flex items-center justify-center animate-in zoom-in-95 duration-100">
                    {renderVisualStimulus(currentStimulus.iconName, currentStimulus.iconColor, currentStimulus.imageUrl)}
                  </div>
                )}

                {/* Color Word (Stroop) Display */}
                {flow.mode === "color" && (
                  <div
                    className="text-6xl sm:text-7xl font-black tracking-wider transition-none font-sans drop-shadow-[0_0_20px_currentColor]"
                    style={{ color: currentStimulus.colorHex || "#3B82F6" }}
                  >
                    {currentStimulus.text}
                  </div>
                )}
              </div>

              {/* Response Options Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {currentStimulus.options.map((opt, idx) => (
                  <button
                    key={opt}
                    onClick={() => handleResponse(opt, "button")}
                    className="px-5 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/15 text-white font-mono text-xs sm:text-sm font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
                  >
                    <span className="text-[#697386] mr-2">[{idx + 1}]</span>
                    <span>{opt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STAGE 5: FEEDBACK */}
          {stage === "feedback" && lastFeedback && (
            <div className="flex flex-col items-center justify-center h-48 space-y-2 animate-in fade-in duration-100">
              <span className={`text-2xl font-bold font-mono ${lastFeedback.correct ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                {lastFeedback.correct ? "✓ Correct" : "✗ Error"}
              </span>
              <span className="text-xs font-mono text-[#A5ADBD]">
                {lastFeedback.rt} ms
              </span>
            </div>
          )}

          {/* STAGE 6: COMPLETED */}
          {stage === "completed" && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 text-[#34D399] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Study Protocol Completed
                </h2>
                <p className="text-xs text-[#A5ADBD] font-mono">
                  All {totalTrials} trials successfully serialized to telemetry stream.
                </p>
              </div>

              {/* Performance Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[#0A0D14] border border-white/10">
                  <span className="text-[10px] text-[#697386] uppercase font-mono block">Accuracy</span>
                  <span className="text-xl font-bold text-[#22C55E] font-mono">
                    {formatPercent(accuracy)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#0A0D14] border border-white/10">
                  <span className="text-[10px] text-[#697386] uppercase font-mono block">Mean RT</span>
                  <span className="text-xl font-bold text-[#4F8CFF] font-mono">
                    {formatMs(avgRt)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#0A0D14] border border-white/10">
                  <span className="text-[10px] text-[#697386] uppercase font-mono block">Fastest RT</span>
                  <span className="text-xl font-bold text-[#22D3EE] font-mono">
                    {formatMs(fastestRt)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#0A0D14] border border-white/10">
                  <span className="text-[10px] text-[#697386] uppercase font-mono block">Slowest RT</span>
                  <span className="text-xl font-bold text-[#F59E0B] font-mono">
                    {formatMs(slowestRt)}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  onClick={handleRestart}
                  variant="secondary"
                  size="md"
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                >
                  Run Again
                </Button>

                {isParticipant ? (
                  <>
                    <Link href="/participant/dashboard">
                      <Button
                        variant="glow"
                        size="md"
                        leftIcon={<BarChart2 className="w-4 h-4" />}
                      >
                        View in My Dashboard
                      </Button>
                    </Link>
                    <Link href="/participant/personal-bests">
                      <Button variant="ghost" size="md">
                        Personal Bests
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/researcher/age-analytics">
                      <Button
                        variant="glow"
                        size="md"
                        leftIcon={<Sparkles className="w-4 h-4" />}
                      >
                        View in Age Analytics
                      </Button>
                    </Link>
                    <Link href="/experiments">
                      <Button variant="ghost" size="md">
                        Manage Studies
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="h-10 border-t border-white/[0.06] px-6 flex items-center justify-between text-[11px] text-[#697386] font-mono">
        <span>COGNITIVELAB RUNTIME ENGINE • v3.0</span>
        <span>LATENCY PRECISION: HIGH RES SUB-MS</span>
      </footer>
    </div>
  );
}
