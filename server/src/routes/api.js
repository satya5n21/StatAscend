import express from 'express';
import User from '../models/User.js';
import Quest from '../models/Quest.js';
import ResinService from '../services/ResinService.js';

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

// POST /api/v1/trigger-event - Generic ping from python scripts
router.post('/trigger-event', async (req, res) => {
  const { event_type, exp_reward = 10, mora_reward = 100 } = req.body;
  const user = req.user;
  
  user.exp += exp_reward;
  user.wallets.mora += mora_reward;
  await user.save();

  res.json({ message: 'Event triggered successfully', rewards: { exp: exp_reward, mora: mora_reward }, user });
});

// POST /api/v1/domain/start - Deduct resin and lock UI into /focus
router.post('/domain/start', async (req, res) => {
  const { quest_id } = req.body;
  
  try {
    let quest;
    let resinCost = 20; // Default domain cost

    if (quest_id) {
      quest = await Quest.findById(quest_id);
      if (!quest) return res.status(404).json({ error: 'Quest not found' });
      resinCost = quest.resin_cost;
    }

    // Try consuming resin
    const updatedUser = await ResinService.consumeResin(req.user, resinCost);

    // Assume frontend handles the "Focus Mode" locking, backend just acks the transaction
    res.json({ 
      message: 'Domain Started', 
      resin_remaining: updatedUser.resin.current,
      quest: quest || { title: 'Random Domain', timer_duration: 25 }
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/v1/domain/complete - Domain finished successfully
router.post('/domain/complete', async (req, res) => {
   // In a full game, we'd verify the start time vs current time to prevent cheating.
   const user = req.user;
   
   // Mock RNG drops
   const exp = 50;
   const mora = 2000;
   
   user.exp += exp;
   user.wallets.mora += mora;
   await user.save();

   res.json({ message: 'Domain Cleared', drops: { exp, mora } });
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
