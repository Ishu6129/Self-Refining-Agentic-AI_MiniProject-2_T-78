import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import { useWorkflowStore } from '../../store/workflowStore';

const nodeTypes = { custom: CustomNode };

const WorkflowCanvas = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const { setNodes: setStoreNodes, setEdges: setStoreEdges } = useWorkflowStore();

  const onConnect = useCallback((params) => {
    const newEdge = { 
      ...params, 
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 }
    };
    setEdges((eds) => addEdge(newEdge, eds));
  }, [setEdges]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;

    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const newNode = {
      id: `${type}-${Date.now()}`,
      type: 'custom',
      position,
      data: { 
        type,
        label: type.charAt(0).toUpperCase() + type.slice(1),
        config: {}
      },
    };

    setNodes((nds) => nds.concat(newNode));
  }, [reactFlowInstance, setNodes]);

  React.useEffect(() => {
    setStoreNodes(nodes);
    setStoreEdges(edges);
  }, [nodes, edges, setStoreNodes, setStoreEdges]);

  return (
    <div className="flex-1 h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        attributionPosition="bottom-left"
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#3b82f6', strokeWidth: 2 }
        }}
      >
        <Background color="#334155" gap={20} size={1} variant="dots" />
        <Controls className="bg-dark-800 border-dark-700" />
        <MiniMap 
          className="bg-dark-800 border-dark-700"
          nodeColor={(node) => {
            switch(node.data.type) {
              case 'input': return '#3b82f6';
              case 'planner': return '#f59e0b';
              case 'executor': return '#10b981';
              case 'critic': return '#ef4444';
              case 'memory': return '#8b5cf6';
              default: return '#6b7280';
            }
          }}
          maskColor="rgba(15, 23, 42, 0.8)"
        />
        <Panel position="top-center" className="bg-dark-800 px-4 py-2 rounded-lg border border-dark-700">
          <p className="text-sm text-gray-400">Nodes: {nodes.length} | Connections: {edges.length}</p>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;
