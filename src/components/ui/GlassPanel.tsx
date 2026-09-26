import React from "react";
import { cn } from "@/lib/utils";

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  glow?: "blue" | "violet" | "cyan" | "none";
}

export function GlassPanel({
  className,
  elevated = false,
  glow = "none",
  children,
  ...props
}: GlassPanelProps) {
  const glowStyles = {
    none: "",
    blue: "glow-blue",
    violet: "glow-violet",
    cyan: "glow-cyan",
  };

  return (
    <div
      className={cn(
        elevated ? "glass-panel-elevated" : "glass-panel",
        "rounded-xl transition-all duration-200",
        glowStyles[glow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export const Card = GlassPanel;
