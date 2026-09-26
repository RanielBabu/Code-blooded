import React from "react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const iconSize = size === "sm" ? 24 : size === "md" ? 32 : 44;

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 group transition-transform duration-200 active:scale-95 ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {/* Ambient glow behind logo */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-[#4F8CFF] to-[#8B5CF6] blur-[10px] opacity-40 group-hover:opacity-75 transition-opacity" />

        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 drop-shadow-[0_0_12px_rgba(79,140,255,0.4)]"
        >
          {/* Outer synaptic network hexagon ring */}
          <polygon
            points="20,2 35,11 35,29 20,38 5,29 5,11"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1.2"
            fill="#0A0D14"
          />

          {/* Internal neural paths */}
          <path
            d="M20 7L20 20M20 20L31 26M20 20L9 26M20 20L20 33"
            stroke="url(#logo_grad)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M12 14L20 20M28 14L20 20"
            stroke="#22D3EE"
            strokeWidth="1.2"
            strokeDasharray="2 3"
          />

          {/* Nodes */}
          <circle cx="20" cy="7" r="2.5" fill="#4F8CFF" />
          <circle cx="31" cy="26" r="2.5" fill="#8B5CF6" />
          <circle cx="9" cy="26" r="2.5" fill="#22D3EE" />
          <circle cx="20" cy="20" r="3.2" fill="#FFFFFF" className="animate-pulse" />
          <circle cx="12" cy="14" r="1.8" fill="#4F8CFF" />
          <circle cx="28" cy="14" r="1.8" fill="#8B5CF6" />

          <defs>
            <linearGradient id="logo_grad" x1="5" y1="5" x2="35" y2="35" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4F8CFF" />
              <stop offset="0.5" stopColor="#22D3EE" />
              <stop offset="1" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1 font-semibold tracking-tight text-white">
            <span className="text-[17px] font-bold tracking-tight">COGNITIVE</span>
            <span className="text-[17px] font-light text-[#4F8CFF] tracking-widest">LAB</span>
          </div>
          <span className="text-[9px] tracking-widest uppercase text-[#697386] font-mono -mt-1">
            Research Intelligence
          </span>
        </div>
      )}
    </Link>
  );
}
