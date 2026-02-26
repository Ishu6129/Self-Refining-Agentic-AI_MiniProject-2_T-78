import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { MessageSquare, Target, Zap, Search, Database, ArrowRight, MoreVertical } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

const iconMap = {
  input: MessageSquare,
  planner: Target,
  executor: Zap,
  critic: Search,
  memory: Database,
  output: ArrowRight
};

const colorMap = {
  input: 'bg-blue-500',
  planner: 'bg-amber-500',
  executor: 'bg-emerald-500',
  critic: 'bg-red-500',
  memory: 'bg-purple-500',
  output: 'bg-gray-500'
};

const CustomNode = ({ data, id, selected }) => {
  const Icon = iconMap[data.type] || MessageSquare;
  const colorClass = colorMap[data.type] || 'bg-gray-500';
  const { executingNodes, nodeStatuses } = useWorkflowStore();
  const isExecuting = executingNodes.has(id);
  const status = nodeStatuses[id];

  return (
    <div className={`relative ${isExecuting ? 'animate-pulse' : ''}`}>
      <div className={`
        w-64 bg-dark-800 rounded-xl border-2 transition-all duration-200 shadow-lg
        ${selected ? 'border-primary-500' : 'border-dark-700'}
        ${isExecuting ? 'border-emerald-500' : ''}
        ${status === 'completed' ? 'border-emerald-500' : ''}
        ${status === 'error' ? 'border-red-500' : ''}
      `}>
        <div className={`flex items-center gap-3 p-4 border-b border-dark-700 rounded-t-xl ${colorClass} bg-opacity-10`}>
          <div className={`w-10 h-10 ${colorClass} rounded-lg flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white truncate">{data.label}</h4>
            <p className="text-xs text-gray-400 capitalize">{data.type} Node</p>
          </div>
          <button className="p-1 hover:bg-dark-700 rounded transition-colors">
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="text-sm text-gray-400">
            {data.type === 'input' && 'Accepts high-level abstract goals'}
            {data.type === 'planner' && 'Decomposes goals into sub-tasks'}
            {data.type === 'executor' && 'Executes planned sub-tasks'}
            {data.type === 'critic' && 'Reviews and evaluates outputs'}
            {data.type === 'memory' && 'Stores execution context'}
            {data.type === 'output' && 'Produces refined final output'}
          </div>

          {status && (
            <div className={`
              inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium
              ${status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : ''}
              ${status === 'error' ? 'bg-red-500/20 text-red-400' : ''}
              ${status === 'running' ? 'bg-blue-500/20 text-blue-400' : ''}
            `}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${status === 'completed' ? 'bg-emerald-400' : status === 'error' ? 'bg-red-400' : 'bg-blue-400'}`} />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
          )}
        </div>
      </div>

      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-dark-700 !border-2 !border-primary-500" />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-dark-700 !border-2 !border-primary-500" />
    </div>
  );
};

export default memo(CustomNode);
