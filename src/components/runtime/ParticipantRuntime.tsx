"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Experiment } from "@/types/experiment";
import { TrialResult, StimulusType } from "@/types/participant";
import {
  createTrialTimer,
  evaluateTrial,
  measureClockResolution,
  DEFAULT_TIMING_RULES,
  type TimingRules,
  type ClockDiagnostics,
} from "@/lib/timing";
import { trialService } from "@/lib/api/services/trial-service";
import { formatMs, formatPercent } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  Shield,
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
    default:
      return <Sparkles {...iconProps} />;
  }
}

function resolveExperimentFlow(experiment: Experiment) {
  const nodes = experiment.nodes || [];
  const edges = experiment.edges || [];

  const stimulusNodes = nodes.filter(
    (n) => n.type === "stimulusNode" || n.data?.category === "stimulus"
  );

  const connectedIds = new Set<string>();
  edges.forEach((e) => {
    connectedIds.add(e.source);
    connectedIds.add(e.target);
  });

  const connectedStimulusNodes = stimulusNodes.filter((n) => connectedIds.has(n.id));
  const activeNode = connectedStimulusNodes[0] || stimulusNodes[0] || null;

  const label = String(activeNode?.data?.label || "").toLowerCase();
  const config = (activeNode?.data?.config || {}) as Record<string, any>;
  const iconName = String(activeNode?.data?.iconName || "").toLowerCase();

  let mode: "text" | "image" | "color" = "color";
  if (label.includes("text") || config.text !== undefined || config.fontSize !== undefined) {
    mode = "text";
  } else if (
    label.includes("image") ||
    label.includes("icon") ||
    config.imageUrl !== undefined ||
    iconName.includes("image")
  ) {
    mode = "image";
  } else {
    mode = "color";
  }

  let headline = "Task Instructions";
  let description = "Identify the font color of the word as quickly and accurately as possible.";
  let tip = "CRITICAL: Ignore the literal text word. Choose the ink color!";
  let trials: TrialStimulus[] = [];

  if (mode === "text") {
    headline = "Lexical & Text Recognition Task";
    description = "A lexical target word will appear on screen. Identify the target word as rapidly and accurately as possible.";
    tip = "Focus on the fixation point. Use keyboard shortcuts [1], [2], [3], [4] or click the matching button.";

    const customWord = (config.text as string) || "TARGET";
    trials = [
      {
        prompt: "Identify the Target Word",
        text: customWord,
        type: "text",
        correctAnswer: customWord,
        options: [customWord, "STIMULUS", "MEMORY", "SIGNAL"],
      },
      {
        prompt: "Identify the Target Word",
        text: "SYNAPSE",
        type: "text",
        correctAnswer: "SYNAPSE",
        options: ["NEURON", "SYNAPSE", "CORTEX", "AXON"],
      },
      {
        prompt: "Identify the Target Word",
        text: "VELOCITY",
        type: "text",
        correctAnswer: "VELOCITY",
        options: ["MOMENTUM", "VECTOR", "VELOCITY", "ENERGY"],
      },
      {
        prompt: "Identify the Target Word",
        text: "COGNITION",
        type: "text",
        correctAnswer: "COGNITION",
        options: ["BEHAVIOR", "PERCEPTION", "ATTENTION", "COGNITION"],
      },
      {
        prompt: "Identify the Target Word",
        text: "HORIZON",
        type: "text",
        correctAnswer: "HORIZON",
        options: ["HORIZON", "ELEVATION", "AZIMUTH", "ALTITUDE"],
      },
      {
        prompt: "Identify the Target Word",
        text: "NEURON",
        type: "text",
        correctAnswer: "NEURON",
        options: ["NEURON", "GLIA", "DENDRITE", "SOMA"],
      },
      {
        prompt: "Identify the Target Word",
        text: "LATENCY",
        type: "text",
        correctAnswer: "LATENCY",
        options: ["PERIOD", "LATENCY", "DURATION", "INTERVAL"],
      },
      {
        prompt: "Identify the Target Word",
        text: "LUMEN",
        type: "text",
        correctAnswer: "LUMEN",
        options: ["CANDELA", "FLUX", "LUMEN", "PHOTON"],
      },
      {
        prompt: "Identify the Target Word",
        text: "PRISM",
        type: "text",
        correctAnswer: "PRISM",
        options: ["SPECTRUM", "PRISM", "OPTIC", "REFRACT"],
      },
      {
        prompt: "Identify the Target Word",
        text: "QUANTUM",
        type: "text",
        correctAnswer: "QUANTUM",
        options: ["ATOMIC", "QUANTUM", "PARTICLE", "FERMION"],
      },
    ];
  } else if (mode === "image") {
    headline = "Visual Object & Icon Recognition Task";
    description = "A visual stimulus icon will be presented on screen. Identify the matching visual object as rapidly and accurately as possible.";
    tip = "Respond immediately when the visual object appears. Use keys [1], [2], [3], [4] or click the button.";

    trials = [
      {
        prompt: "Identify the Visual Icon",
        text: "LIGHTNING",
        type: "image",
        iconName: "Zap",
        iconColor: "#F59E0B",
        imageUrl: config.imageUrl,
        correctAnswer: "LIGHTNING",
        options: ["LIGHTNING", "TARGET", "DIAMOND", "SHIELD"],
      },
      {
        prompt: "Identify the Visual Icon",
        text: "TARGET",
        type: "image",
        iconName: "Target",
        iconColor: "#EF4444",
        correctAnswer: "TARGET",
        options: ["STAR", "TARGET", "HEXAGON", "SHIELD"],
      },
      {
        prompt: "Identify the Visual Icon",
        text: "DIAMOND",
        type: "image",
        iconName: "Diamond",
        iconColor: "#3B82F6",
        correctAnswer: "DIAMOND",
        options: ["CIRCLE", "DIAMOND", "FLAME", "LIGHTNING"],
      },
      {
        prompt: "Identify the Visual Icon",
        text: "SHIELD",
        type: "image",
        iconName: "Shield",
        iconColor: "#22C55E",
        correctAnswer: "SHIELD",
        options: ["STAR", "LIGHTNING", "SHIELD", "TARGET"],
      },
      {
        prompt: "Identify the Visual Icon",
        text: "STAR",
        type: "image",
        iconName: "Star",
        iconColor: "#FBBF24",
        correctAnswer: "STAR",
        options: ["STAR", "DIAMOND", "HEXAGON", "TARGET"],
      },
      {
        prompt: "Identify the Visual Icon",
        text: "FLAME",
        type: "image",
        iconName: "Flame",
        iconColor: "#F97316",
        correctAnswer: "FLAME",
        options: ["LIGHTNING", "FLAME", "STAR", "SHIELD"],
      },
      {
        prompt: "Identify the Visual Icon",
        text: "EYE",
        type: "image",
        iconName: "Eye",
        iconColor: "#8B5CF6",
        correctAnswer: "EYE",
        options: ["EYE", "DIAMOND", "SHIELD", "TARGET"],
      },
      {
        prompt: "Identify the Visual Icon",
        text: "COMPASS",
        type: "image",
        iconName: "Compass",
        iconColor: "#06B6D4",
        correctAnswer: "COMPASS",
        options: ["TARGET", "COMPASS", "STAR", "LIGHTNING"],
      },
      {
        prompt: "Identify the Visual Icon",
        text: "CHIP",
        type: "image",
        iconName: "Cpu",
        iconColor: "#10B981",
        correctAnswer: "CHIP",
        options: ["CHIP", "SHIELD", "DIAMOND", "EYE"],
      },
      {
        prompt: "Identify the Visual Icon",
        text: "SPARK",
        type: "image",
        iconName: "Sparkles",
        iconColor: "#EC4899",
        correctAnswer: "SPARK",
        options: ["LIGHTNING", "SPARK", "STAR", "DIAMOND"],
      },
    ];
  } else {
    // Stroop Color Discrimination
    trials = [
      {
        prompt: "Identify the font ink color",
        text: "RED",
        colorName: "RED",
        colorHex: "#EF4444",
        rule: "match_color",
        type: "color",
        congruent: true,
        correctAnswer: "RED",
        options: ["RED", "BLUE", "GREEN", "YELLOW"],
      },
      {
        prompt: "Identify the font ink color",
        text: "BLUE",
        colorName: "BLUE",
        colorHex: "#3B82F6",
        rule: "match_color",
        type: "color",
        congruent: true,
        correctAnswer: "BLUE",
        options: ["RED", "BLUE", "GREEN", "YELLOW"],
      },
      {
        prompt: "Identify the font ink color (Ignore the text!)",
        text: "GREEN",
        colorName: "RED",
        colorHex: "#EF4444",
        rule: "match_color",
        type: "mixed",
        congruent: false,
        correctAnswer: "RED",
        options: ["RED", "BLUE", "GREEN", "YELLOW"],
      },
      {
        prompt: "Identify the font ink color",
        text: "YELLOW",
        colorName: "YELLOW",
        colorHex: "#F59E0B",
        rule: "match_color",
        type: "color",
        congruent: true,
        correctAnswer: "YELLOW",
        options: ["RED", "BLUE", "GREEN", "YELLOW"],
      },
      {
        prompt: "Identify the font ink color (Ignore the text!)",
        text: "YELLOW",
        colorName: "BLUE",
        colorHex: "#3B82F6",
        rule: "match_color",
        type: "mixed",
        congruent: false,
        correctAnswer: "BLUE",
        options: ["RED", "BLUE", "GREEN", "YELLOW"],
      },
      {
        prompt: "Identify the font ink color",
        text: "GREEN",
        colorName: "GREEN",
        colorHex: "#22C55E",
        rule: "match_color",
        type: "color",
        congruent: true,
        correctAnswer: "GREEN",
        options: ["RED", "BLUE", "GREEN", "YELLOW"],
      },
      {
        prompt: "Identify the font ink color (Ignore the text!)",
        text: "RED",
        colorName: "GREEN",
        colorHex: "#22C55E",
        rule: "match_color",
        type: "color",
        congruent: false,
        correctAnswer: "GREEN",
        options: ["RED", "BLUE", "GREEN", "YELLOW"],
      },
      {
        prompt: "Identify the font ink color (Ignore the text!)",
        text: "BLUE",
        colorName: "YELLOW",
        colorHex: "#F59E0B",
        rule: "match_color",
        type: "color",
        congruent: false,
        correctAnswer: "YELLOW",
        options: ["RED", "BLUE", "GREEN", "YELLOW"],
      },
      {
        prompt: "Identify the font ink color (Ignore the text!)",
        text: "RED",
        colorName: "BLUE",
        colorHex: "#3B82F6",
        rule: "match_color",
        type: "mixed",
        congruent: false,
        correctAnswer: "BLUE",
        options: ["RED", "BLUE", "GREEN", "YELLOW"],
      },
      {
        prompt: "Final high-interference trial (Ignore the text!)",
        text: "GREEN",
        colorName: "YELLOW",
        colorHex: "#F59E0B",
        rule: "match_color",
        type: "mixed",
        congruent: false,
        correctAnswer: "YELLOW",
        options: ["RED", "BLUE", "GREEN", "YELLOW"],
      },
    ];
  }

  return { mode, headline, description, tip, trials, activeNode, config };
}

