"use client";

import React, { useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  Connection,
} from "@xyflow/react";

import { nodeTypes } from "@/lib/reactflow/nodeTypes";

import "@xyflow/react/dist/style.css";

interface WorkflowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
}) => {
  const memoizedNodeTypes = useMemo(() => nodeTypes, []);
  
  const hasNodes = nodes.length > 0;

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={memoizedNodeTypes}
        fitView={false}
        className="w-full h-full"
        minZoom={0.2}
        maxZoom={2}
        panOnScroll={hasNodes}
        panOnScrollSpeed={0.5}
        panOnDrag={hasNodes}
        zoomOnScroll={hasNodes}
        zoomOnPinch={hasNodes}
        zoomOnDoubleClick={hasNodes}
        nodesDraggable={hasNodes}
        nodesConnectable={hasNodes}
        elementsSelectable={hasNodes}
      >
        {hasNodes && <MiniMap />}
        {hasNodes && <Controls />}
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;