"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleToolAction = handleToolAction;
const tools_1 = require("./tools");
async function handleToolAction(action) {
    if (!action || !action.type) {
        return null;
    }
    console.log("🛠 Tool Handler Triggered:", action.type);
    try {
        switch (action.type) {
            case "web_search": {
                return await (0, tools_1.serperSearch)(action.input);
            }
            case "currency_converter": {
                return await (0, tools_1.getExchangeRate)(action.input);
            }
            default:
                throw new Error(`Unknown tool: ${action.type}`);
        }
    }
    catch (err) {
        console.error("❌ Tool Handler Error:", err.message);
        return { error: err.message };
    }
}
//# sourceMappingURL=toolHandle.js.map