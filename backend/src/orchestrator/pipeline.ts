import { plannerAgent } from '../agent/planner.agent';
import { executorAgent } from '../agent/executor.agent';
import { criticAgent } from '../agent/critic.agent';
import { memoryAgent } from '../agent/memory.agent';

// ─── Types ───────────────────────────────────────────────────────────────────
interface MemoryFact {
  id: string;
  fact: string;
  timestamp: string;
  keywords: string[];
}

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
  usedCustomKey: boolean;
}

// ─── In-Memory Store ──────────────────────────────────────────────────────────
const executionHistory: Map<string, ExecutionRecord> = new Map();

let memoryFacts: MemoryFact[] = [];
let memoryIdCounter = 1;

// ─── Memory helpers ───────────────────────────────────────────────────────────

function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'a','an','the','is','are','was','were','be','been','being',
    'have','has','had','do','does','did','will','would','could',
    'should','may','might','shall','can','need','and','or','but',
    'in','on','at','to','for','of','with','by','from','as','into',
    'through','about','not','no','nor','so','yet','both','either',
    'neither','none','all','any','few','more','most','other','some',
    'such','than','that','this','these','those','what','which','who',
    'user','none','keep','update','remove','memory','story','write',
  ]);
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
}

function parseMemoryMarkdown(markdown: string): string[] {
  const facts: string[] = [];
  const keepSection = markdown.match(/##\s*Keep([\s\S]*?)(?=##|$)/i)?.[1] ?? '';
  for (const line of keepSection.split('\n')) {
    const trimmed = line.replace(/^[\s\-*]+/, '').trim();
    if (trimmed && trimmed.toLowerCase() !== 'none' && trimmed.length > 5) {
      facts.push(trimmed);
    }
  }
  return facts;
}

function addMemoryFacts(newFacts: string[], timestamp: string): void {
  for (const fact of newFacts) {
    const newKw = extractKeywords(fact);
    if (newKw.length === 0) continue;

    const isDuplicate = memoryFacts.some(existing => {
      const overlap = existing.keywords.filter(k => newKw.includes(k)).length;
      const union   = new Set([...existing.keywords, ...newKw]).size;
      return union > 0 && overlap / union > 0.6;
    });

    if (!isDuplicate) {
      memoryFacts.push({ id: `mem-${String(memoryIdCounter++).padStart(3, '0')}`, fact, timestamp, keywords: newKw });
    }
  }
  if (memoryFacts.length > 100) memoryFacts = memoryFacts.slice(-100);
}

function getRelevantFacts(goal: string, topN = 5): string[] {
  const goalKw = extractKeywords(goal);
  if (goalKw.length === 0 || memoryFacts.length === 0) return [];
  return memoryFacts
    .map(f => ({ f, score: f.keywords.filter(k => goalKw.includes(k)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map(({ f }) => f.fact);
}

// ─── Pipeline ────────────────────────────────────────────────────────────────
export async function runPipeline(goal: string, apiKey?: string): Promise<ExecutionRecord> {
  const id        = `exec-${Date.now()}`;
  const timestamp = new Date().toISOString();
  const usedCustomKey = !!(apiKey && apiKey.trim());

  // ── Step 1: Memory retrieval + Plan ──────────────────────────────────────
  console.log(`[PIPELINE ${id}] Step 1 – Memory retrieval + Planner`);
  const relevantFacts = getRelevantFacts(goal);
  const memoryContext = relevantFacts.length > 0
    ? `\n\n--- RELEVANT MEMORY FROM PAST SESSIONS ---\n${relevantFacts.map(f => `• ${f}`).join('\n')}\n--- END MEMORY ---`
    : '';

  const plan = await plannerAgent(goal + memoryContext, apiKey);

  // ── Step 2: Execute ────────────────────────────────────────────────────────
  console.log(`[PIPELINE ${id}] Step 2 – Executor`);
  const executionResult = await executorAgent(plan, apiKey);

  // ── Step 3: Critique ───────────────────────────────────────────────────────
  console.log(`[PIPELINE ${id}] Step 3 – Critic`);
  const critique = await criticAgent(goal, plan, executionResult, apiKey);

  let refinedPlan:   string | undefined;
  let refinedResult: string | undefined;
  let iterationsRan  = 1;
  let finalResult    = executionResult;
  let finalScore     = critique.qualityScore;

  // ── Step 4: Self-Refinement loop ───────────────────────────────────────────
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

    refinedPlan   = await plannerAgent(refinementContext + memoryContext, apiKey);
    refinedResult = await executorAgent(refinedPlan, apiKey);
    finalResult   = refinedResult;

    console.log(`[PIPELINE ${id}] Step 4b – Re-critiquing refined result`);
    const refinedCritique = await criticAgent(goal, refinedPlan, refinedResult, apiKey);
    finalScore = refinedCritique.qualityScore;
    console.log(`[PIPELINE ${id}] Refined score: ${finalScore}`);
  }

  // ── Step 5: Memory Update ──────────────────────────────────────────────────
  console.log(`[PIPELINE ${id}] Step 5 – Memory Agent`);
  const conversationText = `Goal: ${goal}\nPlan: ${plan}\nResult: ${finalResult}\nQuality Score: ${finalScore}`.trim();
  const memoryUpdate = await memoryAgent(conversationText, apiKey);

  if (memoryUpdate !== 'No memory update.') {
    addMemoryFacts(parseMemoryMarkdown(memoryUpdate), timestamp);
  }

  // ── Store & Return ──────────────────────────────────────────────────────────
  const record: ExecutionRecord = {
    id, goal, plan, executionResult, critique,
    refinedPlan, refinedResult, memoryUpdate,
    qualityScore: finalScore,
    iterationsRan,
    status: finalScore >= 70 ? (iterationsRan > 1 ? 'refined' : 'success') : 'failed',
    timestamp,
    usedCustomKey,
  };
  executionHistory.set(id, record);
  return record;
}

export function getHistory(): ExecutionRecord[] {
  return Array.from(executionHistory.values()).reverse();
}

export function getMemoryStore(): { id: string; content: string; timestamp: string; keywords: string[] }[] {
  return memoryFacts.map(f => ({ id: f.id, content: f.fact, timestamp: f.timestamp, keywords: f.keywords }));
}

export function getStats() {
  const all     = getHistory();
  const success = all.filter(r => r.status === 'success' || r.status === 'refined').length;
  const avgScore = all.length ? Math.round(all.reduce((s, r) => s + r.qualityScore, 0) / all.length) : 0;
  return {
    totalExecutions: all.length,
    successRate:     all.length ? Math.round((success / all.length) * 100) : 0,
    avgQualityScore: avgScore,
    memoryEntries:   memoryFacts.length,
  };
}
