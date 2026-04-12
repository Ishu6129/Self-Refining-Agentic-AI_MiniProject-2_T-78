import React, { useState, useEffect } from 'react';
import { Save, CheckCircle } from 'lucide-react';

const DEFAULT_SETTINGS = {
  apiEndpoint: 'http://localhost:5000',
  executionTimeout: 60,
  maxRetries: 1,
  enableLogs: true,
};

const Settings = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved]       = useState(false);
  const [backendOk, setBackendOk] = useState(null); // null=unchecked, true/false

  // Load saved settings on mount
  useEffect(() => {
    const saved = localStorage.getItem('agentic-ai-settings');
    if (saved) {
      try { setSettings(JSON.parse(saved)); } catch (_) {}
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('agentic-ai-settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const testBackend = async () => {
    setBackendOk(null);
    try {
      const res = await fetch(`${settings.apiEndpoint}/`);
      const json = await res.json();
      setBackendOk(json.status === 'running');
    } catch (_) {
      setBackendOk(false);
    }
  };

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-400 mt-1">Configure system preferences</p>
      </div>

      <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 space-y-5">
        {/* API Endpoint */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Backend API Endpoint</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg focus:border-primary-500 focus:outline-none"
              value={settings.apiEndpoint}
              onChange={(e) => setSettings({ ...settings, apiEndpoint: e.target.value })}
              placeholder="http://localhost:5000"
            />
            <button
              onClick={testBackend}
              className="px-4 py-2 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors text-sm"
            >
              Test
            </button>
          </div>
          {backendOk === true  && <p className="text-emerald-400 text-xs mt-1">✅ Backend is reachable</p>}
          {backendOk === false && <p className="text-red-400 text-xs mt-1">❌ Cannot reach backend. Is it running?</p>}
          <p className="text-gray-600 text-xs mt-1">Default: http://localhost:5000 (backend must be running)</p>
        </div>

        {/* Timeout & Retries */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Execution Timeout (seconds)</label>
            <input
              type="number"
              min={10} max={300}
              className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg focus:border-primary-500 focus:outline-none"
              value={settings.executionTimeout}
              onChange={(e) => setSettings({ ...settings, executionTimeout: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Max Refinement Retries</label>
            <input
              type="number"
              min={0} max={3}
              className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg focus:border-primary-500 focus:outline-none"
              value={settings.maxRetries}
              onChange={(e) => setSettings({ ...settings, maxRetries: parseInt(e.target.value) })}
            />
          </div>
        </div>

        {/* Enable Logs */}
        <div className="flex items-center gap-3">
          <input
            id="enableLogs"
            type="checkbox"
            className="w-4 h-4 accent-primary-500"
            checked={settings.enableLogs}
            onChange={(e) => setSettings({ ...settings, enableLogs: e.target.checked })}
          />
          <label htmlFor="enableLogs" className="text-sm text-gray-300">
            Show execution logs in Workflow Builder
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-primary flex items-center gap-2">
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default Settings;
