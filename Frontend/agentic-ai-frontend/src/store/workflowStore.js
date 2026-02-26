import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export const useWorkflowStore = create((set, get) => ({
  nodes: [],
  edges: [],
  logs: [],
  isExecuting: false,
  executingNodes: new Set(),
  nodeStatuses: {},

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  addLog: (message, type = 'info', nodeId = null) => {
    const log = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      message,
      type,
      nodeId
    };
    set((state) => ({ logs: [...state.logs, log] }));
  },

  clearLogs: () => set({ logs: [] }),

  setNodeStatus: (nodeId, status) => {
    set((state) => ({
      nodeStatuses: { ...state.nodeStatuses, [nodeId]: status }
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

  executeWorkflow: async () => {
    const { nodes, edges, addLog, setNodeStatus, setExecutingNode } = get();

    set({ isExecuting: true });
    addLog('Starting workflow execution...', 'info');

    const inputNode = nodes.find(n => n.data.type === 'input');
    if (!inputNode) {
      addLog('No input node found!', 'error');
      set({ isExecuting: false });
      return;
    }

    const visited = new Set();
    const executeNode = async (node) => {
      if (visited.has(node.id)) return;
      visited.add(node.id);

      setExecutingNode(node.id, true);
      setNodeStatus(node.id, 'running');
      addLog(`Executing ${node.data.type} node...`, 'info', node.id);

      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

      switch(node.data.type) {
        case 'input':
          const goal = node.data.config?.goal || 'Unknown goal';
          addLog(`Processing goal: "${goal.substring(0, 50)}..."`, 'success', node.id);
          break;
        case 'planner':
          addLog('Decomposed goal into 4 sub-tasks', 'success', node.id);
          break;
        case 'executor':
          addLog('Executed sub-tasks with 98% accuracy', 'success', node.id);
          break;
        case 'critic':
          const strictness = node.data.config?.strictness || 'medium';
          if (strictness === 'high') {
            addLog('Found issues, triggering refinement loop', 'warning', node.id);
          } else {
            addLog('Quality check passed', 'success', node.id);
          }
          break;
        case 'memory':
          addLog('Persisted execution context', 'success', node.id);
          break;
        case 'output':
          addLog('Generated final output', 'success', node.id);
          break;
      }

      setExecutingNode(node.id, false);
      setNodeStatus(node.id, 'completed');

      const nextEdges = edges.filter(e => e.source === node.id);
      for (const edge of nextEdges) {
        const nextNode = nodes.find(n => n.id === edge.target);
        if (nextNode) await executeNode(nextNode);
      }
    };

    try {
      await executeNode(inputNode);
      addLog('Workflow execution completed successfully!', 'success');
    } catch (error) {
      addLog(`Execution failed: ${error.message}`, 'error');
    } finally {
      set({ isExecuting: false });
    }
  },

  saveWorkflow: () => {
    const { nodes, edges } = get();
    const workflow = { nodes, edges, timestamp: new Date().toISOString() };
    localStorage.setItem('agentic-ai-workflow', JSON.stringify(workflow));
  }
}));
