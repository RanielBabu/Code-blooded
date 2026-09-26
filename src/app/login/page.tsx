"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { NeuralCanvas } from "@/components/visualizations/NeuralCanvas";
import {
  User,
  FlaskConical,
  ArrowRight,
  Calendar,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Shield,
  Lock,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { Sex, Role } from "@/types/auth";
import { calculateAge, validateRoleAge } from "@/lib/demographics";
import { MOCK_USERS } from "@/lib/auth/mock-users";

export default function LoginPage() {
  const router = useRouter();
  const { loginParticipant, loginResearcher, switchDemoUser } = useAuth();

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState<Sex>("female");
  const [institutionalId, setInstitutionalId] = useState("INST-RES-2026");

  // Error & validation states
  const [validationError, setValidationError] = useState<string | null>(null);
  const [ageBlockedNotice, setAgeBlockedNotice] = useState<{
    title: string;
    message: string;
    calculatedAge: number;
  } | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle Participant Submission
  const handleParticipantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setAgeBlockedNotice(null);

    if (!name.trim()) {
      setValidationError("Please enter your name or pseudonym.");
      return;
    }

    if (!dob) {
      setValidationError("Please enter your date of birth.");
      return;
    }

    const ageRes = calculateAge(dob);
    if (!ageRes.valid) {
      setValidationError(ageRes.error || "Please enter a valid date of birth.");
      return;
    }

    const check = validateRoleAge(ageRes.age, "participant");
    if (!check.eligible) {
      setAgeBlockedNotice({
        title: "Age Requirement",
        message: check.message || "CognitiveLab participation is currently available only to participants aged 15 and above.",
        calculatedAge: ageRes.age,
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = loginParticipant({
        name: name.trim(),
        dateOfBirth: dob,
        sex,
      });

      setIsLoading(false);
      if (res.success) {
        router.push("/participant/dashboard");
      } else {
        setValidationError(res.error || "Login failed");
      }
    }, 400);
  };

  // Handle Researcher Submission
  const handleResearcherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setAgeBlockedNotice(null);

    if (!name.trim()) {
      setValidationError("Please enter your researcher name.");
      return;
    }

    if (!dob) {
      setValidationError("Please enter your date of birth.");
      return;
    }

    if (!institutionalId.trim()) {
      setValidationError("Enter your researcher or institutional ID.");
      return;
    }

    const ageRes = calculateAge(dob);
    if (!ageRes.valid) {
      setValidationError(ageRes.error || "Please enter a valid date of birth.");
      return;
    }

    const check = validateRoleAge(ageRes.age, "researcher");
    if (!check.eligible) {
      setAgeBlockedNotice({
        title: "Researcher Account Requirement",
        message: check.message || "Researcher accounts require the user to be at least 18 years old.",
        calculatedAge: ageRes.age,
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = loginResearcher({
        name: name.trim(),
        dateOfBirth: dob,
        sex,
        institutionalId: institutionalId.trim(),
      });

      setIsLoading(false);
      if (res.success) {
        router.push("/dashboard");
      } else {
        setValidationError(res.error || "Login failed");
      }
    }, 400);
  };

  // Fast demo presets
  const handleQuickDemo = (userId: string) => {
    switchDemoUser(userId);
    const target = MOCK_USERS.find((u) => u.id === userId);
    if (target?.role === "participant") {
      router.push("/participant/dashboard");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#05060A] text-white flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background Neural Matrix */}
      <NeuralCanvas className="opacity-35" />

      {/* Radial Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#4F8CFF]/15 via-[#8B5CF6]/10 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Logo size="lg" className="justify-center" />
          <p className="text-xs text-[#A5ADBD] pt-1 font-mono tracking-wide">
            Cognitive & Behavioral Telemetry Platform
          </p>
        </div>

        {/* --- AGE BLOCKED NOTICE MODAL --- */}
        {ageBlockedNotice && (
          <GlassPanel elevated className="p-6 sm:p-8 space-y-4 border-[#EF4444]/40 bg-[#0F0B10]/95 shadow-[0_0_40px_rgba(239,68,68,0.2)] animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(239,68,68,0.3)]">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-lg font-bold text-white tracking-tight">{ageBlockedNotice.title}</h2>
              <p className="text-xs text-[#A5ADBD] leading-relaxed max-w-sm mx-auto">
                {ageBlockedNotice.message}
              </p>
              <div className="pt-2">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-[#697386]">
                  Calculated age: <strong className="text-white">{ageBlockedNotice.calculatedAge} years</strong>
                </span>
              </div>
            </div>

            <div className="pt-3 flex gap-2">
              <Button
                variant="secondary"
                size="md"
                className="w-full"
                onClick={() => {
                  setAgeBlockedNotice(null);
                  setValidationError(null);
                }}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Return to Login
              </Button>
            </div>
          </GlassPanel>
        )}

        {/* --- MAIN AUTH CONTAINER --- */}
        {!ageBlockedNotice && (
          <GlassPanel elevated className="p-6 sm:p-8 space-y-6 border-white/15 shadow-2xl backdrop-blur-xl">
            {/* Step 1: Role Selection Cards */}
            {!selectedRole ? (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="text-center space-y-1">
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    How are you using CognitiveLab?
                  </h2>
                  <p className="text-xs text-[#697386]">
                    Select your access workspace to proceed.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Participant Card */}
                  <button
                    onClick={() => {
                      setSelectedRole("participant");
                      setName("Alex Jordan");
                      setDob("2002-04-18");
                      setSex("female");
                    }}
                    className="p-5 rounded-2xl border border-white/10 bg-[#0C1018]/80 hover:bg-[#4F8CFF]/10 hover:border-[#4F8CFF]/50 transition-all duration-200 flex flex-col items-start text-left space-y-3 group hover:shadow-[0_0_25px_rgba(79,140,255,0.25)] relative overflow-hidden"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>PARTICIPANT</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#22C55E]/15 text-[#22C55E] font-normal">
                          Private
                        </span>
                      </div>
                      <p className="text-xs text-[#A5ADBD] pt-1 leading-relaxed">
                        Take part in a cognitive experiment and inspect your personal performance history.
                      </p>
                    </div>
                    <div className="pt-2 text-[11px] font-mono text-[#4F8CFF] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Enter as Participant</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>

                  {/* Researcher Card */}
                  <button
                    onClick={() => {
                      setSelectedRole("researcher");
                      setName("Dr. Elena Vance");
                      setDob("1994-05-15");
                      setSex("female");
                    }}
                    className="p-5 rounded-2xl border border-white/10 bg-[#0C1018]/80 hover:bg-[#8B5CF6]/10 hover:border-[#8B5CF6]/50 transition-all duration-200 flex flex-col items-start text-left space-y-3 group hover:shadow-[0_0_25px_rgba(139,92,246,0.25)] relative overflow-hidden"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#4F8CFF]/15 border border-[#4F8CFF]/30 text-[#4F8CFF] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FlaskConical className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>RESEARCHER</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#4F8CFF]/15 text-[#4F8CFF] font-normal">
                          Console
                        </span>
                      </div>
                      <p className="text-xs text-[#A5ADBD] pt-1 leading-relaxed">
                        Design experiments, inspect demographic distributions, and analyze research data.
                      </p>
                    </div>
                    <div className="pt-2 text-[11px] font-mono text-[#8B5CF6] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Enter as Researcher</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                </div>

                {/* Quick Demo Switcher Strip for Evaluation */}
                <div className="pt-4 border-t border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#697386]">
                    <span>⚡ 1-CLICK DEMO ACCOUNTS</span>
                    <span>DEMO MODE</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleQuickDemo("user-res-alpha")}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#4F8CFF]/20 text-xs font-mono text-[#60A5FA] border border-white/10 hover:border-[#4F8CFF]/40 transition-colors"
                    >
                      Researcher Alpha (Age 32)
                    </button>
                    <button
                      onClick={() => handleQuickDemo("part-001")}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#22C55E]/20 text-xs font-mono text-[#4ADE80] border border-white/10 hover:border-[#22C55E]/40 transition-colors"
                    >
                      Participant P-001 (Age 16)
                    </button>
                    <button
                      onClick={() => handleQuickDemo("part-004")}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#22C55E]/20 text-xs font-mono text-[#4ADE80] border border-white/10 hover:border-[#22C55E]/40 transition-colors"
                    >
                      Participant P-004 (Age 28)
                    </button>
                    <button
                      onClick={() => handleQuickDemo("part-007")}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#22C55E]/20 text-xs font-mono text-[#4ADE80] border border-white/10 hover:border-[#22C55E]/40 transition-colors"
                    >
                      Participant P-007 (Age 58)
                    </button>
                  </div>
                </div>
              </div>
            ) : selectedRole === "participant" ? (
              /* Step 2A: Participant Login Form */
              <form onSubmit={handleParticipantSubmit} className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#22C55E]/20 text-[#22C55E] flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Participant Login</h3>
                      <p className="text-[11px] text-[#A5ADBD]">Private performance and trial access</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole(null);
                      setValidationError(null);
                    }}
                    className="text-[11px] font-mono text-[#697386] hover:text-white underline"
                  >
                    Change Role
                  </button>
                </div>

                {validationError && (
                  <div className="p-3 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-mono text-[#A5ADBD] uppercase">
                    Your Name or Pseudonym
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Jordan or Participant P-004"
                    className="w-full bg-[#10141D] text-xs text-white px-3 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#22C55E] transition-colors"
                  />
                </div>

                {/* Date of Birth */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-[#A5ADBD] uppercase flex items-center gap-1.5">
                      <span>Date of Birth</span>
                      <span className="text-[10px] text-[#697386]">(Min 15 yrs)</span>
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowTooltip(!showTooltip)}
                        className="text-[11px] text-[#4F8CFF] hover:underline flex items-center gap-1"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Why do we ask?</span>
                      </button>

                      {showTooltip && (
                        <div className="absolute right-0 bottom-6 w-64 p-3 rounded-xl bg-[#0D111A] border border-white/20 text-[11px] text-[#A5ADBD] shadow-2xl z-30 space-y-1.5">
                          <p className="font-semibold text-white">Demographic Research Grouping</p>
                          <p className="leading-snug">
                            Date of birth is used solely to derive your research age cohort (e.g. 18–24, 25–34) for anonymized scientific comparisons.
                          </p>
                          <p className="text-[10px] text-[#22C55E] pt-1">
                            🔒 Your exact date of birth is never shared with other participants.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-[#697386] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full bg-[#10141D] text-xs text-white pl-9 pr-3 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#22C55E] transition-colors font-mono"
                    />
                  </div>
                </div>

                {/* Sex */}
                <div className="space-y-1">
                  <label className="text-xs font-mono text-[#A5ADBD] uppercase">
                    Sex / Gender Grouping
                  </label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value as Sex)}
                    className="w-full bg-[#10141D] text-xs text-white px-3 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#22C55E] transition-colors"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="intersex">Intersex</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>

                {/* Action button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="glow"
                    size="md"
                    className="w-full bg-[#22C55E] hover:bg-[#16A34A] border-[#22C55E]/40"
                    isLoading={isLoading}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Access Participant Dashboard
                  </Button>
                </div>

                {/* Privacy Badge */}
                <div className="pt-2 text-center text-[11px] font-mono text-[#697386] flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>Private workspace • Data isolated to your account</span>
                </div>
              </form>
            ) : (
              /* Step 2B: Researcher Login Form */
              <form onSubmit={handleResearcherSubmit} className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#4F8CFF]/20 text-[#4F8CFF] flex items-center justify-center">
                      <FlaskConical className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Researcher Console</h3>
                      <p className="text-[11px] text-[#A5ADBD]">Research authoring and cohort telemetry</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole(null);
                      setValidationError(null);
                    }}
                    className="text-[11px] font-mono text-[#697386] hover:text-white underline"
                  >
                    Change Role
                  </button>
                </div>

                {validationError && (
                  <div className="p-3 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-mono text-[#A5ADBD] uppercase">
                    Researcher Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Elena Vance"
                    className="w-full bg-[#10141D] text-xs text-white px-3 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#4F8CFF] transition-colors"
                  />
                </div>

                {/* Institutional ID */}
                <div className="space-y-1">
                  <label className="text-xs font-mono text-[#A5ADBD] uppercase flex items-center justify-between">
                    <span>Institutional / Lab Identifier</span>
                    <span className="text-[10px] text-[#4F8CFF]">Required</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={institutionalId}
                    onChange={(e) => setInstitutionalId(e.target.value)}
                    placeholder="e.g. RES-ALPHA-2026 or MIT-COG-402"
                    className="w-full bg-[#10141D] text-xs text-white px-3 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#4F8CFF] transition-colors font-mono"
                  />
                </div>

                {/* Date of Birth */}
                <div className="space-y-1">
                  <label className="text-xs font-mono text-[#A5ADBD] uppercase flex items-center justify-between">
                    <span>Date of Birth</span>
                    <span className="text-[10px] text-[#697386]">(Min 18 yrs for researchers)</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-[#697386] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full bg-[#10141D] text-xs text-white pl-9 pr-3 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#4F8CFF] transition-colors font-mono"
                    />
                  </div>
                </div>

                {/* Sex */}
                <div className="space-y-1">
                  <label className="text-xs font-mono text-[#A5ADBD] uppercase">
                    Sex
                  </label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value as Sex)}
                    className="w-full bg-[#10141D] text-xs text-white px-3 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#4F8CFF] transition-colors"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="intersex">Intersex</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>

                {/* Action button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="glow"
                    size="md"
                    className="w-full"
                    isLoading={isLoading}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Enter Researcher Console
                  </Button>
                </div>

                {/* Security Note */}
                <div className="pt-2 text-center text-[11px] font-mono text-[#697386] flex items-center justify-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#4F8CFF]" />
                  <span>Full access to cohort analytics, authoring & exports</span>
                </div>
              </form>
            )}
          </GlassPanel>
        )}
      </div>
    </div>
  );
}
