import React, { memo, useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import {
  MessageSquare, Target, Zap, Search, Database, ArrowRight,
  ChevronDown, ChevronUp, CheckCircle, Loader2
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

const CustomNode = ({ data, id, selected }) => {
  const Icon = iconMap[data.type] || MessageSquare;
  const colors = colorMap[data.type] || colorMap.output;

  const { executingNodes, nodeStatuses, nodes, setNodes } = useWorkflowStore();
  const isExecuting = executingNodes.has(id);
  const status      = nodeStatuses[id];

  // Local config state (synced to node data)
  const [configOpen, setConfigOpen] = useState(data.type === 'input'); // input opens by default
  const [goal, setGoal]             = useState(data.config?.goal || '');

  // Persist config change back to the node in the store
  const updateConfig = useCallback((key, value) => {
    const updated = nodes.map(n =>
      n.id === id
        ? { ...n, data: { ...n.data, config: { ...n.data.config, [key]: value } } }
        : n
    );
    setNodes(updated);
  }, [id, nodes, setNodes]);

  const handleGoalChange = (e) => {
    setGoal(e.target.value);
    updateConfig('goal', e.target.value);
  };

  // Border colour based on status
  const borderClass =
    isExecuting         ? 'border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.3)]' :
    status === 'completed'? 'border-emerald-500' :
    status === 'failed'   ? 'border-red-500' :
    selected              ? 'border-primary-500' :
                            'border-dark-700';

  return (
    <div className={`relative ${isExecuting ? 'animate-pulse' : ''}`}>
      <div className={`w-72 bg-dark-800 rounded-xl border-2 transition-all duration-200 shadow-lg ${borderClass}`}>

        {/* ── Node header ─────────────────────────────────────────── */}
        <div
          className={`flex items-center gap-3 p-4 border-b border-dark-700 rounded-t-xl cursor-pointer select-none`}
          onClick={() => data.type !== 'input' && setConfigOpen(o => !o)}
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

          {/* Status badge */}
          {status === 'completed' && (
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          )}

          {/* Expand toggle (not for input — always expanded) */}
          {data.type !== 'input' && (
            configOpen
              ? <ChevronUp   className="w-4 h-4 text-gray-400 flex-shrink-0" />
              : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )}
        </div>

        {/* ── Description / config body ────────────────────────── */}
        <div className="p-4 space-y-3">
          <p className="text-xs text-gray-400">{descriptions[data.type]}</p>

          {/* INPUT node — always show goal textarea */}
          {data.type === 'input' && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400">Goal</label>
              <textarea
                rows={3}
                placeholder="e.g. Write a research summary on neural networks"
                value={goal}
                onChange={handleGoalChange}
                className="w-full px-3 py-2 text-xs bg-dark-900 border border-dark-700 rounded-lg
                           focus:border-blue-500 focus:outline-none resize-none text-white
                           placeholder:text-gray-600"
                // Prevent ReactFlow drag when typing
                onMouseDown={e => e.stopPropagation()}
              />
              {goal.trim().length > 0 && (
                <p className="text-xs text-blue-400">✓ Goal set — hit Execute in the header</p>
              )}
            </div>
          )}

          {/* CRITIC node config — expandable */}
          {data.type === 'critic' && configOpen && (
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

      {/* ── ReactFlow handles ────────────────────────────────────── */}
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
