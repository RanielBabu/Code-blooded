import { Sex, AgeGroup } from "./auth";

export type { Sex, AgeGroup };
export type StimulusType = "text" | "color" | "image" | "mixed";

export interface Participant {
  id: string;
  displayName: string;
  dateOfBirth?: string;
  age?: number;
  sex?: Sex;
  ageGroup?: AgeGroup;
  sessionId?: string;
  status: "active" | "completed" | "abandoned";
  completedExperiments: number;
  totalTrials: number;
  avgReactionTimeMs: number;
  accuracyPercent: number;
  consistencyScore: number; // 0 - 100, lower RT variance = higher consistency
  createdAt: string;
  lastActiveAt: string;
  notes?: string;
}

export interface TrialResult {
  id: string;
  participantId: string;
  participantName?: string;
  ageGroup?: AgeGroup;
  sex?: Sex;
  experimentId: string;
  trialNumber: number;
  stimulusType: StimulusType;
  stimulus: {
    prompt?: string;
    text?: string;
    color?: string;
    imageUrl?: string;
    targetRule?: string;
    congruent?: boolean;
  };
  response: {
    selectedAnswer: string;
    inputMethod: "keyboard" | "button" | "mouse";
  };
  correct: boolean;
  reactionTimeMs: number;
  startedAt: string;
  respondedAt: string;
}

export interface AnalyticsSummary {
  participantCount: number;
  trialCount: number;
  averageReactionTimeMs: number;
  medianReactionTimeMs: number;
  accuracyPercent: number;
  fastestReactionTimeMs: number;
  slowestReactionTimeMs: number;
  stdDeviationMs: number;
  stimulusBreakdown: {
    type: StimulusType;
    avgRt: number;
    accuracy: number;
    count: number;
  }[];
  trialProgression: {
    trial: number;
    avgRt: number;
    accuracy: number;
    textRt?: number;
    colorRt?: number;
    imageRt?: number;
  }[];
  rtDistribution: {
    binRange: string;
    minMs: number;
    maxMs: number;
    count: number;
    percent: number;
  }[];
}

export interface AgeGroupMetric {
  ageGroup: AgeGroup;
  participantCount: number;
  trialCount: number;
  avgRt: number;
  medianRt: number;
  minRt: number;
  maxRt: number;
  q1Rt: number; // 25th percentile
  q3Rt: number; // 75th percentile
  accuracy: number;
  consistency: number;
  stimulusAvgRt: {
    text: number;
    color: number;
    image: number;
    mixed: number;
  };
  insufficientData?: boolean;
}

export interface AgeScatterPoint {
  age: number;
  reactionTimeMs: number;
  accuracy: number;
  stimulusType: StimulusType;
  participantId: string; // anonymized e.g. "P-004"
  ageGroup: AgeGroup;
}

export interface AgeAnalyticsData {
  metricsByGroup: AgeGroupMetric[];
  scatterPoints: AgeScatterPoint[];
  totalCohortParticipants: number;
  totalCohortTrials: number;
  ageSpan: string;
  insights: string[];
}

export interface ParticipantPersonalSummary {
  participant: Participant;
  experimentsCompleted: number;
  totalTrials: number;
  avgReactionTimeMs: number;
  medianReactionTimeMs: number;
  fastestReactionTimeMs: number;
  slowestReactionTimeMs: number;
  accuracyPercent: number;
  consistencyScore: number;
  trials: TrialResult[];
  personalBests: {
    fastestRt: { value: number; taskName: string; date: string };
    bestAccuracy: { value: number; taskName: string; date: string };
    mostConsistent: { value: number; taskName: string; date: string };
    mostTrials: { value: number; taskName: string; date: string };
    bestColorRt: { value: number; taskName: string; date: string };
    bestImageRt: { value: number; taskName: string; date: string };
    bestTextRt: { value: number; taskName: string; date: string };
  };
}

export interface LeaderboardEntry {
  rank: number;
  participantId: string;
  displayName: string;
  ageGroup?: AgeGroup;
  averageReactionTimeMs: number;
  accuracyPercent: number;
  completedTrials: number;
  consistencyScore: number;
  textRt: number;
  colorRt: number;
  imageRt: number;
  trend: "up" | "down" | "neutral";
  lastActive: string;
}

export interface ResearchInsight {
  id: string;
  category: "latency" | "accuracy" | "stimulus" | "learning";
  title: string;
  message: string;
  type: "positive" | "neutral" | "warning";
  metricImpact?: string;
}
