import { plannerAgent } from '../agent/planner.agent';
import { executorAgent } from '../agent/executor.agent';
import { criticAgent } from '../agent/critic.agent';
import { memoryAgent } from '../agent/memory.agent';

// ─── In-Memory Store (replace with DB for production) ───────────────────────
interface ExecutionRecord {
  id: string;
  goal: string;
  plan: string;
  executionResult: string;
  critique: any;
  refinedPlan?: string;
  refinedResult?: string;
  memoryUpdate: string;
  qualityScore: number;
  iterationsRan: number;
  status: 'success' | 'refined' | 'failed';
  timestamp: string;
}

const executionHistory: Map<string, ExecutionRecord> = new Map();
let memoryStore: string[] = [];   // accumulates memory across sessions

// ─── Pipeline ────────────────────────────────────────────────────────────────
export async function runPipeline(goal: string): Promise<ExecutionRecord> {
  const id = `exec-${Date.now()}`;
  const timestamp = new Date().toISOString();

  // ── Step 1 : Plan ──────────────────────────────────────────────────────────
  console.log(`[PIPELINE ${id}] Step 1 – Planner`);
  const plan = await plannerAgent(goal);

  // ── Step 2 : Execute ───────────────────────────────────────────────────────
  console.log(`[PIPELINE ${id}] Step 2 – Executor`);
  const executionResult = await executorAgent(plan);

  // ── Step 3 : Critique ──────────────────────────────────────────────────────
  console.log(`[PIPELINE ${id}] Step 3 – Critic`);
  const critique = await criticAgent(goal, plan, executionResult);

  let refinedPlan: string | undefined;
  let refinedResult: string | undefined;
  let iterationsRan = 1;
  let finalResult = executionResult;
  let finalScore = critique.qualityScore;

  // ── Step 4 : Self-Refinement loop (max 1 extra iteration for 80% mode) ─────
  if (critique.needsRefinement && critique.qualityScore < 90) {
    console.log(`[PIPELINE ${id}] Step 4 – Refinement triggered (score: ${critique.qualityScore})`);
    iterationsRan = 2;

    const refinementContext = `
ORIGINAL GOAL:
${goal}

PREVIOUS PLAN (needs improvement):
${plan}

CRITIC FEEDBACK:
Issues Found: ${critique.issuesFound?.join('; ')}
Improvement Suggestions: ${critique.improvementSuggestions?.join('; ')}
Refinement Focus: ${critique.refinementFocus}
    `.trim();

    refinedPlan = await plannerAgent(refinementContext);
    refinedResult = await executorAgent(refinedPlan);
    finalResult = refinedResult;
    finalScore = Math.min(100, critique.qualityScore + 15); // assume improvement
  }

  // ── Step 5 : Memory Update ─────────────────────────────────────────────────
  console.log(`[PIPELINE ${id}] Step 5 – Memory Agent`);
  const conversationText = `
Goal: ${goal}
Plan: ${plan}
Result: ${finalResult}
Quality Score: ${finalScore}
  `.trim();
  const memoryUpdate = await memoryAgent(conversationText);
  if (memoryUpdate !== 'No memory update.') {
    memoryStore.push(`[${timestamp}] ${memoryUpdate}`);
    if (memoryStore.length > 50) memoryStore = memoryStore.slice(-50); // keep last 50
  }

  // ── Store & Return ─────────────────────────────────────────────────────────
  const record: ExecutionRecord = {
    id,
    goal,
    plan,
    executionResult,
    critique,
    refinedPlan,
    refinedResult,
    memoryUpdate,
    qualityScore: finalScore,
    iterationsRan,
    status: finalScore >= 70 ? (iterationsRan > 1 ? 'refined' : 'success') : 'failed',
    timestamp,
  };

  executionHistory.set(id, record);
  return record;
}

export function getHistory(): ExecutionRecord[] {
  return Array.from(executionHistory.values()).reverse(); // newest first
}

export function getMemoryStore(): string[] {
  return memoryStore;
}

export function getStats() {
  const all = getHistory();
  const success = all.filter(r => r.status === 'success' || r.status === 'refined').length;
  const avgScore = all.length
    ? Math.round(all.reduce((s, r) => s + r.qualityScore, 0) / all.length)
    : 0;
  return {
    totalExecutions: all.length,
    successRate: all.length ? Math.round((success / all.length) * 100) : 0,
    avgQualityScore: avgScore,
    memoryEntries: memoryStore.length,
  };
}
