"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Copy, Download, Check, AlertTriangle, ShieldCheck } from "lucide-react";
import { downloadJsonFile } from "@/lib/utils";
import { ExperimentSchema } from "@/schemas/experiment.schema";

interface JsonViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  experimentData: any;
}

export function JsonViewerModal({ isOpen, onClose, experimentData }: JsonViewerModalProps) {
  const [copied, setCopied] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors?: string[];
  } | null>(null);

  const jsonString = JSON.stringify(experimentData, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadJsonFile(`${experimentData.name?.toLowerCase().replace(/\s+/g, "_") || "experiment"}.json`, experimentData);
  };

  const handleValidate = () => {
    const result = ExperimentSchema.safeParse(experimentData);
    if (result.success) {
      setValidationResult({ valid: true });
    } else {
      const errMsgs = result.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`);
      setValidationResult({ valid: false, errors: errMsgs });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Structured Experiment Definition"
      description="Inspect, copy, export, and validate the underlying JSON schema for this experiment."
      maxWidth="2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleValidate}
              variant="secondary"
              size="sm"
              leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-[#22D3EE]" />}
            >
              Validate Schema
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleCopy}
              variant="secondary"
              size="sm"
              leftIcon={copied ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? "Copied" : "Copy JSON"}
            </Button>
            <Button
              onClick={handleDownload}
              variant="primary"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Download JSON
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        {/* Validation Result Banner */}
        {validationResult && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
              validationResult.valid
                ? "bg-[#22C55E]/10 border-[#22C55E]/30 text-[#4ADE80]"
                : "bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]"
            }`}
          >
            {validationResult.valid ? (
              <>
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#22C55E] mt-0.5" />
                <div>
                  <p className="font-semibold">Valid CognitiveLab Experiment Definition</p>
                  <p className="text-[11px] text-[#A5ADBD] mt-0.5">
                    Conforms with strict runtime schema; ready for participant deployment.
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#EF4444] mt-0.5" />
                <div>
                  <p className="font-semibold">Validation Errors Detected</p>
                  <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px]">
                    {validationResult.errors?.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        )}

        {/* JSON Display */}
        <div className="relative rounded-lg bg-[#07090E] border border-white/10 p-4 overflow-x-auto max-h-[380px]">
          <pre className="text-[11px] font-mono text-[#A5ADBD] leading-relaxed selection:bg-[#4F8CFF]/30">
            <code>{jsonString}</code>
          </pre>
        </div>
      </div>
    </Modal>
  );
}
