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
  /**
   * Per-node-type settings bag.
   *
   * Deliberately `unknown` rather than `any`. Which keys exist depends on which
   * node type authored the config, so it cannot be a closed object type without
   * one interface per node. `unknown` keeps that flexibility while refusing to
   * let an unvalidated value flow into arithmetic unchecked -- a value read from
   * here has to be narrowed at the point of use. This is the same boundary the
   * PROPOSAL describes as a known Phase 1 hardening item.
   */
  config: Record<string, unknown>;
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
    /** Counts are always known, even at zero. */
    participants: number;
    completedTrials: number;
    /**
     * Measurements are null when no admissible trial exists, and must be
     * rendered as a gap. A 0 here would assert an instant response and a
     * wholly incorrect cohort.
     */
    avgReactionTimeMs: number | null;
    accuracyPercent: number | null;
  };
}

export interface NodeTypeDefinition {
  type: string;
  label: string;
  category: NodeCategory;
  description: string;
  defaultData: Record<string, unknown>;
  icon: string;
  color: string;
}
