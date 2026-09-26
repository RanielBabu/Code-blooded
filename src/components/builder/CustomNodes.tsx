"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps, useNodeConnections } from "@xyflow/react";
import {
  Play,
  CheckCircle,
  FileText,
  Palette,
  Clock,
  Keyboard,
  Timer,
  Database,
  Repeat,
  Sparkles,
  GitBranch,
} from "lucide-react";
import { NodeCategory } from "@/types/experiment";

const categoryStyles: Record<
  NodeCategory,
  { bg: string; border: string; glow: string; text: string; headerBg: string }
> = {
  flow: {
    bg: "bg-[#10141D]",
    border: "border-blue-500/40",
    glow: "shadow-[0_0_15px_rgba(79,140,255,0.2)]",
    text: "text-[#60A5FA]",
    headerBg: "bg-blue-500/10",
  },
  stimulus: {
    bg: "bg-[#10141D]",
    border: "border-purple-500/40",
    glow: "shadow-[0_0_15px_rgba(139,92,246,0.2)]",
    text: "text-[#A78BFA]",
    headerBg: "bg-purple-500/10",
  },
  timing: {
    bg: "bg-[#10141D]",
    border: "border-amber-500/40",
    glow: "shadow-[0_0_15px_rgba(245,158,11,0.2)]",
    text: "text-[#FBBF24]",
    headerBg: "bg-amber-500/10",
  },
  response: {
    bg: "bg-[#10141D]",
    border: "border-emerald-500/40",
    glow: "shadow-[0_0_15px_rgba(34,197,94,0.2)]",
    text: "text-[#4ADE80]",
    headerBg: "bg-emerald-500/10",
  },
  measurement: {
    bg: "bg-[#10141D]",
    border: "border-cyan-500/40",
    glow: "shadow-[0_0_15px_rgba(34,211,238,0.2)]",
    text: "text-[#22D3EE]",
    headerBg: "bg-cyan-500/10",
  },
  data: {
    bg: "bg-[#10141D]",
    border: "border-rose-500/40",
    glow: "shadow-[0_0_15px_rgba(244,63,94,0.2)]",
    text: "text-[#FB7185]",
    headerBg: "bg-rose-500/10",
  },
  randomization: {
    bg: "bg-[#10141D]",
    border: "border-indigo-500/40",
    glow: "shadow-[0_0_15px_rgba(99,102,241,0.2)]",
    text: "text-[#818CF8]",
    headerBg: "bg-indigo-500/10",
  },
};

function getNodeIcon(iconName?: string) {
  switch (iconName) {
    case "Play":
      return <Play className="w-3.5 h-3.5 fill-current" />;
    case "CheckCircle":
      return <CheckCircle className="w-3.5 h-3.5" />;
    case "FileText":
      return <FileText className="w-3.5 h-3.5" />;
    case "Palette":
      return <Palette className="w-3.5 h-3.5" />;
    case "Clock":
      return <Clock className="w-3.5 h-3.5" />;
    case "Keyboard":
      return <Keyboard className="w-3.5 h-3.5" />;
    case "Timer":
      return <Timer className="w-3.5 h-3.5" />;
    case "Database":
      return <Database className="w-3.5 h-3.5" />;
    case "Repeat":
      return <Repeat className="w-3.5 h-3.5" />;
    case "GitBranch":
      return <GitBranch className="w-3.5 h-3.5" />;
    default:
      return <Sparkles className="w-3.5 h-3.5" />;
  }
}

