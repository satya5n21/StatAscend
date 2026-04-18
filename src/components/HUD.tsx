import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Diamond, Coins, Zap, User } from 'lucide-react';
import api from '../lib/axios';

export const HUD = () => {
  const [userData, setUserData] = useState<any>(null);
  const MAX_RESIN = 200; // As specified in plan

  useEffect(() => {
    // Poll API every 60 seconds to keep stats updated
    const fetchUser = async () => {
      try {
        const res = await api.get('/me');
        setUserData(res.data);
      } catch (err) {
        console.error("Failed to fetch user data", err);
      }
    };
    
    fetchUser();
    const interval = setInterval(fetchUser, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!userData) return <div className="p-4 text-center text-[var(--color-primary)]">Loading Link to Celestia...</div>;

  return (
    <nav className="sticky top-0 z-50 px-6 pt-4 pb-12 flex justify-between items-center w-full bg-gradient-to-b from-black/80 via-black/40 to-transparent">
      <div className="flex gap-6 items-center">
        <NavLink to="/dashboard" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
          StatAscend
        </NavLink>
        <div className="hidden md:flex gap-4 ml-4">
          <NavLink to="/dashboard" className={({isActive}) => `text-sm font-medium transition-colors ${isActive ? 'text-[var(--color-secondary)]' : 'text-gray-300 hover:text-white'}`}>Home</NavLink>
          <NavLink to="/quests" className={({isActive}) => `text-sm font-medium transition-colors ${isActive ? 'text-[var(--color-secondary)]' : 'text-gray-300 hover:text-white'}`}>Quests</NavLink>
          <NavLink to="/inventory" className={({isActive}) => `text-sm font-medium transition-colors ${isActive ? 'text-[var(--color-secondary)]' : 'text-gray-300 hover:text-white'}`}>Inventory</NavLink>
          <NavLink to="/wish" className={({isActive}) => `text-sm font-medium transition-colors ${isActive ? 'text-[var(--color-secondary)]' : 'text-gray-300 hover:text-white'}`}>Wish</NavLink>
        </div>
      </div>
      
      <div className="flex gap-4 items-center bg-[rgba(15,23,42,0.8)] px-4 py-2 rounded-full border border-gray-700">
        <div className="flex items-center gap-2" title="Resin">
          <Zap className="text-[var(--color-resin)] w-5 h-5" />
          <span className="font-mono text-[var(--color-resin)] font-semibold">{userData.resin.current}/{MAX_RESIN}</span>
        </div>
        <div className="w-px h-6 bg-gray-600 mx-2"></div>
        <div className="flex items-center gap-2" title="Aether Gems">
          <Diamond className="text-pink-400 w-5 h-5" />
          <span className="font-mono font-medium">{userData.wallets.aether_gems}</span>
        </div>
        <div className="w-px h-6 bg-gray-600 mx-2"></div>
        <div className="flex items-center gap-2" title="Mora">
          <Coins className="text-[var(--color-secondary)] w-5 h-5" />
          <span className="font-mono font-medium">{userData.wallets.mora.toLocaleString()}</span>
        </div>
        <div className="w-px h-6 bg-gray-600 mx-2"></div>
        <div className="flex items-center gap-2 bg-[var(--color-primary-dark)] px-3 py-1 rounded-full text-sm font-bold shadow-[0_0_10px_rgba(139,92,246,0.5)] cursor-pointer hover:bg-[var(--color-primary)] transition-colors">
           <User className="w-4 h-4" /> 
           AR {userData.adventurer_rank}
        </div>
      </div>
    </nav>
  );
};
