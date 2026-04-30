"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ExecutionSchema = new mongoose_1.default.Schema({
    userId: { type: String, required: true, index: true },
    id: { type: String, required: true, unique: true },
    goal: String,
    plan: String,
    executionResult: String,
    refinedPlan: String,
    refinedResult: String,
    critique: mongoose_1.default.Schema.Types.Mixed,
    qualityScore: Number,
    iterationsRan: Number,
    status: String,
    memoryUpdate: String,
    usedCustomKey: Boolean,
    timestamp: { type: Date, default: Date.now }
});
exports.default = mongoose_1.default.model('Execution', ExecutionSchema);
//# sourceMappingURL=execution.js.map