export type StimulusType = "text" | "color" | "image" | "mixed";

export interface Participant {
  id: string;
  displayName: string;
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

export interface LeaderboardEntry {
  rank: number;
  participantId: string;
  displayName: string;
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
