import mongoose from 'mongoose';

const QuestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Commission', 'Domain', 'World', 'Boss'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Available', 'Active', 'Completed'],
    default: 'Available',
  },
  resin_cost: { type: Number, default: 0 },
  requirements: { type: Array, default: [] }, // Array of strings or objects representing required AR or items
  timer_duration: { type: Number, default: 25 }, // in minutes for the Focus sanctum
}, { timestamps: true });

export default mongoose.model('Quest', QuestSchema);
