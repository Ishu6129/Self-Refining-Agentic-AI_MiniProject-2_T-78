import React, { useState, useEffect, useCallback } from 'react';
import { Search, Database, RefreshCw, Trash2 } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const MemoryViewer = () => {
  const [memoryData, setMemoryData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const fetchMemory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${API_BASE}/agent/memory`);
      const json = await res.json();
      if (json.success) setMemoryData(json.data);
      else throw new Error('Failed to fetch memory');
    } catch (err) {
      setError('Cannot connect to backend. Make sure the server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMemory();
  }, [fetchMemory]);

  const filteredData = memoryData.filter((item) =>
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Parse timestamp from content string "[ISO_TIMESTAMP] memory text"
  const parseEntry = (item) => {
    const match = item.content.match(/^\[([^\]]+)\]\s*([\s\S]*)$/);
    if (match) {
      return { id: item.id, timestamp: match[1], content: match[2].trim() };
    }
    return { id: item.id, timestamp: '—', content: item.content };
  };

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Memory Store</h1>
          <p className="text-gray-400 mt-1">
            Persistent context extracted by the Memory Agent ({memoryData.length} entries)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchMemory}
            className="flex items-center gap-2 px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg hover:border-primary-500 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search memory entries..."
          className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg focus:border-primary-500 focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading memory store...</div>
        ) : filteredData.length === 0 ? (
          <div className="p-8 text-center">
            <Database className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">
              {memoryData.length === 0
                ? 'No memory entries yet. Execute a workflow to populate the memory store.'
                : 'No entries match your search.'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-dark-700/50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-400 w-24">ID</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-400">Memory Content</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-400 w-52">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {filteredData.map((item) => {
                const parsed = parseEntry(item);
                return (
                  <tr key={parsed.id} className="hover:bg-dark-700/30">
                    <td className="px-6 py-4 text-sm font-mono text-gray-400">{parsed.id}</td>
                    <td className="px-6 py-4 text-sm whitespace-pre-wrap">{parsed.content}</td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {parsed.timestamp !== '—'
                        ? new Date(parsed.timestamp).toLocaleString()
                        : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MemoryViewer;
