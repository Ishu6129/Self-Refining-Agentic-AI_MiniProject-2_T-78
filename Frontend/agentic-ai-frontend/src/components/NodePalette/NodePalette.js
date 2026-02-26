import React from 'react';
import { MessageSquare, Target, Zap, Search, Database, ArrowRight } from 'lucide-react';

const nodeTypes = [
  { type: 'input', label: 'Input Goal', icon: MessageSquare, color: 'bg-blue-500', description: 'Accept user goals' },
  { type: 'planner', label: 'Planner', icon: Target, color: 'bg-amber-500', description: 'Decompose tasks' },
  { type: 'executor', label: 'Executor', icon: Zap, color: 'bg-emerald-500', description: 'Execute sub-tasks' },
  { type: 'critic', label: 'Critic', icon: Search, color: 'bg-red-500', description: 'Review outputs' },
  { type: 'memory', label: 'Memory', icon: Database, color: 'bg-purple-500', description: 'Store context' },
  { type: 'output', label: 'Output', icon: ArrowRight, color: 'bg-gray-500', description: 'Final result' }
];

const NodePalette = () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-dark-800 border-r border-dark-700 flex flex-col">
      <div className="p-4 border-b border-dark-700">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400">Node Palette</h3>
      </div>

      <div className="p-4 space-y-3 overflow-y-auto flex-1">
        {nodeTypes.map((node) => (
          <div
            key={node.type}
            draggable
            onDragStart={(e) => onDragStart(e, node.type)}
            className="bg-dark-900 border border-dark-700 rounded-lg p-3 cursor-move hover:border-primary-500 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${node.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <node.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-sm">{node.label}</p>
                <p className="text-xs text-gray-500">{node.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-dark-700">
        <div className="text-xs text-gray-500 space-y-2">
          <p>• Drag nodes to canvas</p>
          <p>• Connect output to input</p>
          <p>• Double-click to configure</p>
        </div>
      </div>
    </div>
  );
};

export default NodePalette;
