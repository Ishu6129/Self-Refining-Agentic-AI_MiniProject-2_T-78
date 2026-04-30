import React, { useEffect, useState } from 'react';
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('agentic-ai-user') || '{}');
    const userId = user?.id;

    fetch(`${API_BASE}/admin/logs/${userId}`) // ✅ PARAMS
      .then(r => r.json())
      .then(d => setLogs(d.data));
  }, []);

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>Admin Logs</h1>
      <table className='w-full text-sm'>
        <thead><tr><th>IP</th><th>Route</th><th>Status</th><th>Time</th></tr></thead>
        <tbody>
          {logs.map((l,i)=>(<tr key={i}><td>{l.ip}</td><td>{l.route}</td><td>{l.status}</td><td>{new Date(l.createdAt).toLocaleString()}</td></tr>))}
        </tbody>
      </table>
    </div>
  );
}