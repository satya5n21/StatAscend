import express from 'express';
import User from '../models/User.js';
import Quest from '../models/Quest.js';
import ResinService from '../services/ResinService.js';
import { getRedisClient } from '../config/redis.js';

const router = express.Router();

// Mock Auth Middleware for MVP
const getMockUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: 'mock_dev' });
    if (!user) {
      return res.status(404).json({ error: 'Mock user not found. Did you run the seed script?' });
    }
    // Update resin state right as we fetch the user
    const { currentResin, lastUpdated } = ResinService.calculateCurrentResin(user);
    if (user.resin.current !== currentResin) {
      user.resin.current = currentResin;
      user.resin.last_updated = lastUpdated;
      await user.save();
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Apply mock auth to all API routes
router.use(getMockUser);

// GET /api/v1/me - Get current user stats
router.get('/me', (req, res) => {
  res.json(req.user);
});

// GET /api/v1/quests - Get all quests
router.get('/quests', async (req, res) => {
  try {
    const quests = await Quest.find({});
    res.json(quests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/trigger-event - Generic ping from python scripts
router.post('/trigger-event', async (req, res) => {
  const { event_type, exp_reward = 10, mora_reward = 100 } = req.body;
  const user = req.user;
  
  user.exp += exp_reward;
  user.wallets.mora += mora_reward;
  await user.save();

  res.json({ message: 'Event triggered successfully', rewards: { exp: exp_reward, mora: mora_reward }, user });
});

// GET /api/v1/focus/status
router.get('/focus/status', async (req, res) => {
  try {
    const redisClient = getRedisClient();
    if (!redisClient) {
      return res.status(503).json({ error: 'Redis client not reachable' });
    }
    const sessionData = await redisClient.get(`focus_session:${req.user._id}`);
    if (sessionData) {
      return res.json({ active: true, session: JSON.parse(sessionData) });
    }
    res.json({ active: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/focus/start
router.post('/focus/start', async (req, res) => {
  const { block_type } = req.body; // 'instant', 'skirmish', 'main', 'boss'
  
  try {
    let durationMins = 0;
    let resinCost = 0;
    
    switch (block_type) {
      case 'skirmish': durationMins = 20; resinCost = 20; break;
      case 'main': durationMins = 40; resinCost = 40; break;
      case 'boss': durationMins = 90; resinCost = 60; break;
      case 'instant':
      default:
        // Handle instant clear directly here instead of using focus session?
        // Actually instant clear shouldn't create a session, but let's handle the request here for simplicity
        if (block_type === 'instant') {
           const updatedUser = await ResinService.consumeResin(req.user, 0); // 0 resin
           updatedUser.exp += 10;
           updatedUser.wallets.mora += 100;
           await updatedUser.save();
           return res.json({ message: 'Instant Drop Claimed', drops: { exp: 10, mora: 100 } });
        }
        return res.status(400).json({ error: 'Invalid block type' });
    }

    const redisClient = getRedisClient();
    const existing = await redisClient.get(`focus_session:${req.user._id}`);
    if (existing) {
       return res.status(400).json({ error: 'Focus session already active' });
    }

    const updatedUser = await ResinService.consumeResin(req.user, resinCost);
    
    const now = Date.now();
    const session = {
       block_type,
       start_time: now,
       end_time: now + durationMins * 60 * 1000,
       resin_cost: resinCost,
       duration_mins: durationMins
    };
    
    await redisClient.set(`focus_session:${req.user._id}`, JSON.stringify(session));

    res.json({ 
      message: 'Focus Domain Started', 
      resin_remaining: updatedUser.resin.current,
      session
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/v1/focus/claim
router.post('/focus/claim', async (req, res) => {
   try {
     const redisClient = getRedisClient();
     const sessionData = await redisClient.get(`focus_session:${req.user._id}`);
     
     if (!sessionData) {
       return res.status(404).json({ error: 'No active session found.' });
     }
     
     const session = JSON.parse(sessionData);
     const now = Date.now();
     
     if (now < session.end_time) {
       return res.status(400).json({ error: 'Domain timer has not finished.' });
     }
     
     // Calculate Overtime
     const overtimeMs = now - session.end_time;
     const overtimeMins = Math.max(0, Math.floor(overtimeMs / 60000));
     
     let baseExp = 0;
     let baseMora = 0;
     
     switch (session.block_type) {
        case 'skirmish': baseExp = 100; baseMora = 1000; break;
        case 'main': baseExp = 200; baseMora = 2000; break;
        case 'boss': baseExp = 300; baseMora = 3000; break;
     }
     
     const totalMora = baseMora + (overtimeMins * 10);
     const totalExp = baseExp; // No extra exp per 10 mins as per instruction "Total Mora=Base Mora+(Overtime Minutes×10)"
     
     req.user.exp += totalExp;
     req.user.wallets.mora += totalMora;
     await req.user.save();
     
     await redisClient.del(`focus_session:${req.user._id}`);
     
     res.json({ message: 'Domain Cleared', drops: { exp: totalExp, mora: totalMora }, overtime_mins: overtimeMins });
   } catch(err) {
     res.status(500).json({ error: err.message });
   }
});

// POST /api/v1/focus/forfeit
router.post('/focus/forfeit', async (req, res) => {
   try {
     const redisClient = getRedisClient();
     const sessionData = await redisClient.get(`focus_session:${req.user._id}`);
     
     if (!sessionData) {
       return res.status(404).json({ error: 'No active session found.' });
     }
     
     const session = JSON.parse(sessionData);
     
     // Refund 50% rounded
     const refund = Math.floor(session.resin_cost / 2);
     req.user.resin.current = Math.min(200, req.user.resin.current + refund); // assuming cap is 200
     await req.user.save();
     
     await redisClient.del(`focus_session:${req.user._id}`);
     
     res.json({ message: 'Domain Forfeited', refund });
   } catch(err) {
     res.status(500).json({ error: err.message });
   }
});


// POST /api/v1/wish - Gacha system
router.post('/wish', async (req, res) => {
  const WISH_COST = 160;
  const user = req.user;

  if (user.wallets.aether_gems < WISH_COST) {
    return res.status(400).json({ error: 'Not enough Aether Gems' });
  }

  user.wallets.aether_gems -= WISH_COST;
  user.pity_counters.four_star += 1;
  user.pity_counters.five_star += 1;

  let rarity = 3;
  let rewardName = 'Common Advice'; // Some 3-star junk

  // 5-Star Logic
  if (user.pity_counters.five_star >= 90) {
    rarity = 5;
  } else {
    // 0.6% flat chance
    if (Math.random() < 0.006) rarity = 5;
  }

  // 4-Star Logic (if not 5-star)
  if (rarity !== 5) {
    if (user.pity_counters.four_star >= 10) {
      rarity = 4;
    } else {
      // 5.1% flat chance
      if (Math.random() < 0.051) rarity = 4;
    }
  }

  // Generate Item
  if (rarity === 5) {
    rewardName = 'Golden Ticket. Go Watch a Movie!';
    user.pity_counters.five_star = 0; // Reset pity
    user.pity_counters.four_star = 0; // 5-star pull also resets 4-star pity in some games
  } else if (rarity === 4) {
    rewardName = 'Purple EXP Book';
    user.pity_counters.four_star = 0; // Reset 4-star pity
  }

  await user.save();

  res.json({
    message: 'Wish Successful',
    reward: {
      name: rewardName,
      rarity
    },
    pity: user.pity_counters
  });
});

export default router;
