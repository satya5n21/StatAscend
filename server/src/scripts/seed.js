import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Quest from '../models/Quest.js';

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

    // Clear existing quests
    await Quest.deleteMany({});

    // Seed Quests
    const questsToSeed = [
      // Commissions (Daily / Quick Tasks)
      { title: 'Meditation', category: 'Commission', status: 'Available', resin_cost: 10, timer_duration: 15 },
      { title: 'Bring cash from ATM', category: 'Commission', status: 'Available', resin_cost: 0, timer_duration: 0 },
      { title: 'Buy groceries for home from local shop', category: 'Commission', status: 'Available', resin_cost: 0, timer_duration: 0 },
      { title: 'Completing task-1 given in office', category: 'Commission', status: 'Available', resin_cost: 20, timer_duration: 60 },
      { title: 'Completing task-2 given in office', category: 'Commission', status: 'Available', resin_cost: 20, timer_duration: 60 },

      // Domains (Skill-building / Focused Time)
      { title: 'Workout', category: 'Domain', status: 'Available', resin_cost: 20, timer_duration: 45 },
      { title: 'Learning guitar', category: 'Domain', status: 'Available', resin_cost: 20, timer_duration: 30 },
      { title: 'Learn about jest and how to mock backend infra like pubsub', category: 'Domain', status: 'Available', resin_cost: 20, timer_duration: 60 },
      { title: 'Learning about Linux file system', category: 'Domain', status: 'Available', resin_cost: 20, timer_duration: 60 },
      { title: 'Finishing a section of a Udemy course', category: 'Domain', status: 'Available', resin_cost: 20, timer_duration: 60 },

      // World Quests (Out-and-about / Errands / Travel)
      { title: 'Bring medicine from a different city', category: 'World', status: 'Available', resin_cost: 40, timer_duration: 0 },
      { title: 'Take bike for servicing', category: 'World', status: 'Available', resin_cost: 20, timer_duration: 0 },
      { title: 'Visit different state to meet a relative', category: 'World', status: 'Available', resin_cost: 60, timer_duration: 0 },
      { title: 'Drop my son at a distant mall with my wife', category: 'World', status: 'Available', resin_cost: 20, timer_duration: 0 },

      // Boss (Major projects / Milestones)
      { title: 'Building a backend app in MERN', category: 'Boss', status: 'Available', resin_cost: 160, timer_duration: 120 }
    ];

    await Quest.insertMany(questsToSeed);
    console.log(`${questsToSeed.length} quests seeded successfully!`);


  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    process.exit(0);
  }
}

seed();
