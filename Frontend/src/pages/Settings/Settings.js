import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, Key, ToggleLeft, ToggleRight, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const DEFAULT_SETTINGS = {
  apiEndpoint: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  executionTimeout: 60,
  maxRetries: 1,
  enableLogs: true,
};

// ─── Groq API Key storage helpers (localStorage) ──────────────────────────────
const GROQ_KEY_STORAGE = 'agentic-ai-groq-key';
const GROQ_MODE_STORAGE = 'agentic-ai-groq-mode'; // 'system' | 'custom'

export function getActiveGroqKey() {
  const mode = localStorage.getItem(GROQ_MODE_STORAGE) || 'system';
  if (mode === 'custom') {
    return localStorage.getItem(GROQ_KEY_STORAGE) || '';
  }
  return ''; // empty = backend uses system key
}

export function isUsingCustomKey() {
  return localStorage.getItem(GROQ_MODE_STORAGE) === 'custom';
}

// ─────────────────────────────────────────────────────────────────────────────

const Settings = () => {
  const { user, saveGroqKey, isAuthenticated } = useAuthStore();

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved]        = useState(false);
  const [backendOk, setBackendOk] = useState(null);

  // Groq key state
  const [groqApiKey, setGroqApiKey]       = useState('');
  const [useCustomKey, setUseCustomKey]   = useState(false);
  const [showKey, setShowKey]             = useState(false);
  const [keyValidating, setKeyValidating] = useState(false);
  const [keyStatus, setKeyStatus]         = useState(null); // null | 'valid' | 'invalid'
  const [keySaved, setKeySaved]           = useState(false);
  const [keyError, setKeyError]           = useState('');

  // Load settings
  useEffect(() => {
    const saved = localStorage.getItem('agentic-ai-settings');
    if (saved) {
      try { setSettings(JSON.parse(saved)); } catch (_) {}
    }
    // Load saved groq key preference
    const storedKey = localStorage.getItem(GROQ_KEY_STORAGE) || '';
    const storedMode = localStorage.getItem(GROQ_MODE_STORAGE) || 'system';
    setGroqApiKey(storedKey);
    setUseCustomKey(storedMode === 'custom');
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

  // Validate Groq API key by making a minimal test request
  const validateKey = async () => {
    if (!groqApiKey.trim()) {
      setKeyError('Please enter a Groq API key first.');
      return;
    }
    setKeyValidating(true);
    setKeyStatus(null);
    setKeyError('');
    const userId = user?.id; 
    try {
      await fetch(`${settings.apiEndpoint}/agent/status/${userId}`); // ensure backend is up
      
      // Simple lightweight check directly against Groq to verify the key
      const testRes = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { 'Authorization': `Bearer ${groqApiKey.trim()}` }
      });
      
      if (testRes.ok) {
        setKeyStatus('valid');
      } else {
        const data = await testRes.json();
        setKeyStatus('invalid');
        setKeyError(data.error?.message || 'Key validation failed.');
      }
    } catch (_) {
      setKeyStatus('invalid');
      setKeyError('Could not reach backend to validate key.');
    } finally {
      setKeyValidating(false);
    }
  };

  const saveGroqSettings = async () => {
    setKeyError('');
    if (useCustomKey && !groqApiKey.trim()) {
      setKeyError('Please enter your Groq API key to use custom key mode.');
      return;
    }

    // Always save to localStorage for immediate use
    localStorage.setItem(GROQ_KEY_STORAGE, groqApiKey.trim());
    localStorage.setItem(GROQ_MODE_STORAGE, useCustomKey ? 'custom' : 'system');

    // Also persist to backend if authenticated
    if (isAuthenticated) {
      await saveGroqKey(groqApiKey.trim(), useCustomKey);
    }

    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2500);
  };

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-400 mt-1">Configure system preferences and API keys</p>
      </div>

      {/* ── General Settings ─────────────────────────────────────────────── */}
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 space-y-5">
        <h2 className="text-lg font-semibold text-white">General</h2>

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
          <p className="text-gray-600 text-xs mt-1">Default: http://localhost:5000</p>
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

        <div className="flex justify-end">
          <button onClick={handleSave} className="btn-primary flex items-center gap-2">
            {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* ── Groq API Key ──────────────────────────────────────────────────── */}
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <Key className="w-5 h-5 text-primary-400" />
          <h2 className="text-lg font-semibold text-white">Groq API Key</h2>
        </div>

        <p className="text-sm text-gray-400">
          By default the system uses the server's built-in API key. You can provide your own
          Groq API key for personal rate limits and usage tracking.
        </p>

        {/* Toggle system vs custom */}
        <div
          onClick={() => setUseCustomKey(!useCustomKey)}
          className="flex items-center justify-between p-4 bg-dark-900 border border-dark-700 rounded-lg cursor-pointer hover:border-primary-500/50 transition-colors"
        >
          <div>
            <p className="text-sm font-medium text-white">
              {useCustomKey ? 'Using your API key' : 'Using system API key'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {useCustomKey
                ? 'Your requests use your personal Groq key'
                : 'Requests use the shared server-side key'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${useCustomKey ? 'bg-primary-500/20 text-primary-400' : 'bg-gray-700 text-gray-400'}`}>
              {useCustomKey ? 'Custom' : 'System'}
            </span>
            {useCustomKey
              ? <ToggleRight className="w-6 h-6 text-primary-400" />
              : <ToggleLeft className="w-6 h-6 text-gray-500" />}
          </div>
        </div>

        {/* Key Input (shown when custom is toggled on) */}
        {useCustomKey && (
          <div>
            <label className="block text-sm text-gray-400 mb-1">Your Groq API Key</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={groqApiKey}
                  onChange={(e) => { setGroqApiKey(e.target.value); setKeyStatus(null); setKeyError(''); }}
                  placeholder="gsk_..."
                  className="w-full px-4 py-2 pr-10 bg-dark-900 border border-dark-700 rounded-lg focus:border-primary-500 focus:outline-none font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={validateKey}
                disabled={keyValidating}
                className="px-4 py-2 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors text-sm disabled:opacity-50"
              >
                {keyValidating ? 'Testing...' : 'Test Key'}
              </button>
            </div>

            {keyStatus === 'valid' && (
              <p className="flex items-center gap-1.5 text-emerald-400 text-xs mt-1.5">
                <CheckCircle className="w-3.5 h-3.5" /> Key is valid and working
              </p>
            )}
            {keyStatus === 'invalid' && (
              <p className="flex items-center gap-1.5 text-red-400 text-xs mt-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> {keyError || 'Key validation failed'}
              </p>
            )}

            <p className="text-gray-600 text-xs mt-1.5">
              Get your free API key at{' '}
              <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="text-primary-400 hover:underline">
                console.groq.com
              </a>
            </p>
          </div>
        )}

        {/* System key info (shown when system mode is active) */}
        {!useCustomKey && (
          <div className="flex items-start gap-3 p-3 bg-primary-500/5 border border-primary-500/20 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-400">
              You're using the system's shared Groq API key. This key has shared rate limits.
              Switch to your own key for dedicated usage.
            </p>
          </div>
        )}

        {keyError && !useCustomKey && (
          <p className="text-red-400 text-xs">{keyError}</p>
        )}

        {/* Save Groq Settings */}
        <div className="flex justify-end">
          <button onClick={saveGroqSettings} className="btn-primary flex items-center gap-2">
            {keySaved ? <CheckCircle className="w-4 h-4" /> : <Key className="w-4 h-4" />}
            {keySaved ? 'Saved!' : 'Save API Key Settings'}
          </button>
        </div>
      </div>

      {/* Account info (if logged in) */}
      {isAuthenticated && user && (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Account</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Username</p>
              <p className="text-white font-medium">{user.username}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="text-white font-medium">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
