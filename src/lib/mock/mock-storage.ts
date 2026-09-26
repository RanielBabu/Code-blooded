import { Experiment } from "@/types/experiment";
import {
  Participant,
  TrialResult,
  AnalyticsSummary,
  LeaderboardEntry,
  ResearchInsight,
  StimulusType,
} from "@/types/participant";
import { MOCK_EXPERIMENTS } from "./mock-experiments";
import { MOCK_PARTICIPANTS } from "./mock-participants";
import { MOCK_TRIALS } from "./mock-trials";

const STORAGE_KEYS = {
  EXPERIMENTS: "cognitivelab_experiments_v1",
  PARTICIPANTS: "cognitivelab_participants_v1",
  TRIALS: "cognitivelab_trials_v1",
  SETTINGS: "cognitivelab_settings_v1",
};

class MockStorageStore {
  private experiments: Experiment[] = [];
  private participants: Participant[] = [];
  private trials: TrialResult[] = [];
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;

    if (typeof window !== "undefined") {
      try {
        const savedExp = localStorage.getItem(STORAGE_KEYS.EXPERIMENTS);
        const savedParts = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
        const savedTrials = localStorage.getItem(STORAGE_KEYS.TRIALS);

        this.experiments = savedExp ? JSON.parse(savedExp) : MOCK_EXPERIMENTS;
        this.participants = savedParts ? JSON.parse(savedParts) : MOCK_PARTICIPANTS;
        this.trials = savedTrials ? JSON.parse(savedTrials) : MOCK_TRIALS;
      } catch (e) {
        console.warn("Local storage parse error, falling back to in-memory mocks", e);
        this.experiments = [...MOCK_EXPERIMENTS];
        this.participants = [...MOCK_PARTICIPANTS];
        this.trials = [...MOCK_TRIALS];
      }
    } else {
      this.experiments = [...MOCK_EXPERIMENTS];
      this.participants = [...MOCK_PARTICIPANTS];
      this.trials = [...MOCK_TRIALS];
    }

