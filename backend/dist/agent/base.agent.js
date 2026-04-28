"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatText = chatText;
exports.chatJSON = chatJSON;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
function getClient(apiKey) {
    const key = (apiKey && apiKey.trim()) ? apiKey.trim() : process.env.GROQ_API_KEY;
    if (!key)
        throw new Error('No Groq API key available. Set GROQ_API_KEY in .env or provide your own key in Settings.');
    return new groq_sdk_1.default({ apiKey: key });
}
async function chatText(system, user, temperature = 0.7, apiKey) {
    const groq = getClient(apiKey);
    const res = await groq.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
        temperature,
        max_tokens: 4096,
    });
    return res.choices[0]?.message?.content || '';
}
async function chatJSON(system, user, temperature = 0.1, apiKey) {
    const groq = getClient(apiKey);
    const res = await groq.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
        temperature,
        max_tokens: 1024,
        response_format: { type: 'json_object' },
    });
    const raw = res.choices[0]?.message?.content;
    if (!raw)
        throw new Error('Empty response from LLM.');
    return JSON.parse(raw);
}
//# sourceMappingURL=base.agent.js.map