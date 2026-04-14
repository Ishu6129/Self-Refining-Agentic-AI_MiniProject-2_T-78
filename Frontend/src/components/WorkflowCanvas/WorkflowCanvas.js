import React, { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import { useWorkflowStore } from '../../store/workflowStore';
import { Sparkles, X } from 'lucide-react';

const nodeTypes = { custom: CustomNode };

// ── Default pipeline layout ───────────────────────────────────────────────────
const DEFAULT_NODES = [
  { id: 'input-1',    type: 'custom', position: { x: 40,  y: 160 }, data: { type: 'input',    label: 'Input Goal', config: { goal: '' } } },
  { id: 'planner-1',  type: 'custom', position: { x: 360, y: 60  }, data: { type: 'planner',  label: 'Planner',    config: {} } },
  { id: 'executor-1', type: 'custom', position: { x: 680, y: 60  }, data: { type: 'executor', label: 'Executor',   config: {} } },
  { id: 'critic-1',   type: 'custom', position: { x: 680, y: 280 }, data: { type: 'critic',   label: 'Critic',     config: { threshold: '70' } } },
  { id: 'memory-1',   type: 'custom', position: { x: 360, y: 280 }, data: { type: 'memory',   label: 'Memory',     config: {} } },
  { id: 'output-1',   type: 'custom', position: { x: 1000,y: 170 }, data: { type: 'output',   label: 'Output',     config: {} } },
];

const DEFAULT_EDGES = [
  { id: 'e1', source: 'input-1',   target: 'planner-1',  animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
  { id: 'e2', source: 'planner-1', target: 'executor-1', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
  { id: 'e3', source: 'executor-1',target: 'critic-1',   animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
  { id: 'e4', source: 'critic-1',  target: 'memory-1',   animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
  { id: 'e5', source: 'memory-1',  target: 'output-1',   animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
  // Refinement loop back arrow
  { id: 'e6', source: 'critic-1',  target: 'planner-1',  animated: true,
    style: { stroke: '#f59e0b', strokeWidth: 1.5, strokeDasharray: '5 5' },
    label: 'refine', labelStyle: { fill: '#f59e0b', fontSize: 10 },
    labelBgStyle: { fill: 'transparent' }
  },
];

// ── Result side panel ─────────────────────────────────────────────────────────
const ResultPanel = ({ result, onClose }) => {
  const [section, setSection] = useState('output'); // 'output' | 'plan' | 'critique'

  if (!result) return null;

  const tabs = [
    { key: 'output',   label: 'Final Output'   },
    { key: 'plan',     label: 'Plan'           },
    { key: 'critique', label: 'Critique'       },
  ];

  return (
    <div className="absolute top-0 right-0 h-full w-96 bg-dark-800 border-l border-dark-700 flex flex-col z-10 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-700">
        <div>
          <h3 className="font-semibold text-sm">Execution Result</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Score: <span className={`font-bold ${result.qualityScore >= 90 ? 'text-emerald-400' : result.qualityScore >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
              {result.qualityScore}/100
            </span>
            &nbsp;·&nbsp;{result.iterationsRan} iteration{result.iterationsRan > 1 ? 's' : ''}
            &nbsp;·&nbsp;<span className="capitalize">{result.status}</span>
          </p>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-dark-700 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-dark-700">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setSection(t.key)}
            className={`flex-1 py-2 text-xs font-medium transition-colors
              ${section === t.key ? 'text-white border-b-2 border-primary-500' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {section === 'output' && (
          <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
            {result.refinedResult || result.executionResult}
          </pre>
        )}
        {section === 'plan' && (
          <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
            {result.refinedPlan || result.plan}
          </pre>
        )}
        {section === 'critique' && result.critique && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Issues</p>
              {result.critique.issuesFound?.length
                ? result.critique.issuesFound.map((iss, i) => (
                    <p key={i} className="text-xs text-red-300 mb-1">• {iss}</p>
                  ))
                : <p className="text-xs text-gray-600">None</p>
              }
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Strengths</p>
              {result.critique.strengths?.map((s, i) => (
                <p key={i} className="text-xs text-emerald-300 mb-1">• {s}</p>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Suggestions</p>
              {result.critique.improvementSuggestions?.map((s, i) => (
                <p key={i} className="text-xs text-amber-300 mb-1">• {s}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Canvas ───────────────────────────────────────────────────────────────
const WorkflowCanvas = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(DEFAULT_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(DEFAULT_EDGES);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const {
    setNodes: setStoreNodes,
    setEdges: setStoreEdges,
    lastResult,
  } = useWorkflowStore();

  // Show result panel when a new result comes in
  useEffect(() => {
    if (lastResult) setShowResult(true);
  }, [lastResult]);

  // Sync nodes/edges to store on every change
  useEffect(() => {
    setStoreNodes(nodes);
    setStoreEdges(edges);
  }, [nodes, edges, setStoreNodes, setStoreEdges]);

  const onConnect = useCallback((params) => {
    setEdges(eds => addEdge({
      ...params,
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
    }, eds));
  }, [setEdges]);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/reactflow');
    if (!type || !reactFlowInstance) return;
    const position = reactFlowInstance.screenToFlowPosition({ x: e.clientX, y: e.clientY });
    setNodes(nds => nds.concat({
      id: `${type}-${Date.now()}`,
      type: 'custom',
      position,
      data: { type, label: type.charAt(0).toUpperCase() + type.slice(1), config: {} },
    }));
  }, [reactFlowInstance, setNodes]);

  const loadDefaultPipeline = () => {
    setNodes(DEFAULT_NODES.map(n => ({ ...n, data: { ...n.data, config: { ...n.data.config } } })));
    setEdges(DEFAULT_EDGES);
  };

  return (
    <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
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
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-left"
        defaultEdgeOptions={{ animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } }}
      >
        <Background color="#1e293b" gap={20} size={1} variant="dots" />
        <Controls className="bg-dark-800 border-dark-700" />
        <MiniMap
          className="bg-dark-800 border-dark-700"
          nodeColor={(n) => ({
            input: '#3b82f6', planner: '#f59e0b', executor: '#10b981',
            critic: '#ef4444', memory: '#8b5cf6', output: '#6b7280',
          })[n.data.type] || '#6b7280'}
          maskColor="rgba(15,23,42,0.8)"
        />

        {/* Top panel */}
        <Panel position="top-center">
          <div className="flex items-center gap-3 bg-dark-800 px-4 py-2 rounded-lg border border-dark-700 shadow-lg">
            <p className="text-sm text-gray-400">Nodes: {nodes.length} · Edges: {edges.length}</p>
            <span className="text-dark-700">|</span>
            <button
              onClick={loadDefaultPipeline}
              className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load Default Pipeline
            </button>
          </div>
        </Panel>
      </ReactFlow>

      {/* Result side panel */}
      {lastResult && showResult && (
        <ResultPanel result={lastResult} onClose={() => setShowResult(false)} />
      )}
    </div>
  );
};

export default WorkflowCanvas;
