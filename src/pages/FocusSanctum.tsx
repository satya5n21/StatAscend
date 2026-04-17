import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Trophy } from 'lucide-react';
import api from '../lib/axios';

export const FocusSanctum = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 mins
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [rewards, setRewards] = useState<any>(null);

  // Auto-start domain upon loading for MVP simplicity
  useEffect(() => {
    const initDomain = async () => {
      try {
        await api.post('/domain/start', { quest_id: null }); // Takes 20 resin default
        setIsActive(true);
      } catch (err: any) {
         if (err.response?.data?.error === 'Not enough resin') {
           alert('Not enough resin to enter the domain!');
           navigate('/dashboard');
         }
      }
    };
    initDomain();
  }, [navigate]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setIsCompleted(true);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleClaim = async () => {
    try {
      const res = await api.post('/domain/complete');
      setRewards(res.data.drops);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAbort = () => {
    if (window.confirm("Are you sure? Your resin will not be refunded.")) {
       navigate('/dashboard');
    }
  };

  if (rewards) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in">
        <Trophy className="w-24 h-24 text-[var(--color-secondary)] mb-6 animate-bounce" />
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-8">
          Domain Cleared
        </h1>
        <div className="glass-card p-8 flex gap-8 mb-8 text-center">
            <div>
              <p className="text-gray-400 uppercase tracking-widest text-sm mb-2">Exp Gained</p>
              <p className="text-3xl font-mono text-[var(--color-primary)]">+{rewards.exp}</p>
            </div>
            <div className="w-px bg-gray-700"></div>
            <div>
               <p className="text-gray-400 uppercase tracking-widest text-sm mb-2">Mora Looted</p>
               <p className="text-3xl font-mono text-yellow-400">+{rewards.mora}</p>
            </div>
        </div>
        <button onClick={() => navigate('/dashboard')} className="px-8 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold rounded-lg transition-colors">
          Return to Guild
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-black bg-opacity-40 rounded-3xl border border-gray-800 shadow-[inset_0_0_100px_rgba(0,0,0,1)] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[rgba(139,92,246,0.15)] via-transparent to-transparent"></div>
      
      <div className="z-10 text-center">
        <h2 className="text-2xl font-semibold mb-2 text-gray-300 tracking-[0.2em] uppercase">Deep Focus</h2>
        <div className="text-9xl font-mono font-light text-white mb-12 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
          {formatTime(timeLeft)}
        </div>

        {!isCompleted ? (
          <button 
            onDoubleClick={handleAbort}
            className="group flex items-center gap-2 mx-auto text-gray-500 hover:text-red-500 transition-colors"
            title="Double click to abort"
          >
            <ShieldAlert className="w-5 h-5 group-hover:animate-pulse" />
            <span className="uppercase tracking-widest text-sm">Force Abort</span>
          </button>
        ) : (
          <button 
            onClick={handleClaim}
            className="animate-pulse bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-12 py-4 rounded-full font-black text-xl shadow-[0_0_30px_rgba(234,179,8,0.5)] hover:scale-105 transition-transform"
          >
            Claim Victory
          </button>
        )}
      </div>
    </div>
  );
};
