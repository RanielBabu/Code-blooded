import { User } from "@/types/auth";

/**
 * Centralized authorization & permission helpers.
 * Frontend role-guards prevent unauthorized navigation and data leakage.
 * The production backend must independently enforce these permissions.
 */

export function canViewParticipantDirectory(user?: User | null): boolean {
  if (!user) return false;
  return user.role === "researcher" && user.permissions.includes("participants");
}

export function canViewParticipantData(
  user: User | null | undefined,
  targetParticipantId: string
): boolean {
  if (!user) return false;
  // Researchers can view participant research records
  if (user.role === "researcher") {
    return user.permissions.includes("participants") || user.permissions.includes("cohort_analytics");
  }
  // Participants can ONLY view their own records
  if (user.role === "participant") {
    return user.id === targetParticipantId;
  }
  return false;
}

export function canViewResearchAnalytics(user?: User | null): boolean {
  if (!user) return false;
  return user.role === "researcher" && user.permissions.includes("cohort_analytics");
}

export function canViewAgeAnalytics(user?: User | null): boolean {
  if (!user) return false;
  return user.role === "researcher" && user.permissions.includes("age_analytics");
}

export function canExportResearchData(user?: User | null): boolean {
  if (!user) return false;
  return user.role === "researcher" && user.permissions.includes("exports");
}

export function canManageExperiments(user?: User | null): boolean {
  if (!user) return false;
  return user.role === "researcher" && user.permissions.includes("experiments");
}

export function canViewLeaderboard(user?: User | null): boolean {
  if (!user) return false;
  return user.role === "researcher" && user.permissions.includes("leaderboard");
}