function BaseNodeComponent({ data, selected }: NodeProps) {
  const nodeData = (data || {}) as Record<string, any>;
  const category = (nodeData.category as NodeCategory) || "flow";
  const style = categoryStyles[category] || categoryStyles.flow;

  const targetConnections = useNodeConnections({ handleType: "target" });
  const sourceConnections = useNodeConnections({ handleType: "source" });
  const isTargetConnected = Boolean(targetConnections && targetConnections.length > 0);
  const isSourceConnected = Boolean(sourceConnections && sourceConnections.length > 0);

  return (
    <div
      className={`relative min-w-[200px] max-w-[250px] rounded-xl border transition-all duration-200 backdrop-blur-md overflow-visible ${
        style.bg
      } ${selected ? `${style.border} ring-2 ring-[#4F8CFF]/50 ${style.glow}` : "border-white/10 hover:border-white/25"}`}
    >
      {/* Target input handle (on the left) - Unity Port Socket */}
      <Handle
        type="target"
        position={Position.Left}
        title={
          isTargetConnected
            ? "Input Port (Connected - White)"
            : "Input Port (Red): Drag a green output cable here to connect"
        }
        className={`!w-5 !h-5 !rounded-full !border-2 !z-50 !-left-2.5 !top-1/2 !-translate-y-1/2 cursor-crosshair transition-all duration-200 hover:scale-130 ${
          isTargetConnected
            ? "!bg-white !border-white shadow-[0_0_14px_#FFFFFF,0_0_24px_rgba(255,255,255,0.9)] ring-4 ring-white/40"
            : "!bg-[#EF4444] !border-[#1E293B] shadow-[0_0_12px_#EF4444,0_0_20px_rgba(239,68,68,0.6)] ring-4 ring-[#EF4444]/30"
        }`}
      >
        {/* Inner socket core */}
        <span
          className={`block w-1.5 h-1.5 rounded-full mx-auto my-auto ${
            isTargetConnected ? "bg-[#05060A]" : "bg-white/80"
          }`}
        />
      </Handle>

      {/* Node Header */}
      <div className={`px-3 py-2 flex items-center justify-between border-b border-white/[0.08] rounded-t-xl ${style.headerBg}`}>
        <div className="flex items-center gap-2">
          <span className={style.text}>{getNodeIcon(nodeData.iconName as string)}</span>
          <span className="text-xs font-semibold text-white tracking-tight">{String(nodeData.label || "Node")}</span>
        </div>
        <span className={`text-[9px] font-mono uppercase tracking-wider ${style.text}`}>
          {category}
        </span>
      </div>

      {/* Node Body & Config summary */}
      <div className="p-3 text-[11px] text-[#A5ADBD] space-y-1 rounded-b-xl">
        {nodeData.description ? <p className="leading-snug">{String(nodeData.description)}</p> : null}
        {nodeData.config && typeof nodeData.config === "object" && Object.keys(nodeData.config).length > 0 && (
          <div className="pt-1 text-[10px] font-mono text-[#697386] truncate">
            {Object.entries(nodeData.config)
              .slice(0, 2)
              .map(([k, v]) => `${k}: ${String(v)}`)
              .join(" • ")}
          </div>
        )}
      </div>

      {/* Source output handle (on the right) - Unity Port Socket */}
      <Handle
        type="source"
        position={Position.Right}
        title={
          isSourceConnected
            ? "Output Port (Connected - White)"
            : "Output Port (Green): Drag this to a red input port to connect"
        }
        className={`!w-5 !h-5 !rounded-full !border-2 !z-50 !-right-2.5 !top-1/2 !-translate-y-1/2 cursor-crosshair transition-all duration-200 hover:scale-130 ${
          isSourceConnected
            ? "!bg-white !border-white shadow-[0_0_14px_#FFFFFF,0_0_24px_rgba(255,255,255,0.9)] ring-4 ring-white/40"
            : "!bg-[#22C55E] !border-[#1E293B] shadow-[0_0_12px_#22C55E,0_0_20px_rgba(34,197,94,0.6)] ring-4 ring-[#22C55E]/30"
        }`}
      >
        {/* Inner socket core */}
        <span
          className={`block w-1.5 h-1.5 rounded-full mx-auto my-auto ${
            isSourceConnected ? "bg-[#05060A]" : "bg-white/80"
          }`}
        />
      </Handle>
    </div>
  );
}

export const FlowNode = memo(BaseNodeComponent);
export const StimulusNode = memo(BaseNodeComponent);
export const TimingNode = memo(BaseNodeComponent);
export const ResponseNode = memo(BaseNodeComponent);
export const MeasurementNode = memo(BaseNodeComponent);
export const DataNode = memo(BaseNodeComponent);
