import React from 'react';
import { Activity, CheckCircle, Clock, Cpu } from 'lucide-react';

const stats = [
  { label: 'Total Executions', value: '1,234', icon: Activity, color: 'text-blue-400' },
  { label: 'Success Rate', value: '94.2%', icon: CheckCircle, color: 'text-emerald-400' },
  { label: 'Avg Duration', value: '2.4s', icon: Clock, color: 'text-amber-400' },
  { label: 'Active Workflows', value: '12', icon: Cpu, color: 'text-purple-400' },
];

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-400 mt-1">Overview of your Agentic AI system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
        <h3 className="font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { text: 'Workflow "Research Assistant" executed successfully', time: '2 mins ago', type: 'success' },
            { text: 'New goal submitted: "Analyze Q4 data"', time: '5 mins ago', type: 'info' },
            { text: 'Self-refinement loop triggered', time: '12 mins ago', type: 'warning' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-dark-900 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${item.type === 'success' ? 'bg-emerald-400' : item.type === 'warning' ? 'bg-amber-400' : 'bg-blue-400'}`} />
              <span className="flex-1">{item.text}</span>
              <span className="text-sm text-gray-500">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
