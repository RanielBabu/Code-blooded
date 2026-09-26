"use client";

import React, { useState } from "react";
import {
  Play,
  CheckCircle,
  FileText,
  Palette,
  Type,
  Image,
  Clock,
  Timer,
  Keyboard,
  MousePointer,
  ListFilter,
  Database,
  Repeat,
  Shuffle,
  ChevronDown,
  ChevronRight,
  Plus,
} from "lucide-react";
import { NodeCategory, NodeTypeDefinition } from "@/types/experiment";

export const AVAILABLE_NODE_TEMPLATES: NodeTypeDefinition[] = [
  // FLOW
  {
    type: "flowNode",
    label: "Start Node",
    category: "flow",
    description: "Initializes experiment session & hardware clock",
    icon: "Play",
    color: "#60A5FA",
    defaultData: { sessionIdPrefix: "CRS-2026", fullscreenRequired: true },
  },
  {
    type: "flowNode",
    label: "Task Instructions",
    category: "flow",
    description: "Presents task rules and briefing to participant",
    icon: "FileText",
    color: "#60A5FA",
    defaultData: {
      headline: "Task Instructions",
      bodyText: "Respond to the target stimulus as quickly as possible.",
      acknowledgeRequired: true,
    },
  },
  {
    type: "flowNode",
    label: "Trial Loop",
    category: "flow",
    description: "Iterates through experimental trials",
    icon: "Repeat",
    color: "#60A5FA",
    defaultData: { totalTrials: 10, randomizeOrder: true },
  },
  {
    type: "flowNode",
    label: "Experiment Complete",
    category: "flow",
    description: "Debriefs participant and outputs telemetry",
    icon: "CheckCircle",
    color: "#60A5FA",
    defaultData: { showSummaryToParticipant: true, exportAllowed: true },
  },

  // STIMULUS
  {
    type: "stimulusNode",
    label: "Color Stimulus",
    category: "stimulus",
    description: "Renders chromatic target or Stroop conflict font",
    icon: "Palette",
    color: "#A78BFA",
    defaultData: {
      stimulusType: "color",
      options: ["RED", "BLUE", "GREEN", "YELLOW"],
      displayDurationMs: 1200,
      congruencyRatio: 0.5,
    },
  },
  {
    type: "stimulusNode",
    label: "Text Stimulus",
    category: "stimulus",
    description: "Presents lexical target word or character",
    icon: "Type",
    color: "#A78BFA",
    defaultData: {
      text: "TARGET",
      fontSize: "48px",
      fontColor: "#FFFFFF",
      durationMs: 800,
    },
  },
  {
    type: "stimulusNode",
    label: "Image / Icon Stimulus",
    category: "stimulus",
    description: "Renders visual shape, icon, or photographic scene",
    icon: "Image",
    color: "#A78BFA",
    defaultData: {
      imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300",
      altText: "Geometric stimulus",
      durationMs: 1000,
    },
  },

  // TIMING
  {
    type: "timingNode",
    label: "Wait / Fixation Cross",
    category: "timing",
    description: "Inter-stimulus interval (ISI) with fixation point",
    icon: "Clock",
    color: "#FBBF24",
    defaultData: { durationMs: 500, jitterMs: 150, showFixationCross: true },
  },
  {
    type: "timingNode",
    label: "Response Timeout",
    category: "timing",
    description: "Maximum latency window before marking omission",
    icon: "Timer",
    color: "#FBBF24",
    defaultData: { timeoutMs: 2500, recordOmission: true },
  },

  // RESPONSE
  {
    type: "responseNode",
    label: "Keyboard Response",
    category: "response",
    description: "Captures designated key triggers (1-4, RGBY, etc.)",
    icon: "Keyboard",
    color: "#4ADE80",
    defaultData: {
      keys: ["1", "2", "3", "4"],
      labels: ["RED", "BLUE", "GREEN", "YELLOW"],
      recordKeydown: true,
    },
  },
  {
    type: "responseNode",
    label: "Choice Buttons",
    category: "response",
    description: "Interactive tactile on-screen response buttons",
    icon: "MousePointer",
    color: "#4ADE80",
    defaultData: {
      options: ["RED", "BLUE", "GREEN", "YELLOW"],
      buttonLayout: "grid",
    },
  },

  // MEASUREMENT
  {
    type: "measurementNode",
    label: "Measure Reaction Time",
    category: "measurement",
    description: "rAF-anchored stimulus onset delta logging",
    icon: "Timer",
    color: "#22D3EE",
    // minValidMs is ENFORCED at capture time, not decorative. 150ms is the
    // conventional floor for simple reaction time; samples below it indicate an
    // anticipatory press and are excluded from aggregates.
    defaultData: { precision: "0.1ms-grid", filterOutliers: true, minValidMs: 150 },
  },
  {
    type: "measurementNode",
    label: "Accuracy Evaluator",
    category: "measurement",
    description: "Compares participant response against target rule",
    icon: "CheckCircle",
    color: "#22D3EE",
    defaultData: { rule: "target_color_match", feedback: "silent" },
  },

  // DATA & RANDOMIZATION
  {
    type: "dataNode",
    label: "Store Trial Result",
    category: "data",
    description: "Serializes trial parameters and timing to telemetry",
    icon: "Database",
    color: "#FB7185",
    defaultData: { telemetryChannel: "api/trials", encryptPayload: false },
  },
  {
    type: "dataNode",
    label: "Randomize Stimuli",
    category: "randomization",
    description: "Shuffles stimulus queue or counterbalances conditions",
    icon: "Shuffle",
    color: "#818CF8",
    defaultData: { mode: "latin-square", blockCount: 2 },
  },
];

