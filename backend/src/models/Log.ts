import mongoose from 'mongoose';

const LogSchema = new mongoose.Schema({
  ip: String,
  route: String,
  method: String,
  goal: String,
  status: String,
  responseTime: Number,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Log', LogSchema);