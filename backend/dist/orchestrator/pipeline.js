"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPipeline = runPipeline;
exports.getHistory = getHistory;
exports.getMemoryStore = getMemoryStore;
exports.getStats = getStats;
const planner_agent_1 = require("../agent/planner.agent");
const executor_agent_1 = require("../agent/executor.agent");
const critic_agent_1 = require("../agent/critic.agent");
const memory_agent_1 = require("../agent/memory.agent");
const memory_1 = __importDefault(require("../models/memory"));
const execution_1 = __importDefault(require("../models/execution"));
// ─── Memory helpers ───────────────────────────────────────────────────────────
function extractKeywords(text) {
    const stopWords = new Set([
        'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'shall', 'can', 'need', 'and', 'or', 'but',
        'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'into',
        'through', 'about', 'not', 'no', 'nor', 'so', 'yet', 'both', 'either',
        'neither', 'none', 'all', 'any', 'few', 'more', 'most', 'other', 'some',
        'such', 'than', 'that', 'this', 'these', 'those', 'what', 'which', 'who',
        'user', 'none', 'keep', 'update', 'remove', 'memory', 'story', 'write',
    ]);
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopWords.has(w));
}
function parseMemoryMarkdown(markdown) {
    const facts = [];
    const keepSection = markdown.match(/##\s*Keep([\s\S]*?)(?=##|$)/i)?.[1] ?? '';
    for (const line of keepSection.split('\n')) {
        const trimmed = line.replace(/^[\s\-*]+/, '').trim();
        if (trimmed && trimmed.toLowerCase() !== 'none' && trimmed.length > 5) {
            facts.push(trimmed);
        }
    }
    return facts;
}
// function addMemoryFacts(userId: string, newFacts: string[], timestamp: string): void {
//   for (const fact of newFacts) {
//     const newKw = extractKeywords(fact);
//     if (newKw.length === 0) continue;
//     const isDuplicate = memoryFacts.some(existing => {
//       if (existing.userId !== userId) return false; // ✅ isolate user
//       const overlap = existing.keywords.filter(k => newKw.includes(k)).length;
//       const union   = new Set([...existing.keywords, ...newKw]).size;
//       return union > 0 && overlap / union > 0.6;
//     });
//     if (!isDuplicate) {
//       memoryFacts.push({ id: `mem-${String(memoryIdCounter++).padStart(3, '0')}`, fact, timestamp, keywords: newKw, userId });
//     }
//   }
//   if (memoryFacts.length > 100) memoryFacts = memoryFacts.slice(-100);
// }
async function addMemoryFacts(userId, newFacts, timestamp, sessionId) {
    for (const fact of newFacts) {
        const keywords = extractKeywords(fact);
        if (keywords.length === 0)
            continue;
        await memory_1.default.create({
            userId,
            sessionId: sessionId || `exec-${Date.now()}`,
            fact,
            keywords
        });
    }
}
// function getRelevantFacts(userId: string, goal: string, topN = 5): string[] {
//   const goalKw = extractKeywords(goal);
//   if (goalKw.length === 0 || memoryFacts.length === 0) return [];
//   return memoryFacts
//     .filter(f => f.userId === userId)
//     .map(f => ({ f, score: f.keywords.filter(k => goalKw.includes(k)).length }))
//     .filter(({ score }) => score > 0)
//     .sort((a, b) => b.score - a.score)
//     .slice(0, topN)
//     .map(({ f }) => f.fact);
// }
async function getRelevantFacts(userId, goal, topN = 5) {
    const goalKw = extractKeywords(goal);
    if (goalKw.length === 0)
        return [];
    const memories = await memory_1.default.find({ userId });
    return memories
        .map(m => ({
        fact: m.fact,
        score: m.keywords.filter(k => goalKw.includes(k)).length
    }))
        .filter(m => m.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, topN)
        .map(m => m.fact);
}
// ─── Pipeline ────────────────────────────────────────────────────────────────
async function runPipeline(userId, goal, apiKey, onProgress) {
    const id = `exec-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const usedCustomKey = !!(apiKey && apiKey.trim());
    const sendProgress = (event, node, message, status = 'success') => {
        if (onProgress)
            onProgress({ event, node, message, status });
    };
    // ── Step 1: Memory retrieval + Plan ──────────────────────────────────────
    console.log(`[PIPELINE ${id}] Step 1 – Memory retrieval + Planner`);
    sendProgress('node_start', 'planner', '🧠 Planner Agent decomposing goal into sub-tasks...', 'info');
    const relevantFacts = await getRelevantFacts(userId, goal);
    const memoryContext = relevantFacts.length > 0
        ? `\n\n--- RELEVANT MEMORY FROM PAST SESSIONS ---\n${relevantFacts.map(f => `• ${f}`).join('\n')}\n--- END MEMORY ---`
        : '';
    const plan = await (0, planner_agent_1.plannerAgent)(goal + memoryContext, apiKey);
    sendProgress('node_complete', 'planner', `✅ Plan created with ${(plan.match(/^\d+\./gm) || []).length} steps`, 'success');
    // ── Step 2: Execute ────────────────────────────────────────────────────────
    console.log(`[PIPELINE ${id}] Step 2 – Executor`);
    sendProgress('node_start', 'executor', '⚙️  Executor Agent running sub-tasks...', 'info');
    const executionResult = await (0, executor_agent_1.executorAgent)(plan, apiKey);
    // ── Step 3: Critique ───────────────────────────────────────────────────────
    console.log(`[PIPELINE ${id}] Step 3 – Critic`);
    sendProgress('node_start', 'critic', '🔍 Critic Agent evaluating output quality...', 'info');
    const critique = await (0, critic_agent_1.criticAgent)(goal, plan, executionResult, apiKey);
    let refinedPlan;
    let refinedResult;
    let iterationsRan = 1;
    let finalResult = executionResult;
    let finalScore = critique.qualityScore;
    const critiqueType = finalScore >= 90 ? 'success' : finalScore >= 70 ? 'warning' : 'error';
    sendProgress('node_complete', 'critic', `${finalScore >= 90 ? '✅' : '⚠️'} Quality score: ${finalScore}/100`, critiqueType);
    // ── Step 4: Self-Refinement loop ───────────────────────────────────────────
    if (critique.needsRefinement && critique.qualityScore < 90) {
        console.log(`[PIPELINE ${id}] Step 4 – Refinement triggered (score: ${critique.qualityScore})`);
        sendProgress('node_start', 'planner', '🔄 Refinement triggered: Re-planning...', 'warning');
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
        refinedPlan = await (0, planner_agent_1.plannerAgent)(refinementContext + memoryContext, apiKey);
        sendProgress('node_complete', 'planner', `✅ Refined Plan created`, 'success');
        sendProgress('node_start', 'executor', '⚙️  Executor running refined tasks...', 'info');
        refinedResult = await (0, executor_agent_1.executorAgent)(refinedPlan, apiKey);
        finalResult = refinedResult;
        console.log(`[PIPELINE ${id}] Step 4b – Re-critiquing refined result`);
        sendProgress('node_start', 'critic', '🔍 Critic evaluating refined output...', 'info');
        const refinedCritique = await (0, critic_agent_1.criticAgent)(goal, refinedPlan, refinedResult, apiKey);
        finalScore = refinedCritique.qualityScore;
        console.log(`[PIPELINE ${id}] Refined score: ${finalScore}`);
        const rCritiqueType = finalScore >= 90 ? 'success' : finalScore >= 70 ? 'warning' : 'error';
        sendProgress('node_complete', 'critic', `${finalScore >= 90 ? '✅' : '⚠️'} Refined Quality score: ${finalScore}/100`, rCritiqueType);
    }
    sendProgress('node_complete', 'executor', `✅ Execution complete (${iterationsRan} iteration${iterationsRan > 1 ? 's' : ''})`, 'success');
    // ── Step 5: Memory Update ──────────────────────────────────────────────────
    console.log(`[PIPELINE ${id}] Step 5 – Memory Agent`);
    sendProgress('node_start', 'memory', '💾 Memory Agent storing execution context...', 'info');
    const conversationText = `Goal: ${goal}\nPlan: ${plan}\nResult: ${finalResult}\nQuality Score: ${finalScore}`.trim();
    const memoryUpdate = await (0, memory_agent_1.memoryAgent)(conversationText, apiKey);
    if (memoryUpdate !== 'No memory update.') {
        await addMemoryFacts(userId, parseMemoryMarkdown(memoryUpdate), timestamp, id);
    }
    sendProgress('node_complete', 'memory', memoryUpdate !== 'No memory update.' ? '✅ Memory updated with key information' : '✅ No new memory entries', 'success');
    // ── Store & Return ──────────────────────────────────────────────────────────
    const record = {
        id, userId, goal, plan, executionResult, critique,
        refinedPlan, refinedResult, memoryUpdate,
        qualityScore: finalScore,
        iterationsRan,
        status: finalScore >= 70 ? (iterationsRan > 1 ? 'refined' : 'success') : 'failed',
        timestamp,
        usedCustomKey,
    };
    // executionHistory.set(id, record);
    await execution_1.default.create(record);
    return record;
}
// --------------- get history ----------------------
// export function getHistory(userId: string): ExecutionRecord[] {
//   return Array.from(executionHistory.values())
//     .filter(r => r.userId === userId) // ✅ filter by user
//     .reverse();
// }
async function getHistory(userId) {
    return await execution_1.default.find({ userId }).sort({ timestamp: -1 });
}
// ------------- get memory store ----------------------
// export function getMemoryStore(userId: string) {
//   return memoryFacts
//     .filter(f => f.userId === userId) // ✅ filter
//     .map(f => ({
//       id: f.id,
//       content: f.fact,
//       timestamp: f.timestamp,
//       keywords: f.keywords
//     }));
// }
async function getMemoryStore(userId) {
    const data = await memory_1.default.find({ userId });
    return data.map(m => ({
        id: m._id,
        content: m.fact,
        timestamp: m.timestamp,
        keywords: m.keywords
    }));
}
//  --------- get status ----------------
// export function getStats(userId: string) {
//   const all = getHistory(userId); // ✅ user-specific history
//   const success = all.filter(r =>
//     r.status === 'success' || r.status === 'refined'
//   ).length;
//   const avgScore = all.length
//     ? Math.round(all.reduce((s, r) => s + r.qualityScore, 0) / all.length)
//     : 0;
//   return {
//     totalExecutions: all.length,
//     successRate: all.length
//       ? Math.round((success / all.length) * 100)
//       : 0,
//     avgQualityScore: avgScore,
//     memoryEntries: memoryFacts.filter(f => f.userId === userId).length, // ✅ fix
//   };
// }
async function getStats(userId) {
    const executions = await execution_1.default.find({ userId });
    const total = executions.length;
    const success = executions.filter(r => r.status === 'success' || r.status === 'refined').length;
    const avgScore = total
        ? Math.round(executions.reduce((s, r) => s + (r.qualityScore ?? 0), 0) / total)
        : 0;
    const memoryCount = await memory_1.default.countDocuments({ userId });
    return {
        totalExecutions: total,
        successRate: total ? Math.round((success / total) * 100) : 0,
        avgQualityScore: avgScore,
        memoryEntries: memoryCount
    };
}
//# sourceMappingURL=pipeline.js.map