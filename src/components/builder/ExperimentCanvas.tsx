"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  reconnectEdge,
  Connection,
  ConnectionLineType,
  BezierEdge,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
} from "@xyflow/react";
import {
  FlowNode,
  StimulusNode,
  TimingNode,
  ResponseNode,
  MeasurementNode,
  DataNode,
} from "./CustomNodes";
import { NodeLibrary } from "./NodeLibrary";
import { PropertiesPanel } from "./PropertiesPanel";
import { JsonViewerModal } from "./JsonViewerModal";
import { PublishModal } from "./PublishModal";
import { Experiment, NodeTypeDefinition } from "@/types/experiment";
import { Button } from "@/components/ui/Button";
import {
  Eye,
  Send,
  Code2,
  Check,
  Undo2,
  Redo2,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  Save,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";

const nodeTypes = {
  flowNode: FlowNode,
  stimulusNode: StimulusNode,
  timingNode: TimingNode,
  responseNode: ResponseNode,
  measurementNode: MeasurementNode,
  dataNode: DataNode,
};

const edgeTypes = {
  default: BezierEdge,
  bezier: BezierEdge,
};

interface ExperimentCanvasProps {
  initialExperiment: Experiment;
  onSave?: (exp: Experiment) => Promise<Experiment>;
  onPublish?: (id: string) => Promise<Experiment | null>;
}

export function ExperimentCanvas({
  initialExperiment,
  onSave,
  onPublish,
}: ExperimentCanvasProps) {
  const [experiment, setExperiment] = useState<Experiment>(initialExperiment);
  const [nodes, setNodes] = useState<Node[]>(initialExperiment.nodes as unknown as Node[]);
  const [edges, setEdges] = useState<Edge[]>(() => {
    const raw = (initialExperiment.edges as unknown as Edge[]) || [];
    return raw.map((e) => ({
      ...e,
      type: "default",
      animated: true,
      style: {
        stroke: "#FFFFFF",
        strokeWidth: 3,
        filter: "drop-shadow(0 0 8px rgba(255,255,255,0.75))",
        ...e.style,
      },
    }));
  });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Undo/Redo stacks
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Status transitions: "saved" | "saving" | "unsaved"
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");

  // Modals
  const [isJsonOpen, setIsJsonOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);

  const { success, error: toastError } = useToast();
  const router = useRouter();

  // Push history state
  const pushHistory = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), { nodes: newNodes, edges: newEdges }]);
    setHistoryIndex((prev) => prev + 1);
    setSaveStatus("unsaved");
  }, [historyIndex]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        const next = applyNodeChanges(changes, nds);
        return next;
      });
      setSaveStatus("unsaved");
    },
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => {
        const next = applyEdgeChanges(changes, eds);
        return next;
      });
      setSaveStatus("unsaved");
    },
    []
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => {
        const newEdges = addEdge(
          {
            ...connection,
            type: "default",
            animated: true,
            style: {
              stroke: "#FFFFFF",
              strokeWidth: 3,
              filter: "drop-shadow(0 0 10px rgba(255,255,255,0.85))",
            },
          },
          eds
        );
        pushHistory(nodes, newEdges);
        return newEdges;
      });
    },
    [nodes, pushHistory]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // Add new node from library
  const handleAddNode = (template: NodeTypeDefinition) => {
    const id = `node-${template.category}-${Date.now().toString().slice(-4)}`;
    const newNode: Node = {
      id,
      type: template.type,
      position: {
        x: 350 + Math.random() * 80,
        y: 180 + Math.random() * 80,
      },
      data: {
        label: template.label,
        category: template.category,
        description: template.description,
        iconName: template.icon,
        config: { ...template.defaultData },
      },
    };

    const nextNodes = [...nodes, newNode];
    setNodes(nextNodes);
    setSelectedNodeId(id);
    pushHistory(nextNodes, edges);
    success("Node Added", `Added ${template.label} to canvas.`);
  };

  // Node Inspector updates
  const handleUpdateNode = (id: string, updatedData: any) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) {
          return { ...n, data: updatedData };
        }
        return n;
      })
    );
    setSaveStatus("unsaved");
  };

  const handleDeleteNode = (id: string) => {
    const nextNodes = nodes.filter((n) => n.id !== id);
    const nextEdges = edges.filter((e) => e.source !== id && e.target !== id);
    setNodes(nextNodes);
    setEdges(nextEdges);
    setSelectedNodeId(null);
    pushHistory(nextNodes, nextEdges);
    success("Node Removed", "Node and associated links deleted.");
  };

  const handleDuplicateNode = (id: string) => {
    const target = nodes.find((n) => n.id === id);
    if (!target) return;
    const newId = `${target.id}-copy-${Date.now().toString().slice(-3)}`;
    const duplicated: Node = {
      ...target,
      id: newId,
      position: {
        x: target.position.x + 40,
        y: target.position.y + 40,
      },
    };
    const nextNodes = [...nodes, duplicated];
    setNodes(nextNodes);
    setSelectedNodeId(newId);
    pushHistory(nextNodes, edges);
    success("Node Duplicated", `Cloned ${target.data.label}`);
  };

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const targetState = history[historyIndex - 1];
      setNodes(targetState.nodes);
      setEdges(targetState.edges);
      setHistoryIndex((prev) => prev - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const targetState = history[historyIndex + 1];
      setNodes(targetState.nodes);
      setEdges(targetState.edges);
      setHistoryIndex((prev) => prev + 1);
    }
  };

  // Validation
  const validateGraph = () => {
    const hasStart = nodes.some(
      (n) => (n.data.label as string)?.toLowerCase().includes("start") || n.id.includes("start")
    );
    const hasEnd = nodes.some(
      (n) => (n.data.label as string)?.toLowerCase().includes("complete") || (n.data.label as string)?.toLowerCase().includes("end") || n.id.includes("end")
    );
    const hasStimulus = nodes.some((n) => n.data.category === "stimulus");
    const hasResponse = nodes.some((n) => n.data.category === "response");

    if (!hasStart) {
      setValidationWarning("Validation warning: Experiment requires a designated Start node.");
      return false;
    }
    if (!hasStimulus) {
      setValidationWarning("Validation warning: At least one Stimulus presentation node must be configured.");
      return false;
    }
    if (!hasResponse) {
      setValidationWarning("Validation warning: No Response capture node found in the flow.");
      return false;
    }
    if (!hasEnd) {
      setValidationWarning("Validation warning: Flow should terminate with an Experiment Complete node.");
      return false;
    }

    setValidationWarning(null);
    return true;
  };

  // Save experiment
  const handleSave = async () => {
    try {
      setSaveStatus("saving");
      const updated: Experiment = {
        ...experiment,
        nodes: nodes as any,
        edges: edges as any,
        updatedAt: new Date().toISOString(),
      };
      if (onSave) {
        await onSave(updated);
      }
      setExperiment(updated);
      setSaveStatus("saved");
      success("Experiment Saved", `Changes to ${updated.name} saved.`);
    } catch (e: any) {
      setSaveStatus("unsaved");
      toastError("Save Failed", e?.message || "Could not save experiment.");
    }
  };

  // Publish experiment
  const handlePublish = async () => {
    if (onPublish) {
      await onPublish(experiment.id);
    }
    setExperiment((prev) => ({ ...prev, status: "published" }));
    success("Experiment Published", "Live participant sessions are now accepting trials.");
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  return (
    <div className="flex flex-col h-screen w-full bg-[#05060A] text-white overflow-hidden">
      {/* Builder Top Bar */}
      <div className="h-14 bg-[#0A0D14] border-b border-white/10 px-4 flex items-center justify-between z-20 shrink-0">
        {/* Left: Back & Experiment Title */}
        <div className="flex items-center gap-3">
          <Link
            href="/experiments"
            className="p-1.5 rounded-lg text-[#A5ADBD] hover:text-white hover:bg-white/5 transition-colors"
            title="Back to Experiments"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={experiment.name}
                onChange={(e) => {
                  setExperiment((prev) => ({ ...prev, name: e.target.value }));
                  setSaveStatus("unsaved");
                }}
                className="text-sm font-bold text-white bg-transparent border-b border-transparent hover:border-white/20 focus:border-[#4F8CFF] focus:outline-none px-1 tracking-tight"
              />
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/15 text-[#A5ADBD] uppercase">
                {experiment.status}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Save state indicator & Undo/Redo */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-[#A5ADBD]">
            {saveStatus === "saving" && (
              <span className="flex items-center gap-1 text-[#F59E0B] font-mono text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-ping" />
                Saving...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="flex items-center gap-1 text-[#22C55E] font-mono text-[11px]">
                <Check className="w-3.5 h-3.5" />
                Saved
              </span>
            )}
            {saveStatus === "unsaved" && (
              <span className="flex items-center gap-1 text-[#697386] font-mono text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A5ADBD]" />
                Unsaved changes
              </span>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-1 border-l border-white/10 pl-3">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 rounded hover:bg-white/5 text-[#A5ADBD] hover:text-white disabled:opacity-30 transition-colors"
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded hover:bg-white/5 text-[#A5ADBD] hover:text-white disabled:opacity-30 transition-colors"
              title="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Actions (Save, View JSON, Preview, Publish) */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsJsonOpen(true)}
            leftIcon={<Code2 className="w-3.5 h-3.5 text-[#22D3EE]" />}
          >
            View JSON
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleSave}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            Save
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                setSaveStatus("saving");
                const updated: Experiment = {
                  ...experiment,
                  nodes: nodes as any,
                  edges: edges as any,
                  updatedAt: new Date().toISOString(),
                };
                if (onSave) {
                  await onSave(updated);
                }
                setExperiment(updated);
                setSaveStatus("saved");
              } catch (err) {
                console.error("Auto-save before preview", err);
              }
              router.push(`/preview/${experiment.id}`);
            }}
            leftIcon={<Eye className="w-3.5 h-3.5 text-[#4F8CFF]" />}
          >
            Preview
          </Button>

          <Button
            variant="glow"
            size="sm"
            onClick={() => {
              if (validateGraph()) {
                setIsPublishOpen(true);
              } else {
                toastError("Validation Error", "Please resolve graph structure warnings before publishing.");
              }
            }}
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Publish
          </Button>
        </div>
      </div>

      {/* Validation alert banner if graph incomplete */}
      {validationWarning && (
        <div className="bg-[#EF4444]/15 border-b border-[#EF4444]/30 px-4 py-2 text-xs text-[#EF4444] flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationWarning}</span>
          </div>
          <button
            onClick={() => setValidationWarning(null)}
            className="text-xs hover:underline uppercase font-mono"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Builder Workspace: Library + Canvas + Properties */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Palette */}
        <NodeLibrary onAddNode={handleAddNode} />

        {/* Center Canvas */}
        <div className="flex-1 h-full relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
            connectionLineType={ConnectionLineType.Bezier}
            connectionLineStyle={{
              stroke: "#FFFFFF",
              strokeWidth: 3,
              strokeDasharray: "5 5",
              filter: "drop-shadow(0 0 10px rgba(255,255,255,0.9))",
            }}
            defaultEdgeOptions={{
              type: "default",
              animated: true,
              style: {
                stroke: "#FFFFFF",
                strokeWidth: 3,
                filter: "drop-shadow(0 0 8px rgba(255,255,255,0.75))",
              },
            }}
          >
            <Background color="#1A212E" gap={20} size={1} />
            <Controls />
            <MiniMap
              nodeStrokeColor="#4F8CFF"
              nodeColor="#151A24"
              maskColor="rgba(5, 6, 10, 0.75)"
            />
          </ReactFlow>
        </div>

        {/* Right Inspector */}
        <PropertiesPanel
          selectedNode={selectedNode}
          onUpdateNode={handleUpdateNode}
          onDeleteNode={handleDeleteNode}
          onDuplicateNode={handleDuplicateNode}
          onClose={() => setSelectedNodeId(null)}
        />
      </div>

      {/* JSON Viewer Modal */}
      <JsonViewerModal
        isOpen={isJsonOpen}
        onClose={() => setIsJsonOpen(false)}
        experimentData={{
          ...experiment,
          nodes,
          edges,
        }}
      />

      {/* Publish Confirmation Modal */}
      <PublishModal
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        experiment={{
          ...experiment,
          nodes: nodes as any,
          edges: edges as any,
        }}
        onConfirmPublish={handlePublish}
      />
    </div>
  );
}
