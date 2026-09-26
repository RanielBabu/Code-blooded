import { z } from "zod";

export const ExperimentNodeSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.object({
    label: z.string(),
    category: z.enum([
      "flow",
      "stimulus",
      "timing",
      "response",
      "measurement",
      "data",
      "randomization",
    ]),
    description: z.string().optional(),
    config: z.record(z.string(), z.any()),
    iconName: z.string().optional(),
  }),
});

export const ExperimentEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().nullable().optional(),
  targetHandle: z.string().nullable().optional(),
  condition: z.string().optional(),
  label: z.string().optional(),
  animated: z.boolean().optional(),
});

export const ExperimentSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Experiment name is required"),
  description: z.string().default(""),
  status: z.enum(["draft", "published", "archived"]),
  version: z.number().int().positive(),
  tags: z.array(z.string()).default([]),
  trialCount: z.number().int().nonnegative().default(10),
  nodes: z.array(ExperimentNodeSchema),
  edges: z.array(ExperimentEdgeSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
  author: z.string().optional(),
});

export const TrialResultSchema = z.object({
  id: z.string(),
  participantId: z.string(),
  experimentId: z.string(),
  trialNumber: z.number().int().positive(),
  stimulusType: z.enum(["text", "color", "image", "mixed"]),
  stimulus: z.object({
    prompt: z.string().optional(),
    text: z.string().optional(),
    color: z.string().optional(),
    imageUrl: z.string().optional(),
    targetRule: z.string().optional(),
    congruent: z.boolean().optional(),
  }),
  response: z.object({
    selectedAnswer: z.string(),
    inputMethod: z.enum(["keyboard", "button", "mouse"]),
  }),
  correct: z.boolean(),
  reactionTimeMs: z.number().nonnegative(),
  startedAt: z.string(),
  respondedAt: z.string(),
});

export type ValidatedExperiment = z.infer<typeof ExperimentSchema>;
export type ValidatedTrialResult = z.infer<typeof TrialResultSchema>;
