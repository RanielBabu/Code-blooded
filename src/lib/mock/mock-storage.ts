import { Experiment } from "@/types/experiment";
import {
  Participant,
  TrialResult,
  AnalyticsSummary,
  LeaderboardEntry,
  ResearchInsight,
  StimulusType,
  AgeAnalyticsData,
  AgeGroupMetric,
  AgeScatterPoint,
  ParticipantPersonalSummary,
} from "@/types/participant";
import { AgeGroup } from "@/types/auth";
import { AGE_GROUPS, MIN_ANALYTICS_GROUP_SIZE, getAgeGroup } from "@/lib/demographics";
import { MOCK_EXPERIMENTS } from "./mock-experiments";
import { MOCK_PARTICIPANTS } from "./mock-participants";
import { MOCK_TRIALS } from "./mock-trials";

const STORAGE_KEYS = {
  EXPERIMENTS: "cognitivelab_experiments_v3",
  PARTICIPANTS: "cognitivelab_participants_v3",
  TRIALS: "cognitivelab_trials_v3",
  SETTINGS: "cognitivelab_settings_v3",
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

  public updateExperimentStatus(
    id: string,
    status: "draft" | "published" | "disabled" | "archived"
  ): Experiment | null {
    this.init();
    const exp = this.getExperimentById(id);
    if (!exp) return null;
    exp.status = status;
    exp.updatedAt = new Date().toISOString();
    this.persist();
    return exp;
  }

  public getPublishedExperiments(): Experiment[] {
    this.init();
    return this.experiments.filter((e) => e.status === "published");
  }

  public isExperimentPlayable(id: string): boolean {
    this.init();
    const exp = this.getExperimentById(id);
    return Boolean(exp && exp.status === "published");
  }

  public togglePublishExperiment(id: string, publish?: boolean): Experiment | null {
    this.init();
    const exp = this.getExperimentById(id);
    if (!exp) return null;
    const nextStatus = publish !== undefined
      ? (publish ? "published" : "disabled")
      : (exp.status === "published" ? "disabled" : "published");
    exp.status = nextStatus;
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

  public registerOrUpdateParticipant(participant: Participant): Participant {
    this.init();
    const idx = this.participants.findIndex((p) => p.id === participant.id);
    if (idx >= 0) {
      this.participants[idx] = { ...this.participants[idx], ...participant };
    } else {
      this.participants.unshift(participant);
    }
    this.persist();
    return participant;
  }

  // --- TRIALS & RUNTIME RECORDING ---
  public getTrials(filter?: {
    experimentId?: string;
    participantId?: string;
    stimulusType?: string;
    ageGroup?: string;
    sex?: string;
  }): TrialResult[] {
    this.init();
    return this.trials.filter((t) => {
      if (filter?.experimentId && t.experimentId !== filter.experimentId) return false;
      if (filter?.participantId && t.participantId !== filter.participantId) return false;
      if (filter?.stimulusType && filter.stimulusType !== "all" && t.stimulusType !== filter.stimulusType) return false;
      if (filter?.ageGroup && filter.ageGroup !== "all" && t.ageGroup !== filter.ageGroup) return false;
      if (filter?.sex && filter.sex !== "all" && t.sex !== filter.sex) return false;
      return true;
    });
  }

  public recordTrialRun(
    participantName: string,
    newTrials: TrialResult[],
    activeParticipantId?: string
  ): { participant: Participant; trials: TrialResult[] } {
    this.init();

    // Use active logged in participant ID if provided, otherwise check or create
    let participant = activeParticipantId ? this.getParticipantById(activeParticipantId) : undefined;
    const participantId = participant?.id || activeParticipantId || `part-${Date.now().toString().slice(-4)}`;

    const totalTrials = newTrials.length;
    const correctCount = newTrials.filter((t) => t.correct).length;
    const accuracy = totalTrials > 0 ? (correctCount / totalTrials) * 100 : 0;
    const rts = newTrials.map((t) => t.reactionTimeMs);
    const avgRt = rts.length > 0 ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : 0;

    // Variance & consistency score (0 - 100)
    const variance = rts.length > 1 ? rts.reduce((acc, val) => acc + Math.pow(val - avgRt, 2), 0) / (rts.length - 1) : 0;
    const stdDev = Math.sqrt(variance);
    const consistencyScore = Math.max(40, Math.min(99, Math.round(100 - stdDev / 3)));

    if (participant) {
      participant.completedExperiments = (participant.completedExperiments || 0) + 1;
      participant.totalTrials = (participant.totalTrials || 0) + totalTrials;
      participant.avgReactionTimeMs = Math.round((participant.avgReactionTimeMs + avgRt) / 2);
      participant.accuracyPercent = Math.round(((participant.accuracyPercent + accuracy) / 2) * 10) / 10;
      participant.consistencyScore = Math.round((participant.consistencyScore + consistencyScore) / 2);
      participant.lastActiveAt = new Date().toISOString();
      participant.status = "completed";
    } else {
      participant = {
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
      this.participants.unshift(participant);
    }

    const assignedTrials = newTrials.map((t, idx) => ({
      ...t,
      id: `trial-${participantId}-${Date.now().toString().slice(-4)}-${idx + 1}`,
      participantId,
      participantName: participant!.displayName,
      ageGroup: participant!.ageGroup,
      sex: participant!.sex,
    }));

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
    return { participant, trials: assignedTrials };
  }

  // --- PARTICIPANT PERSONAL SUMMARY ---
  public getParticipantPersonalSummary(participantId: string): ParticipantPersonalSummary | null {
    this.init();
    const participant = this.getParticipantById(participantId);
    if (!participant) return null;

    const pTrials = this.getTrials({ participantId });
    const rts = pTrials.map((t) => t.reactionTimeMs).sort((a, b) => a - b);
    const avgRt = rts.length > 0 ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : participant.avgReactionTimeMs || 360;
    const mid = Math.floor(rts.length / 2);
    const medianRt = rts.length % 2 === 0 && rts.length > 0 ? Math.round((rts[mid - 1] + rts[mid]) / 2) : rts[mid] || avgRt;
    const fastestRt = rts.length > 0 ? rts[0] : 310;
    const slowestRt = rts.length > 0 ? rts[rts.length - 1] : 490;

    const colorTrials = pTrials.filter((t) => t.stimulusType === "color" || t.stimulusType === "mixed");
    const imageTrials = pTrials.filter((t) => t.stimulusType === "image");
    const textTrials = pTrials.filter((t) => t.stimulusType === "text");

    const bestColor = colorTrials.length > 0 ? Math.min(...colorTrials.map((t) => t.reactionTimeMs)) : Math.round(fastestRt * 1.05);
    const bestImage = imageTrials.length > 0 ? Math.min(...imageTrials.map((t) => t.reactionTimeMs)) : Math.round(fastestRt * 1.1);
    const bestText = textTrials.length > 0 ? Math.min(...textTrials.map((t) => t.reactionTimeMs)) : fastestRt;

    return {
      participant,
      experimentsCompleted: participant.completedExperiments || 1,
      totalTrials: pTrials.length || participant.totalTrials || 10,
      avgReactionTimeMs: avgRt,
      medianReactionTimeMs: medianRt,
      fastestReactionTimeMs: fastestRt,
      slowestReactionTimeMs: slowestRt,
      accuracyPercent: participant.accuracyPercent || 96,
      consistencyScore: participant.consistencyScore || 90,
      trials: pTrials,
      personalBests: {
        fastestRt: { value: fastestRt, taskName: "Color Response Study", date: participant.lastActiveAt },
        bestAccuracy: { value: Math.max(participant.accuracyPercent || 95, 96.5), taskName: "Lexical & Color Discrimination", date: participant.lastActiveAt },
        mostConsistent: { value: Math.max(participant.consistencyScore || 88, 92), taskName: "Session Run #3", date: participant.lastActiveAt },
        mostTrials: { value: participant.totalTrials || 10, taskName: "Color Response Study", date: participant.lastActiveAt },
        bestColorRt: { value: bestColor, taskName: "Color Discrimination", date: participant.lastActiveAt },
        bestImageRt: { value: bestImage, taskName: "Visual Shape Match", date: participant.lastActiveAt },
        bestTextRt: { value: bestText, taskName: "Lexical Decision", date: participant.lastActiveAt },
      },
    };
  }

  // --- AGE & DEMOGRAPHIC COHORT ANALYTICS ---
  public getAgeAnalytics(filters?: {
    experimentId?: string;
    sex?: string;
    stimulusType?: string;
    ageGroup?: string;
  }): AgeAnalyticsData {
    this.init();

    // Filter participants
    let matchedParticipants = [...this.participants];
    if (filters?.sex && filters.sex !== "all") {
      matchedParticipants = matchedParticipants.filter((p) => p.sex === filters.sex);
    }
    if (filters?.ageGroup && filters.ageGroup !== "all") {
      matchedParticipants = matchedParticipants.filter((p) => p.ageGroup === filters.ageGroup);
    }

    const matchedParticipantIds = new Set(matchedParticipants.map((p) => p.id));
    const relevantTrials = this.trials.filter((t) => {
      if (!matchedParticipantIds.has(t.participantId)) return false;
      if (filters?.experimentId && t.experimentId !== filters.experimentId) return false;
      if (filters?.stimulusType && filters.stimulusType !== "all" && t.stimulusType !== filters.stimulusType) return false;
      return true;
    });

    // Compute metrics for each age group
    const metricsByGroup: AgeGroupMetric[] = AGE_GROUPS.map((group) => {
      const groupParticipants = matchedParticipants.filter((p) => p.ageGroup === group);
      const groupTrials = relevantTrials.filter((t) => t.ageGroup === group);
      const participantCount = groupParticipants.length;
      const trialCount = groupTrials.length;

      // Small-sample privacy threshold check
      const insufficientData = participantCount < MIN_ANALYTICS_GROUP_SIZE;

      if (trialCount === 0 || insufficientData) {
        return {
          ageGroup: group,
          participantCount,
          trialCount,
          avgRt: 0,
          medianRt: 0,
          minRt: 0,
          maxRt: 0,
          q1Rt: 0,
          q3Rt: 0,
          accuracy: 0,
          consistency: 0,
          stimulusAvgRt: { text: 0, color: 0, image: 0, mixed: 0 },
          insufficientData,
        };
      }

      const rts = groupTrials.map((t) => t.reactionTimeMs).sort((a, b) => a - b);
      const avgRt = Math.round(rts.reduce((a, b) => a + b, 0) / rts.length);
      const mid = Math.floor(rts.length / 2);
      const medianRt = rts.length % 2 === 0 ? Math.round((rts[mid - 1] + rts[mid]) / 2) : rts[mid];
      const minRt = rts[0];
      const maxRt = rts[rts.length - 1];

      // Quartiles for box plot distribution
      const q1Index = Math.floor(rts.length * 0.25);
      const q3Index = Math.floor(rts.length * 0.75);
      const q1Rt = rts[q1Index];
      const q3Rt = rts[q3Index];

      const correctCount = groupTrials.filter((t) => t.correct).length;
      const accuracy = Math.round((correctCount / trialCount) * 1000) / 10;
      const avgConsistency = Math.round(
        groupParticipants.reduce((acc, p) => acc + (p.consistencyScore || 80), 0) / participantCount
      );

      // Stimulus modality breakdown
      const calcStimRt = (type: StimulusType) => {
        const stimTrials = groupTrials.filter((t) => t.stimulusType === type);
        return stimTrials.length > 0
          ? Math.round(stimTrials.reduce((a, b) => a + b.reactionTimeMs, 0) / stimTrials.length)
          : avgRt;
      };

      return {
        ageGroup: group,
        participantCount,
        trialCount,
        avgRt,
        medianRt,
        minRt,
        maxRt,
        q1Rt,
        q3Rt,
        accuracy,
        consistency: avgConsistency,
        stimulusAvgRt: {
          text: calcStimRt("text"),
          color: calcStimRt("color"),
          image: calcStimRt("image"),
          mixed: calcStimRt("mixed"),
        },
        insufficientData: false,
      };
    });

    // Generate scatter data points (Age on X, Reaction Time on Y)
    const scatterPoints: AgeScatterPoint[] = [];
    matchedParticipants.forEach((p) => {
      const pTrials = relevantTrials.filter((t) => t.participantId === p.id);
      pTrials.forEach((t) => {
        if (p.age) {
          scatterPoints.push({
            age: p.age,
            reactionTimeMs: t.reactionTimeMs,
            accuracy: t.correct ? 100 : 0,
            stimulusType: t.stimulusType,
            participantId: `P-${p.id.replace("part-", "")}`,
            ageGroup: p.ageGroup || getAgeGroup(p.age),
          });
        }
      });
    });

    // Generate scientific observational insights dynamically from current filtered data
    const insights: string[] = [];
    const validGroups = metricsByGroup.filter((g) => !g.insufficientData && g.trialCount > 0);

    if (validGroups.length >= 2) {
      const fastestGroup = [...validGroups].sort((a, b) => a.medianRt - b.medianRt)[0];
      const slowestGroup = [...validGroups].sort((a, b) => b.medianRt - a.medianRt)[0];
      const delta = slowestGroup.medianRt - fastestGroup.medianRt;

      insights.push(
        `Observed median reaction time is ${delta} ms higher in the ${slowestGroup.ageGroup} group than in the ${fastestGroup.ageGroup} cohort in this demo dataset.`
      );

      // Compare stimulus types across all cohorts
      const totalTextTrials = relevantTrials.filter((t) => t.stimulusType === "text");
      const totalImageTrials = relevantTrials.filter((t) => t.stimulusType === "image");
      if (totalTextTrials.length > 0 && totalImageTrials.length > 0) {
        const avgText = Math.round(totalTextTrials.reduce((a, b) => a + b.reactionTimeMs, 0) / totalTextTrials.length);
        const avgImage = Math.round(totalImageTrials.reduce((a, b) => a + b.reactionTimeMs, 0) / totalImageTrials.length);
        const stimDelta = Math.abs(avgImage - avgText);
        insights.push(
          `Image recognition trials show an observed ${stimDelta} ms higher latency compared to lexical text trials across recorded cohorts.`
        );
      }

      // Accuracy stability observation
      const highAccGroup = [...validGroups].sort((a, b) => b.accuracy - a.accuracy)[0];
      insights.push(
        `Accuracy remains consistently above 90% across age cohorts, with the ${highAccGroup.ageGroup} cohort exhibiting ${highAccGroup.accuracy}% accuracy.`
      );
    } else {
      insights.push("Select a broader cohort filter to view multi-group comparative observations.");
    }

    return {
      metricsByGroup,
      scatterPoints,
      totalCohortParticipants: matchedParticipants.length,
      totalCohortTrials: relevantTrials.length,
      ageSpan: "15–67 years",
      insights,
    };
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

    // RT Distribution Bins
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
        } mean (${summary.averageReactionTimeMs} ms), indicating positive right-tail skew typical in cognitive reaction tasks.`,
        type: "neutral",
        metricImpact: `${Math.abs(diff)} ms delta`,
      });
    }

    // 2. Stimulus type comparison
    const textStim = summary.stimulusBreakdown.find((s) => s.type === "text");
    const mixedStim = summary.stimulusBreakdown.find((s) => s.type === "mixed");
    if (textStim && mixedStim && textStim.count > 0 && mixedStim.count > 0) {
      const interferenceCost = mixedStim.avgRt - textStim.avgRt;
      insights.push({
        id: "insight-interference",
        category: "stimulus",
        title: "Incongruency Interference Cost",
        message: `High-conflict incongruent trials induced an observed latency increase of +${interferenceCost} ms relative to baseline congruent text presentations.`,
        type: "warning",
        metricImpact: `+${interferenceCost} ms latency`,
      });
    }

    // 3. Learning curve / trial progression
    const firstTrial = summary.trialProgression[0];
    const tenthTrial = summary.trialProgression[9];
    if (firstTrial && tenthTrial && firstTrial.avgRt > 0 && tenthTrial.avgRt > 0) {
      const practiceGain = firstTrial.avgRt - tenthTrial.avgRt;
      if (practiceGain > 0) {
        insights.push({
          id: "insight-practice",
          category: "learning",
          title: "Practice & Motor Adaptation",
          message: `Mean response latency decreased by ${practiceGain} ms between Trial 1 and Trial 10, demonstrating rapid motor adaptation.`,
          type: "positive",
          metricImpact: `-${practiceGain} ms faster`,
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
        ageGroup: p.ageGroup,
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
