import React from "react";
import { GlassPanel } from "./GlassPanel";
import { Button } from "./Button";
import { Layers } from "lucide-react";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon = <Layers className="w-10 h-10 text-[#4F8CFF]" />,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <GlassPanel className={`p-8 lg:p-12 text-center flex flex-col items-center justify-center ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-4 text-[#4F8CFF] shadow-[0_0_20px_rgba(79,140,255,0.15)]">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white tracking-tight mb-1">{title}</h3>
      <p className="text-sm text-[#A5ADBD] max-w-md mx-auto mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </GlassPanel>
  );
}
