import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const executions = [
  { id: 'exec-001', workflow: 'Research Assistant', status: 'completed', duration: '2m 30s', time: '2 mins ago' },
  { id: 'exec-002', workflow: 'Code Review', status: 'completed', duration: '1m 45s', time: '5 mins ago' },
  { id: 'exec-003', workflow: 'Data Analysis', status: 'error', duration: '1m 20s', time: '12 mins ago' },
];

const ExecutionHistory = () => {
  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      <div>
        <h1 className="text-2xl font-bold">Execution History</h1>
        <p className="text-gray-400 mt-1">View past workflow executions</p>
      </div>

      <div className="space-y-4">
        {executions.map((exec) => (
          <div key={exec.id} className="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${exec.status === 'completed' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                {exec.status === 'completed' ? <CheckCircle className="w-6 h-6 text-emerald-400" /> : <XCircle className="w-6 h-6 text-red-400" />}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{exec.workflow}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <span>{exec.id}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{exec.duration}</span>
                </div>
              </div>
              <span className="text-gray-500 text-sm">{exec.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExecutionHistory;
