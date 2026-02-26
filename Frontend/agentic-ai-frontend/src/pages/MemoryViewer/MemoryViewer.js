import React, { useState } from 'react';
import { Search, Database } from 'lucide-react';

const memoryData = [
  { id: 'mem-001', type: 'Goal', content: 'Research AI advancements', timestamp: '2024-01-15 10:30:00', size: '2.4 KB' },
  { id: 'mem-002', type: 'Plan', content: 'Task decomposition for code review', timestamp: '2024-01-15 10:31:00', size: '5.1 KB' },
  { id: 'mem-003', type: 'Execution', content: 'Sub-task execution results', timestamp: '2024-01-15 10:32:00', size: '12.8 KB' },
];

const MemoryViewer = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = memoryData.filter(item => 
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Memory Store</h1>
          <p className="text-gray-400 mt-1">Persistent storage for execution context</p>
        </div>
      </div>

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

      <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-dark-700/50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-400">ID</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-400">Type</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-400">Content</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-400">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700">
            {filteredData.map((item) => (
              <tr key={item.id} className="hover:bg-dark-700/30">
                <td className="px-6 py-4 text-sm font-mono text-gray-400">{item.id}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-500/20 text-primary-400">
                    {item.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">{item.content}</td>
                <td className="px-6 py-4 text-sm text-gray-400">{item.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemoryViewer;
