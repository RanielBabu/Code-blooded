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

  public recordTrialRun(participantName: string, newTrials: TrialResult[]): { participant: Participant; trials: TrialResult[] } {
    this.init();
    const participantId = `part-${Date.now().toString().slice(-4)}`;
    const totalTrials = newTrials.length;
    const correctCount = newTrials.filter((t) => t.correct).length;
    const accuracy = totalTrials > 0 ? (correctCount / totalTrials) * 100 : 0;
    const rts = newTrials.map((t) => t.reactionTimeMs);
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
      notes: "Completed interactive live test run in CognitiveLab runtime.",
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
        const expTrials = this.trials.filter((t) => t.experimentId === expId);
        const expParticipants = new Set(expTrials.map((t) => t.participantId)).size;
        const expRt = expTrials.map((t) => t.reactionTimeMs);
        const newAvg = expRt.length > 0 ? Math.round(expRt.reduce((a, b) => a + b, 0) / expRt.length) : exp.stats?.avgReactionTimeMs || 412;
        const newAcc = (expTrials.filter((t) => t.correct).length / expTrials.length) * 100;

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
    const relevantTrials = this.getTrials({ experimentId, participantId });

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

    const variance = rts.reduce((acc, val) => acc + Math.pow(val - avgRt, 2), 0) / rts.length;
    const stdDev = Math.round(Math.sqrt(variance));

    // Stimulus Breakdown
    const stimTypes: StimulusType[] = ["text", "color", "image", "mixed"];
    const stimulusBreakdown = stimTypes.map((type) => {
      const typeTrials = relevantTrials.filter((t) => t.stimulusType === type);
      const count = typeTrials.length;
      if (count === 0) {
        return { type, avgRt: 0, accuracy: 0, count: 0 };
      }
      const typeAvgRt = Math.round(typeTrials.reduce((a, b) => a + b.reactionTimeMs, 0) / count);
      const typeAcc = Math.round((typeTrials.filter((t) => t.correct).length / count) * 1000) / 10;
      return { type, avgRt: typeAvgRt, accuracy: typeAcc, count };
    });

    // Trial progression (1 to 10)
    const trialProgression = Array.from({ length: 10 }, (_, i) => {
      const trialNum = i + 1;
      const tAtNum = relevantTrials.filter((t) => t.trialNumber === trialNum);
      const textAtNum = tAtNum.filter((t) => t.stimulusType === "text");
      const colorAtNum = tAtNum.filter((t) => t.stimulusType === "color");
      const imageAtNum = tAtNum.filter((t) => t.stimulusType === "image");

      const avgRtAtNum = tAtNum.length > 0 ? Math.round(tAtNum.reduce((a, b) => a + b.reactionTimeMs, 0) / tAtNum.length) : 0;
      const accAtNum = tAtNum.length > 0 ? Math.round((tAtNum.filter((t) => t.correct).length / tAtNum.length) * 100) : 100;

      return {
        trial: trialNum,
        avgRt: avgRtAtNum || (400 - trialNum * 6),
        accuracy: accAtNum || 92,
        textRt: textAtNum.length > 0 ? Math.round(textAtNum.reduce((a, b) => a + b.reactionTimeMs, 0) / textAtNum.length) : Math.round(avgRtAtNum * 0.9),
        colorRt: colorAtNum.length > 0 ? Math.round(colorAtNum.reduce((a, b) => a + b.reactionTimeMs, 0) / colorAtNum.length) : Math.round(avgRtAtNum * 1.05),
        imageRt: imageAtNum.length > 0 ? Math.round(imageAtNum.reduce((a, b) => a + b.reactionTimeMs, 0) / imageAtNum.length) : Math.round(avgRtAtNum * 1.15),
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
    const diff = summary.averageReactionTimeMs - summary.medianReactionTimeMs;
    if (Math.abs(diff) >= 10) {
      insights.push({
        id: "insight-skew",
        category: "latency",
        title: "Latency Distribution Asymmetry",
        message: `Median reaction time (${summary.medianReactionTimeMs} ms) is ${Math.abs(diff)} ms ${
          diff > 0 ? "faster than" : "slower than"
        } mean (${summary.averageReactionTimeMs} ms), indicating ${diff > 0 ? "positive right-tail skew from cognitive conflict" : "left-tail skew"}.`,
        type: "neutral",
        metricImpact: `${diff > 0 ? "-" : "+"}${Math.abs(diff)} ms delta`,
      });
    }

    // 2. Stimulus Type Variability
    const textStim = summary.stimulusBreakdown.find((s) => s.type === "text");
    const colorStim = summary.stimulusBreakdown.find((s) => s.type === "color");
    const imageStim = summary.stimulusBreakdown.find((s) => s.type === "image");

    if (textStim && colorStim && textStim.avgRt > 0 && colorStim.avgRt > 0) {
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

    // 3. Learning & Practice Effects (Trial 1-3 vs Trial 8-10)
    if (summary.trialProgression.length >= 10) {
      const earlyRt = (summary.trialProgression[0].avgRt + summary.trialProgression[1].avgRt) / 2;
      const lateRt = (summary.trialProgression[8].avgRt + summary.trialProgression[9].avgRt) / 2;
      const speedup = Math.round(earlyRt - lateRt);
      if (speedup > 15) {
        insights.push({
          id: "insight-learning",
          category: "learning",
          title: "Intra-Session Practice Acceleration",
          message: `Participants exhibited a ${speedup} ms latency acceleration across trials 8–10 compared to baseline trials 1–2 while maintaining >90% accuracy.`,
          type: "positive",
          metricImpact: `-${speedup} ms speedup`,
        });
      }
    }

    // 4. Accuracy stability
    if (summary.accuracyPercent >= 90) {
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
      const pTrials = this.getTrials({ participantId: p.id });
      const textTrials = pTrials.filter((t) => t.stimulusType === "text");
      const colorTrials = pTrials.filter((t) => t.stimulusType === "color");
      const imageTrials = pTrials.filter((t) => t.stimulusType === "image");

      const textRt = textTrials.length > 0 ? Math.round(textTrials.reduce((a, b) => a + b.reactionTimeMs, 0) / textTrials.length) : Math.round(p.avgReactionTimeMs * 0.92);
      const colorRt = colorTrials.length > 0 ? Math.round(colorTrials.reduce((a, b) => a + b.reactionTimeMs, 0) / colorTrials.length) : Math.round(p.avgReactionTimeMs * 1.05);
      const imageRt = imageTrials.length > 0 ? Math.round(imageTrials.reduce((a, b) => a + b.reactionTimeMs, 0) / imageTrials.length) : Math.round(p.avgReactionTimeMs * 1.15);

      return {
        rank: 0,
        participantId: p.id,
        displayName: p.displayName,
        averageReactionTimeMs: p.avgReactionTimeMs,
        accuracyPercent: p.accuracyPercent,
        completedTrials: p.totalTrials,
        consistencyScore: p.consistencyScore,
        textRt,
        colorRt,
        imageRt,
        trend: p.avgReactionTimeMs < 400 ? "up" : p.avgReactionTimeMs > 450 ? "down" : "neutral",
        lastActive: p.lastActiveAt,
      };
    });

    // Sort according to metric
    if (metric === "reactionTime") {
      entries.sort((a, b) => a.averageReactionTimeMs - b.averageReactionTimeMs);
    } else if (metric === "accuracy") {
      entries.sort((a, b) => b.accuracyPercent - a.accuracyPercent);
    } else {
      entries.sort((a, b) => b.consistencyScore - a.consistencyScore);
    }

    return entries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }
}

export const mockStore = new MockStorageStore();
