"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const LogSchema = new mongoose_1.default.Schema({
    ip: String,
    route: String,
    method: String,
    goal: String,
    status: String,
    responseTime: Number,
    createdAt: { type: Date, default: Date.now }
});
exports.default = mongoose_1.default.model('Log', LogSchema);
//# sourceMappingURL=Log.js.map