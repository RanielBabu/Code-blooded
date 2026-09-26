"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { NeuralCanvas } from "@/components/visualizations/NeuralCanvas";
import {
  User,
  FlaskConical,
  ArrowRight,
  Calendar,
  Mail,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Shield,
  Lock,
  CheckCircle2,
  Info,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { Sex, Role } from "@/types/auth";
import { calculateAge, validateRoleAge } from "@/lib/demographics";
import { MOCK_USERS } from "@/lib/auth/mock-users";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginParticipant, loginResearcher, switchDemoUser } = useAuth();

  const roleParam = searchParams.get("role") as Role | null;
  const targetGame = searchParams.get("game");

  const [selectedRole, setSelectedRole] = useState<Role>(
    roleParam === "researcher" ? "researcher" : "participant"
  );

  // Update role if query param changes
  useEffect(() => {
    if (roleParam === "researcher" || roleParam === "participant") {
      setSelectedRole(roleParam);
    }
  }, [roleParam]);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState<Sex>("male");
  const [institutionalId, setInstitutionalId] = useState("INST-RES-2026");

  // Error & validation states
  const [validationError, setValidationError] = useState<string | null>(null);
  const [ageBlockedNotice, setAgeBlockedNotice] = useState<{
    title: string;
    message: string;
    calculatedAge: number;
  } | null>(null);
  const [showWhyAsk, setShowWhyAsk] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic live age calculation from entered bdate
  const liveAgeInfo = useMemo(() => {
    if (!dob) return null;
    return calculateAge(dob);
  }, [dob]);

  // Real-time eligibility evaluation
  const ageValidation = useMemo(() => {
    if (!liveAgeInfo || !liveAgeInfo.valid) return null;
    return validateRoleAge(liveAgeInfo.age, selectedRole);
  }, [liveAgeInfo, selectedRole]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setAgeBlockedNotice(null);

    if (!name.trim()) {
      setValidationError("Please enter your name (e.g. hetanshu).");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    if (!dob) {
      setValidationError("Please enter your birth date (bdate).");
      return;
    }

    const ageRes = calculateAge(dob);
    if (!ageRes.valid) {
      setValidationError(ageRes.error || "Please enter a valid birth date.");
      return;
    }

    // Role-specific age restriction enforcement
    const check = validateRoleAge(ageRes.age, selectedRole);
    if (!check.eligible) {
      setAgeBlockedNotice({
        title:
          selectedRole === "participant"
            ? "Participant Age Restriction (< 15)"
            : "Researcher Age Restriction (< 18)",
        message: check.message || "Age restriction prevented access.",
        calculatedAge: ageRes.age,
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      if (selectedRole === "participant") {
        const res = loginParticipant({
          name: name.trim(),
          email: email.trim(),
          dateOfBirth: dob,
          sex,
        });
        setIsLoading(false);
        if (res.success) {
          if (targetGame) {
            router.push(`/preview/${targetGame}`);
          } else {
            router.push("/participant/dashboard");
          }
        } else {
          setValidationError(res.error || "Sign in failed");
        }
      } else {
        const res = loginResearcher({
          name: name.trim(),
          email: email.trim(),
          dateOfBirth: dob,
          sex,
          institutionalId: institutionalId.trim() || "INST-RES-2026",
        });
        setIsLoading(false);
        if (res.success) {
          router.push("/dashboard");
        } else {
          setValidationError(res.error || "Sign in failed");
        }
      }
    }, 300);
  };

  const handleDemoSelect = (userId: string, targetRole: Role) => {
    switchDemoUser(userId);
    if (targetRole === "participant") {
      router.push("/participant/dashboard");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#05060A] text-white flex flex-col justify-between selection:bg-[#4F8CFF]/30 select-none relative overflow-hidden">
      {/* Dynamic Background Network */}
      <NeuralCanvas className="opacity-40" />

      {/* Radial Glow Ambient Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-[#4F8CFF]/15 via-[#8B5CF6]/15 to-transparent rounded-full blur-[140px] pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-20 h-16 border-b border-white/[0.08] px-6 flex items-center justify-between backdrop-blur-md bg-[#05060A]/80">
        <Logo size="md" />
        <Link
          href="/"
          className="text-xs text-[#A5ADBD] hover:text-white transition-colors flex items-center gap-1 font-mono"
        >
          <span>← Back to Platform Overview</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-xl">
          <GlassPanel className="p-6 sm:p-8 rounded-2xl border-white/10 shadow-2xl relative">
            {/* Top Brand & Purpose */}
            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-mono text-[#A5ADBD]">
                <Shield className="w-3.5 h-3.5 text-[#4F8CFF]" />
                <span>Identity, Role & Demographic Registration</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Enter CognitiveLab
              </h1>
              <p className="text-xs sm:text-sm text-[#A5ADBD] max-w-md mx-auto">
                Enter your details to generate your research session and verify scientific age eligibility.
              </p>
            </div>

            {/* Role Selection Tabs */}
            <div className="space-y-1.5 mb-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A5ADBD]">
                Select Role
              </label>
              <div className="grid grid-cols-2 gap-3 p-1 rounded-xl bg-white/[0.03] border border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedRole("researcher")}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-xs transition-all ${
                    selectedRole === "researcher"
                      ? "bg-[#4F8CFF] text-white shadow-[0_0_15px_-3px_rgba(79,140,255,0.4)]"
                      : "text-[#A5ADBD] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <FlaskConical className="w-4 h-4" />
                  <div className="text-left">
                    <div className="font-semibold text-sm">Researcher</div>
                    <div className="text-[10px] opacity-80">Full Access · 18+ required</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("participant")}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-xs transition-all ${
                    selectedRole === "participant"
                      ? "bg-[#10B981] text-white shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)]"
                      : "text-[#A5ADBD] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <div className="text-left">
                    <div className="font-semibold text-sm">Participant</div>
                    <div className="text-[10px] opacity-80">Take Studies · 15+ required</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Form Error Banner */}
            {validationError && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* The Unified Form: Name, Email, Sex, Birthdate (bdate) with Why Ask */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-white mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#4F8CFF]" />
                    {selectedRole === "researcher" ? "Researcher Full Name" : "Participant Name / Pseudonym"}
                  </span>
                  <span className="text-[10px] font-mono text-[#697386]">e.g. hetanshu</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. hetanshu"
                  required
                  className="w-full bg-[#0D111A] text-xs text-white placeholder-[#697386] px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#4F8CFF] transition-colors"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-medium text-white mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#4F8CFF]" />
                    Email Address
                  </span>
                  <span className="text-[10px] font-mono text-[#697386]">Account Identifier</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. hetanshu@example.com"
                  required
                  className="w-full bg-[#0D111A] text-xs text-white placeholder-[#697386] px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#4F8CFF] transition-colors"
                />
              </div>

              {/* Biological Sex */}
              <div>
                <label className="block text-xs font-medium text-white mb-1.5">
                  Biological Sex / Demographic Classification
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                    { value: "intersex", label: "Intersex" },
                    { value: "prefer_not_to_say", label: "Decline" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSex(opt.value as Sex)}
                      className={`py-2 px-2 text-xs rounded-lg border font-medium transition-all ${
                        sex === opt.value
                          ? "bg-[#4F8CFF]/20 border-[#4F8CFF] text-[#60A5FA]"
                          : "bg-white/[0.02] border-white/10 text-[#A5ADBD] hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date of Birth (bdate) with WHY ASK? for age restrictions */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-white flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#4F8CFF]" />
                    <span>Date of Birth / Birthdate (bdate)</span>
                  </label>

                  {/* Why ask? Button */}
                  <button
                    type="button"
                    onClick={() => setShowWhyAsk(!showWhyAsk)}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-[11px] text-[#60A5FA] font-medium transition-all"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Why ask? (Age restrictions)</span>
                  </button>
                </div>

                {/* Explanatory "Why ask?" Box */}
                {showWhyAsk && (
                  <div className="p-3 rounded-xl bg-[#141A26] border border-blue-500/40 text-xs text-[#A5ADBD] space-y-2 shadow-2xl animate-in fade-in duration-150">
                    <div className="flex items-center justify-between font-semibold text-white">
                      <span className="flex items-center gap-1.5 text-[#60A5FA]">
                        <Info className="w-4 h-4 text-[#38BDF8]" />
                        Age Restrictions & Scientific Protocol
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowWhyAsk(false)}
                        className="text-[10px] text-[#697386] hover:text-white"
                      >
                        ✕ Close
                      </button>
                    </div>
                    <ul className="text-[11px] space-y-1 list-disc list-inside text-gray-300">
                      <li>
                        <strong className="text-amber-400">Researcher Age Requirement:</strong> Must be at least{" "}
                        <span className="text-white font-bold">18 years old</span> to publish experiments and collect participant data.
                      </li>
                      <li>
                        <strong className="text-amber-400">Participant Age Requirement:</strong> Must be at least{" "}
                        <span className="text-white font-bold">15 years old</span> to take independent, unmonitored studies.
                      </li>
                      <li>
                        <strong className="text-sky-300">Scientific Cohort Calculation:</strong> Neuromotor reaction times are benchmarked strictly against calculated chronological age groups (e.g., Young Adult, Mature Adult).
                      </li>
                    </ul>
                  </div>
                )}

                <input
                  type="date"
                  value={dob}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDob(e.target.value)}
                  required
                  className="w-full bg-[#0D111A] text-xs text-white placeholder-[#697386] px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#4F8CFF] transition-colors font-mono"
                />

                {/* Dynamic Live Age Calculation Box */}
                {liveAgeInfo && liveAgeInfo.valid ? (
                  <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-1.5 text-xs animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[#A5ADBD]">
                        Calculated Age: <strong className="text-white font-mono text-sm">{liveAgeInfo.age} years old</strong>
                      </span>
                      <span className="text-[#34D399] font-mono text-[11px] bg-[#10B981]/15 px-2 py-0.5 rounded border border-[#10B981]/30">
                        Cohort: {liveAgeInfo.ageGroup}
                      </span>
                    </div>

                    {/* Eligibility Status Alert */}
                    {ageValidation && !ageValidation.eligible ? (
                      <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                        <span>
                          {selectedRole === "researcher"
                            ? `⛔ RESTRICTION: Researchers must be 18+ (Current calculated age: ${liveAgeInfo.age} yrs). Authorization blocked.`
                            : `⛔ RESTRICTION: Participants must be 15+ (Current calculated age: ${liveAgeInfo.age} yrs). Participation blocked.`}
                        </span>
                      </div>
                    ) : (
                      <div className="p-1.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20 text-[#34D399] text-[11px] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                        <span>
                          Age verified: Eligible for {selectedRole === "researcher" ? "Researcher (18+)" : "Participant (15+)"} access.
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#697386]">
                    Select your birthdate above to calculate age and verify role restriction.
                  </p>
                )}
              </div>

              {/* Researcher Institutional ID (only if researcher) */}
              {selectedRole === "researcher" && (
                <div className="animate-in fade-in duration-200">
                  <label className="block text-xs font-medium text-white mb-1.5 flex items-center justify-between">
                    <span>Institutional or Lab ID</span>
                    <span className="text-[10px] font-mono text-[#697386]">IRB / Ethics Protocol</span>
                  </label>
                  <input
                    type="text"
                    value={institutionalId}
                    onChange={(e) => setInstitutionalId(e.target.value)}
                    placeholder="e.g. INST-RES-2026"
                    className="w-full bg-[#0D111A] text-xs text-white placeholder-[#697386] px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#4F8CFF] transition-colors font-mono"
                  />
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="glow"
                  size="lg"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="w-full justify-center"
                >
                  {selectedRole === "participant"
                    ? name ? `Enter Study Library (${name})` : "Enter Participant Study Library"
                    : name ? `Launch Researcher Console (${name})` : "Launch Researcher Console"}
                </Button>
              </div>
            </form>

            {/* Quick 1-Click Demo Evaluation Switcher */}
            <div className="mt-6 pt-5 border-t border-white/[0.08]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#697386]">
                  Instant Demo Accounts (1-Click)
                </span>
                <span className="text-[10px] font-mono text-[#A5ADBD]">Pre-configured</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MOCK_USERS.slice(0, 4).map((u) => {
                  const isPart = u.role === "participant";
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleDemoSelect(u.id, u.role)}
                      className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-white/15 text-left transition-all group"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isPart ? "bg-[#10B981]" : "bg-[#4F8CFF]"
                          }`}
                        />
                        <span className="text-[10px] font-mono uppercase text-[#A5ADBD] group-hover:text-white truncate">
                          {isPart ? "Part." : "Res."}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-white truncate">
                        {u.displayName.split(" ")[0]}
                      </p>
                      <p className="text-[10px] text-[#697386] font-mono">
                        Age {u.age} · {u.ageGroup}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </GlassPanel>
        </div>
      </main>

      {/* Age Blocked Modal Dialog */}
      {ageBlockedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="max-w-md w-full bg-[#0D111A] border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {ageBlockedNotice.title}
              </h3>
              <p className="text-xs text-[#A5ADBD] leading-relaxed">
                {ageBlockedNotice.message}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-[#A5ADBD] space-y-1">
              <p className="text-white font-medium">Provided Demographics:</p>
              <p className="font-mono text-[11px] text-amber-300">
                Calculated Age: {ageBlockedNotice.calculatedAge} years old
              </p>
              <p className="text-[11px]">
                {selectedRole === "participant"
                  ? "Participants under 15 require supervised parental IRB protocol."
                  : "Investigators must be at least 18 years old to administer experiments."}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setAgeBlockedNotice(null)}
              >
                Close & Revise Birthdate
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className="relative z-20 h-12 border-t border-white/[0.06] px-6 flex items-center justify-between text-[11px] text-[#697386] font-mono backdrop-blur-md bg-[#05060A]/80">
        <span>COGNITIVELAB PROTOCOL • SECURE AUTH</span>
        <span>DEMOGRAPHIC TELEMETRY ENABLED</span>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#05060A] text-white flex items-center justify-center">
          <div className="text-xs font-mono text-[#A5ADBD] animate-pulse">
            Loading CognitiveLab authentication...
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
