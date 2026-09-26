import React from "react";
import { GlassPanel } from "./GlassPanel";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  icon?: React.ReactNode;
  accentColor?: "blue" | "violet" | "cyan" | "success" | "warning";
  className?: string;
  /**
   * Real measurements to plot. There is deliberately no default: a sparkline
   * drawn from placeholder numbers is indistinguishable from one drawn from
   * data, so the chart is omitted unless a caller supplies actual values.
   */
  sparklineData?: number[];
}

export function MetricCard({
  label,
  value,
  unit,
  change,
  trend = "neutral",
  trendLabel,
  icon,
  accentColor = "blue",
  className,
  sparklineData,
}: MetricCardProps) {
  const accentBorders = {
    blue: "hover:border-[#4F8CFF]/40",
    violet: "hover:border-[#8B5CF6]/40",
    cyan: "hover:border-[#22D3EE]/40",
    success: "hover:border-[#22C55E]/40",
    warning: "hover:border-[#F59E0B]/40",
  };

  const accentIcons = {
    blue: "text-[#4F8CFF] bg-[#4F8CFF]/10 border-[#4F8CFF]/25",
    violet: "text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/25",
    cyan: "text-[#22D3EE] bg-[#22D3EE]/10 border-[#22D3EE]/25",
    success: "text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/25",
    warning: "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/25",
  };

  // Generate SVG path for sparkline, only when real data was supplied.
  const hasSparkline = Array.isArray(sparklineData) && sparklineData.length > 1;
  const minVal = hasSparkline ? Math.min(...sparklineData!) : 0;
  const maxVal = hasSparkline ? Math.max(...sparklineData!) : 0;
  const range = maxVal - minVal || 1;
  const height = 28;
  const width = 72;
  const points = hasSparkline
    ? sparklineData!
        .map((v, i) => {
          const x = (i / (sparklineData!.length - 1)) * width;
          const y = height - ((v - minVal) / range) * (height - 4) - 2;
          return `${x},${y}`;
        })
        .join(" ")
    : "";

  return (
    <GlassPanel
      className={cn(
        "p-5 relative overflow-hidden transition-all duration-300 group hover:-translate-y-0.5",
        accentBorders[accentColor],
        className
      )}
    >
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-full blur-xl pointer-events-none group-hover:bg-[#4F8CFF]/5 transition-colors" />

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-[#A5ADBD] font-mono">
          {label}
        </span>
        {icon && (
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center border transition-transform duration-200 group-hover:scale-110",
              accentIcons[accentColor]
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl lg:text-3xl font-bold tracking-tight text-white font-mono">
            {value}
          </span>
          {unit && <span className="text-xs text-[#A5ADBD] font-medium">{unit}</span>}
        </div>

        {/* Mini sparkline — rendered only for real measurements */}
        {hasSparkline && (
          <div className="opacity-70 group-hover:opacity-100 transition-opacity">
            <svg width={width} height={height} className="overflow-visible">
              <polyline
                fill="none"
                stroke={
                  accentColor === "cyan"
                    ? "#22D3EE"
                    : accentColor === "violet"
                    ? "#8B5CF6"
                    : accentColor === "success"
                    ? "#22C55E"
                    : "#4F8CFF"
                }
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
            </svg>
          </div>
        )}
      </div>

      {(change || trendLabel) && (
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/[0.06] text-xs">
          {trend === "up" && (
            <span className="flex items-center font-medium text-[#22C55E] gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              {change}
            </span>
          )}
          {trend === "down" && (
            <span className="flex items-center font-medium text-[#EF4444] gap-0.5">
              <TrendingDown className="w-3.5 h-3.5" />
              {change}
            </span>
          )}
          {trend === "neutral" && change && (
            <span className="flex items-center font-medium text-[#A5ADBD] gap-0.5">
              <Minus className="w-3.5 h-3.5" />
              {change}
            </span>
          )}
          <span className="text-[#697386] truncate">{trendLabel}</span>
        </div>
      )}
    </GlassPanel>
  );
}
