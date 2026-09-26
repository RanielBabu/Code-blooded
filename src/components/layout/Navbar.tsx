"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Menu, X, ArrowRight, Hourglass, BookOpen, Lock, FlaskConical, User as UserIcon, LogOut } from "lucide-react";
import { RoleSelectModal } from "@/components/auth/RoleSelectModal";
import { useAuth } from "@/lib/auth/auth-context";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, isResearcher } = useAuth();

  const navLinks = [
    { label: "Platform", href: "/#platform" },
    { label: "Experiments", href: "/experiments" },
    { label: "Age Analytics", href: "/researcher/age-analytics" },
    { label: "Research Library", href: "/library" },
    { label: "Leaderboard", href: "/leaderboard" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#05060A]/80 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Logo */}
          <Logo size="md" />

          {/* Center: Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-full px-4 py-1.5 backdrop-blur-md">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-150 ${
                    isActive
                      ? "text-white bg-white/10"
                      : "text-[#A5ADBD] hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Telemetry Hourglass + Know About Research + Sign In / User Profile */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Hourglass Sub-ms Precision Engine */}
            <div
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-mono text-[#A5ADBD]"
              title="Browser performance.now() animation-frame telemetry clock"
            >
              <Hourglass className="w-3.5 h-3.5 text-[#F59E0B] animate-spin" style={{ animationDuration: "8s" }} />
              <span className="hidden xl:inline">Sub-ms Precision</span>
              <span className="text-[#34D399] font-semibold">● 1000Hz</span>
            </div>

            {/* Know About Research */}
            <Link
              href="/library"
              className="text-xs text-[#A5ADBD] hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#4F8CFF]" />
              <span>Know about Research</span>
            </Link>

            {/* Sign In Button / User Profile */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={user.role === "researcher" ? "/dashboard" : "/participant/dashboard"}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full ${user.role === "researcher" ? "bg-[#4F8CFF]" : "bg-[#10B981]"}`} />
                  <span className="text-xs font-semibold text-white max-w-[120px] truncate">{user.displayName}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase ${user.role === "researcher" ? "bg-[#4F8CFF]/20 text-[#60A5FA]" : "bg-[#10B981]/20 text-[#34D399]"}`}>
                    {user.role}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  title="Sign out of CognitiveLab"
                  className="p-1.5 text-[#A5ADBD] hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link href="/login">
                <Button
                  variant="glow"
                  size="sm"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="sm:hidden flex items-center gap-2">
            {user ? (
              <Link
                href={user.role === "researcher" ? "/dashboard" : "/participant/dashboard"}
                className="text-xs font-medium text-white px-2.5 py-1 rounded bg-white/10"
              >
                {user.displayName.split(" ")[0]}
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="glow" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#A5ADBD] hover:text-white rounded-lg hover:bg-white/5"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-[#0A0D14] border-b border-white/10 px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-[#A5ADBD] hover:text-white hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <Link
                href="/library"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs text-[#A5ADBD] hover:text-white py-2 px-3 rounded bg-white/5 flex items-center gap-2"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#4F8CFF]" />
                <span>Know about Research</span>
              </Link>
              <Button
                variant="glow"
                size="md"
                className="w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setRoleModalOpen(true);
                }}
              >
                Sign In / Select Role
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Role Selection Modal */}
      <RoleSelectModal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
      />
    </>
  );
}
