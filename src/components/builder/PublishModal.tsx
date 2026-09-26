"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Experiment } from "@/types/experiment";
import { Send, CheckCircle2, ShieldAlert, Sparkles, Layers } from "lucide-react";

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  experiment: Experiment;
  onConfirmPublish: () => Promise<void>;
}

export function PublishModal({
  isOpen,
  onClose,
  experiment,
  onConfirmPublish,
}: PublishModalProps) {
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const handlePublish = async () => {
    try {
      setPublishing(true);
      await onConfirmPublish();
      setPublished(true);
      setTimeout(() => {
        setPublished(false);
        onClose();
      }, 1400);
    } finally {
      setPublishing(false);
    }
  };

  const responseNodesCount = experiment.nodes.filter((n) => n.data.category === "response").length;
  const stimulusNodesCount = experiment.nodes.filter((n) => n.data.category === "stimulus").length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Publish Experiment to Research Registry"
      description="Make this experiment live for participant recruitment and runtime telemetry collection."
      maxWidth="md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={publishing}>
            Cancel
          </Button>
          <Button
            variant="glow"
            size="sm"
            isLoading={publishing}
            onClick={handlePublish}
            disabled={published}
            leftIcon={
              published ? (
                <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
              ) : (
                <Send className="w-4 h-4" />
              )
            }
          >
            {published ? "Published Successfully" : publishing ? "Publishing Pipeline..." : "Confirm & Publish"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Experiment Specs Card */}
        <div className="p-4 rounded-xl bg-[#080B11] border border-white/10 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <span className="text-xs text-[#A5ADBD]">Target Experiment:</span>
            <span className="text-xs font-semibold text-white truncate max-w-[200px]">
              {experiment.name}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-[#10141D] border border-white/5">
              <span className="text-[10px] text-[#697386] font-mono uppercase block">Version</span>
              <span className="text-sm font-bold text-white font-mono">v{experiment.version}.0</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#10141D] border border-white/5">
              <span className="text-[10px] text-[#697386] font-mono uppercase block">Trial Volume</span>
              <span className="text-sm font-bold text-[#4F8CFF] font-mono">
                {experiment.trialCount || 10} Trials
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#10141D] border border-white/5">
              <span className="text-[10px] text-[#697386] font-mono uppercase block">Active Graph Nodes</span>
              <span className="text-sm font-bold text-white font-mono">
                {experiment.nodes.length} Nodes
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#10141D] border border-white/5">
              <span className="text-[10px] text-[#697386] font-mono uppercase block">Response Touchpoints</span>
              <span className="text-sm font-bold text-[#22C55E] font-mono">
                {responseNodesCount} Touchpoints
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-[#60A5FA] flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0 text-[#4F8CFF]" />
          <span>
            Publishing will allocate a live participant session link at{" "}
            <code className="text-white font-mono text-[11px]">/run/{experiment.id}/[sessionId]</code>.
          </span>
        </div>
      </div>
    </Modal>
  );
}
