"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { NeuralCanvas } from "@/components/visualizations/NeuralCanvas";
import { ArrowRight, Lock, Mail, User, Building2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("Dr. Elena Vance");
  const [institution, setInstitution] = useState("Stanford Cognitive Systems Lab");
  const [email, setEmail] = useState("elena.vance@stanford.edu");
  const [password, setPassword] = useState("••••••••••••");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#05060A] text-white flex items-center justify-center p-4 relative overflow-hidden">
      <NeuralCanvas className="opacity-40" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#4F8CFF]/15 to-[#8B5CF6]/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Logo size="lg" className="justify-center" />
          <p className="text-xs text-[#A5ADBD] pt-1 font-mono">
            Register Institutional Research Workspace
          </p>
        </div>

        <GlassPanel elevated className="p-6 sm:p-8 space-y-5 border-white/15 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-mono text-[#A5ADBD] uppercase">
                Principal Investigator Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#697386] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#10141D] text-xs text-white pl-9 pr-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-[#4F8CFF]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-[#A5ADBD] uppercase">
                University / Institute
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-[#697386] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full bg-[#10141D] text-xs text-white pl-9 pr-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-[#4F8CFF]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-[#A5ADBD] uppercase">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#697386] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#10141D] text-xs text-white pl-9 pr-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-[#4F8CFF]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-[#A5ADBD] uppercase">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#697386] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#10141D] text-xs text-white pl-9 pr-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-[#4F8CFF]"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="glow"
              size="md"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Research Console
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-[#A5ADBD]">
            Already have an active console?{" "}
            <Link href="/login" className="text-[#4F8CFF] hover:underline font-medium">
              Sign In
            </Link>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
