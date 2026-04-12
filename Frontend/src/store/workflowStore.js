import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// Read backend URL from env or fall back to localhost:5000
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const useWorkflowStore = create((set, get) => ({
  nodes: [],
  edges: [],
  logs: [],
  isExecuting: false,
  executingNodes: new Set(),
  nodeStatuses: {},
  lastResult: null,   // stores full pipeline result from backend
  stats: null,        // stores /agent/status data

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
    const { nodes, edges, addLog, setNodeStatus, setExecutingNode } = get();

    set({ isExecuting: true, lastResult: null });
    addLog('Starting workflow execution...', 'info');

    // Find input node to get the goal
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

    // ── Animate nodes in order: input → planner → executor → critic → memory → output
    const nodeOrder = ['input', 'planner', 'executor', 'critic', 'memory', 'output'];

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
      // Step 1: Input node
      animateNode('input', `📥 Goal received: "${goal.substring(0, 60)}..."`, 'info');

      // Step 2: Planner (animate while API call runs)
      animateNode('planner', '🧠 Planner Agent decomposing goal into sub-tasks...', 'info');

      // ── Real API call to backend ───────────────────────────────────────────
      const response = await fetch(`${API_BASE}/agent/goal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: goal.trim() }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Backend error: ${response.status}`);
      }

      const { data: result } = await response.json();

      // Complete input node
      completeNode('input', '✅ Input node processed', 'success');
      completeNode('planner', `✅ Plan created with ${(result.plan.match(/^\d+\./gm) || []).length} steps`, 'success');

      // Step 3: Executor
      animateNode('executor', '⚙️  Executor Agent running sub-tasks...', 'info');
      completeNode('executor', `✅ Execution complete (${result.iterationsRan} iteration${result.iterationsRan > 1 ? 's' : ''})`, 'success');

      // Step 4: Critic
      animateNode('critic', '🔍 Critic Agent evaluating output quality...', 'info');
      const score = result.qualityScore;
      const critiqueType = score >= 90 ? 'success' : score >= 70 ? 'warning' : 'error';
      completeNode('critic', `${score >= 90 ? '✅' : '⚠️'} Quality score: ${score}/100`, critiqueType);

      // Step 4b: Refinement if needed
      if (result.iterationsRan > 1) {
        addLog('🔄 Self-refinement loop triggered — re-planning and re-executing...', 'warning');
      }

      // Step 5: Memory
      animateNode('memory', '💾 Memory Agent storing execution context...', 'info');
      completeNode('memory', result.memoryUpdate !== 'No memory update.'
        ? '✅ Memory updated with key information'
        : '✅ No new memory entries (context unchanged)', 'success');

      // Step 6: Output
      animateNode('output', '📤 Generating final output...', 'info');
      completeNode('output', '✅ Final output ready', 'success');

      addLog(`🎉 Workflow complete! Quality: ${score}/100 | Status: ${result.status.toUpperCase()}`, 'success');

      set({ lastResult: result });

      // Refresh stats
      get().fetchStats();

    } catch (error) {
      addLog(`❌ Execution failed: ${error.message}`, 'error');
      // Mark all running nodes as failed
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

  // ── Fetch live stats from backend ──────────────────────────────────────────
  fetchStats: async () => {
    try {
      const res = await fetch(`${API_BASE}/agent/status`);
      const json = await res.json();
      if (json.success) set({ stats: json.stats });
    } catch (_) {
      // backend not running – silently ignore
    }
  },

  // ── Save workflow to localStorage ──────────────────────────────────────────
  saveWorkflow: () => {
    const { nodes, edges } = get();
    const workflow = { nodes, edges, timestamp: new Date().toISOString() };
    localStorage.setItem('agentic-ai-workflow', JSON.stringify(workflow));
  },

  // ── Load workflow from localStorage ───────────────────────────────────────
  loadWorkflow: () => {
    const saved = localStorage.getItem('agentic-ai-workflow');
    if (saved) {
      const { nodes, edges } = JSON.parse(saved);
      set({ nodes, edges });
    }
  },
}));
