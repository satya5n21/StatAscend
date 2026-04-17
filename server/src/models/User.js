import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  adventurer_rank: { type: Number, default: 1 },
  exp: { type: Number, default: 0 },
  resin: {
    current: { type: Number, default: 200 },
    last_updated: { type: Date, default: Date.now },
  },
  wallets: {
    aether_gems: { type: Number, default: 0 },
    mora: { type: Number, default: 0 },
  },
  pity_counters: {
    four_star: { type: Number, default: 0 },
    five_star: { type: Number, default: 0 },
  },
  talents: {
    backend: { type: Number, default: 1 },
    linux: { type: Number, default: 1 },
    mental_resilience: { type: Number, default: 1 }
  }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
