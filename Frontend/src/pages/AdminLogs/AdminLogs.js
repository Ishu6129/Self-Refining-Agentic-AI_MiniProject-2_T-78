import {
  Shield,
  RefreshCw,
  Trash2,
  Clock,
  Globe,
  Activity
} from "lucide-react";
import React, { useEffect, useState } from 'react';
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function AdminLogs() {
  const STATUS_MEANINGS = {
    SUCCESS: "Success",
    ERROR: "Error",
    PENDING: "Pending",
    FAILED: "Failed"
  };
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getStatusMeaning = (code) => {
    return STATUS_MEANINGS[code] || `HTTP ${code} - Standard response`;
  };

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('agentic-ai-token');
      const res = await fetch(`${API_BASE}/admin/logs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const clearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear all audit logs?')) return;
    try {
      const token = localStorage.getItem('agentic-ai-token');
      const res = await fetch(`${API_BASE}/admin/logs`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) fetchLogs();
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('agentic-ai-user') || '{}');
    const userId = user?.id;

    fetch(`${API_BASE}/admin/logs/${userId}`) // ✅ PARAMS
      .then(r => r.json())
      .then(d => setLogs(d.data));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary-500" />
            System Audit Logs
          </h1>
          <p className="text-gray-400 mt-2">Global activity trail and API telemetry</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={fetchLogs}
            className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-all text-sm font-medium border border-dark-600"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={clearLogs}
            className="flex items-center gap-2 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition-all text-sm font-medium border border-red-900/50"
          >
            <Trash2 className="w-4 h-4" />
            Clear Audit Trail
          </button>
        </div>
      </div>

      <div className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-900/50 border-b border-dark-700">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Origin IP</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Method & Route</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Lat.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {logs.length > 0 ? logs.map((log, i) => (
                <tr key={log._id || i} className="hover:bg-dark-700/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm font-mono text-primary-400">
                      <Globe className="w-3.5 h-3.5" />
                      {log.ip}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-purple-400 mb-0.5">{log.method}</span>
                      <span className="text-sm text-gray-300 font-mono truncate max-w-xs">{log.route}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => alert(getStatusMeaning(log.status))}
                      title={getStatusMeaning(log.status)}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold transition-transform active:scale-95 ${
                      log.status.startsWith('2') ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50' :
                      log.status.startsWith('4') ? 'bg-amber-900/30 text-amber-400 border border-amber-800/50' :
                      'bg-red-900/30 text-red-400 border border-red-800/50'
                    }`}>
                      {log.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5 text-xs text-gray-500 font-mono">
                      <Activity className="w-3 h-3" />
                      {log.responseTime}ms
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    {isLoading ? 'Decrypting audit trail...' : 'No logs found in the database.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}