export function NodeLibrary({ onAddNode }: { onAddNode: (template: NodeTypeDefinition) => void }) {
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const categories: { key: NodeCategory; label: string; count: number }[] = [
    { key: "flow", label: "Flow & Control", count: 4 },
    { key: "stimulus", label: "Stimulus Types", count: 3 },
    { key: "timing", label: "Timing & ISI", count: 2 },
    { key: "response", label: "Response Capture", count: 2 },
    { key: "measurement", label: "Measurement & RT", count: 2 },
    { key: "data", label: "Data & Randomization", count: 2 },
  ];

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Play":
        return <Play className="w-3.5 h-3.5" />;
      case "FileText":
        return <FileText className="w-3.5 h-3.5" />;
      case "CheckCircle":
        return <CheckCircle className="w-3.5 h-3.5" />;
      case "Palette":
        return <Palette className="w-3.5 h-3.5" />;
      case "Type":
        return <Type className="w-3.5 h-3.5" />;
      case "Image":
        return <Image className="w-3.5 h-3.5" />;
      case "Clock":
        return <Clock className="w-3.5 h-3.5" />;
      case "Timer":
        return <Timer className="w-3.5 h-3.5" />;
      case "Keyboard":
        return <Keyboard className="w-3.5 h-3.5" />;
      case "MousePointer":
        return <MousePointer className="w-3.5 h-3.5" />;
      case "Database":
        return <Database className="w-3.5 h-3.5" />;
      case "Repeat":
        return <Repeat className="w-3.5 h-3.5" />;
      case "Shuffle":
        return <Shuffle className="w-3.5 h-3.5" />;
      default:
        return <Plus className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="w-64 bg-[#0A0D14] border-r border-white/10 flex flex-col h-full overflow-hidden select-none">
      <div className="p-3 border-b border-white/10">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white font-mono flex items-center justify-between">
          <span>Component Library</span>
          <span className="text-[10px] text-[#697386]">DRAG OR CLICK</span>
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {categories.map((cat) => {
          const isCollapsed = collapsedCategories[cat.key];
          const nodesInCat = AVAILABLE_NODE_TEMPLATES.filter(
            (n) => n.category === cat.key || (cat.key === "data" && n.category === "randomization")
          );

          return (
            <div key={cat.key} className="space-y-1">
              <button
                onClick={() => toggleCategory(cat.key)}
                className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-mono text-[#A5ADBD] hover:text-white rounded hover:bg-white/5 transition-colors"
              >
                <span>{cat.label}</span>
                {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {!isCollapsed && (
                <div className="space-y-1 pl-1">
                  {nodesInCat.map((node) => (
                    <div
                      key={node.label}
                      onClick={() => onAddNode(node)}
                      className="group flex items-start gap-2.5 p-2 rounded-lg bg-[#10141D] hover:bg-[#151A24] border border-white/5 hover:border-white/15 cursor-pointer transition-all duration-150 active:scale-[0.98]"
                      title="Click to add to canvas"
                    >
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center shrink-0 border border-white/10 mt-0.5"
                        style={{ color: node.color, backgroundColor: `${node.color}15` }}
                      >
                        {getIcon(node.icon)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-white group-hover:text-[#4F8CFF] transition-colors truncate">
                          {node.label}
                        </div>
                        <div className="text-[10px] text-[#697386] truncate leading-tight">
                          {node.description}
                        </div>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-[#697386] group-hover:text-white shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
