"use client";

import React from "react";
import { Node } from "@xyflow/react";
import { Trash2, Copy, Sparkles, X, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onUpdateNode: (id: string, updatedData: any) => void;
  onDeleteNode: (id: string) => void;
  onDuplicateNode: (id: string) => void;
  onClose: () => void;
}

export function PropertiesPanel({
  selectedNode,
  onUpdateNode,
  onDeleteNode,
  onDuplicateNode,
  onClose,
}: PropertiesPanelProps) {
  if (!selectedNode) {
    return (
      <div className="w-80 bg-[#0A0D14] border-l border-white/10 p-5 flex flex-col items-center justify-center text-center text-[#697386] select-none h-full">
        <Settings2 className="w-8 h-8 mb-2 opacity-40 text-[#4F8CFF]" />
        <p className="text-xs font-medium text-[#A5ADBD]">No Node Selected</p>
        <p className="text-[11px] mt-1 max-w-[180px]">
          Click any node on the experiment canvas to inspect and configure its parameters.
        </p>
      </div>
    );
  }

  const data = selectedNode.data as any;
  const config = data.config || {};

  const handleConfigChange = (key: string, value: any) => {
    onUpdateNode(selectedNode.id, {
      ...data,
      config: {
        ...config,
        [key]: value,
      },
    });
  };

  const handleBasicChange = (field: string, value: string) => {
    onUpdateNode(selectedNode.id, {
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="w-80 bg-[#0A0D14] border-l border-white/10 flex flex-col h-full overflow-hidden select-none">
      {/* Panel Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#4F8CFF]">
            {data.category || "Node"} Inspector
          </span>
          <h3 className="text-sm font-semibold text-white tracking-tight truncate max-w-[200px]">
            {data.label || selectedNode.id}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-[#697386] hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Configuration Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Basic Label */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-[#A5ADBD] uppercase font-mono">
            Node Label
          </label>
          <input
            type="text"
            value={data.label || ""}
            onChange={(e) => handleBasicChange("label", e.target.value)}
            className="w-full bg-[#10141D] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-[#4F8CFF]"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-[#A5ADBD] uppercase font-mono">
            Description
          </label>
          <textarea
            rows={2}
            value={data.description || ""}
            onChange={(e) => handleBasicChange("description", e.target.value)}
            className="w-full bg-[#10141D] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-[#4F8CFF] resize-none"
          />
        </div>

        <div className="border-t border-white/10 pt-3 space-y-3">
          <span className="text-[11px] font-mono text-[#697386] uppercase tracking-wider">
            Telemetry & Execution
          </span>

          {/* Stimulus specific config */}
          {data.category === "stimulus" && (
            <>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-[#A5ADBD]">Display Duration (ms)</label>
                <input
                  type="number"
                  value={config.displayDurationMs || 1000}
                  onChange={(e) => handleConfigChange("displayDurationMs", parseInt(e.target.value) || 0)}
                  className="w-full bg-[#10141D] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-[#4F8CFF]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-[#A5ADBD]">Stimulus Category</label>
                <select
                  value={config.stimulusType || "color"}
                  onChange={(e) => handleConfigChange("stimulusType", e.target.value)}
                  className="w-full bg-[#10141D] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-[#4F8CFF]"
                >
                  <option value="color">Color Discrim (Stroop)</option>
                  <option value="text">Lexical Text Read</option>
                  <option value="image">Visual Image Target</option>
                  <option value="mixed">Mixed Multimodal</option>
                </select>
              </div>
            </>
          )}

          {/* Timing specific config */}
          {data.category === "timing" && (
            <>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-[#A5ADBD]">Interval Duration (ms)</label>
                <input
                  type="number"
                  value={config.durationMs || 500}
                  onChange={(e) => handleConfigChange("durationMs", parseInt(e.target.value) || 0)}
                  className="w-full bg-[#10141D] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-[#4F8CFF]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-[#A5ADBD]">Random Jitter (ms)</label>
                <input
                  type="number"
                  value={config.jitterMs || 100}
                  onChange={(e) => handleConfigChange("jitterMs", parseInt(e.target.value) || 0)}
                  className="w-full bg-[#10141D] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-[#4F8CFF]"
                />
              </div>
            </>
          )}

          {/* Response specific config */}
          {data.category === "response" && (
            <>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-[#A5ADBD]">Permitted Response Keys</label>
                <input
                  type="text"
                  value={Array.isArray(config.keys) ? config.keys.join(", ") : "1, 2, 3, 4"}
                  onChange={(e) =>
                    handleConfigChange(
                      "keys",
                      e.target.value.split(",").map((s) => s.trim())
                    )
                  }
                  className="w-full bg-[#10141D] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-[#4F8CFF]"
                />
                <span className="text-[10px] text-[#697386]">Comma-separated key triggers</span>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-[#A5ADBD]">Timeout Limit (ms)</label>
                <input
                  type="number"
                  value={config.timeoutMs || 2500}
                  onChange={(e) => handleConfigChange("timeoutMs", parseInt(e.target.value) || 0)}
                  className="w-full bg-[#10141D] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-[#4F8CFF]"
                />
              </div>
            </>
          )}

          {/* Loop / Flow trial counts */}
          {(data.label === "Trial Loop" || data.label === "Next Trial Loop") && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-[#A5ADBD]">Total Target Trials</label>
              <input
                type="number"
                min={1}
                max={100}
                value={config.totalTrials || 10}
                onChange={(e) => handleConfigChange("totalTrials", parseInt(e.target.value) || 10)}
                className="w-full bg-[#10141D] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-[#4F8CFF]"
              />
            </div>
          )}

          {/* Node ID indicator */}
          <div className="p-2 rounded bg-black/30 border border-white/5 font-mono text-[10px] text-[#697386]">
            Node ID: {selectedNode.id}
          </div>
        </div>
      </div>

      {/* Actions (Delete, Duplicate) */}
      <div className="p-3 border-t border-white/10 flex items-center gap-2 bg-[#080A10]">
        <Button
          onClick={() => onDuplicateNode(selectedNode.id)}
          variant="secondary"
          size="sm"
          className="flex-1"
          leftIcon={<Copy className="w-3.5 h-3.5" />}
        >
          Duplicate
        </Button>
        <Button
          onClick={() => onDeleteNode(selectedNode.id)}
          variant="danger"
          size="sm"
          className="flex-1"
          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
