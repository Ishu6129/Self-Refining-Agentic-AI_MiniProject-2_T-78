import mongoose from 'mongoose';

const MemorySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true, index: true },

  fact: String,
  keywords: [String],

  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Memory', MemorySchema);