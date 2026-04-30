import React, { memo, useState, useCallback } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import {
  MessageSquare, Target, Zap, Search, Database, ArrowRight,
  ChevronDown, ChevronUp, CheckCircle, Loader2, FileText
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

const iconMap = {
  input:    MessageSquare,
  planner:  Target,
  executor: Zap,
  critic:   Search,
  memory:   Database,
  output:   ArrowRight,
};

const colorMap = {
  input:    { bg: 'bg-blue-500',   ring: 'ring-blue-500/30',   text: 'text-blue-400'   },
  planner:  { bg: 'bg-amber-500',  ring: 'ring-amber-500/30',  text: 'text-amber-400'  },
  executor: { bg: 'bg-emerald-500',ring: 'ring-emerald-500/30',text: 'text-emerald-400'},
  critic:   { bg: 'bg-red-500',    ring: 'ring-red-500/30',    text: 'text-red-400'    },
  memory:   { bg: 'bg-purple-500', ring: 'ring-purple-500/30', text: 'text-purple-400' },
  output:   { bg: 'bg-gray-500',   ring: 'ring-gray-500/30',   text: 'text-gray-400'   },
};

const descriptions = {
  input:    'Type your high-level goal below, then hit Execute.',
  planner:  'Decomposes the goal into structured, ordered sub-tasks.',
  executor: 'Faithfully executes each sub-task from the plan.',
  critic:   'Reviews output quality and triggers refinement if needed.',
  memory:   'Extracts and stores reusable context across sessions.',
  output:   'Delivers the final refined output to the user.',
};

/** Extract code blocks and return segments for better rendering */
function renderOutput(text) {
  if (!text) return null;
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith('```')) {
      const lines = part.split('\n');
      const lang = lines[0].replace('```', '').trim() || 'code';
      const code = lines.slice(1, lines[lines.length - 1] === '```' ? -1 : undefined).join('\n');
      return (
        <div key={i} className="mt-1 mb-1">
          <div className="flex items-center gap-2 bg-dark-900 px-2 py-0.5 rounded-t border border-dark-600 border-b-0">
            <span className="text-xs text-emerald-400 font-mono font-semibold">{lang}</span>
          </div>
          <pre className="bg-[#0d1117] border border-dark-600 rounded-b px-3 py-2 text-xs text-green-300 font-mono overflow-x-auto whitespace-pre">
            {code}
          </pre>
        </div>
      );
    }
    return part ? (
      <span key={i} className="text-xs text-gray-300 whitespace-pre-wrap">{part}</span>
    ) : null;
  });
}

