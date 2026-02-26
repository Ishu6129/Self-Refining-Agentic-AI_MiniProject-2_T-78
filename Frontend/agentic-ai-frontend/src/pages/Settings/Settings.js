import React, { useState } from 'react';
import { Save } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    apiEndpoint: 'http://localhost:8000/api',
    executionTimeout: 30,
    maxRetries: 3,
    enableLogs: true,
  });

  const handleSave = () => {
    localStorage.setItem('agentic-ai-settings', JSON.stringify(settings));
    alert('Settings saved!');
  };

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-400 mt-1">Configure system preferences</p>
      </div>

      <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">API Endpoint</label>
          <input 
            type="text"
            className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg focus:border-primary-500 focus:outline-none"
            value={settings.apiEndpoint}
            onChange={(e) => setSettings({...settings, apiEndpoint: e.target.value})}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Timeout (seconds)</label>
            <input 
              type="number"
              className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg focus:border-primary-500 focus:outline-none"
              value={settings.executionTimeout}
              onChange={(e) => setSettings({...settings, executionTimeout: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Max Retries</label>
            <input 
              type="number"
              className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg focus:border-primary-500 focus:outline-none"
              value={settings.maxRetries}
              onChange={(e) => setSettings({...settings, maxRetries: parseInt(e.target.value)})}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;
