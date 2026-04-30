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
import { useLocation } from 'react-router-dom';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import { useWorkflowStore } from '../../store/workflowStore';
import { Sparkles} from 'lucide-react';

const nodeTypes = { custom: CustomNode };

// ── Default pipeline layout ───────────────────────────────────────────────────
const getDefaultNodes = (initialGoal = '') => [
  { id: 'input-1',    type: 'custom', position: { x: 40,  y: 160 }, data: { type: 'input',    label: 'Input Goal', config: { goal: initialGoal } } },
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
//{/* Replace your existing ResultPanel inside WorkflowCanvas.js with this FULL corrected version */}

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ResultPanel = ({ result, onClose }) => {
  const [section, setSection] = useState('output');

  if (!result) return null;
  const user = JSON.parse(localStorage.getItem('agentic-ai-user') || '{}');
  const userId = user?.id;

  const tabs = [
    { key: 'output', label: 'Final Output' },
    { key: 'plan', label: 'Plan' },
    { key: 'critique', label: 'Critique' },
  ];

  return (
    <div className="absolute top-0 right-0 h-full w-[420px] bg-dark-800 border-l border-dark-700 flex flex-col z-20 shadow-2xl">

      {/* HEADER */}
      <div className="p-4 border-b border-dark-700">

        <div className="flex items-start justify-between gap-3">

          <div>
            <h3 className="font-semibold text-sm text-white">
              Execution Result
            </h3>

            <p className="text-xs text-gray-400 mt-1">
              Score:
              <span
                className={`ml-1 font-bold ${
                  result.qualityScore >= 90
                    ? 'text-emerald-400'
                    : result.qualityScore >= 70
                    ? 'text-amber-400'
                    : 'text-red-400'
                }`}
              >
                {result.qualityScore}/100
              </span>

              <span className="mx-2">•</span>

              {result.iterationsRan} Iteration
              {result.iterationsRan > 1 ? 's' : ''}

              <span className="mx-2">•</span>

              <span className="capitalize">{result.status}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="px-2 py-1 rounded bg-dark-700 hover:bg-dark-600 text-white text-xs"
          >
            ✕
          </button>
        </div>

        {/* DOWNLOAD BUTTONS */}
        <div className="flex gap-2 mt-4">

          <a
            href={`${API_BASE}/agent/export/pdf/${userId}/${result.id}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 text-center px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-all"
          >
            📄 Download PDF
          </a>

          <a
            href={`${API_BASE}/agent/export/docx/${userId}/${result.id}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 text-center px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all"
          >
            📝 Download DOCX
          </a>

        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-dark-700">

        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSection(tab.key)}
            className={`flex-1 py-3 text-xs font-medium transition-all ${
              section === tab.key
                ? 'text-white border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}

      </div>

      {/* CONTENT */}
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
          <div className="space-y-5">

            <div>
              <p className="text-xs font-semibold text-red-400 uppercase mb-2">
                Issues
              </p>

              {result.critique.issuesFound?.length ? (
                result.critique.issuesFound.map((item, i) => (
                  <p key={i} className="text-xs text-red-300 mb-1">
                    • {item}
                  </p>
                ))
              ) : (
                <p className="text-xs text-gray-500">None</p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-emerald-400 uppercase mb-2">
                Strengths
              </p>

              {result.critique.strengths?.map((item, i) => (
                <p key={i} className="text-xs text-emerald-300 mb-1">
                  • {item}
                </p>
              ))}
            </div>

            <div>
              <p className="text-xs font-semibold text-amber-400 uppercase mb-2">
                Suggestions
              </p>

              {result.critique.improvementSuggestions?.map((item, i) => (
                <p key={i} className="text-xs text-amber-300 mb-1">
                  • {item}
                </p>
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
  const location = useLocation();
  const initialGoal = location.state?.goal || '';
  
  const [nodes, setNodes, onNodesChange] = useNodesState(getDefaultNodes(initialGoal));
  const [edges, setEdges, onEdgesChange] = useEdgesState(DEFAULT_EDGES);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [showResult, setShowResult] = useState(false);

  // Use individual selectors so this component only re-renders when
  // the selected slice changes — not on every store mutation.
  const setStoreNodes = useWorkflowStore((s) => s.setNodes);
  const setStoreEdges = useWorkflowStore((s) => s.setEdges);
  const lastResult    = useWorkflowStore((s) => s.lastResult);
  const executeWorkflow = useWorkflowStore((s) => s.executeWorkflow);
  const isExecuting   = useWorkflowStore((s) => s.isExecuting);

  const hasAttemptedAutoExec = useRef(false);

  // Auto-execute if goal is passed from landing page
  useEffect(() => {
    if (initialGoal && !isExecuting && !lastResult && !hasAttemptedAutoExec.current) {
      hasAttemptedAutoExec.current = true;
      // Small delay to ensure nodes are synced to store
      const timer = setTimeout(() => {
        executeWorkflow();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [initialGoal, executeWorkflow, isExecuting, lastResult]);

  // Show result panel when a new result comes in
  useEffect(() => {
    if (lastResult) setShowResult(true);
  }, [lastResult]);

  // Sync nodes/edges to store on every change
  // NOTE: Zustand setters are stable references, so we intentionally omit them
  // from the dependency array to avoid an infinite update loop.
  useEffect(() => {
    setStoreNodes(nodes);
    setStoreEdges(edges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);

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
    setNodes(getDefaultNodes('').map(n => ({ ...n, data: { ...n.data, config: { ...n.data.config } } })));
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