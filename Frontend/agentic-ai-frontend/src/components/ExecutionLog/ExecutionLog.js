import React from 'react';
import { X, ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { format } from 'date-fns';

const ExecutionLog = ({ onClose }) => {
  const { logs, isExecuting, clearLogs } = useWorkflowStore();
  const [isExpanded, setIsExpanded] = React.useState(true);

  const getLogColor = (type) => {
    switch(type) {
      case 'success': return 'text-emerald-400 border-l-emerald-500';
      case 'error': return 'text-red-400 border-l-red-500';
      case 'warning': return 'text-amber-400 border-l-amber-500';
      case 'info': return 'text-blue-400 border-l-blue-500';
      default: return 'text-gray-400 border-l-gray-500';
    }
  };

  return (
    <div className={`bg-dark-800 border-t border-dark-700 transition-all duration-300 ${isExpanded ? 'h-64' : 'h-10'}`}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-dark-700">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-sm">Execution Log</span>
          {isExecuting && (
            <span className="flex items-center gap-2 text-xs text-emerald-400">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Running...
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={clearLogs} className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-dark-700">Clear</button>
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 hover:bg-dark-700 rounded">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button onClick={onClose} className="p-1 hover:bg-dark-700 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="h-[calc(100%-40px)] overflow-y-auto p-4 font-mono text-sm space-y-1">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No execution logs yet. Run a workflow to see logs.</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className={`flex gap-3 py-1 border-l-2 pl-3 ${getLogColor(log.type)}`}>
                <span className="text-gray-500 text-xs shrink-0">{format(new Date(log.timestamp), 'HH:mm:ss')}</span>
                {log.nodeId && <span className="text-purple-400 text-xs shrink-0">[{log.nodeId}]</span>}
                <span className="break-all">{log.message}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ExecutionLog;
