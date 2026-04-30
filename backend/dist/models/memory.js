"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const MemorySchema = new mongoose_1.default.Schema({
    userId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    fact: String,
    keywords: [String],
    timestamp: { type: Date, default: Date.now }
});
exports.default = mongoose_1.default.model('Memory', MemorySchema);
//# sourceMappingURL=memory.js.map