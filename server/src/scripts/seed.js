import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/statascend';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Clear existing users for a fresh seed
    await User.deleteMany({});
    
    // Create the mock dev user
    const devUser = new User({
      username: 'mock_dev', // Using 'mock_dev' as the single user for MVP
      adventurer_rank: 10,
      exp: 1500,
      resin: {
        current: 200,
        last_updated: new Date()
      },
      wallets: {
        aether_gems: 1600, // Enough for a 10-pull
        mora: 500000 
      },
      pity_counters: {
        four_star: 0,
        five_star: 0
      },
      talents: {
        backend: 5,
        linux: 3,
        mental_resilience: 2
      }
    });

    await devUser.save();
    console.log('Mock developer user seeded successfully!');
    console.log(devUser);

  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    process.exit(0);
  }
}

seed();
