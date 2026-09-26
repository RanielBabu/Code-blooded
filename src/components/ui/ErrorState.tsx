import React from "react";
import { GlassPanel } from "./GlassPanel";
import { Button } from "./Button";
import { AlertCircle, RefreshCw } from "lucide-react";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Telemetry Feed Disrupted",
  message = "Failed to synchronize experiment data with the measurement engine. Please verify network status or fallback to mock mode.",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <GlassPanel className={`p-8 lg:p-10 border-[#EF4444]/30 bg-[#EF4444]/5 flex flex-col items-center text-center ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>
      <p className="text-xs text-[#A5ADBD] max-w-sm mt-1 mb-5">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Retry Connection
        </Button>
      )}
    </GlassPanel>
  );
}
