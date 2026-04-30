import React, { useState, useEffect, useCallback } from 'react';
import { Search, Database, RefreshCw } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const MemoryViewer = () => {
  const [memoryData, setMemoryData]   = useState([]);
  const [searchTerm, setSearchTerm]   = useState('');
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [searchMode, setSearchMode]   = useState(false);

  const fetchMemory = useCallback(async () => {
    setLoading(true);
    setError(null);
    const user = JSON.parse(localStorage.getItem('agentic-ai-user') || '{}');
    const userId = user?.id;
    try {
      const res  = await fetch(`${API_BASE}/agent/memory/${userId}`);
      const json = await res.json();
      if (json.success) setMemoryData(json.data);
      else throw new Error('Failed to fetch memory');
    } catch {
      setError('Cannot connect to backend. Make sure the server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMemory(); }, [fetchMemory]);

  const handleSearch = useCallback(async (term) => {
    if (!term || term.trim().length < 2) {
      setSearchMode(false);
      return;
    }
    setLoading(true);
    setSearchMode(true);
    try {
      const user = JSON.parse(localStorage.getItem('agentic-ai-user') || '{}');
      const userId = user?.id;
      const res  = await fetch(`${API_BASE}/agent/memory/search/${userId}?q=${encodeURIComponent(term)}`);
      const json = await res.json();
      if (json.success) setMemoryData(json.data);
    } catch {
      // silently fall back to local filter on network error
      setSearchMode(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => handleSearch(searchTerm), 400);
    return () => clearTimeout(debounce);
  }, [searchTerm, handleSearch]);

  const handleRefresh = () => {
    setSearchTerm('');
    setSearchMode(false);
    fetchMemory();
  };

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Memory Store</h1>
          <p className="text-gray-400 mt-1">
            {searchMode
              ? `${memoryData.length} results ranked by keyword relevance`
              : `${memoryData.length} atomic facts — deduplicated, injected into planner`}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg hover:border-primary-500 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Search — now hits backend keyword-ranked endpoint */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by keyword (ranked by relevance, same as pipeline retrieval)..."
          className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg focus:border-primary-500 focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading memory store...</div>
        ) : memoryData.length === 0 ? (
          <div className="p-8 text-center">
            <Database className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchMode
                ? 'No facts matched your keywords.'
                : 'No memory entries yet. Execute a workflow to populate the memory store.'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-dark-700/50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-400 w-24">ID</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-400">Memory Fact</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-400">Keywords</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-400 w-44">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {memoryData.map((item) => (
                <tr key={item.id} className="hover:bg-dark-700/30">
                  <td className="px-6 py-4 text-sm font-mono text-gray-400">{item.id}</td>
                  <td className="px-6 py-4 text-sm">{item.content}</td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    <div className="flex flex-wrap gap-1">
                      {(item.keywords || []).slice(0, 5).map(kw => (
                        <span key={kw} className="px-1.5 py-0.5 bg-dark-700 rounded text-gray-300 text-xs">{kw}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {item.timestamp ? new Date(item.timestamp).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Info box explaining the retrieval method */}
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 text-xs text-gray-400 space-y-1">
        <p className="font-medium text-gray-300">How memory retrieval works</p>
        <p>Each execution extracts atomic facts from the memory agent's output and stores them with keyword tags. Duplicate facts (Jaccard similarity &gt; 60%) are skipped.</p>
        <p>When a new goal arrives, the top-5 most keyword-relevant facts are injected into the planner prompt, giving it context from past sessions. The search above uses the same ranking algorithm.</p>
      </div>
    </div>
  );
};

export default MemoryViewer;