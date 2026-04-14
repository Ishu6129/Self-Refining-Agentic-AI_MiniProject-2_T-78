import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Clock, RefreshCw, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const statusConfig = {
  success:  { icon: CheckCircle,   color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Success'  },
  refined:  { icon: AlertTriangle, color: 'text-amber-400',   bg: 'bg-amber-500/20',   label: 'Refined'  },
  failed:   { icon: XCircle,       color: 'text-red-400',     bg: 'bg-red-500/20',     label: 'Failed'   },
};

const timeAgo = (iso) => {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
};

// ── Expandable execution card ─────────────────────────────────────────────────
const ExecutionCard = ({ exec }) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = statusConfig[exec.status] || statusConfig.success;
  const Icon = cfg.icon;

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
      {/* Summary row */}
      <div
        className="flex items-center gap-4 p-5 cursor-pointer hover:bg-dark-700/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
          <Icon className={`w-6 h-6 ${cfg.color}`} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{exec.goal}</p>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <span className="font-mono text-xs">{exec.id}</span>
            <span className={`font-medium text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
              {cfg.label}
            </span>
            <span>Score: <span className="text-white font-semibold">{exec.qualityScore}/100</span></span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {exec.iterationsRan} iteration{exec.iterationsRan > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-gray-500 text-sm">{timeAgo(exec.timestamp)}</span>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-gray-400" />
            : <ChevronDown className="w-4 h-4 text-gray-400" />
          }
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-dark-700 divide-y divide-dark-700/50">
          {/* Critique section */}
          {exec.critique && (
            <div className="p-5 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Critic Evaluation</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-dark-900 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Issues Found</p>
                  {exec.critique.issuesFound?.length
                    ? exec.critique.issuesFound.map((iss, i) => <p key={i} className="text-red-300 text-xs">• {iss}</p>)
                    : <p className="text-gray-600 text-xs">None</p>
                  }
                </div>
                <div className="bg-dark-900 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Strengths</p>
                  {exec.critique.strengths?.length
                    ? exec.critique.strengths.map((s, i) => <p key={i} className="text-emerald-300 text-xs">• {s}</p>)
                    : <p className="text-gray-600 text-xs">None recorded</p>
                  }
                </div>
              </div>
              {exec.critique.refinementFocus && exec.critique.refinementFocus !== 'None' && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-300">
                  <span className="font-semibold">Refinement focus: </span>{exec.critique.refinementFocus}
                </div>
              )}
            </div>
          )}

          {/* Plan */}
          <div className="p-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              {exec.iterationsRan > 1 ? 'Refined Plan' : 'Plan'}
            </h4>
            <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono bg-dark-900 rounded-lg p-3 max-h-40 overflow-y-auto">
              {exec.refinedPlan || exec.plan}
            </pre>
          </div>

          {/* Final Result */}
          <div className="p-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Final Output</h4>
            <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono bg-dark-900 rounded-lg p-3 max-h-48 overflow-y-auto">
              {exec.refinedResult || exec.executionResult}
            </pre>
          </div>

          {/* Memory update */}
          {exec.memoryUpdate && exec.memoryUpdate !== 'No memory update.' && (
            <div className="p-5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Memory Captured</h4>
              <pre className="text-xs text-purple-300 whitespace-pre-wrap font-mono bg-dark-900 rounded-lg p-3 max-h-24 overflow-y-auto">
                {exec.memoryUpdate}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const ExecutionHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${API_BASE}/agent/history`);
      const json = await res.json();
      if (json.success) setHistory(json.data);
      else throw new Error('Failed to load history');
    } catch (err) {
      setError('Cannot reach backend. Make sure the server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Execution History</h1>
          <p className="text-gray-400 mt-1">
            {history.length > 0 ? `${history.length} execution${history.length > 1 ? 's' : ''} recorded` : 'Past workflow runs'}
          </p>
        </div>
        <button
          onClick={fetchHistory}
          className="flex items-center gap-2 px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg hover:border-primary-500 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">⚠️ {error}</div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="bg-dark-800 border border-dark-700 rounded-xl p-5 animate-pulse">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-dark-700 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-dark-700 rounded w-3/4" />
                  <div className="h-3 bg-dark-700 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-16">
          <Clock className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500">No executions yet.</p>
          <p className="text-gray-600 text-sm mt-1">Go to Workflow Builder and run a goal to see history here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((exec) => (
            <ExecutionCard key={exec.id} exec={exec} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExecutionHistory;
