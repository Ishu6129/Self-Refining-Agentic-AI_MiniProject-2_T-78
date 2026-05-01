import { create } from 'zustand';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const getStoredAuth = () => {
  try {
    const token = localStorage.getItem('agentic-ai-token');
    const user = JSON.parse(localStorage.getItem('agentic-ai-user') || 'null');
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
};

export const useAuthStore = create((set, get) => {
  const { token, user } = getStoredAuth();

  return {
    token,
    user,
    isAuthenticated: !!token,
    loading: false,
    error: null,

    // ── Register ────────────────────────────────────────────────────────────
    register: async (username, email, password) => {
      set({ loading: true, error: null });
      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed.');
        localStorage.setItem('agentic-ai-token', data.token);
        localStorage.setItem('agentic-ai-user', JSON.stringify(data.user));
        set({ token: data.token, user: data.user, isAuthenticated: true, loading: false });
        return { success: true };
      } catch (err) {
        set({ loading: false, error: err.message });
        return { success: false, error: err.message };
      }
    },

    // ── Login ───────────────────────────────────────────────────────────────
    login: async (email, password) => {
      set({ loading: true, error: null });
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed.');
        localStorage.setItem('agentic-ai-token', data.token);
        localStorage.setItem('agentic-ai-user', JSON.stringify(data.user));
        set({ token: data.token, user: data.user, isAuthenticated: true, loading: false });
        return { success: true };
      } catch (err) {
        set({ loading: false, error: err.message });
        return { success: false, error: err.message };
      }
    },

    // ── Logout ──────────────────────────────────────────────────────────────
    logout: () => {
      localStorage.removeItem('agentic-ai-token');
      localStorage.removeItem('agentic-ai-user');
      set({ token: null, user: null, isAuthenticated: false, error: null });
    },

    // ── Save API Keys to backend ──────────────────────────────────────────
    saveApiKeys: async ({ groqApiKey, useCustomGroqKey, serperApiKey, useCustomSerperKey }) => {
      const { token } = get();
      if (!token) return { success: false, error: 'Not authenticated.' };
      try {
        const res = await fetch(`${API_BASE}/auth/api-key`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ groqApiKey, useCustomGroqKey, serperApiKey, useCustomSerperKey }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save API keys.');
        
        // Update local user info
        const updatedUser = { ...get().user };
        if (groqApiKey !== undefined) updatedUser.groqApiKey = groqApiKey ? '***stored***' : '';
        if (useCustomGroqKey !== undefined) updatedUser.useCustomGroqKey = useCustomGroqKey;
        if (serperApiKey !== undefined) updatedUser.serperApiKey = serperApiKey ? '***stored***' : '';
        if (useCustomSerperKey !== undefined) updatedUser.useCustomSerperKey = useCustomSerperKey;

        localStorage.setItem('agentic-ai-user', JSON.stringify(updatedUser));
        set({ user: updatedUser });
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },

    clearError: () => set({ error: null }),
  };
});
