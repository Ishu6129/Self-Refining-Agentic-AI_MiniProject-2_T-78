import Groq from 'groq-sdk';

const groq  = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

export async function chatText(system:string,user:string,temperature: number = 0.7):Promise<string> {
	const res = await groq.chat.completions.create({
		model:      MODEL,
		messages:   [{ role: 'system', content: system }, { role: 'user', content: user }],
		temperature,
		max_tokens: 4096,
	});
  return res.choices[0]?.message?.content || '';
}

export async function chatJSON<T = any>(system:string,user:string,temperature: number = 0.1
): Promise<T> {
	const res = await groq.chat.completions.create({
		model:           MODEL,
		messages:        [{ role: 'system', content: system }, { role: 'user', content: user }],
		temperature,
		max_tokens:      1024,
		response_format: { type: 'json_object' },
	});
  const raw = res.choices[0]?.message?.content;
  if (!raw) throw new Error('Empty response from LLM.');
  return JSON.parse(raw) as T;
}