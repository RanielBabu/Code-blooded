"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Role } from "@/types/auth";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRole?: Role | "any";
}

export function RouteGuard({ children, allowedRole = "any" }: RouteGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (allowedRole !== "any" && user.role !== allowedRole) {
      if (user.role === "participant") {
        router.push("/participant/dashboard");
      } else if (user.role === "researcher") {
        router.push("/dashboard");
      }
    }
  }, [user, isLoading, allowedRole, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#05060A] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#4F8CFF] border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-[#A5ADBD]">Verifying credentials & role...</span>
        </div>
      </div>
    );
  }

  if (!user || (allowedRole !== "any" && user.role !== allowedRole)) {
    return null;
  }

  return <>{children}</>;
}