const CustomNode = ({ data, id, selected }) => {
  const Icon = iconMap[data.type] || MessageSquare;
  const colors = colorMap[data.type] || colorMap.output;

  // Use individual selectors to avoid re-rendering on unrelated store changes.
  const activeNode     = useWorkflowStore((s) => s.activeNode);
  const executingNodes = useWorkflowStore((s) => s.executingNodes);
  const nodeStatuses   = useWorkflowStore((s) => s.nodeStatuses);
  const lastResult     = useWorkflowStore((s) => s.lastResult);
  const { setNodes }   = useReactFlow(); // update ReactFlow local state, not the store directly

  const isExecuting = executingNodes.has(id) || activeNode === data.type || activeNode === id;
  const status      = nodeStatuses[id];

  // Dynamic Glow map based on Agent Type
  const glowMap = {
    planner: 'rgba(245, 158, 11, 0.7)',  // Amber
    executor: 'rgba(16, 185, 129, 0.7)', // Emerald
    critic: 'rgba(239, 68, 68, 0.7)',    // Red
    memory: 'rgba(168, 85, 247, 0.7)',   // Purple
    input: 'rgba(59, 130, 246, 0.7)'     // Blue
  };
  const activeGlow = glowMap[data.type] || 'rgba(107, 114, 128, 0.7)';

  // Local config state
  const [configOpen, setConfigOpen] = useState(data.type === 'input');
  const [showOutput, setShowOutput] = useState(false);
  const [goal, setGoal]             = useState(data.config?.goal || '');

  // Map node type → relevant output from lastResult
  const getNodeOutput = () => {
    if (!lastResult) return null;
    switch (data.type) {
      case 'planner':
        return lastResult.refinedPlan || lastResult.plan;
      case 'executor':
        return lastResult.refinedResult || lastResult.executionResult;
      case 'critic':
        if (!lastResult.critique) return null;
        const c = lastResult.critique;
        return [
          `Score: ${lastResult.qualityScore}/100`,
          `Satisfactory: ${c.isSatisfactory ? 'Yes' : 'No'}`,
          c.issuesFound?.length ? `\nIssues:\n${c.issuesFound.map(i => `• ${i}`).join('\n')}` : '',
          c.strengths?.length   ? `\nStrengths:\n${c.strengths.map(s => `• ${s}`).join('\n')}` : '',
          c.refinementFocus && c.refinementFocus !== 'None' ? `\nRefinement Focus: ${c.refinementFocus}` : '',
        ].filter(Boolean).join('\n');
      case 'memory':
        return lastResult.memoryUpdate && lastResult.memoryUpdate !== 'No memory update.'
          ? lastResult.memoryUpdate
          : 'No new memory entries captured.';
      case 'output':
        return lastResult.refinedResult || lastResult.executionResult;
      default:
        return null;
    }
  };

  const nodeOutput = getNodeOutput();
  const hasOutput  = !!nodeOutput;

  const updateConfig = useCallback((key, value) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, config: { ...n.data.config, [key]: value } } }
          : n
      )
    );
  }, [id, setNodes]);

  const handleGoalChange = (e) => {
    setGoal(e.target.value);
    updateConfig('goal', e.target.value);
  };

  const handleHeaderClick = () => {
    if (data.type === 'input') return;
    if (hasOutput) {
      setShowOutput(o => !o);
    } else {
      setConfigOpen(o => !o);
    }
  };

  const borderClass =
    isExecuting          ? `border-transparent ring-2 ring-white/20` :
    status === 'completed'? 'border-emerald-500' :
    status === 'failed'   ? 'border-red-500' :
    selected              ? 'border-primary-500' :
                            'border-dark-700';

  return (
    <div className={`relative ${isExecuting ? 'animate-pulse' : ''}`}>
      <div 
        className={`w-72 bg-dark-800 rounded-xl border-2 transition-all duration-300 shadow-lg ${borderClass}`}
        style={{
          boxShadow: isExecuting ? `0 0 25px ${activeGlow}, inset 0 0 10px ${activeGlow}` : undefined
        }}
      >

        {/* ── Node header ─────────────────────────────────────── */}
        <div
          className="flex items-center gap-3 p-4 border-b border-dark-700 rounded-t-xl cursor-pointer select-none hover:bg-dark-700/30 transition-colors"
          onClick={handleHeaderClick}
        >
          <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
            {isExecuting
              ? <Loader2 className="w-5 h-5 text-white animate-spin" />
              : <Icon className="w-5 h-5 text-white" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white truncate">{data.label}</h4>
            <p className="text-xs text-gray-400 capitalize">{data.type} Agent</p>
          </div>

          {status === 'completed' && (
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          )}

          {data.type !== 'input' && (
            hasOutput
              ? (showOutput
                  ? <ChevronUp   className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  : <ChevronDown className={`w-4 h-4 flex-shrink-0 ${hasOutput ? 'text-emerald-400' : 'text-gray-400'}`} />
                )
              : (configOpen
                  ? <ChevronUp   className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )
          )}
        </div>

        {/* ── Body ─────────────────────────────────────────────── */}
        <div className="p-4 space-y-3">
          <p className="text-xs text-gray-400">{descriptions[data.type]}</p>

          {/* OUTPUT VIEW — shows agent result when available */}
          {data.type !== 'input' && showOutput && hasOutput && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 mb-1">
                <FileText className="w-3 h-3 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Agent Output</span>
              </div>
              <div className="max-h-48 overflow-y-auto bg-dark-900 rounded-lg p-2 border border-dark-600">
                {renderOutput(nodeOutput)}
              </div>
            </div>
          )}

          {/* CONFIG VIEW — only shown when no output yet, or for input node */}
          {data.type === 'input' && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400">Goal</label>
              <textarea
                rows={3}
                placeholder="e.g. Write a Python function to reverse a linked list"
                value={goal}
                onChange={handleGoalChange}
                className="w-full px-3 py-2 text-xs bg-dark-900 border border-dark-700 rounded-lg
                           focus:border-blue-500 focus:outline-none resize-none text-white
                           placeholder:text-gray-600"
                onMouseDown={e => e.stopPropagation()}
              />
              {goal.trim().length > 0 && (
                <p className="text-xs text-blue-400">✓ Goal set — hit Execute in the header</p>
              )}
            </div>
          )}

          {/* Critic config — only shown when no output */}
          {data.type === 'critic' && !showOutput && configOpen && (
            <div className="space-y-2 pt-1">
              <label className="text-xs font-medium text-gray-400">Quality Threshold</label>
              <select
                className="w-full px-3 py-1.5 text-xs bg-dark-900 border border-dark-700 rounded-lg
                           focus:border-red-500 focus:outline-none text-white"
                defaultValue={data.config?.threshold || '70'}
                onChange={e => updateConfig('threshold', e.target.value)}
                onMouseDown={e => e.stopPropagation()}
              >
                <option value="50">50 — Accept most outputs</option>
                <option value="70">70 — Balanced (default)</option>
                <option value="90">90 — High quality required</option>
              </select>
            </div>
          )}

          {/* Hint when output is available but not shown */}
          {data.type !== 'input' && hasOutput && !showOutput && (
            <p className="text-xs text-emerald-400/70">↑ Click to view agent output</p>
          )}

          {/* Status pill */}
          {status && (
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium
              ${status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : ''}
              ${status === 'failed'    ? 'bg-red-500/20    text-red-400'    : ''}
              ${status === 'running'   ? 'bg-blue-500/20   text-blue-400'   : ''}
            `}>
              <span className={`w-2 h-2 rounded-full
                ${status === 'completed' ? 'bg-emerald-400' : ''}
                ${status === 'failed'    ? 'bg-red-400'    : ''}
                ${status === 'running'   ? 'bg-blue-400 animate-pulse' : ''}
              `} />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
          )}
        </div>
      </div>

      {/* ReactFlow handles */}
      {data.type !== 'input' && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-dark-700 !border-2 !border-primary-500"
        />
      )}
      {data.type !== 'output' && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-dark-700 !border-2 !border-primary-500"
        />
      )}
    </div>
  );
};

export default memo(CustomNode);