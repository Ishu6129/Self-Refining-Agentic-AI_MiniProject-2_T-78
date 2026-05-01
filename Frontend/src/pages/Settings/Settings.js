import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, Key, ToggleLeft, ToggleRight, Eye, EyeOff, ShieldCheck, Search } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const DEFAULT_SETTINGS = {
  apiEndpoint: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  executionTimeout: 60,
  maxRetries: 1,
  enableLogs: true,
};

// ─── API Key storage helpers (localStorage) ──────────────────────────────
const GROQ_KEY_STORAGE = 'agentic-ai-groq-key';
const GROQ_MODE_STORAGE = 'agentic-ai-groq-mode'; // 'system' | 'custom'

const SERPER_KEY_STORAGE = 'agentic-ai-serper-key';
const SERPER_MODE_STORAGE = 'agentic-ai-serper-mode'; // 'system' | 'custom'

export function getActiveGroqKey() {
  const mode = localStorage.getItem(GROQ_MODE_STORAGE) || 'system';
  if (mode === 'custom') {
    return localStorage.getItem(GROQ_KEY_STORAGE) || '';
  }
  return ''; 
}

export function getActiveSerperKey() {
  const mode = localStorage.getItem(SERPER_MODE_STORAGE) || 'system';
  if (mode === 'custom') {
    return localStorage.getItem(SERPER_KEY_STORAGE) || '';
  }
  return ''; 
}

export function isUsingCustomGroqKey() {
  return localStorage.getItem(GROQ_MODE_STORAGE) === 'custom';
}

export function isUsingCustomSerperKey() {
  return localStorage.getItem(SERPER_MODE_STORAGE) === 'custom';
}

// ─────────────────────────────────────────────────────────────────────────────

