/**
 * Native Tool Implementations for Agentic AI
 * (Pure Node.js - No Flask required)
 */

/**
 * Perform a real-time web search using Serper.dev
 */
export async function serperSearch(query: string): Promise<string> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) return "Search failed: SERPER_API_KEY is missing in .env";

  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query }),
    });
    
    const data: any = await response.json();
    const results = data.organic?.map((r: any) => `${r.title}: ${r.snippet}`).join("\n") || "No results found.";
    console.log("🔍 Search Results Found:", results.substring(0, 100) + "...");
    return results;
  } catch (err: any) {
    console.error("❌ Search Error:", err.message);
    return `Search error: ${err.message}`;
  }
}

/**
 * Fetch live exchange rates using ExchangeRate-API
 */
export async function getExchangeRate(query: string): Promise<string> {
  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
    const data: any = await response.json();
    const rates = data.rates;
    
    if (query.toUpperCase().includes("INR")) {
      const result = `1 USD = ${rates.INR} INR (Source: ExchangeRate-API)`;
      console.log("💰 Currency Result:", result);
      return result;
    }
    return `Current Rates: ${JSON.stringify(rates)}`;
  } catch (err: any) {
    console.error("❌ Currency Error:", err.message);
    return `Currency error: ${err.message}`;
  }
}
