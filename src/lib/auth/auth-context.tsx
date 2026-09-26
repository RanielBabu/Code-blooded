"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, ParticipantLoginCredentials, ResearcherLoginCredentials, Role } from "@/types/auth";
import { MOCK_USERS, DEFAULT_USER } from "./mock-users";
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

const AUTH_STORAGE_KEY = "cognitivelab_auth_user_v2";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from local storage or default user
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Default to Researcher Alpha for immediate exploration
        setUser(DEFAULT_USER);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEFAULT_USER));
      }
    } catch {
      setUser(DEFAULT_USER);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveUserSession = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
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
