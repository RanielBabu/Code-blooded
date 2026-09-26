"use client";

import React, { createContext, useContext } from "react";
import { User, ParticipantLoginCredentials, ResearcherLoginCredentials } from "@/types/auth";
import { MOCK_USERS } from "./mock-users";
import { setAuthUser, useAuthHydrated, useAuthUser } from "./auth-store";
import { calculateAge, validateRoleAge } from "@/lib/demographics";
import { mockStore } from "@/lib/mock/mock-storage";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isParticipant: boolean;
  isResearcher: boolean;
  loginParticipant: (cred: ParticipantLoginCredentials) => { success: boolean; error?: string };
  loginResearcher: (cred: ResearcherLoginCredentials) => { success: boolean; error?: string };
  switchDemoUser: (userId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Read through the external store rather than copying localStorage into
  // state from an effect. See auth-store.ts for why that is the honest model:
  // it removes an extra render with `user === null`, and it picks up sign-in and
  // sign-out performed in another tab.
  const user = useAuthUser();
  const hydrated = useAuthHydrated();
  const isLoading = !hydrated;

  const saveUserSession = (newUser: User | null) => {
    setAuthUser(newUser);
  };

  const loginParticipant = (cred: ParticipantLoginCredentials): { success: boolean; error?: string } => {
    const ageResult = calculateAge(cred.dateOfBirth);
    if (!ageResult.valid) {
      return { success: false, error: ageResult.error };
    }

    const validation = validateRoleAge(ageResult.age, "participant");
    if (!validation.eligible) {
      return { success: false, error: validation.message };
    }

    // Check if matching mock participant exists, else create new
    const existing = MOCK_USERS.find(
      (u) => u.role === "participant" && u.displayName.toLowerCase() === cred.name.toLowerCase()
    );

    const participantUser: User = existing || {
      id: `part-${Date.now().toString().slice(-4)}`,
      role: "participant",
      displayName: cred.name.trim(),
      email: cred.email?.trim() || `${cred.name.trim().toLowerCase().replace(/\s+/g, ".")}@cognitivelab.local`,
      dateOfBirth: cred.dateOfBirth,
      age: ageResult.age,
      sex: cred.sex,
      ageGroup: ageResult.ageGroup,
      createdAt: new Date().toISOString(),
      permissions: ["own_profile", "own_results", "own_trials", "own_statistics"],
    };

    // Also register into mock storage participant directory
    mockStore.registerOrUpdateParticipant({
      id: participantUser.id,
      displayName: participantUser.displayName,
      dateOfBirth: participantUser.dateOfBirth,
      age: participantUser.age,
      sex: participantUser.sex,
      ageGroup: participantUser.ageGroup,
      status: "active",
      completedExperiments: 0,
      totalTrials: 0,
      avgReactionTimeMs: 0,
      accuracyPercent: 0,
      consistencyScore: 0,
      createdAt: participantUser.createdAt,
      lastActiveAt: new Date().toISOString(),
    });

    saveUserSession(participantUser);
    return { success: true };
  };

  const loginResearcher = (cred: ResearcherLoginCredentials): { success: boolean; error?: string } => {
    const ageResult = calculateAge(cred.dateOfBirth);
    if (!ageResult.valid) {
      return { success: false, error: ageResult.error };
    }

    const validation = validateRoleAge(ageResult.age, "researcher");
    if (!validation.eligible) {
      return { success: false, error: validation.message };
    }

    const instId = cred.institutionalId?.trim() || `RES-${Date.now().toString().slice(-4)}`;

    const researcherUser: User = {
      id: `res-${Date.now().toString().slice(-4)}`,
      role: "researcher",
      displayName: cred.name.trim(),
      email: cred.email?.trim() || `${cred.name.trim().toLowerCase().replace(/\s+/g, ".")}@lab.edu`,
      dateOfBirth: cred.dateOfBirth,
      age: ageResult.age,
      sex: cred.sex,
      ageGroup: ageResult.ageGroup,
      institutionalId: instId.toUpperCase(),
      createdAt: new Date().toISOString(),
      permissions: [
        "own_profile",
        "experiments",
        "participants",
        "cohort_analytics",
        "experiment_results",
        "leaderboard",
        "exports",
        "research_library",
        "age_analytics",
      ],
    };

    saveUserSession(researcherUser);
    return { success: true };
  };

  const switchDemoUser = (userId: string) => {
    const target = MOCK_USERS.find((u) => u.id === userId);
    if (target) {
      saveUserSession(target);
    }
  };

  const logout = () => {
    saveUserSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isParticipant: user?.role === "participant",
        isResearcher: user?.role === "researcher",
        loginParticipant,
        loginResearcher,
        switchDemoUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
