import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "outline"
    | "published"
    | "draft"
    | "archived"
    | "blue"
    | "violet"
    | "cyan"
    | "success"
    | "warning"
    | "error";
  size?: "sm" | "md";
}

export function Badge({ className, variant = "default", size = "sm", children, ...props }: BadgeProps) {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
  };

  const variantStyles = {
    default: "bg-white/10 text-white border-white/10",
    outline: "bg-transparent text-[#A5ADBD] border-white/15",
    published: "bg-[#22C55E]/15 text-[#4ADE80] border-[#22C55E]/30 shadow-[0_0_10px_rgba(34,197,94,0.15)]",
    draft: "bg-[#F59E0B]/15 text-[#FBBF24] border-[#F59E0B]/30",
    archived: "bg-white/5 text-[#697386] border-white/10",
    blue: "bg-[#4F8CFF]/15 text-[#60A5FA] border-[#4F8CFF]/30",
    violet: "bg-[#8B5CF6]/15 text-[#A78BFA] border-[#8B5CF6]/30",
    cyan: "bg-[#22D3EE]/15 text-[#22D3EE] border-[#22D3EE]/30",
    success: "bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30",
    warning: "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30",
    error: "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium font-mono rounded-full border tracking-wide uppercase",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
