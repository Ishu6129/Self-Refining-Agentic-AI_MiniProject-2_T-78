import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ─── Get active Groq key from localStorage ─────────────────────────────────────
function getActiveGroqKey() {
  const mode = localStorage.getItem('agentic-ai-groq-mode') || 'system';
  if (mode === 'custom') {
    return localStorage.getItem('agentic-ai-groq-key') || '';
  }
  return ''; // empty → backend uses its system key
}

export const useWorkflowStore = create((set, get) => ({
  nodes: [],
  edges: [],
  logs: [],
  isExecuting: false,
  executingNodes: new Set(),
  nodeStatuses: {},
  lastResult: null,
  stats: null,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  addLog: (message, type = 'info', nodeId = null) => {
    const log = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      message,
      type,
      nodeId,
    };
    set((state) => ({ logs: [...state.logs, log] }));
  },

  clearLogs: () => set({ logs: [] }),

  setNodeStatus: (nodeId, status) => {
    set((state) => ({
      nodeStatuses: { ...state.nodeStatuses, [nodeId]: status },
    }));
  },

  setExecutingNode: (nodeId, isExecuting) => {
    set((state) => {
      const newSet = new Set(state.executingNodes);
      if (isExecuting) newSet.add(nodeId);
      else newSet.delete(nodeId);
      return { executingNodes: newSet };
    });
  },

  // ── Real execution: calls backend pipeline ─────────────────────────────────
  executeWorkflow: async () => {
    const { nodes, addLog, setNodeStatus, setExecutingNode } = get();

    set({ isExecuting: true, lastResult: null });
    addLog('Starting workflow execution...', 'info');

    const inputNode = nodes.find((n) => n.data.type === 'input');
    if (!inputNode) {
      addLog('No input node found! Add an Input node to the canvas.', 'error');
      set({ isExecuting: false });
      return;
    }

    const goal = inputNode.data.config?.goal || '';
    if (!goal.trim() || goal.trim().length < 5) {
      addLog('Please set a goal in the Input node before executing.', 'error');
      set({ isExecuting: false });
      return;
    }

    const animateNode = async (type, logMsg, logType = 'info') => {
      const node = nodes.find((n) => n.data.type === type);
      if (!node) return;
      setExecutingNode(node.id, true);
      setNodeStatus(node.id, 'running');
      addLog(logMsg, logType, node.id);
    };

    const completeNode = (type, logMsg, logType = 'success') => {
      const node = nodes.find((n) => n.data.type === type);
      if (!node) return;
      setExecutingNode(node.id, false);
      setNodeStatus(node.id, 'completed');
      addLog(logMsg, logType, node.id);
    };

    try {
      // Get active Groq key (empty string = use system key on backend)
      const groqApiKey = getActiveGroqKey();
      const keyMode = groqApiKey ? 'custom' : 'system';
      addLog(`🔑 Using ${keyMode} Groq API key`, 'info');

      const user = JSON.parse(localStorage.getItem('agentic-ai-user') || '{}');
      const userId = user?.id;

      completeNode('input', '✅ Input goal set', 'success');
      animateNode('planner', '🧠 Connecting to orchestrator...', 'info');

      const response = await fetch(`${API_BASE}/agent/goal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: goal.trim(), groqApiKey: groqApiKey || undefined, userId }),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      if (!response.body) {
         throw new Error("ReadableStream not supported by the browser.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let result = null;
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last partial line in the buffer
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (!line.trim()) continue;
          
          let msg;
          try {
            msg = JSON.parse(line);
          } catch (e) {
            if (e.message !== 'Unexpected end of JSON input') {
              console.error('Error parsing stream chunk', e, line);
            }
            continue;
          }
            
          if (msg.event === 'error') {
             throw new Error(msg.error);
          } else if (msg.event === 'node_start') {
             animateNode(msg.node, msg.message, msg.status || 'info');
          } else if (msg.event === 'node_complete') {
             completeNode(msg.node, msg.message, msg.status || 'success');
          } else if (msg.event === 'done') {
             result = msg.data;
          }
        }
      }

      if (!result) {
        throw new Error("Pipeline finished without returning a result.");
      }

      animateNode('output', '📤 Generating final output...', 'info');
      completeNode('output', '✅ Final output ready', 'success');

      addLog(`🎉 Workflow complete! Quality: ${result.qualityScore}/100 | Status: ${result.status.toUpperCase()}`, 'success');

      set({ lastResult: result });
      get().fetchStats();

    } catch (error) {
      let errorMsg = error.message;
      if (errorMsg.includes('429') || errorMsg.toLowerCase().includes('rate limit')) {
        errorMsg = '⚠️ Rate Limit Reached! Your Groq API key has exceeded its limit. Please go to Settings to update your API key or wait a few minutes.';
      }
      addLog(`❌ Execution failed: ${errorMsg}`, 'error');
      nodes.forEach((n) => {
        const { nodeStatuses } = get();
        if (nodeStatuses[n.id] === 'running') {
          setExecutingNode(n.id, false);
          setNodeStatus(n.id, 'failed');
        }
      });
    } finally {
      set({ isExecuting: false });
    }
  },

  fetchStats: async () => {
    try {
      const res = await fetch(`${API_BASE}/agent/status`);
      const json = await res.json();
      if (json.success) set({ stats: json.stats });
    } catch (_) {}
  },

  saveWorkflow: () => {
    const { nodes, edges } = get();
    const workflow = { nodes, edges, timestamp: new Date().toISOString() };
    localStorage.setItem('agentic-ai-workflow', JSON.stringify(workflow));
  },

  loadWorkflow: () => {
    const saved = localStorage.getItem('agentic-ai-workflow');
    if (saved) {
      const { nodes, edges } = JSON.parse(saved);
      set({ nodes, edges });
    }
  },
}));
