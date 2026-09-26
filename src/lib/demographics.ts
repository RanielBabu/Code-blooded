import { AgeGroup, AgeValidationResult } from "@/types/auth";

export const AGE_GROUPS: AgeGroup[] = [
  "15–17",
  "18–24",
  "25–34",
  "35–44",
  "45–54",
  "55+",
];

export const MIN_ANALYTICS_GROUP_SIZE = 5;
export const PARTICIPANT_MIN_AGE = 15;
export const RESEARCHER_MIN_AGE = 18;

/**
 * Accurately calculates age from date of birth using the current calendar date.
 * Handles month/day comparisons, leap years, timezone offsets, and edge cases.
 */
export function calculateAge(dobInput: string | Date | undefined | null): AgeValidationResult {
  if (!dobInput) {
    return { valid: false, age: 0, error: "Date of birth is required." };
  }

  let dobDate: Date;
  if (typeof dobInput === "string") {
    // Expected format: YYYY-MM-DD or standard ISO
    const parts = dobInput.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      dobDate = new Date(year, month, day);
    } else {
      dobDate = new Date(dobInput);
    }
  } else {
    dobDate = dobInput;
  }

  if (isNaN(dobDate.getTime())) {
    return { valid: false, age: 0, error: "Enter a valid date of birth." };
  }

  const today = new Date();
  // Strip time components for precise calendar date comparison
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDate = today.getDate();

  const birthYear = dobDate.getFullYear();
  const birthMonth = dobDate.getMonth();
  const birthDate = dobDate.getDate();

  // Future DOB check
  if (dobDate > today) {
    return { valid: false, age: 0, error: "Date of birth cannot be in the future." };
  }

  // Pre-1900 sanity check
  if (birthYear < 1900) {
    return { valid: false, age: 0, error: "Please enter a realistic date of birth." };
  }

  let age = currentYear - birthYear;
  const monthDiff = currentMonth - birthMonth;

  // Birthday has not occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && currentDate < birthDate)) {
    age--;
  }

  if (age < 0) {
    return { valid: false, age: 0, error: "Date of birth cannot be in the future." };
  }

  const ageGroup = getAgeGroup(age);

  return {
    valid: true,
    age,
    ageGroup,
  };
}

/**
 * Maps a numerical age to a standardized research AgeGroup
 */
export function getAgeGroup(age: number): AgeGroup {
  if (age <= 17) return "15–17";
  if (age <= 24) return "18–24";
  if (age <= 34) return "25–34";
  if (age <= 44) return "35–44";
  if (age <= 54) return "45–54";
  return "55+";
}

/**
 * Validates eligibility for a given role based on calculated age
 */
export function validateRoleAge(
  age: number,
  role: "participant" | "researcher"
): { eligible: boolean; message?: string } {
  if (role === "participant") {
    if (age < PARTICIPANT_MIN_AGE) {
      return {
        eligible: false,
        message: "CognitiveLab participation is currently available only to participants aged 15 and above.",
      };
    }
    return { eligible: true };
  }

  if (role === "researcher") {
    if (age < RESEARCHER_MIN_AGE) {
      return {
        eligible: false,
        message: "Researcher accounts require the user to be at least 18 years old.",
      };
    }
    return { eligible: true };
  }

  return { eligible: true };
}
