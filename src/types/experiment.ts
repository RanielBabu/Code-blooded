export type NodeCategory =
  | "flow"
  | "stimulus"
  | "timing"
  | "response"
  | "measurement"
  | "data"
  | "randomization";

export interface NodeData {
  label: string;
  category: NodeCategory;
  description?: string;
  config: Record<string, any>;
  iconName?: string;
}

export interface ExperimentNode {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: NodeData;
}

export interface ExperimentEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  condition?: string;
  label?: string;
  animated?: boolean;
}

export type ExperimentStatus = "draft" | "published" | "disabled" | "archived";

export interface Experiment {
  id: string;
  name: string;
  description: string;
  status: ExperimentStatus;
  version: number;
  tags: string[];
  trialCount: number;
  nodes: ExperimentNode[];
  edges: ExperimentEdge[];
  createdAt: string;
  updatedAt: string;
  author?: string;
  stats?: {
    participants: number;
    completedTrials: number;
    avgReactionTimeMs: number;
    accuracyPercent: number;
  };
}

export interface NodeTypeDefinition {
  type: string;
  label: string;
  category: NodeCategory;
  description: string;
  defaultData: Record<string, any>;
  icon: string;
  color: string;
}
