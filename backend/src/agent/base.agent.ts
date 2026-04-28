import Groq from 'groq-sdk';

const DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

function getClient(apiKey?: string): Groq {
  const key = (apiKey && apiKey.trim()) ? apiKey.trim() : process.env.GROQ_API_KEY;
  if (!key) throw new Error('No Groq API key available. Set GROQ_API_KEY in .env or provide your own key in Settings.');
  return new Groq({ apiKey: key });
}

export async function chatText(
  system: string,
  user: string,
  temperature: number = 0.7,
  apiKey?: string,
): Promise<string> {
  const groq = getClient(apiKey);
  const res = await groq.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    temperature,
    max_tokens: 4096,
  });
  return res.choices[0]?.message?.content || '';
}

export async function chatJSON<T = any>(
  system: string,
  user: string,
  temperature: number = 0.1,
  apiKey?: string,
): Promise<T> {
  const groq = getClient(apiKey);
  const res = await groq.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    temperature,
    max_tokens: 1024,
    response_format: { type: 'json_object' },
  });
  const raw = res.choices[0]?.message?.content;
  if (!raw) throw new Error('Empty response from LLM.');
  return JSON.parse(raw) as T;
}
