import React from "react";
import { GlassPanel } from "./GlassPanel";
import { cn } from "@/lib/utils";

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  subtitle,
  headerAction,
  children,
  className,
}: ChartCardProps) {
  return (
    <GlassPanel className={cn("p-5 lg:p-6 flex flex-col", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>
          {subtitle && (
            <p className="text-xs text-[#A5ADBD] mt-0.5 font-normal">{subtitle}</p>
          )}
        </div>
        {headerAction && <div className="flex items-center gap-2">{headerAction}</div>}
      </div>
      <div className="w-full flex-1 min-h-[260px]">{children}</div>
    </GlassPanel>
  );
}
