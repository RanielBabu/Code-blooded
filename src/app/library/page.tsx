"use client";

import React from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  BookOpen,
  FlaskConical,
  Play,
  ArrowRight,
  Clock,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";

interface ExperimentTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  trialCount: number;
  durationEst: string;
  tags: string[];
  complexity: "Basic" | "Intermediate" | "Advanced";
}

const TEMPLATES: ExperimentTemplate[] = [
  {
    id: "tmpl-color-response",
    name: "Color Response Study",
    category: "Visual Psychophysics",
    description: "Standardized 10-trial chromatic identification test measuring latency under congruent and incongruent color-word Stroop interference.",
    trialCount: 10,
    durationEst: "2 mins",
    tags: ["Stroop Effect", "Reaction Time", "Inhibition"],
    complexity: "Basic",
  },
  {
    id: "tmpl-stroop-semantic",
    name: "Stroop Semantic Interference",
    category: "Executive Function",
    description: "Evaluates automated lexical access competition against voluntary color discrimination with balanced counterbalancing.",
    trialCount: 20,
    durationEst: "4 mins",
    tags: ["Cognitive Control", "Interference", "Semantics"],
    complexity: "Intermediate",
  },
  {
    id: "tmpl-visual-search",
    name: "Feature vs Conjunction Visual Search",
    category: "Attention & Perception",
    description: "Measures parallel pre-attentive target detection against serial focal conjunction scanning across distractor set sizes.",
    trialCount: 15,
    durationEst: "3.5 mins",
    tags: ["Treisman Paradigm", "Pop-out Effect", "Visual Search"],
    complexity: "Advanced",
  },
  {
    id: "tmpl-rsvp",
    name: "Rapid Serial Visual Presentation (RSVP)",
    category: "Temporal Cognition",
    description: "Evaluates attentional blink and temporal resolution limits during rapid successive alphanumeric stream presentation.",
    trialCount: 12,
    durationEst: "2.5 mins",
    tags: ["Attentional Blink", "Temporal Perception"],
    complexity: "Advanced",
  },
  {
    id: "tmpl-choice-reaction",
    name: "Multi-Choice Motor Latency Benchmark",
    category: "Motor Control",
    description: "Pure perceptual-motor reaction time comparison demonstrating Hick-Hyman logarithmic latency scaling across 2, 4, and 8 choices.",
    trialCount: 25,
    durationEst: "5 mins",
    tags: ["Hick's Law", "Motor Execution", "Baseline"],
    complexity: "Basic",
  },
  {
    id: "tmpl-flanker",
    name: "Eriksen Flanker Task",
    category: "Cognitive Control",
    description: "Assesses directional response conflict when central arrow targets are flanked by congruent or incongruent distractors.",
    trialCount: 16,
    durationEst: "3 mins",
    tags: ["Response Conflict", "Flanker", "Attention"],
    complexity: "Intermediate",
  },
];

export default function LibraryPage() {
  return (
    <DashboardLayout
      title="Research Experiment Library"
      subtitle="Peer-reviewed cognitive paradigm templates ready to clone and deploy"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {TEMPLATES.map((tmpl) => (
          <GlassPanel
            key={tmpl.id}
            className="p-6 flex flex-col justify-between hover:border-white/20 transition-all group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="blue" size="sm">
                  {tmpl.category}
                </Badge>
                <span className="text-[10px] font-mono text-[#697386]">
                  {tmpl.complexity}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white tracking-tight group-hover:text-[#4F8CFF] transition-colors">
                  {tmpl.name}
                </h3>
                <p className="text-xs text-[#A5ADBD] mt-1 leading-relaxed">
                  {tmpl.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {tmpl.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#A5ADBD] border border-white/5"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              <div className="pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-xs font-mono text-[#A5ADBD]">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#697386]" />
                  <span>{tmpl.trialCount} Trials</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#697386]" />
                  <span>~{tmpl.durationEst}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 flex items-center gap-2">
              <Link href="/builder" className="flex-1">
                <Button variant="glow" size="sm" className="w-full" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Clone into Builder
                </Button>
              </Link>
              <Link href="/preview/exp-color-response">
                <Button variant="outline" size="sm" title="Preview Template">
                  <Play className="w-3.5 h-3.5 fill-current" />
                </Button>
              </Link>
            </div>
          </GlassPanel>
        ))}
      </div>
    </DashboardLayout>
  );
}
