"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { NeuralCanvas } from "@/components/visualizations/NeuralCanvas";
import { ShieldCheck, ArrowRight, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("elena.vance@cognitivelab.internal");
  const [password, setPassword] = useState("••••••••••••");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate token auth and route to dashboard
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#05060A] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Neural Network */}
      <NeuralCanvas className="opacity-40" />

      {/* Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#4F8CFF]/15 to-[#8B5CF6]/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Logo size="lg" className="justify-center" />
          <p className="text-xs text-[#A5ADBD] pt-1 font-mono">
            Research Console & Telemetry Access
          </p>
        </div>

        <GlassPanel elevated className="p-6 sm:p-8 space-y-5 border-white/15 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
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
                  className="w-full bg-[#10141D] text-xs text-white pl-9 pr-3 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#4F8CFF]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono text-[#A5ADBD] uppercase">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-[#4F8CFF] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#697386] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#10141D] text-xs text-white pl-9 pr-3 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#4F8CFF]"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="glow"
              size="md"
              className="w-full"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Console
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-[#A5ADBD]">
            Don&apos;t have an institutional workspace?{" "}
            <Link href="/signup" className="text-[#4F8CFF] hover:underline font-medium">
              Create account
            </Link>
          </div>
        </GlassPanel>

        <div className="text-center text-[11px] text-[#697386] font-mono">
          COGNITIVELAB SECURE PROTOCOL • ENCRYPTED SESSION
        </div>
      </div>
    </div>
  );
}