/**
 * Derive capture-time timing rules from the experiment graph.
 *
 * Previously `minValidMs`, `timeoutMs` and `filterOutliers` were authored in the
 * builder, persisted, displayed in the inspector, and then never read by the
 * runtime. They were decorative. Reading them here is what makes the graph
 * authoritative over measurement policy.
 *
 * A configured minimum of 0 (or a missing key) is treated as "no floor
 * configured" and falls back to the default, because a 0ms floor would admit
 * every anticipatory press and silently destroy the dataset.
 */
function resolveTimingRules(experiment: Experiment): TimingRules {
  const nodes = experiment.nodes || [];
  const measurement = nodes.find((n) => n.data?.category === "measurement");
  const response = nodes.find((n) => n.data?.category === "response");
  // `config` is already `Record<string, any>` on NodeData, so no cast is needed
  // and none is added here.
  const m = measurement?.data?.config ?? {};
  const r = response?.data?.config ?? {};

  const configuredMin = Number(m.minValidMs);
  const configuredTimeout = Number(r.timeoutMs);

  return {
    minValidMs:
      Number.isFinite(configuredMin) && configuredMin > 0
        ? configuredMin
        : DEFAULT_TIMING_RULES.minValidMs,
    timeoutMs:
      Number.isFinite(configuredTimeout) && configuredTimeout > 0
        ? configuredTimeout
        : DEFAULT_TIMING_RULES.timeoutMs,
    filterOutliers: m.filterOutliers !== false,
    outlierMinSamples: DEFAULT_TIMING_RULES.outlierMinSamples,
    outlierSigma: DEFAULT_TIMING_RULES.outlierSigma,
  };
}