    this.initialized = true;
  }

  private persist() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEYS.EXPERIMENTS, JSON.stringify(this.experiments));
        localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(this.participants));
        localStorage.setItem(STORAGE_KEYS.TRIALS, JSON.stringify(this.trials));
      } catch (e) {
        console.warn("Failed to persist to localStorage", e);
      }
    }
  }

  public resetToDefaults() {
    this.experiments = [...MOCK_EXPERIMENTS];
    this.participants = [...MOCK_PARTICIPANTS];
    this.trials = [...MOCK_TRIALS];
    this.persist();
  }

  // --- EXPERIMENTS ---
  public getExperiments(): Experiment[] {
    this.init();
    return this.experiments;
  }

  public getExperimentById(id: string): Experiment | undefined {
    this.init();
    return this.experiments.find((e) => e.id === id);
  }

  public saveExperiment(exp: Experiment): Experiment {
    this.init();
    const idx = this.experiments.findIndex((e) => e.id === exp.id);
    const updated = { ...exp, updatedAt: new Date().toISOString() };
    if (idx >= 0) {
      this.experiments[idx] = updated;
    } else {
      this.experiments.unshift(updated);
    }
    this.persist();
    return updated;
  }

  public duplicateExperiment(id: string): Experiment | null {
    this.init();
    const existing = this.getExperimentById(id);
    if (!existing) return null;
    const duplicated: Experiment = {
      ...existing,
      id: `exp-${Date.now()}`,
      name: `${existing.name} (Copy)`,
      status: "draft",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        participants: 0,
        completedTrials: 0,
        avgReactionTimeMs: 0,
        accuracyPercent: 0,
      },
    };
    this.experiments.unshift(duplicated);
    this.persist();
    return duplicated;
  }

  public updateExperimentStatus(id: string, status: "draft" | "published" | "archived"): Experiment | null {
    this.init();
    const exp = this.getExperimentById(id);
    if (!exp) return null;
    exp.status = status;
    exp.updatedAt = new Date().toISOString();
    this.persist();
    return exp;
  }

  // --- PARTICIPANTS ---
  public getParticipants(): Participant[] {
    this.init();
    return this.participants;
  }

  public getParticipantById(id: string): Participant | undefined {
    this.init();
    return this.participants.find((p) => p.id === id);
  }

  // --- TRIALS & RUNTIME RECORDING ---
  public getTrials(filter?: { experimentId?: string; participantId?: string; stimulusType?: string }): TrialResult[] {
    this.init();
    return this.trials.filter((t) => {
      if (filter?.experimentId && t.experimentId !== filter.experimentId) return false;
      if (filter?.participantId && t.participantId !== filter.participantId) return false;
      if (filter?.stimulusType && filter.stimulusType !== "all" && t.stimulusType !== filter.stimulusType) return false;
      return true;
    });
  }

  /**
   * Trials that passed capture-time validity rules.
   *
   * Rejection happens in the runtime and is recorded on the trial, but a
   * rejected sample must not silently re-enter the aggregates, or the mean and
   * standard deviation the researcher reports would still be contaminated by
   * exactly the anticipatory presses and omissions the rules exist to remove.
   *
   * Trials with `valid === undefined` are historical records predating validity
   * tracking and are retained, so previously collected datasets keep their
   * original meaning instead of silently emptying.
   */
  public getAdmissibleTrials(filter?: {
    experimentId?: string;
    participantId?: string;
    stimulusType?: string;
  }): TrialResult[] {
    return this.getTrials(filter).filter((t) => t.valid !== false);
  }

  public recordTrialRun(participantName: string, newTrials: TrialResult[]): { participant: Participant; trials: TrialResult[] } {
    this.init();
    const participantId = `part-${Date.now().toString().slice(-4)}`;
    const totalTrials = newTrials.length;

    // Participant-level metrics are derived from admissible trials only. An
    // anticipatory press produces a fast, wrong, meaningless sample; letting it
    // set this participant's headline average would misrepresent them.
    const scored = newTrials.filter((t) => t.valid !== false);
    const excludedCount = totalTrials - scored.length;

    const correctCount = scored.filter((t) => t.correct).length;
    const accuracy = scored.length > 0 ? (correctCount / scored.length) * 100 : 0;
    const rts = scored.map((t) => t.reactionTimeMs);
    const avgRt = rts.length > 0 ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : 0;

    // Calculate variance / consistency score (0 - 100)
    const variance = rts.length > 1 ? rts.reduce((acc, val) => acc + Math.pow(val - avgRt, 2), 0) / (rts.length - 1) : 0;
    const stdDev = Math.sqrt(variance);
    const consistencyScore = Math.max(40, Math.min(99, Math.round(100 - stdDev / 3)));

    const createdParticipant: Participant = {
      id: participantId,
      displayName: participantName || `Participant ${participantId.toUpperCase()}`,
      sessionId: `sess_${Date.now()}`,
      status: "completed",
      completedExperiments: 1,
      totalTrials,
      avgReactionTimeMs: avgRt,
      accuracyPercent: Math.round(accuracy * 10) / 10,
      consistencyScore,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      notes:
        excludedCount > 0
          ? `Completed interactive live test run. ${excludedCount} of ${totalTrials} trials excluded by capture-time validity rules (premature / timeout / outlier).`
          : "Completed interactive live test run in CognitiveLab runtime.",
    };

    const assignedTrials = newTrials.map((t, idx) => ({
      ...t,
      id: `trial-${participantId}-${idx + 1}`,
      participantId,
      participantName: createdParticipant.displayName,
    }));

    this.participants.unshift(createdParticipant);
    this.trials = [...assignedTrials, ...this.trials];

    // Update experiment stats
    if (newTrials.length > 0) {
      const expId = newTrials[0].experimentId;
      const exp = this.getExperimentById(expId);
      if (exp) {
        const expTrials = this.getAdmissibleTrials({ experimentId: expId });
        const expParticipants = new Set(expTrials.map((t) => t.participantId)).size;
        const expRt = expTrials.map((t) => t.reactionTimeMs);
        const newAvg = expRt.length > 0 ? Math.round(expRt.reduce((a, b) => a + b, 0) / expRt.length) : exp.stats?.avgReactionTimeMs || 412;
        const newAcc = expTrials.length > 0 ? (expTrials.filter((t) => t.correct).length / expTrials.length) * 100 : 0;

        exp.stats = {
          participants: expParticipants,
          completedTrials: expTrials.length,
          avgReactionTimeMs: newAvg,
          accuracyPercent: Math.round(newAcc * 10) / 10,
        };
      }
    }

    this.persist();
    return { participant: createdParticipant, trials: assignedTrials };
  }

  // --- ANALYTICS SUMMARY & CALCULATIONS ---
  public getAnalyticsSummary(experimentId?: string, participantId?: string): AnalyticsSummary {
    this.init();
    // Admissible-only: aggregates must not be contaminated by samples the
    // runtime already rejected as premature, timed out, or outlying.
    const relevantTrials = this.getAdmissibleTrials({ experimentId, participantId });

    if (relevantTrials.length === 0) {
      return {
        participantCount: 0,
        trialCount: 0,
        averageReactionTimeMs: 0,
        medianReactionTimeMs: 0,
        accuracyPercent: 0,
        fastestReactionTimeMs: 0,
        slowestReactionTimeMs: 0,
        stdDeviationMs: 0,
        stimulusBreakdown: [],
        trialProgression: [],
        rtDistribution: [],
      };
    }

    const uniqueParticipants = new Set(relevantTrials.map((t) => t.participantId)).size;
    const rts = relevantTrials.map((t) => t.reactionTimeMs).sort((a, b) => a - b);
    const avgRt = Math.round(rts.reduce((a, b) => a + b, 0) / rts.length);
    const mid = Math.floor(rts.length / 2);
    const medianRt = rts.length % 2 === 0 ? Math.round((rts[mid - 1] + rts[mid]) / 2) : rts[mid];
    const fastestRt = rts[0];
    const slowestRt = rts[rts.length - 1];

    const correctCount = relevantTrials.filter((t) => t.correct).length;
    const accuracyPercent = Math.round((correctCount / relevantTrials.length) * 1000) / 10;

    // Per-modality latency and accuracy, derived only from trials that were
    // actually recorded. A modality with no trials reports null rather than a
    // synthesised value, matching the database-backed implementation.
    const stimTypes: StimulusType[] = ["text", "color", "image", "mixed"];
    const stimulusBreakdown = stimTypes.map((type) => {
      const typeTrials = relevantTrials.filter((t) => t.stimulusType === type);
      const count = typeTrials.length;
      if (count === 0) {
        return { type, avgRt: null, accuracy: null, count: 0 };
      }
      const typeAvgRt = Math.round(
        typeTrials.reduce((a, b) => a + b.reactionTimeMs, 0) / count
      );
      const typeAcc = Math.round((typeTrials.filter((t) => t.correct).length / count) * 1000) / 10;
      return { type, avgRt: typeAvgRt, accuracy: typeAcc, count };
    });

    const variance = rts.reduce((acc, val) => acc + Math.pow(val - avgRt, 2), 0) / rts.length;
    const stdDev = Math.round(Math.sqrt(variance));

    // Trial progression, restricted to trial numbers that were actually
    // collected. The previous version always emitted ten rows and filled the
    // absent ones with a synthetic `400 - trial * 6` ms curve and a flat 92%
    // accuracy, which drew a smooth practice curve across trials nobody ran.
    const observedTrialNumbers = [
      ...new Set(relevantTrials.map((t) => t.trialNumber)),
    ].sort((a, b) => a - b);

    const trialProgression = observedTrialNumbers.map((trialNum) => {
      const tAtNum = relevantTrials.filter((t) => t.trialNumber === trialNum);
      const textAtNum = tAtNum.filter((t) => t.stimulusType === "text");
      const colorAtNum = tAtNum.filter((t) => t.stimulusType === "color");
      const imageAtNum = tAtNum.filter((t) => t.stimulusType === "image");

      const avgRtAtNum = Math.round(
        tAtNum.reduce((a, b) => a + b.reactionTimeMs, 0) / tAtNum.length
      );

      return {
        trial: trialNum,
        avgRt: avgRtAtNum,
        accuracy:
          Math.round((tAtNum.filter((t) => t.correct).length / tAtNum.length) * 1000) / 10,
        textRt:
          textAtNum.length > 0
            ? Math.round(textAtNum.reduce((a, b) => a + b.reactionTimeMs, 0) / textAtNum.length)
            : null,
        colorRt:
          colorAtNum.length > 0
            ? Math.round(colorAtNum.reduce((a, b) => a + b.reactionTimeMs, 0) / colorAtNum.length)
            : null,
        imageRt:
          imageAtNum.length > 0
            ? Math.round(imageAtNum.reduce((a, b) => a + b.reactionTimeMs, 0) / imageAtNum.length)
            : null,
      };
    });

    // RT Distribution Bins (e.g. 250-300, 301-350, 351-400, 401-450, 451-500, 501-550, 551-600, 601+)
    const bins = [
      { range: "250-300ms", min: 250, max: 300 },
      { range: "301-350ms", min: 301, max: 350 },
      { range: "351-400ms", min: 351, max: 400 },
      { range: "401-450ms", min: 401, max: 450 },
      { range: "451-500ms", min: 451, max: 500 },
      { range: "501-550ms", min: 501, max: 550 },
      { range: "551-600ms", min: 551, max: 600 },
      { range: "601ms+", min: 601, max: 2000 },
    ];

    const rtDistribution = bins.map((bin) => {
      const matchCount = rts.filter((rt) => rt >= bin.min && rt <= bin.max).length;
      return {
        binRange: bin.range,
        minMs: bin.min,
        maxMs: bin.max,
        count: matchCount,
        percent: Math.round((matchCount / (rts.length || 1)) * 100),
      };
    });

    return {
      participantCount: uniqueParticipants,
      trialCount: relevantTrials.length,
      averageReactionTimeMs: avgRt,
      medianReactionTimeMs: medianRt,
      accuracyPercent,
      fastestReactionTimeMs: fastestRt,
      slowestReactionTimeMs: slowestRt,
      stdDeviationMs: stdDev,
      stimulusBreakdown,
      trialProgression,
      rtDistribution,
    };
  }

  // --- DYNAMIC RESEARCH INSIGHTS (Computed from actual data) ---
  public getResearchInsights(experimentId?: string): ResearchInsight[] {
    const summary = this.getAnalyticsSummary(experimentId);
    const insights: ResearchInsight[] = [];

    // 1. Skewness / Mean vs Median
    // Gated on both figures existing. Previously these were compared while
    // defaulting to 0, so an empty cohort reported "Median (0 ms) is 400 ms
    // faster than mean" as a finding.
    const mean = summary.averageReactionTimeMs;
    const median = summary.medianReactionTimeMs;
    const diff = mean !== null && median !== null ? mean - median : null;
    if (diff !== null && Math.abs(diff) >= 10) {
      insights.push({
        id: "insight-skew",
        category: "latency",
        title: "Latency Distribution Asymmetry",
        message: `Median reaction time (${median} ms) is ${Math.abs(diff)} ms ${
          diff > 0 ? "faster than" : "slower than"
        } mean (${mean} ms), indicating ${diff > 0 ? "positive right-tail skew from cognitive conflict" : "left-tail skew"}.`,
        type: "neutral",
        metricImpact: `${diff > 0 ? "-" : "+"}${Math.abs(diff)} ms delta`,
      });
    }

    // 2. Stimulus Type Variability
    const textStim = summary.stimulusBreakdown.find((s) => s.type === "text");
    const colorStim = summary.stimulusBreakdown.find((s) => s.type === "color");

    if (textStim?.avgRt != null && colorStim?.avgRt != null) {
      const gap = colorStim.avgRt - textStim.avgRt;
      insights.push({
        id: "insight-stimulus-cost",
        category: "stimulus",
        title: "Chromatic Interference Cost",
        message: `Color discrimination trials produce a +${gap} ms processing latency overhead relative to pure text reading trials, confirming classic chromatic attention cost.`,
        type: gap > 40 ? "warning" : "positive",
        metricImpact: `+${gap} ms interference`,
      });
    }

    // 3. Learning & Practice Effects, comparing the first and last trial
    //    numbers actually observed. Previously this required exactly ten
    //    progression rows and read fixed indices 0, 1, 8 and 9.
    const progression = summary.trialProgression;
    if (progression.length >= 2) {
      const first = progression[0];
      const last = progression[progression.length - 1];
      if (first.avgRt !== null && last.avgRt !== null) {
        const speedup = Math.round(first.avgRt - last.avgRt);
        if (speedup > 15) {
          insights.push({
            id: "insight-learning",
            category: "learning",
            title: "Intra-Session Practice Acceleration",
            message: `Participants exhibited a ${speedup} ms latency acceleration by trial ${last.trial} compared to baseline trial ${first.trial}.`,
            type: "positive",
            metricImpact: `-${speedup} ms speedup`,
          });
        }
      }
    }

    // 4. Accuracy stability
    if (summary.accuracyPercent !== null && summary.accuracyPercent >= 90) {
      insights.push({
        id: "insight-accuracy-ceiling",
        category: "accuracy",
        title: "High Performance Threshold",
        message: `Cohort accuracy remains sustained at ${summary.accuracyPercent}%, meeting rigorous psychometric benchmark criteria.`,
        type: "positive",
        metricImpact: `${summary.accuracyPercent}% fidelity`,
      });
    }

    return insights;
  }

  // --- LEADERBOARD ENTRIES ---
  public getLeaderboard(metric: "reactionTime" | "accuracy" | "consistency" = "reactionTime"): LeaderboardEntry[] {
    this.init();
    const entries: LeaderboardEntry[] = this.participants.map((p) => {
      const pTrials = this.getAdmissibleTrials({ participantId: p.id });
      const textTrials = pTrials.filter((t) => t.stimulusType === "text");
      const colorTrials = pTrials.filter((t) => t.stimulusType === "color");
      const imageTrials = pTrials.filter((t) => t.stimulusType === "image");

      // Per-modality latency is reported only where that modality was actually
      // presented. The previous `avgRt * 0.92 / 1.05 / 1.15` multipliers
      // displayed an invented latency for every condition a participant never
      // encountered.
      const avgOf = (rows: TrialResult[]) =>
        rows.length > 0
          ? Math.round(rows.reduce((a, b) => a + b.reactionTimeMs, 0) / rows.length)
          : null;

      return {
        rank: 0,
        participantId: p.id,
        displayName: p.displayName,
        averageReactionTimeMs: p.avgReactionTimeMs,
        accuracyPercent: p.accuracyPercent,
        completedTrials: p.totalTrials,
        consistencyScore: p.consistencyScore,
        textRt: avgOf(textTrials),
        colorRt: avgOf(colorTrials),
        imageRt: avgOf(imageTrials),
        trend: p.avgReactionTimeMs < 400 ? "up" : p.avgReactionTimeMs > 450 ? "down" : "neutral",
        lastActive: p.lastActiveAt,
      };
    });

    // Sort according to metric. The mock store's participant metrics are
    // always populated (they are written at record time), so these comparators
    // stay numeric; the database implementation ranks with a window function.
    if (metric === "reactionTime") {
      entries.sort((a, b) => a.averageReactionTimeMs! - b.averageReactionTimeMs!);
    } else if (metric === "accuracy") {
      entries.sort((a, b) => b.accuracyPercent! - a.accuracyPercent!);
    } else {
      entries.sort((a, b) => b.consistencyScore! - a.consistencyScore!);
    }

    return entries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }
}

export const mockStore = new MockStorageStore();
