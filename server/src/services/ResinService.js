import User from '../models/User.js';

class ResinService {
  constructor() {
    this.REGEN_RATE_MINUTES = 8;
  }

  get MAX_RESIN() {
    return parseInt(process.env.MAX_RESIN || '200');
  }

  /**
   * Lazily calculates current resin based on time elapsed since last update
   * @param {Object} user - The user document
   * @returns {Object} { currentResin, lastUpdated } 
   */
  calculateCurrentResin(user) {
    if (!user || !user.resin) return { currentResin: 0, lastUpdated: new Date() };

    const { current, last_updated } = user.resin;
    
    if (current >= this.MAX_RESIN) {
      return { currentResin: this.MAX_RESIN, lastUpdated: last_updated };
    }

    const now = new Date();
    const msPassed = now.getTime() - new Date(last_updated).getTime();
    const minutesPassed = Math.floor(msPassed / 60000);

    const resinToGain = Math.floor(minutesPassed / this.REGEN_RATE_MINUTES);

    if (resinToGain > 0) {
      const newResinValue = Math.min(this.MAX_RESIN, current + resinToGain);
      // We don't advance the timer exactly to 'now'. We only advance it by the exact chunks of 8 minutes 
      // used to generate the new resin, to avoid losing fractional minutes (e.g. 7 mins stored).
      const msToAdvance = resinToGain * this.REGEN_RATE_MINUTES * 60000;
      const newLastUpdated = new Date(new Date(last_updated).getTime() + msToAdvance);
      
      // However if we hit MAX_RESIN, simply reset the timer to now.
      if (newResinValue === this.MAX_RESIN) {
          return { currentResin: newResinValue, lastUpdated: now };
      }

      return { currentResin: newResinValue, lastUpdated: newLastUpdated };
    }

    // Not enough time passed for 1 resin
    return { currentResin: current, lastUpdated: last_updated };
  }

  /**
   * Deduct resin from user, returns updated user or throws error
   */
  async consumeResin(user, amount) {
    const { currentResin, lastUpdated } = this.calculateCurrentResin(user);
    if (currentResin < amount) {
      throw new Error('Not enough resin');
    }
    
    user.resin.current = currentResin - amount;
    
    // If we were at cap, start regenerating from NOW
    if (currentResin === this.MAX_RESIN) {
        user.resin.last_updated = new Date();
    } else {
        user.resin.last_updated = lastUpdated;
    }
    
    await user.save();
    return user;
  }
}

export default new ResinService();
