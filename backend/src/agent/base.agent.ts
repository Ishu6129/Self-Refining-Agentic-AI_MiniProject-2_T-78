import Groq from "groq-sdk";

const client = new Groq({
	apiKey: process.env.GROQ_API_KEY
});

export async function chatText(input: string) {
	const res = await client.chat.completions.create({
		model: "openai/gpt-oss-120b",
		messages: [
			{
				role: "user",
				content: input
			}
		]
	});

	return res.choices[0]?.message?.content || "";
}