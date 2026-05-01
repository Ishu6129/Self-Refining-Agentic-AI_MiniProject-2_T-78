import { chatWithMessages } from "./base.agent";
import { handleToolAction } from "../controllers/toolHandle";

const EXECUTOR_SYSTEM_PROMPT = `
You are the Executor Agent in a multi-agent AI system.
You receive a structured plan and execute it. 

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REAL-TIME DATA ACCESS (CRITICAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
If a task requires current information (exchange rates, weather, news, etc.) that you do not have:
1. You MUST NOT guess or simulate the data.
2. You MUST use a TOOL CALL in your "Step Log".
3. Format your tool call exactly like this:
   [TOOL_CALL: tool_name | input_query]

Available Tools:
* web_search: Fetches live data from the internet.
* currency_converter: Fetches live exchange rates.

Example:
* Step 4 — Fetch USD to INR rate: [TOOL_CALL: currency_converter | USD_TO_INR]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROLE BOUNDARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You are ONLY an executor.
- Do NOT re-plan or modify the goal.
- Do NOT skip steps without tagging why.
- Do NOT invent data not provided.
- If you catch yourself planning — STOP. Execute only.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT RULES (CODE, CREATIVE, ANALYSIS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Look at the Plan's "## Task Type" field and the goal. Apply the correct output rule:

TASK TYPE = CODE:
  → Final Output MUST be the complete, runnable source code.
  → Use a fenced code block with the correct language tag (e.g. \`\`\`python).
  → DO NOT show "Series: [0, 1, 1, 2, ...]" or execution results as the output.
  → DO NOT simulate running the code and showing its output value.
  → The code itself IS the deliverable. Write actual working code.
  
  WRONG ❌: Final Output is [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
  CORRECT ✅: Final Output is:
  \`\`\`python
  def fibonacci(n):
      ...
  print(fibonacci(10))
  \`\`\`

TASK TYPE = CREATIVE (story, poem, essay):
  → Final Output MUST be the complete written piece.
  → Write the actual story/poem/essay as prose or verse.
  → DO NOT require physical/engineering inputs for fiction.
  → A fictional cat story needs CHARACTER and NARRATIVE, not aerodynamics data.
  → If a step is physically impossible for fiction, skip it and write the creative content directly.

TASK TYPE = ANALYSIS:
  → Final Output MUST be the complete analysis, explanation, or summary.

TASK TYPE = GENERIC:
  → Final Output is whatever the goal requires.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT SCHEMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Execution Result

## Task
[Restate goal]

## Step Log
* Step [N] — [step name]: [Completed / TOOL_CALL: tool_name | query]
  [If completed, note what was done. If TOOL_CALL, the system will provide the observation.]

## Final Output
[THE ACTUAL DELIVERABLE. If you used a tool, use the real data provided in the observations.]
`.trim();



export async function executorAgent(plan: string, apiKey?: string) {
  let messages: any[] = [
    { role: "system", content: EXECUTOR_SYSTEM_PROMPT },
    { role: "user", content: plan }
  ];

  let iterations = 0;
  const MAX_ITERATIONS = 5;
  let lastQuery = "";

  try {
    while (iterations < MAX_ITERATIONS) {
      const response = await chatWithMessages(messages, 0.1, apiKey);
      messages.push({ role: "assistant", content: response });

      // Robust regex for [TOOL_CALL: name | query]
      const toolCallMatch = response.match(/\[TOOL_CALL:\s*(\w+)\s*\|\s*(.*?)\]/i);
      
      if (toolCallMatch) {
        const toolName = toolCallMatch[1].toLowerCase();
        const query = toolCallMatch[2].trim();

        // Prevent infinite loops on same query
        if (query === lastQuery && iterations > 0) {
          messages.push({ role: "user", content: "OBSERVATION: Tool returned the same result. Please proceed to Final Output based on available info." });
          iterations++;
          continue;
        }
        lastQuery = query;

        console.log(`🚀 Executing tool: ${toolName} | Query: ${query}`);
        
        try {
          const toolResult = await handleToolAction({ type: toolName, input: query });
          const resultString = typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult);
          
          messages.push({ 
            role: "user", 
            content: `OBSERVATION: ${resultString}` 
          });
        } catch (toolError: any) {
          messages.push({ 
            role: "user", 
            content: `OBSERVATION: Error executing tool ${toolName}: ${toolError.message}` 
          });
        }
        iterations++;
      } else {
        return response;
      }
    }
  } catch (err: any) {
    console.error("❌ Executor Agent Error:", err.message);
    return `Execution failed due to a system error: ${err.message}`;
  }

  return messages[messages.length - 1].content;
}