const COLOR_BUTTONS = [
  { label: "RED", key: "1", colorHex: "#EF4444", bgClass: "hover:bg-[#EF4444]/20 border-[#EF4444]/40" },
  { label: "BLUE", key: "2", colorHex: "#3B82F6", bgClass: "hover:bg-[#3B82F6]/20 border-[#3B82F6]/40" },
  { label: "GREEN", key: "3", colorHex: "#22C55E", bgClass: "hover:bg-[#22C55E]/20 border-[#22C55E]/40" },
  { label: "YELLOW", key: "4", colorHex: "#F59E0B", bgClass: "hover:bg-[#F59E0B]/20 border-[#F59E0B]/40" },
];

/**
 * Fixation cross duration before the stimulus frame is scheduled.
 * Long enough to recentre gaze, short enough that the participant does not
 * begin anticipating the stimulus onset.
 */
const FIXATION_MS = 380;

/** Inter-trial feedback display. Never overlaps an active measurement window. */
const FEEDBACK_MS = 320;

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
  const [clock, setClock] = useState<ClockDiagnostics | null>(null);

  const rules = React.useMemo(() => resolveTimingRules(experiment), [experiment]);

  // Lazy ref init. `useRef(createTrialTimer())` would re-run the factory on
  // every render and discard the result, and the timer must be constructed with
  // the response window from the current rules.
  const timerRef = useRef<ReturnType<typeof createTrialTimer> | null>(null);
  if (timerRef.current === null) {
    timerRef.current = createTrialTimer(rules.timeoutMs);
  }

  // Pending work that must be cancelled on restart and on unmount. Previously
  // these timeouts were fire-and-forget, so restarting inside the fixation
  // window would still fire the stale callback and start a trial the
  // participant never saw.
  const fixationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onsetFrameRef = useRef<number | null>(null);
  const onsetFrame2Ref = useRef<number | null>(null);
  const pendingOnsetRef = useRef<number | null>(null);
  /** Bounds the response window. Set on trial start, cleared on every transition. */
  const omissionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /**
   * Indirection so the omission timer can reach `handleOmission` without making
   * `launchTrial` depend on a callback that is itself declared later and closes
   * over `launchTrial`. A direct dependency here would be a circular reference.
   */
  const handleOmissionRef = useRef<(() => void) | null>(null);

  // Sync participantName if user changes
  useEffect(() => {
    if (user?.displayName) {
      setParticipantName(user.displayName);
    }
  }, [user?.displayName]);

  const trialActiveRef = useRef(false);

  const flow = React.useMemo(() => resolveExperimentFlow(experiment), [experiment]);
  const activeTrials = flow.trials;
  const totalTrials = Math.min(experiment.trialCount || 10, activeTrials.length);
  const currentStimulus = activeTrials[currentTrialIdx] || activeTrials[0];

  // Probe the live clock once, so the footer reports measured configuration
  // rather than an assumed one.
  useEffect(() => {
    let cancelled = false;
    measureClockResolution().then((d) => {
      if (!cancelled) setClock(d);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const cancelPending = useCallback(() => {
    if (fixationTimerRef.current) {
      clearTimeout(fixationTimerRef.current);
      fixationTimerRef.current = null;
    }
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
    if (onsetFrameRef.current !== null) {
      cancelAnimationFrame(onsetFrameRef.current);
      onsetFrameRef.current = null;
    }
    if (onsetFrame2Ref.current !== null) {
      cancelAnimationFrame(onsetFrame2Ref.current);
      onsetFrame2Ref.current = null;
    }
    if (omissionTimerRef.current) {
      clearTimeout(omissionTimerRef.current);
      omissionTimerRef.current = null;
    }
    trialActiveRef.current = false;
  }, []);

  // Unmount safety: without this the rAF chain can resolve after teardown.
  useEffect(() => cancelPending, [cancelPending]);

  /**
   * Start a trial: fixation cross, then a stimulus frame whose onset is
   * timestamped by the browser rather than by this code.
   *
   * The previous implementation called `timer.start()` in the same synchronous
   * task as `setStage("trial")`. React had not yet rendered, committed, or
   * painted anything, so the recorded onset preceded the visible stimulus by a
   * full render+paint cycle (roughly 5-20ms) and every trial was systematically
   * under-reported. The variable component of that overhead also inflated the
   * measured standard deviation.
   *
   * Now: the first rAF callback receives the timestamp of the frame that will
   * paint the stimulus, and the second confirms that frame was committed before
   * responses are accepted. Onset is anchored to the earlier frame-start time,
   * so the participant has physically seen the stimulus before any reaction can
   * be recorded.
   *
   * `trialIdx` is intentionally not a parameter. The active stimulus is derived
   * from `currentTrialIdx` state, and threading an index through a `setTimeout`
   * closure previously produced a stale-closure off-by-one waiting to happen.
   */
  const launchTrial = useCallback(() => {
    cancelPending();
    setStage("fixation");

    fixationTimerRef.current = setTimeout(() => {
      fixationTimerRef.current = null;
      setStage("trial");

      // Frame 1: timestamp the frame that will present the stimulus.
      onsetFrameRef.current = requestAnimationFrame((frameStartMs) => {
        onsetFrameRef.current = null;
        pendingOnsetRef.current = frameStartMs;

        // Frame 2: that frame is now committed. Open the response window.
        onsetFrame2Ref.current = requestAnimationFrame(() => {
          onsetFrame2Ref.current = null;
          timerRef.current!.start(pendingOnsetRef.current ?? undefined);
          pendingOnsetRef.current = null;
          trialActiveRef.current = true;

          // Arm the bounded response window from stimulus onset.
          omissionTimerRef.current = setTimeout(() => {
            omissionTimerRef.current = null;
            handleOmissionRef.current?.();
          }, rules.timeoutMs);
        });
      });
    }, FIXATION_MS);
  }, [cancelPending, rules.timeoutMs]);

  /**
   * Complete the session: persist every trial (including rejected ones, so the
   * exclusion is auditable) and show the debrief.
   */
  const finishRun = useCallback(
    (finalResults: TrialResult[]) => {
      setStage("completed");
      // Submit the full run. Rejected trials are transmitted with `valid: false`
      // and are excluded downstream by the storage layer, not hidden here.
      // The active user id links the run to the logged-in participant so repeat
      // sessions accumulate on one record instead of forking a new one.
      trialService
        .submitTrialRun(participantName, finalResults, user?.id)
        .catch(console.error);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#4F8CFF", "#8B5CF6", "#22D3EE", "#22C55E"],
        });
      } catch {}
    },
    [participantName, user?.id]
  );

  /**
   * Record a response window timeout as an explicit omission trial.
   *
   * The response window is bounded by the `responseNode` `timeoutMs` config.
   * Previously the window was unbounded, so an inattentive participant could
   * take arbitrarily long and the sample still entered the dataset, inflating
   * the cohort mean. An omission is recorded rather than dropped so trial
   * counts stay reconcilable against the protocol.
   */
  const handleOmission = useCallback(() => {
    if (!trialActiveRef.current || stage !== "trial") return;
    trialActiveRef.current = false;

    const timing = timerRef.current!.stop();
    const stim = activeTrials[currentTrialIdx] || activeTrials[0];

    const omissionTrial: TrialResult = {
      id: `trial-live-${currentTrialIdx + 1}`,
      participantId: "pending",
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
        selectedAnswer: "",
        inputMethod: "keyboard",
      },
      correct: false,
      // The full elapsed time is retained for analysis even though the trial
      // is scored as an omission; it is the best available evidence of the
      // participant's disengagement.
      reactionTimeMs: timing.reactionTimeMs,
      startedAt: timing.startedAtIso,
      respondedAt: timing.stoppedAtIso,
      valid: false,
      rejection: "timeout",
      rejectionDetail: `No response within ${rules.timeoutMs}ms window (elapsed ${timing.reactionTimeMs}ms)`,
      omission: true,
      onsetSource: timing.onsetSource,
    };

    const nextResults = [...results, omissionTrial];
    setResults(nextResults);
    setLastFeedback({ correct: false, rt: timing.reactionTimeMs });

    if (currentTrialIdx + 1 < totalTrials) {
      setStage("feedback");
      feedbackTimerRef.current = setTimeout(() => {
        feedbackTimerRef.current = null;
        setCurrentTrialIdx((prev) => prev + 1);
        launchTrial();
      }, FEEDBACK_MS);
    } else {
      finishRun(nextResults);
    }
  }, [
    activeTrials,
    currentTrialIdx,
    experiment.id,
    finishRun,
    launchTrial,
    results,
    rules.timeoutMs,
    stage,
    totalTrials,
  ]);

  // Record response
  const handleResponse = useCallback(
    (selectedAnswer: string, inputMethod: "keyboard" | "button" = "button") => {
      if (!trialActiveRef.current || stage !== "trial") return;
      trialActiveRef.current = false;

      const timing = timerRef.current!.stop();
      const stim = activeTrials[currentTrialIdx] || activeTrials[0];
      const correct = selectedAnswer === stim.correctAnswer;

      // Capture-time validity. Evaluated here, not at aggregation time, and
      // recorded on the trial so exclusions remain auditable rather than
      // silently filtered out of a mean.
      const priorRts = results.filter((r) => r.valid !== false).map((r) => r.reactionTimeMs);
      const verdict = evaluateTrial(timing.reactionTimeMs, rules, priorRts);

      const recordedTrial: TrialResult = {
        id: `trial-live-${currentTrialIdx + 1}`,
        participantId: "pending",
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
        valid: verdict.valid,
        rejection: verdict.rejection,
        rejectionDetail: verdict.detail,
        omission: false,
        onsetSource: timing.onsetSource,
      };

      const nextResults = [...results, recordedTrial];
      setResults(nextResults);
      setLastFeedback({ correct, rt: timing.reactionTimeMs });

      // Move to next trial or finish
      if (currentTrialIdx + 1 < totalTrials) {
        // Very brief feedback display, entirely between measurement windows so
        // it cannot contaminate a reaction time.
        setStage("feedback");
        feedbackTimerRef.current = setTimeout(() => {
          feedbackTimerRef.current = null;
          setCurrentTrialIdx((prev) => prev + 1);
          launchTrial();
        }, FEEDBACK_MS);
      } else {
        finishRun(nextResults);
      }
    },
    [
      activeTrials,
      currentTrialIdx,
      experiment.id,
      finishRun,
      launchTrial,
      results,
      rules,
      stage,
      totalTrials,
    ]
  );

  // Keep the omission indirection current. Must be an effect, not a render-time
  // assignment: the omission timer only fires well after mount, so the ref is
  // always populated before it is read.
  useEffect(() => {
    handleOmissionRef.current = handleOmission;
  }, [handleOmission]);

  // Keyboard navigation for keys 1, 2, 3, 4 or R, G, B, Y
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (stage !== "trial" || !trialActiveRef.current) return;

      const key = e.key.toUpperCase();
      const options = currentStimulus?.options || [];
      if (key === "1" && options[0]) {
        handleResponse(options[0], "keyboard");
      } else if (key === "2" && options[1]) {
        handleResponse(options[1], "keyboard");
      } else if (key === "3" && options[2]) {
        handleResponse(options[2], "keyboard");
      } else if (key === "4" && options[3]) {
        handleResponse(options[3], "keyboard");
      } else if (flow.mode === "color") {
        if (key === "R") handleResponse("RED", "keyboard");
        else if (key === "B") handleResponse("BLUE", "keyboard");
        else if (key === "G") handleResponse("GREEN", "keyboard");
        else if (key === "Y") handleResponse("YELLOW", "keyboard");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStimulus?.options, flow.mode, handleResponse, stage]);

  // Restart demo run
  const handleRestart = () => {
    // Must cancel first: without this a restart during the fixation window
    // leaves the stale callback live, which would start a trial the
    // participant never saw and record a reaction to it.
    cancelPending();
    setResults([]);
    setCurrentTrialIdx(0);
    setLastFeedback(null);
    setStage("instructions");
  };

  // Completed metrics. Derived from admissible trials only, matching the
  // aggregation the storage layer performs, so the debrief the participant sees
  // and the statistics the researcher reads are computed the same way.
  const scored = results.filter((r) => r.valid !== false);
  const excluded = results.length - scored.length;
  const accuracy = scored.length > 0 ? (scored.filter((r) => r.correct).length / scored.length) * 100 : 0;
  const rts = scored.map((r) => r.reactionTimeMs);
  const avgRt = rts.length > 0 ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : 0;
  const fastestRt = rts.length > 0 ? Math.min(...rts) : 0;
  const slowestRt = rts.length > 0 ? Math.max(...rts) : 0;

  return (
    <div className="min-h-screen bg-[#05060A] text-white flex flex-col justify-between selection:bg-[#4F8CFF]/30 select-none">
      {/* Minimal Header */}
      <div className="h-12 border-b border-white/[0.06] px-6 flex items-center justify-between text-xs text-[#697386]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="font-mono uppercase tracking-wider">
            {isPreview ? "PREVIEW RUNTIME" : "COGNITIVELAB SESSION"}
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
            href="/builder"
            className="text-xs text-[#A5ADBD] hover:text-white underline font-mono"
          >
            Exit Runtime
          </Link>
        )}
      </div>

      {/* Main Focus Area */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl text-center">
          {/* STAGE 1: CONSENT */}
          {stage === "consent" && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-2xl bg-[#4F8CFF]/10 border border-[#4F8CFF]/30 text-[#4F8CFF] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(79,140,255,0.2)]">
                <Shield className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Informed Participant Briefing
                </h1>
                <p className="text-xs text-[#A5ADBD] leading-relaxed max-w-md mx-auto">
                  You are participating in a behavioral measurement study evaluating visual-motor reaction time and cognitive inhibition under Stroop interference.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0A0D14] border border-white/10 text-left text-xs text-[#A5ADBD] space-y-2">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 mb-2">
                  <span className="font-semibold text-white">Participant Demographics:</span>
                  <span className="text-[11px] font-mono text-[#34D399] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/30">
                    Age {user?.age ?? "—"} · {user?.ageGroup} Cohort
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
              <div className="w-14 h-14 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#8B5CF6] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                {flow.mode === "image" ? (
                  <Zap className="w-7 h-7" />
                ) : flow.mode === "text" ? (
                  <Target className="w-7 h-7" />
                ) : (
                  <Zap className="w-7 h-7" />
                )}
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

              {/* Sample illustration */}
              <div className="p-6 rounded-2xl bg-[#0A0D14] border border-white/10 flex flex-col items-center gap-3">
                <span className="text-xs text-[#697386] font-mono uppercase">Example Stimulus</span>
                {flow.mode === "image" ? (
                  <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
                    <Zap className="w-10 h-10 text-[#F59E0B] drop-shadow-[0_0_15px_#F59E0B]" />
                  </div>
                ) : flow.mode === "text" ? (
                  <span className="text-4xl font-black font-mono tracking-widest text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]">
                    {flow.trials[0]?.text || "TARGET"}
                  </span>
                ) : (
                  <span className="text-4xl font-black font-sans tracking-wide text-[#3B82F6]">
                    RED
                  </span>
                )}

                <span className="text-xs text-[#22C55E] font-medium">
                  {flow.mode === "color" ? (
                    <>Correct Answer: <strong className="text-white">BLUE</strong> (because ink is blue)</>
                  ) : flow.mode === "image" ? (
                    <>Action: Press <strong className="text-white">[1]</strong> or click <strong className="text-white">LIGHTNING</strong></>
                  ) : (
                    <>Action: Press <strong className="text-white">[1]</strong> or select <strong className="text-white">{flow.trials[0]?.text || "TARGET"}</strong></>
                  )}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/10 text-xs text-[#A5ADBD] font-mono">
                Keyboard shortcuts enabled: <strong className="text-white">1, 2, 3, 4</strong>
              </div>

              <Button
                onClick={() => launchTrial()}
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

          {/* STAGE 4: TRIAL ACTIVE (DISTRACTION-FREE, NO HEAVY TRANSITIONS) */}
          {stage === "trial" && (
            <div className="space-y-8">
              <div className="text-xs font-mono text-[#697386] uppercase tracking-wider">
                {currentStimulus.prompt}
              </div>

              {/* Central Target Stimulus */}
              <div className="h-44 flex items-center justify-center">
                {flow.mode === "image" ? (
                  <div className="w-36 h-36 rounded-3xl bg-[#0D111A] border-2 border-[#4F8CFF]/30 shadow-[0_0_35px_rgba(79,140,255,0.25)] flex items-center justify-center animate-in zoom-in-95 duration-100">
                    {renderVisualStimulus(currentStimulus.iconName, currentStimulus.iconColor, currentStimulus.imageUrl)}
                  </div>
                ) : flow.mode === "text" ? (
                  <div className="px-8 py-5 rounded-2xl bg-white/[0.03] border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.15)] animate-in zoom-in-95 duration-100">
                    <span className="text-5xl sm:text-6xl font-black tracking-widest text-white font-mono drop-shadow-[0_0_25px_rgba(255,255,255,0.5)]">
                      {currentStimulus.text}
                    </span>
                  </div>
                ) : (
                  <div
                    className="text-6xl sm:text-7xl font-black tracking-wider transition-none font-sans drop-shadow-[0_0_20px_currentColor]"
                    style={{ color: currentStimulus.colorHex }}
                  >
                    {currentStimulus.text}
                  </div>
                )}
              </div>

              {/* Response Options */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
                {(currentStimulus.options || []).map((btnLabel, idx) => {
                  const colorBtn = COLOR_BUTTONS.find((b) => b.label === btnLabel);
                  const keyNum = String(idx + 1);
                  return (
                    <button
                      key={btnLabel}
                      // pointerdown, not click. A click event is only dispatched
                      // after the full pointerdown -> pointerup sequence, adding a
                      // systematic offset relative to the keyboard path and biasing
                      // button responses slower. preventDefault suppresses the
                      // synthetic mouse/click sequence and the 75ms active-state
                      // transition, which would otherwise be in flight here.
                      onPointerDown={(e) => {
                        e.preventDefault();
                        handleResponse(btnLabel, "button");
                      }}
                      className={`py-3.5 px-4 rounded-xl border bg-[#10141D] text-white font-bold text-sm tracking-wide transition-all duration-75 active:scale-95 flex flex-col items-center justify-center gap-1 shadow-lg hover:border-[#4F8CFF]/60 hover:bg-[#4F8CFF]/15 ${
                        colorBtn ? colorBtn.bgClass : "border-white/10"
                      }`}
                    >
                      <span style={{ color: colorBtn ? colorBtn.colorHex : "#FFFFFF" }}>{btnLabel}</span>
                      <span className="text-[10px] font-mono text-[#697386]">[{keyNum}]</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STAGE 5: VERY BRIEF FEEDBACK */}
          {stage === "feedback" && lastFeedback && (
            <div className="flex flex-col items-center justify-center h-48 space-y-2">
              <div
                className={`text-2xl font-bold font-mono ${
                  lastFeedback.correct ? "text-[#22C55E]" : "text-[#EF4444]"
                }`}
              >
                {lastFeedback.correct ? "CORRECT" : "INCORRECT"}
              </div>
              <div className="text-xs text-[#A5ADBD] font-mono">
                {Math.round(lastFeedback.rt)} ms
              </div>
            </div>
          )}

          {/* STAGE 6: COMPLETED */}
          {stage === "completed" && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-2xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(34,197,94,0.3)]">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Experiment Complete
                </h1>
                <p className="text-xs text-[#A5ADBD] font-mono">
                  All {totalTrials} trials successfully serialized to telemetry stream.
                </p>
              </div>

              {/* Exclusion notice: a dataset that has been cleaned is only
                  interpretable if the reader knows what was removed. */}
              {excluded > 0 && (
                <div className="p-3 rounded-xl bg-[#F59E0B]/[0.06] border border-[#F59E0B]/25 text-left">
                  <p className="text-[10px] text-[#F59E0B] uppercase font-mono">
                    {excluded} of {results.length} trials excluded
                  </p>
                  <p className="text-[11px] text-[#A5ADBD] mt-1 leading-relaxed">
                    Removed by capture-time validity rules: responses faster than{" "}
                    {rules.minValidMs}ms (anticipatory), no response within {rules.timeoutMs}ms
                    (omission), or robust outliers. Figures below reflect the{" "}
                    {scored.length} admissible trials.
                  </p>
                </div>
              )}

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
                    <Link href={`/participant/results/${experiment.id}`}>
                      <Button variant="ghost" size="md">
                        Trial Breakdown
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
                    <Link href="/dashboard">
                      <Button variant="ghost" size="md">
                        Return to Dashboard
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
        <span>COGNITIVELAB RUNTIME ENGINE • v2.5</span>
        {/* Measured configuration, not an assumed one. The previous
            "HIGH RES SUB-MS" claim was unsupportable: stimulus onset carries
            +/-1 frame of quantization (6.9-16.7ms) that no browser API can
            remove, which is two orders of magnitude larger than the clock
            resolution this line was implicitly citing. */}
        <span
          title={clock?.note}
          className={clock?.crossOriginIsolated ? "text-[#4F8CFF]" : "text-[#F59E0B]"}
        >
          {clock
            ? `ONSET rAF • CLOCK ${clock.resolutionMs.toFixed(3)}ms • ${clock.crossOriginIsolated ? "ISOLATED 5us" : "CLAMPED 100us"} • ±1 FRAME`
            : "ONSET rAF • PROBING CLOCK…"}
        </span>
      </footer>
    </div>
  );
}