const Settings = () => {
  const { user, saveApiKeys, isAuthenticated } = useAuthStore();

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved]        = useState(false);
  const [backendOk, setBackendOk] = useState(null);

  // Groq key state
  const [groqApiKey, setGroqApiKey]       = useState('');
  const [useCustomGroqKey, setUseCustomGroqKey]   = useState(false);
  const [showGroqKey, setShowGroqKey]             = useState(false);
  const [groqValidating, setGroqValidating] = useState(false);
  const [groqStatus, setGroqStatus]         = useState(null);
  const [groqError, setGroqError]           = useState('');

  // Serper key state
  const [serperApiKey, setSerperApiKey]       = useState('');
  const [useCustomSerperKey, setUseCustomSerperKey] = useState(false);
  const [showSerperKey, setShowSerperKey]             = useState(false);
  const [serperValidating, setSerperValidating] = useState(false);
  const [serperStatus, setSerperStatus]         = useState(null);
  const [serperError, setSerperError]           = useState('');

  const [keySaved, setKeySaved]           = useState(false);

  // Load settings
  useEffect(() => {
    const saved = localStorage.getItem('agentic-ai-settings');
    if (saved) {
      try { setSettings(JSON.parse(saved)); } catch (_) {}
    }
    
    // Load Groq
    setGroqApiKey(localStorage.getItem(GROQ_KEY_STORAGE) || '');
    setUseCustomGroqKey(localStorage.getItem(GROQ_MODE_STORAGE) === 'custom');
    
    // Load Serper
    setSerperApiKey(localStorage.getItem(SERPER_KEY_STORAGE) || '');
    setUseCustomSerperKey(localStorage.getItem(SERPER_MODE_STORAGE) === 'custom');
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

  const validateGroqKey = async () => {
    if (!groqApiKey.trim()) {
      setGroqError('Please enter a Groq API key.');
      return;
    }
    setGroqValidating(true);
    setGroqStatus(null);
    setGroqError('');
    try {
      const testRes = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { 'Authorization': `Bearer ${groqApiKey.trim()}` }
      });
      if (testRes.ok) setGroqStatus('valid');
      else {
        const data = await testRes.json();
        setGroqStatus('invalid');
        setGroqError(data.error?.message || 'Validation failed.');
      }
    } catch (_) {
      setGroqStatus('invalid');
      setGroqError('Validation request failed.');
    } finally {
      setGroqValidating(false);
    }
  };

  const validateSerperKey = async () => {
    if (!serperApiKey.trim()) {
      setSerperError('Please enter a Serper API key.');
      return;
    }
    setSerperValidating(true);
    setSerperStatus(null);
    setSerperError('');
    try {
      const testRes = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': serperApiKey.trim(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: 'test' })
      });
      if (testRes.ok) setSerperStatus('valid');
      else {
        setSerperStatus('invalid');
        setSerperError('Invalid API key or rate limit exceeded.');
      }
    } catch (_) {
      setSerperStatus('invalid');
      setSerperError('Validation request failed.');
    } finally {
      setSerperValidating(false);
    }
  };

  const saveAllApiSettings = async () => {
    // Save to local storage
    localStorage.setItem(GROQ_KEY_STORAGE, groqApiKey.trim());
    localStorage.setItem(GROQ_MODE_STORAGE, useCustomGroqKey ? 'custom' : 'system');
    
    localStorage.setItem(SERPER_KEY_STORAGE, serperApiKey.trim());
    localStorage.setItem(SERPER_MODE_STORAGE, useCustomSerperKey ? 'custom' : 'system');

    // Save to backend if logged in
    if (isAuthenticated) {
      await saveApiKeys({
        groqApiKey: groqApiKey.trim(),
        useCustomGroqKey,
        serperApiKey: serperApiKey.trim(),
        useCustomSerperKey
      });
    }

    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2500);
  };

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto max-w-4xl mx-auto pb-20">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Configure system preferences and custom API credentials</p>
      </div>

      {/* ── General Settings ─────────────────────────────────────────────── */}
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 space-y-5 shadow-lg">
        <h2 className="text-lg font-semibold text-white">General Preferences</h2>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Backend API Endpoint</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg focus:border-primary-500 focus:outline-none text-white text-sm"
              value={settings.apiEndpoint}
              onChange={(e) => setSettings({ ...settings, apiEndpoint: e.target.value })}
            />
            <button onClick={testBackend} className="px-4 py-2 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors text-sm text-white">Test</button>
          </div>
          {backendOk === true  && <p className="text-emerald-400 text-xs mt-1">✅ Connection established</p>}
          {backendOk === false && <p className="text-red-400 text-xs mt-1">❌ Connection failed</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Timeout (sec)</label>
            <input
              type="number"
              className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg focus:border-primary-500 focus:outline-none text-white text-sm"
              value={settings.executionTimeout}
              onChange={(e) => setSettings({ ...settings, executionTimeout: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Max Retries</label>
            <input
              type="number"
              className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg focus:border-primary-500 focus:outline-none text-white text-sm"
              value={settings.maxRetries}
              onChange={(e) => setSettings({ ...settings, maxRetries: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={handleSave} className="px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg transition-all flex items-center gap-2 text-white text-sm font-medium">
            {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Settings Saved' : 'Save General Settings'}
          </button>
        </div>
      </div>

      {/* ── API Keys Container ────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white px-1">API Credentials</h2>
        
        {/* Groq Section */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-500/10 rounded-lg"><Key className="w-5 h-5 text-primary-400" /></div>
              <div>
                <h3 className="text-white font-medium">Groq LLM API</h3>
                <p className="text-xs text-gray-500">Powers the agent's reasoning and planning</p>
              </div>
            </div>
            <button 
              onClick={() => setUseCustomGroqKey(!useCustomGroqKey)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${useCustomGroqKey ? 'bg-primary-500/10 border-primary-500/50 text-primary-400' : 'bg-dark-900 border-dark-700 text-gray-500'}`}
            >
              <span className="text-xs font-bold">{useCustomGroqKey ? 'CUSTOM' : 'SYSTEM'}</span>
              {useCustomGroqKey ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            </button>
          </div>

          {useCustomGroqKey ? (
            <div className="space-y-3 pt-2">
              <div className="relative">
                <input
                  type={showGroqKey ? 'text' : 'password'}
                  className="w-full px-4 py-2.5 bg-dark-900 border border-dark-700 rounded-lg focus:border-primary-500 focus:outline-none text-white text-sm font-mono"
                  value={groqApiKey}
                  onChange={(e) => { setGroqApiKey(e.target.value); setGroqStatus(null); }}
                  placeholder="gsk_..."
                />
                <button onClick={() => setShowGroqKey(!showGroqKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  {showGroqKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <button onClick={validateGroqKey} disabled={groqValidating} className="text-xs text-primary-400 hover:text-primary-300 font-medium">
                  {groqValidating ? 'Validating...' : 'Verify Key'}
                </button>
                {groqStatus === 'valid' && <span className="text-[10px] text-emerald-400">Key is active</span>}
                {groqStatus === 'invalid' && <span className="text-[10px] text-red-400">{groqError || 'Invalid key'}</span>}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-dark-900/50 border border-dark-700/50 rounded-lg text-xs text-gray-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Using shared system key with default rate limits.
            </div>
          )}
        </div>

        {/* Serper Section */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg"><Search className="w-5 h-5 text-blue-400" /></div>
              <div>
                <h3 className="text-white font-medium">Serper Search API</h3>
                <p className="text-xs text-gray-500">Powers real-time web research tools</p>
              </div>
            </div>
            <button 
              onClick={() => setUseCustomSerperKey(!useCustomSerperKey)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${useCustomSerperKey ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' : 'bg-dark-900 border-dark-700 text-gray-500'}`}
            >
              <span className="text-xs font-bold">{useCustomSerperKey ? 'CUSTOM' : 'SYSTEM'}</span>
              {useCustomSerperKey ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            </button>
          </div>

          {useCustomSerperKey ? (
            <div className="space-y-3 pt-2">
              <div className="relative">
                <input
                  type={showSerperKey ? 'text' : 'password'}
                  className="w-full px-4 py-2.5 bg-dark-900 border border-dark-700 rounded-lg focus:border-blue-500 focus:outline-none text-white text-sm font-mono"
                  value={serperApiKey}
                  onChange={(e) => { setSerperApiKey(e.target.value); setSerperStatus(null); }}
                  placeholder="Enter Serper.dev Key"
                />
                <button onClick={() => setShowSerperKey(!showSerperKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  {showSerperKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <button onClick={validateSerperKey} disabled={serperValidating} className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                  {serperValidating ? 'Validating...' : 'Verify Key'}
                </button>
                {serperStatus === 'valid' && <span className="text-[10px] text-emerald-400">Key is active</span>}
                {serperStatus === 'invalid' && <span className="text-[10px] text-red-400">{serperError || 'Invalid key'}</span>}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-dark-900/50 border border-dark-700/50 rounded-lg text-xs text-gray-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Using shared system key for web research.
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button onClick={saveAllApiSettings} className="px-6 py-2.5 bg-white hover:bg-gray-100 text-dark-900 rounded-xl transition-all flex items-center gap-2 text-sm font-bold shadow-xl">
            {keySaved ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Save className="w-4 h-4" />}
            {keySaved ? 'All Credentials Saved' : 'Update All API Credentials'}
          </button>
        </div>
      </div>

      {/* Account info */}
      {isAuthenticated && user && (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold">User Profile</h2>
            <p className="text-xs text-gray-500 mt-1">{user.email} ({user.role})</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] bg-dark-700 px-2 py-1 rounded text-gray-400 uppercase tracking-widest font-bold">Authenticated</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
