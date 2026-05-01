import { serperSearch, getExchangeRate } from "./tools";

type ToolAction = {
  type: string;
  input: any;
};

export async function handleToolAction(action?: ToolAction): Promise<any> {
  if (!action || !action.type) {
    return null;
  }

  console.log("🛠 Tool Handler Triggered:", action.type);

  try {
    switch (action.type) {
      case "web_search": {
        return await serperSearch(action.input);
      }

      case "currency_converter": {
        return await getExchangeRate(action.input);
      }

      default:
        throw new Error(`Unknown tool: ${action.type}`);
    }
  } catch (err: any) {
    console.error("❌ Tool Handler Error:", err.message);
    return { error: err.message };
  }
}