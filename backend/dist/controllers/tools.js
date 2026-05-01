"use strict";
/**
 * Native Tool Implementations for Agentic AI
 * (Pure Node.js - No Flask required)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.serperSearch = serperSearch;
exports.getExchangeRate = getExchangeRate;
/**
 * Perform a real-time web search using Serper.dev
 */
async function serperSearch(query) {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey)
        return "Search failed: SERPER_API_KEY is missing in .env";
    try {
        const response = await fetch("https://google.serper.dev/search", {
            method: "POST",
            headers: {
                "X-API-KEY": apiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ q: query }),
        });
        const data = await response.json();
        const results = data.organic?.map((r) => `${r.title}: ${r.snippet}`).join("\n") || "No results found.";
        console.log("🔍 Search Results Found:", results.substring(0, 100) + "...");
        return results;
    }
    catch (err) {
        console.error("❌ Search Error:", err.message);
        return `Search error: ${err.message}`;
    }
}
/**
 * Fetch live exchange rates using ExchangeRate-API
 */
async function getExchangeRate(query) {
    try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
        const data = await response.json();
        const rates = data.rates;
        if (query.toUpperCase().includes("INR")) {
            const result = `1 USD = ${rates.INR} INR (Source: ExchangeRate-API)`;
            console.log("💰 Currency Result:", result);
            return result;
        }
        return `Current Rates: ${JSON.stringify(rates)}`;
    }
    catch (err) {
        console.error("❌ Currency Error:", err.message);
        return `Currency error: ${err.message}`;
    }
}
//# sourceMappingURL=tools.js.map