import React, { useEffect, useState, useCallback } from 'react';
import { Activity, CheckCircle, Clock, Cpu, RefreshCw } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Dashboard = () => {
  const [stats, setStats]     = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statusRes, historyRes] = await Promise.all([
        fetch(`${API_BASE}/agent/status`),
        fetch(`${API_BASE}/agent/history`),
      ]);
      const statusJson  = await statusRes.json();
      const historyJson = await historyRes.json();

      if (statusJson.success)  setStats(statusJson.stats);
      if (historyJson.success) setHistory(historyJson.data.slice(0, 5)); // last 5
    } catch (err) {
      setError('Cannot connect to backend. Start the backend server first.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const statCards = stats
    ? [
        { label: 'Total Executions',  value: stats.totalExecutions,   icon: Activity,     color: 'text-blue-400' },
        { label: 'Success Rate',       value: `${stats.successRate}%`, icon: CheckCircle,  color: 'text-emerald-400' },
        { label: 'Avg Quality Score',  value: `${stats.avgQualityScore}/100`, icon: Clock, color: 'text-amber-400' },
        { label: 'Memory Entries',     value: stats.memoryEntries,     icon: Cpu,          color: 'text-purple-400' },
      ]
    : [];

  const statusColor = (status) => ({
    success: 'bg-emerald-400',
    refined: 'bg-amber-400',
    failed:  'bg-red-400',
  })[status] || 'bg-blue-400';

  const timeAgo = (iso) => {
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (diff < 60)  return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-400 mt-1">Live overview of your Agentic AI system</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg hover:border-primary-500 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Stats cards */}
      {loading && !stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => (
            <div key={i} className="bg-dark-800 border border-dark-700 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-dark-700 rounded w-3/4 mb-3" />
              <div className="h-8 bg-dark-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <div key={i} className="bg-dark-800 border border-dark-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{s.label}</p>
                  <p className="text-2xl font-bold mt-1">{s.value}</p>
                </div>
                <s.icon className={`w-8 h-8 ${s.color}`} />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Recent executions */}
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
        <h3 className="font-semibold mb-4">Recent Executions</h3>
        {history.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No executions yet. Go to the Workflow Builder, add nodes, and run a goal!
          </p>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-3 bg-dark-900 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${statusColor(item.status)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{item.goal}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Score: {item.qualityScore}/100 · {item.iterationsRan} iteration{item.iterationsRan > 1 ? 's' : ''} · {item.status}
                  </p>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">{timeAgo(item.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
