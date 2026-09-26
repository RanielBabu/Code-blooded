"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { NeuralCanvas } from "@/components/visualizations/NeuralCanvas";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#05060A] text-white flex items-center justify-center p-4 relative overflow-hidden">
      <NeuralCanvas className="opacity-40" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Logo size="lg" className="justify-center" />
          <p className="text-xs text-[#A5ADBD] pt-1 font-mono">
            Password Recovery
          </p>
        </div>

        <GlassPanel elevated className="p-6 sm:p-8 space-y-5 border-white/15 shadow-2xl">
          {submitted ? (
            <div className="text-center space-y-3 py-4">
              <CheckCircle2 className="w-10 h-10 text-[#22C55E] mx-auto" />
              <h3 className="text-base font-bold text-white">Reset Link Dispatched</h3>
              <p className="text-xs text-[#A5ADBD]">
                If an institutional account exists for <strong className="text-white">{email}</strong>, a recovery link has been sent.
              </p>
              <Link href="/login" className="inline-block pt-3">
                <Button variant="secondary" size="sm">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-[#A5ADBD] leading-relaxed">
                Enter your registered research email address to receive password recovery instructions.
              </p>
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
                    placeholder="researcher@university.edu"
                    className="w-full bg-[#10141D] text-xs text-white pl-9 pr-3 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#4F8CFF]"
                  />
                </div>
              </div>

              <Button type="submit" variant="glow" size="md" className="w-full">
                Send Recovery Link
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-xs text-[#A5ADBD] hover:text-white inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}
