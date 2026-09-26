export type Role = "participant" | "researcher";

export type Sex = "female" | "male" | "intersex" | "prefer_not_to_say";

export type AgeGroup = "15–17" | "18–24" | "25–34" | "35–44" | "45–54" | "55+";

export type Permission =
  | "own_profile"
  | "own_results"
  | "own_trials"
  | "own_statistics"
  | "experiments"
  | "participants"
  | "cohort_analytics"
  | "experiment_results"
  | "leaderboard"
  | "exports"
  | "research_library"
  | "age_analytics";

export interface User {
  id: string;
  role: Role;
  displayName: string;
  email?: string;
  dateOfBirth?: string;
  age?: number;
  sex?: Sex;
  ageGroup?: AgeGroup;
  institutionalId?: string; // For researchers
  createdAt: string;
  permissions: Permission[];
}

export interface ParticipantLoginCredentials {
  name: string;
  email: string;
  dateOfBirth: string;
  sex: Sex;
}

export interface ResearcherLoginCredentials {
  name: string;
  email: string;
  dateOfBirth: string;
  sex: Sex;
  institutionalId?: string;
}

export interface AgeValidationResult {
  valid: boolean;
  age: number;
  ageGroup?: AgeGroup;
  error?: string;
}
