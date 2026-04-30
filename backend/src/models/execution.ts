import mongoose from 'mongoose';

const ExecutionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  id: { type: String, required: true, unique: true },
  goal: String,
  plan: String,
  executionResult: String,
  refinedPlan: String,
  refinedResult: String,
  critique: mongoose.Schema.Types.Mixed,

  qualityScore: Number,
  iterationsRan: Number,
  status: String,

  memoryUpdate: String,
  usedCustomKey: Boolean,

  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Execution', ExecutionSchema);